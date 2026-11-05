import { requireAdmin, jsonResponse } from "../../_shared/access.js";

const TYPES = new Set(["tool", "page", "article", "news", "service", "resource", "category", "setting"]);

export async function onRequestGet({ request, env }) {
  const auth = await requireAdmin(request, env, ["admin", "editor", "viewer"]);
  if (!auth.ok) return auth.response;
  const url = new URL(request.url);
  const type = url.searchParams.get("type");
  const id = url.searchParams.get("id");
  if (!type || !TYPES.has(type) || !id || id.length > 100) return jsonResponse({ error: "invalid_request" }, 400);
  try {
    const result = await env.DB.prepare(`
      SELECT id, entity_type, entity_id, revision_number, snapshot_json, change_note, created_by, created_at
      FROM content_revisions
      WHERE entity_type = ? AND entity_id = ?
      ORDER BY revision_number DESC
      LIMIT 50
    `).bind(type, id).all();
    return jsonResponse({ revisions: result.results ?? [] });
  } catch {
    return jsonResponse({ error: "service_unavailable" }, 503);
  }
}
