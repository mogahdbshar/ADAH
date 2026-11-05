import { jsonResponse, validSameOrigin, readBoundedJson, passwordHash, createAdminSession, enforceRateLimit, sha256 } from "../../_shared/access.js";
export async function onRequestPost({request,env}) {
  if(!env.DB) return jsonResponse({error:"service_unavailable"},503);
  if(!validSameOrigin(request)) return jsonResponse({error:"invalid_origin"},403);
  if(!request.headers.get("content-type")?.toLowerCase().includes("application/json")) return jsonResponse({error:"unsupported_media_type"},415);
  try {
    if(!await enforceRateLimit(env,request,"admin-login",5,900)) return jsonResponse({error:"rate_limited"},429);
    const body=await readBoundedJson(request,3000);
    const email=typeof body.email==="string"?body.email.trim().toLowerCase().slice(0,254):"";
    const password=typeof body.password==="string"?body.password:"";
    if(!email||!password||password.length>256) return jsonResponse({error:"invalid_credentials"},401);
    const admin=await env.DB.prepare("SELECT id,email,display_name,password_salt,password_hash,password_iterations,is_active FROM admin_users WHERE lower(email)=? LIMIT 1").bind(email).first();
    let valid=false;
    if(admin?.is_active===1&&admin.password_salt&&admin.password_hash&&admin.password_iterations) {
      valid=constantTime(await passwordHash(password,admin.password_salt,admin.password_iterations),admin.password_hash);
    }
    await env.DB.prepare("INSERT INTO admin_login_events(id,subject_hash,outcome,coarse_reason) VALUES(?,?,?,?)")
      .bind(crypto.randomUUID(),await sha256(email),valid?"success":"denied",valid?"password":"invalid_credentials").run();
    if(!valid) return jsonResponse({error:"invalid_credentials"},401);
    const session=await createAdminSession(env,admin.id);
    await env.DB.prepare("UPDATE admin_users SET last_login_at=CURRENT_TIMESTAMP WHERE id=?").bind(admin.id).run();
    return new Response(JSON.stringify({authenticated:true,admin:{email:admin.email,name:admin.display_name||admin.email}}),{
      status:200,headers:{"content-type":"application/json; charset=utf-8","cache-control":"no-store","set-cookie":session["set-cookie"]}
    });
  } catch { return jsonResponse({error:"service_unavailable"},503); }
}
function constantTime(a,b){if(typeof a!=="string"||typeof b!=="string"||a.length!==b.length)return false;let x=0;for(let i=0;i<a.length;i++)x|=a.charCodeAt(i)^b.charCodeAt(i);return x===0;}
