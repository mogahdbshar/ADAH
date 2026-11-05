import { requireAdmin, jsonResponse, validSameOrigin, readBoundedJson } from "../../_shared/access.js";

export async function onRequestGet({ request, env }) {
  const auth = await requireAdmin(request, env, ["admin", "moderator"]);
  if (!auth.ok) return auth.response;
  try {
    const [ratings, reports] = await Promise.all([
      env.DB.prepare("SELECT * FROM ratings WHERE moderation_status = 'pending' ORDER BY created_at DESC LIMIT 100").all(),
      env.DB.prepare("SELECT * FROM reports WHERE status IN ('open','reviewing') ORDER BY created_at DESC LIMIT 100").all()
    ]);
    return jsonResponse({ ratings: ratings.results ?? [], reports: reports.results ?? [] });
  } catch {
    return jsonResponse({ error: "service_unavailable" }, 503);
  }
}

export async function onRequestPatch({ request, env }) {
  const auth = await requireAdmin(request, env, ["admin", "moderator"]);
  if (!auth.ok) return auth.response;
  if (!validSameOrigin(request)) return jsonResponse({ error: "invalid_origin" }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return jsonResponse({ error: "unsupported_media_type" }, 415);
  }
  let body;
  try { body = await readBoundedJson(request, 4000); }
  catch { return jsonResponse({ error: "invalid_request" }, 400); }

  const id = typeof body?.id === "string" ? body.id.slice(0, 100) : "";
  const kind = body?.kind;
  const status = body?.status;
  const isRating = kind === "rating" && ["approved", "rejected"].includes(status);
  const isReport = kind === "report" && ["reviewing", "resolved", "dismissed"].includes(status);
  if (!id || (!isRating && !isReport)) return jsonResponse({ error: "invalid_request" }, 400);

  try {
    const table = isRating ? "ratings" : "reports";
    const exists = await env.DB.prepare(`SELECT id FROM ${table} WHERE id = ? LIMIT 1`).bind(id).first();
    if (!exists) return jsonResponse({ error: "not_found" }, 404);
    const update = isRating
      ? env.DB.prepare("UPDATE ratings SET moderation_status = ? WHERE id = ?").bind(status, id)
      : env.DB.prepare("UPDATE reports SET status = ?, resolved_at = CASE WHEN ? IN ('resolved','dismissed') THEN CURRENT_TIMESTAMP ELSE NULL END WHERE id = ?").bind(status, status, id);
    const audit = env.DB.prepare(
      "INSERT INTO audit_logs (id, admin_user_id, action, entity_type, entity_id) VALUES (?, ?, ?, ?, ?)"
    ).bind(crypto.randomUUID(), auth.admin.id, "moderate_" + status, kind, id);
    await env.DB.batch([update, audit]);
    return jsonResponse({ updated: true });
  } catch {
    return jsonResponse({ error: "service_unavailable" }, 503);
  }
}
