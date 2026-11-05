import { jsonResponse, validSameOrigin, readBoundedJson, passwordHash, randomHex, constantTimeEqual, enforceRateLimit, createAdminSession } from "../../_shared/access.js";
export async function onRequestPost({request,env}) {
  if(!env.DB) return jsonResponse({error:"service_unavailable"},503);
  if(!env.ADMIN_SETUP_SECRET||String(env.ADMIN_SETUP_SECRET).length<32) return jsonResponse({error:"setup_not_configured"},503);
  if(!validSameOrigin(request)) return jsonResponse({error:"invalid_origin"},403);
  if(!request.headers.get("content-type")?.toLowerCase().includes("application/json")) return jsonResponse({error:"unsupported_media_type"},415);
  try {
    if(!await enforceRateLimit(env,request,"admin-bootstrap",3,3600)) return jsonResponse({error:"rate_limited"},429);
    const body=await readBoundedJson(request,5000);
    const secret=typeof body.setupSecret==="string"?body.setupSecret:"";
    const email=typeof body.email==="string"?body.email.trim().toLowerCase().slice(0,254):"";
    const name=typeof body.name==="string"?body.name.trim().slice(0,100):"";
    const password=typeof body.password==="string"?body.password:"";
    if(!constantTimeEqual(secret,env.ADMIN_SETUP_SECRET)) return jsonResponse({error:"invalid_setup"},403);
    if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||password.length<14||password.length>256) return jsonResponse({error:"invalid_input"},400);
    const count=await env.DB.prepare("SELECT COUNT(*) AS count FROM admin_users").first();
    if((count?.count||0)!==0) return jsonResponse({error:"bootstrap_closed"},409);
    const role=await env.DB.prepare("SELECT id FROM roles WHERE name='admin' LIMIT 1").first();
    if(!role) return jsonResponse({error:"roles_not_initialized"},503);
    const id=crypto.randomUUID(),salt=randomHex(16),iterations=310000,hash=await passwordHash(password,salt,iterations);
    const results=await env.DB.batch([
      env.DB.prepare(`INSERT INTO admin_users(id,external_subject,email,display_name,password_salt,password_hash,password_iterations)
        SELECT ?,?,?,?,?,?,? WHERE NOT EXISTS(SELECT 1 FROM admin_users)`).bind(id,"local:"+id,email,name||email,salt,hash,iterations),
      env.DB.prepare(`INSERT INTO admin_user_roles(admin_user_id,role_id)
        SELECT id,? FROM admin_users WHERE id=? AND (SELECT COUNT(*) FROM admin_users)=1`).bind(role.id,id),
      env.DB.prepare(`INSERT INTO audit_logs(id,admin_user_id,action,entity_type,entity_id)
        SELECT ?,id,'bootstrap_admin','admin_user',id FROM admin_users WHERE id=?`).bind(crypto.randomUUID(),id)
    ]);
    if(results[0]?.meta?.changes!==1||results[1]?.meta?.changes!==1) return jsonResponse({error:"bootstrap_closed"},409);
    const session=await createAdminSession(env,id);
    return new Response(JSON.stringify({created:true,authenticated:true}),{status:201,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","set-cookie":session["set-cookie"]}});
  } catch { return jsonResponse({error:"service_unavailable"},503); }
}
