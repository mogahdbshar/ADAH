import { jsonResponse, responseWithCookies, clearAdminCookies, requireAdmin } from "../../_shared/access.js";
export async function onRequestPost({request,env}) {
  const auth=await requireAdmin(request,env,["admin","editor","moderator","viewer"]);
  if(!auth.ok) return auth.response;
  try {
    await env.DB.prepare("UPDATE admin_sessions SET revoked_at=CURRENT_TIMESTAMP WHERE id=?").bind(auth.sessionId).run();
    return responseWithCookies({loggedOut:true},200,clearAdminCookies());
  } catch { return jsonResponse({error:"service_unavailable"},503); }
}
