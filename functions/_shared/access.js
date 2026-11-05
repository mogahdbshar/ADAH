let cachedJwks = null;
let cachedUntil = 0;

const decodePart = value => {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const binary = atob(normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "="));
  return Uint8Array.from(binary, char => char.charCodeAt(0));
};

const decodeJson = value => JSON.parse(new TextDecoder().decode(decodePart(value)));

async function getJwks(teamDomain) {
  if (cachedJwks && Date.now() < cachedUntil) return cachedJwks;
  const response = await fetch(`https://${teamDomain}/cdn-cgi/access/certs`, {
    headers: { accept: "application/json" }
  });
  if (!response.ok) throw new Error("access_keys_unavailable");
  const data = await response.json();
  if (!Array.isArray(data.keys) || data.keys.length === 0) throw new Error("access_keys_invalid");
  cachedJwks = data.keys;
  cachedUntil = Date.now() + 5 * 60 * 1000;
  return cachedJwks;
}

export async function verifyAccessIdentity(request, env) {
  const rawTeamDomain = String(env.ACCESS_TEAM_DOMAIN || "").trim();
  let teamDomain = "";
  try {
    const parsed = new URL(rawTeamDomain.includes("://") ? rawTeamDomain : `https://${rawTeamDomain}`);
    if (parsed.protocol !== "https:" || parsed.pathname !== "/" || parsed.search || parsed.hash) return null;
    teamDomain = parsed.host;
  } catch { return null; }
  const audience = String(env.ACCESS_AUD || "").trim();
  const allowlist = String(env.ADMIN_EMAIL_ALLOWLIST || "").split(",")
    .map(value => value.trim().toLowerCase()).filter(Boolean);
  const token = request.headers.get("CF-Access-Jwt-Assertion");

  if (!teamDomain || !audience || allowlist.length === 0 || !token || token.length > 16384) return null;

  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const header = decodeJson(parts[0]);
    const claims = decodeJson(parts[1]);
    if (header.alg !== "RS256" || !header.kid) return null;

    const issuer = `https://${teamDomain}`;
    const audiences = Array.isArray(claims.aud) ? claims.aud : [claims.aud];
    const now = Math.floor(Date.now() / 1000);
    if (claims.iss !== issuer || !audiences.includes(audience)) return null;
    if (!Number.isFinite(claims.exp) || claims.exp <= now) return null;
    if (claims.nbf !== undefined && claims.nbf > now + 30) return null;
    if (typeof claims.sub !== "string" || !claims.sub || typeof claims.email !== "string") return null;

    const email = claims.email.trim().toLowerCase();
    if (!allowlist.includes(email)) return null;

    const jwks = await getJwks(teamDomain);
    const jwk = jwks.find(key => key.kid === header.kid && key.kty === "RSA");
    if (!jwk) return null;

    const publicKey = await crypto.subtle.importKey(
      "jwk", jwk, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["verify"]
    );
    const valid = await crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5", publicKey, decodePart(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`)
    );
    return valid ? { subject: claims.sub, email, name: String(claims.name || "").slice(0, 120) } : null;
  } catch {
    return null;
  }
}

const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff",
    "referrer-policy": "no-referrer"
  }
});

export async function requireAdmin(request, env, allowedRoles = ["admin"]) {
  if (!env.DB) return { ok: false, response: json({ error: "service_unavailable" }, 503) };
  const identity = await verifyAccessIdentity(request, env);
  if (!identity) return { ok: false, response: json({ error: "unauthorized" }, 401) };

  try {
    const row = await env.DB.prepare(`
      SELECT u.id, u.email, u.display_name, u.is_active,
        GROUP_CONCAT(r.name, ',') AS roles
      FROM admin_users u
      LEFT JOIN admin_user_roles ur ON ur.admin_user_id = u.id
      LEFT JOIN roles r ON r.id = ur.role_id
      WHERE u.external_subject = ? AND lower(u.email) = ?
      GROUP BY u.id
      LIMIT 1
    `).bind(identity.subject, identity.email).first();

    if (!row || row.is_active !== 1) return { ok: false, response: json({ error: "forbidden" }, 403) };
    const roles = String(row.roles || "").split(",").filter(Boolean);
    if (!allowedRoles.some(role => roles.includes(role))) {
      return { ok: false, response: json({ error: "forbidden" }, 403) };
    }
    return { ok: true, identity, admin: { id: row.id, email: row.email, name: row.display_name || identity.name, roles } };
  } catch {
    return { ok: false, response: json({ error: "service_unavailable" }, 503) };
  }
}

export function jsonResponse(body, status = 200) {
  return json(body, status);
}

export function validSameOrigin(request) {
  const origin = request.headers.get("Origin");
  if (!origin) return false;
  try {
    if (new URL(origin).origin !== new URL(request.url).origin) return false;
  } catch {
    return false;
  }
  const fetchSite = request.headers.get("Sec-Fetch-Site");
  return !fetchSite || fetchSite === "same-origin" || fetchSite === "none";
}

export function readBoundedJson(request, maxBytes = 12000) {
  return request.text().then(raw => {
    if (new TextEncoder().encode(raw).byteLength > maxBytes) throw new Error("payload_too_large");
    return JSON.parse(raw);
  });
}
