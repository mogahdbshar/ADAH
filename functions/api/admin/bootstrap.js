import { jsonResponse, responseWithCookies, validSameOrigin, readBoundedJson, passwordHash, randomHex, constantTimeEqual, enforceRateLimit, createAdminSession } from "../../_shared/access.js";

function getBootstrapSecrets(env) {
  return [env.ADMIN_BOOTSTRAP_SECRET, env.ADMIN_SETUP_SECRET]
    .filter(value => typeof value === "string")
    .map(value => value.trim())
    .filter(value => value.length >= 32);
}

export async function onRequestPost({request,env}) {
  if(!env.DB) return jsonResponse({error:"service_unavailable"},503);
  const setupSecrets=getBootstrapSecrets(env);
  if(!setupSecrets.length) return jsonResponse({error:"setup_not_configured"},503);
  if(!validSameOrigin(request)) return jsonResponse({error:"invalid_origin"},403);
  if(!request.headers.get("content-type")?.toLowerCase().includes("application/json")) return jsonResponse({error:"unsupported_media_type"},415);
  let stage="rate_limit";
  try {
    if(!await enforceRateLimit(env,request,"admin-bootstrap-v2",5,300)) return jsonResponse({error:"rate_limited"},429);
    stage="read_request";
    const body=await readBoundedJson(request,5000);
    const secret=typeof body.setupSecret==="string"?body.setupSecret.trim():"";
    const email=typeof body.email==="string"?body.email.trim().toLowerCase().slice(0,254):"";
    const name=typeof body.name==="string"?body.name.trim().slice(0,100):"";
    const password=typeof body.password==="string"?body.password:"";
    stage="verify_setup_secret";
    if(!setupSecrets.some(candidate=>constantTimeEqual(secret,candidate))) return jsonResponse({error:"invalid_setup"},403);
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<14||password.length>256) return jsonResponse({error:"invalid_input"},400);
    stage="check_existing_admin";
    const count=await env.DB.prepare("SELECT COUNT(*) AS count FROM admin_users").first();
    if((count?.count||0)!==0) return jsonResponse({error:"bootstrap_closed"},409);
    stage="check_admin_role";
    const role=await env.DB.prepare("SELECT id FROM roles WHERE name='admin' LIMIT 1").first();
    if(!role) return jsonResponse({error:"roles_not_initialized"},503);
    stage="derive_password_hash";
    const id=crypto.randomUUID(),salt=randomHex(16),iterations=310000,hash=await passwordHash(password,salt,iterations);
    stage="insert_admin_records";
    const results=await env.DB.batch([
      env.DB.prepare(`INSERT INTO admin_users(id,external_subject,email,display_name,password_salt,password_hash,password_iterations)
        SELECT ?,?,?,?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM admin_users)`).bind(id,"local:"+id,email,name||email,salt,hash,iterations),
      env.DB.prepare(`INSERT INTO admin_user_roles(admin_user_id,role_id)
        SELECT id,? FROM admin_users WHERE id=? AND (SELECT COUNT(*) FROM admin_users)=1`).bind(role.id,id),
      env.DB.prepare(`INSERT INTO audit_logs(id,admin_user_id,action,entity_type,entity_id)
        SELECT ?,id,'bootstrap_admin','admin_user',id FROM admin_users WHERE id=?`).bind(crypto.randomUUID(),id)
    ]);
    if(results[0]?.meta?.changes!==1||results[1]?.meta?.changes!==1) return jsonResponse({error:"bootstrap_closed"},409);
    stage="create_admin_session";
    const session=await createAdminSession(env,id);
    return responseWithCookies({created:true,authenticated:true},201,session["set-cookie"]);
  } catch (error) {
    console.error("admin_bootstrap_failed",stage,error?.name||"Error");
    return jsonResponse({error:"bootstrap_internal_error",stage},503);
  }
}

export async function onRequestGet({env}) {
  if(!env.DB) return jsonResponse({error:"service_unavailable"},503);
  try {
    const row=await env.DB.prepare("SELECT COUNT(*) AS count FROM admin_users").first();
    const setup=typeof env.ADMIN_SETUP_SECRET==="string"?env.ADMIN_SETUP_SECRET:"";
    const alternate=typeof env.ADMIN_BOOTSTRAP_SECRET==="string"?env.ADMIN_BOOTSTRAP_SECRET:"";
    return jsonResponse({needsSetup:(row?.count||0)===0,setupConfigured:getBootstrapSecrets(env).length>0,bindingDiagnostics:{ADMIN_SETUP_SECRET:setup.length>=32?"ready":setup.length>0?"too_short":"missing",ADMIN_BOOTSTRAP_SECRET:alternate.length>=32?"ready":alternate.length>0?"too_short":"missing"}});
  } catch { return jsonResponse({error:"service_unavailable"},503); }
}
