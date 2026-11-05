import { requireAdmin, jsonResponse } from "../../_shared/access.js";

export async function onRequestGet({ request, env }) {
  const auth = await requireAdmin(request, env, ["admin", "editor", "moderator", "viewer"]);
  if (!auth.ok) return auth.response;

  try {
    const queries = await Promise.all([
      env.DB.prepare("SELECT COUNT(*) AS count FROM tools").first(),
      env.DB.prepare("SELECT COUNT(*) AS count FROM tools WHERE status = 'published'").first(),
      env.DB.prepare("SELECT COUNT(*) AS count FROM categories").first(),
      env.DB.prepare("SELECT COUNT(*) AS count FROM content_pages").first(),
      env.DB.prepare("SELECT COUNT(*) AS count FROM ratings WHERE moderation_status = 'pending'").first(),
      env.DB.prepare("SELECT COUNT(*) AS count FROM reports WHERE status IN ('open','reviewing')").first(),
      env.DB.prepare("SELECT COUNT(*) AS count FROM resources WHERE status = 'published'").first()
    ]);
    const [tools, publishedTools, categories, pages, ratings, reports, resources] = queries;
    return jsonResponse({
      admin: auth.admin,
      counts: {
        tools: tools?.count ?? 0,
        publishedTools: publishedTools?.count ?? 0,
        categories: categories?.count ?? 0,
        pages: pages?.count ?? 0,
        pendingRatings: ratings?.count ?? 0,
        openReports: reports?.count ?? 0,
        publishedResources: resources?.count ?? 0
      }
    });
  } catch {
    return jsonResponse({ error: "service_unavailable" }, 503);
  }
}
