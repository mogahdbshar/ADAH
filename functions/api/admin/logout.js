import { jsonResponse, clearAdminCookies, requireAdmin } from "../../_shared/access.js";
export async function onRequestPost({request,env}) {
  const auth=await requireAdmin(request,env,["admin","editor","moderator","viewer"]);
  if(!auth.ok) return auth.response;
  try {
    await env.DB.prepare("UPDATE admin_sessions SET revoked_at=CURRENT_TIMESTAMP WHERE id=?").bind(auth.sessionId).run();
    return new Response(JSON.stringify({loggedOut:true}),{status:200,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","set-cookie":clearAdminCookies()}});
  } catch { return jsonResponse({error:"service_unavailable"},503); }
}
