import { verifyAccessIdentity, jsonResponse, validSameOrigin, readBoundedJson } from "../../_shared/access.js";

export async function onRequestPost({ request, env }) {
  if (!env.DB) return jsonResponse({ error: "service_unavailable" }, 503);
  if (!validSameOrigin(request)) return jsonResponse({ error: "invalid_origin" }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return jsonResponse({ error: "unsupported_media_type" }, 415);
  }

  const identity = await verifyAccessIdentity(request, env);
  if (!identity) return jsonResponse({ error: "unauthorized" }, 401);

  try {
    const existing = await env.DB.prepare("SELECT COUNT(*) AS count FROM admin_users").first();
    if ((existing?.count ?? 0) !== 0) return jsonResponse({ error: "bootstrap_closed" }, 409);

    const id = crypto.randomUUID();
    const role = await env.DB.prepare("SELECT id FROM roles WHERE name = 'admin' LIMIT 1").first();
    if (!role) return jsonResponse({ error: "roles_not_initialized" }, 503);

    const result = await env.DB.prepare(`
      INSERT INTO admin_users (id, external_subject, email, display_name)
      SELECT ?, ?, ?, ?
      WHERE NOT EXISTS (SELECT 1 FROM admin_users)
      RETURNING id
    `).bind(id, identity.subject, identity.email, identity.name || identity.email).run();

    if (!result.success || result.meta?.changes !== 1) return jsonResponse({ error: "bootstrap_closed" }, 409);

    await env.DB.batch([
      env.DB.prepare("INSERT INTO admin_user_roles (admin_user_id, role_id) VALUES (?, ?)").bind(id, role.id),
      env.DB.prepare("INSERT INTO audit_logs (id, admin_user_id, action, entity_type, entity_id) VALUES (?, ?, 'bootstrap_admin', 'admin_user', ?)").bind(crypto.randomUUID(), id, id)
    ]);
    return jsonResponse({ created: true, message: "Initial administrator enrolled." }, 201);
  } catch {
    return jsonResponse({ error: "service_unavailable" }, 503);
  }
}
