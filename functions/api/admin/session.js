import { requireAdmin, jsonResponse } from "../../_shared/access.js";
export async function onRequestGet({request,env}) {
  const auth=await requireAdmin(request,env,["admin","editor","moderator","viewer"]);
  if(!auth.ok) return auth.response;
  return jsonResponse({authenticated:true,admin:auth.admin});
}
