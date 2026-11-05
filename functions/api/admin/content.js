import { requireAdmin, jsonResponse, validSameOrigin, readBoundedJson } from "../../_shared/access.js";

const TYPES = {
  tool: { table: "tools", allowed: ["admin", "editor"], fields: ["status", "category_id", "title", "description"] },
  category: { table: "categories", allowed: ["admin", "editor"], fields: ["status", "sort_order", "title"] },
  page: { table: "content_pages", allowed: ["admin", "editor"], fields: ["status", "title"] }
};
const statuses = new Set(["draft", "published", "archived"]);
const cleanText = (value, max) => typeof value === "string" ? value.trim().slice(0, max) : null;

export async function onRequestGet({ request, env }) {
  const auth = await requireAdmin(request, env, ["admin", "editor", "moderator", "viewer"]);
  if (!auth.ok) return auth.response;
  try {
    const [tools, categories, pages] = await Promise.all([
      env.DB.prepare("SELECT * FROM tools ORDER BY updated_at DESC LIMIT 250").all(),
      env.DB.prepare("SELECT * FROM categories ORDER BY sort_order, slug LIMIT 100").all(),
      env.DB.prepare("SELECT * FROM content_pages ORDER BY updated_at DESC LIMIT 250").all()
    ]);
    const translations = await env.DB.prepare(
      "SELECT entity_type, entity_id, locale, field_name, value FROM translations ORDER BY entity_type, entity_id, locale"
    ).all();
    return jsonResponse({
      tools: tools.results ?? [],
      categories: categories.results ?? [],
      pages: pages.results ?? [],
      translations: translations.results ?? []
    });
  } catch {
    return jsonResponse({ error: "service_unavailable" }, 503);
  }
}

export async function onRequestPatch({ request, env }) {
  const auth = await requireAdmin(request, env, ["admin", "editor"]);
  if (!auth.ok) return auth.response;
  if (!validSameOrigin(request)) return jsonResponse({ error: "invalid_origin" }, 403);
  if (!request.headers.get("content-type")?.toLowerCase().includes("application/json")) {
    return jsonResponse({ error: "unsupported_media_type" }, 415);
  }

  let body;
  try { body = await readBoundedJson(request); }
  catch { return jsonResponse({ error: "invalid_request" }, 400); }

  const type = TYPES[body?.type];
  const id = cleanText(body?.id, 100);
  const locale = body?.locale === "en" ? "en" : "ar";
  if (!type || !id || !body?.changes || typeof body.changes !== "object" || Array.isArray(body.changes)) {
    return jsonResponse({ error: "invalid_request" }, 400);
  }
  const entries = Object.entries(body.changes);
  if (!entries.length || entries.length > 4 || entries.some(([key]) => !type.fields.includes(key))) {
    return jsonResponse({ error: "invalid_fields" }, 400);
  }

  try {
    const current = await env.DB.prepare(`SELECT * FROM ${type.table} WHERE id = ? LIMIT 1`).bind(id).first();
    if (!current) return jsonResponse({ error: "not_found" }, 404);

    const currentTranslations = await env.DB.prepare(
      "SELECT locale, field_name, value FROM translations WHERE entity_type = ? AND entity_id = ?"
    ).bind(body.type, id).all();
    const snapshot = { record: current, translations: currentTranslations.results ?? [] };
    const revision = await env.DB.prepare(
      "SELECT COALESCE(MAX(revision_number), 0) + 1 AS next FROM content_revisions WHERE entity_type = ? AND entity_id = ?"
    ).bind(body.type, id).first();

    const statements = [
      env.DB.prepare(`
        INSERT INTO content_revisions
          (id, entity_type, entity_id, revision_number, snapshot_json, change_note, created_by)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).bind(crypto.randomUUID(), body.type, id, revision.next, JSON.stringify(snapshot), cleanText(body.change_note, 240), auth.admin.id)
    ];

    const updates = {};
    for (const [key, raw] of entries) {
      if (key === "status") {
        if (!statuses.has(raw)) return jsonResponse({ error: "invalid_status" }, 400);
        updates.status = raw;
      } else if (key === "category_id" && body.type === "tool") {
        const categoryId = raw === null || raw === "" ? null : cleanText(raw, 100);
        if (categoryId) {
          const category = await env.DB.prepare("SELECT id FROM categories WHERE id = ?").bind(categoryId).first();
          if (!category) return jsonResponse({ error: "invalid_category" }, 400);
        }
        updates.category_id = categoryId;
      } else if (key === "sort_order" && body.type === "category") {
        if (!Number.isInteger(raw) || raw < 0 || raw > 100000) return jsonResponse({ error: "invalid_sort_order" }, 400);
        updates.sort_order = raw;
      } else if (key === "title" || key === "description") {
        const value = cleanText(raw, key === "title" ? 160 : 800);
        if (!value) return jsonResponse({ error: "invalid_text" }, 400);
        const translationId = crypto.randomUUID();
        statements.push(env.DB.prepare(`
          INSERT INTO translations (id, entity_type, entity_id, locale, field_name, value)
          VALUES (?, ?, ?, ?, ?, ?)
          ON CONFLICT(entity_type, entity_id, locale, field_name)
          DO UPDATE SET value = excluded.value
        `).bind(translationId, body.type, id, locale, key, value));
      }
    }

    const columns = Object.keys(updates);
    if (columns.length) {
      const set = columns.map(column => `${column} = ?`).join(", ");
      statements.push(env.DB.prepare(`UPDATE ${type.table} SET ${set}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`)
        .bind(...columns.map(column => updates[column]), id));
    } else if (body.type !== "category") {
      statements.push(env.DB.prepare(`UPDATE ${type.table} SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`).bind(id));
    }

    statements.push(env.DB.prepare(
      "INSERT INTO audit_logs (id, admin_user_id, action, entity_type, entity_id) VALUES (?, ?, 'update_content', ?, ?)"
    ).bind(crypto.randomUUID(), auth.admin.id, body.type, id));

    await env.DB.batch(statements);
    return jsonResponse({ updated: true, revision: revision.next });
  } catch {
    return jsonResponse({ error: "service_unavailable" }, 503);
  }
}
