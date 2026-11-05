import { requireAdmin, jsonResponse } from "../../_shared/access.js";

const bounded = (value, fallback, max) => {
  const number = Number.parseInt(value ?? "", 10);
  return Number.isFinite(number) && number >= 0 ? Math.min(number, max) : fallback;
};

export async function onRequestGet({ request, env }) {
  const auth = await requireAdmin(request, env, ["admin", "viewer"]);
  if (!auth.ok) return auth.response;
  const url = new URL(request.url);
  const limit = Math.min(Math.max(bounded(url.searchParams.get("limit"), 50, 100), 1), 100);
  const offset = bounded(url.searchParams.get("offset"), 0, 100000);
  try {
    const result = await env.DB.prepare(`
      SELECT a.id, a.action, a.entity_type, a.entity_id, a.request_id, a.created_at,
        u.email AS actor_email, u.display_name AS actor_name
      FROM audit_logs a
      LEFT JOIN admin_users u ON u.id = a.admin_user_id
      ORDER BY a.created_at DESC, a.id DESC
      LIMIT ? OFFSET ?
    `).bind(limit, offset).all();
    return jsonResponse({ entries: result.results ?? [], pagination: { limit, offset, returned: result.results?.length ?? 0 } });
  } catch {
    return jsonResponse({ error: "service_unavailable" }, 503);
  }
}
