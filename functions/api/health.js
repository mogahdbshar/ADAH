const json = (body, status = 200) => new Response(JSON.stringify(body), {
  status,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "cache-control": "no-store",
    "x-content-type-options": "nosniff"
  }
});

export async function onRequestGet({ env }) {
  if (!env.DB) return json({ ok: false, error: "service_unavailable" }, 503);

  try {
    const result = await env.DB.prepare("SELECT 1 AS ready").first();
    if (result?.ready !== 1) throw new Error("database_not_ready");
    return json({ ok: true, service: "adah-api", database: "connected" });
  } catch {
    return json({ ok: false, error: "service_unavailable" }, 503);
  }
}
