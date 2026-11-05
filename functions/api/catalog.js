const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "public, max-age=60, stale-while-revalidate=300",
    "x-content-type-options": "nosniff",
    "vary": "Accept-Language"
  }
});

const localeOf = request => {
  const requested = new URL(request.url).searchParams.get("lang");
  if (requested === "ar" || requested === "en") return requested;
  return request.headers.get("accept-language")?.toLowerCase().startsWith("en") ? "en" : "ar";
};

const boundedInteger = (value, fallback, max) => {
  const parsed = Number.parseInt(value ?? "", 10);
  return Number.isFinite(parsed) && parsed > 0 ? Math.min(parsed, max) : fallback;
};

export async function onRequestGet({ request, env }) {
  if (!env.DB) return json({ error: "service_unavailable" }, 503);

  const url = new URL(request.url);
  const locale = localeOf(request);
  const limit = boundedInteger(url.searchParams.get("limit"), 50, 100);
  const offset = boundedInteger(url.searchParams.get("offset"), 1, 100000) - 1;

  try {
    const [categories, tools] = await Promise.all([
      env.DB.prepare(`
        SELECT c.id, c.slug, c.sort_order,
          (SELECT value FROM translations
           WHERE entity_type = 'category' AND entity_id = c.id
             AND locale = ? AND field_name = 'title' LIMIT 1) AS title
        FROM categories c
        WHERE c.status = 'published'
        ORDER BY c.sort_order ASC, c.slug ASC
      `).bind(locale).all(),
      env.DB.prepare(`
        SELECT t.id, t.slug, t.route, t.icon_key, t.version,
          c.slug AS category,
          (SELECT value FROM translations
           WHERE entity_type = 'tool' AND entity_id = t.id
             AND locale = ? AND field_name = 'title' LIMIT 1) AS title,
          (SELECT value FROM translations
           WHERE entity_type = 'tool' AND entity_id = t.id
             AND locale = ? AND field_name = 'description' LIMIT 1) AS description
        FROM tools t
        LEFT JOIN categories c ON c.id = t.category_id
        WHERE t.status = 'published'
        ORDER BY t.updated_at DESC, t.slug ASC
        LIMIT ? OFFSET ?
      `).bind(locale, locale, limit, offset).all()
    ]);

    return json({
      locale,
      categories: categories.results ?? [],
      tools: tools.results ?? [],
      pagination: {
        limit,
        offset,
        returned: tools.results?.length ?? 0
      }
    });
  } catch {
    return json({ error: "service_unavailable" }, 503);
  }
}
