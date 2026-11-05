const json = (body, status = 200, headers = {}) => new Response(JSON.stringify(body), {
  status, headers: { "content-type":"application/json; charset=utf-8", "cache-control":"no-store",
    "x-content-type-options":"nosniff", "referrer-policy":"no-referrer", "x-frame-options":"DENY", ...headers }
});
export const jsonResponse = (body, status = 200) => json(body, status);
export function validSameOrigin(request) {
  const origin=request.headers.get("Origin");
  if(!origin) return false;
  try { if(new URL(origin).origin!==new URL(request.url).origin) return false; } catch { return false; }
  const site=request.headers.get("Sec-Fetch-Site");
  return !site || site==="same-origin" || site==="none";
}
export async function readBoundedJson(request,maxBytes=12000) {
  const raw=await request.text();
  if(new TextEncoder().encode(raw).byteLength>maxBytes) throw new Error("payload_too_large");
  return JSON.parse(raw);
}
const enc=new TextEncoder();
const hex=bytes=>[...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,"0")).join("");
export const sha256=async value=>hex(await crypto.subtle.digest("SHA-256",enc.encode(value)));
const cookie=(request,name)=>{
  for(const part of (request.headers.get("Cookie")||"").split(";")) {
    const i=part.indexOf("=");
    if(i>=0 && part.slice(0,i).trim()===name) return part.slice(i+1).trim();
  }
  return "";
};
export const clearAdminCookies=()=>[
  "adah_session=; Path=/; Max-Age=0; Secure; HttpOnly; SameSite=Strict",
  "adah_csrf=; Path=/; Max-Age=0; Secure; SameSite=Strict"
];
export const randomHex=(length=16)=>hex(crypto.getRandomValues(new Uint8Array(length)));
export async function passwordHash(password,saltHex,iterations=310000) {
  const salt=new Uint8Array((saltHex.match(/.{2}/g)||[]).map(x=>parseInt(x,16)));
  const key=await crypto.subtle.importKey("raw",enc.encode(password),"PBKDF2",false,["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt,iterations},key,256));
}
export function constantTimeEqual(a,b) {
  if(typeof a!=="string"||typeof b!=="string"||a.length!==b.length) return false;
  let diff=0; for(let i=0;i<a.length;i++) diff|=a.charCodeAt(i)^b.charCodeAt(i);
  return diff===0;
}
export async function enforceRateLimit(env,request,scope,limit,windowSeconds) {
  const key=await sha256(scope+":"+(request.headers.get("CF-Connecting-IP")||"unknown"));
  const now=Math.floor(Date.now()/1000), start=now-(now%windowSeconds);
  await env.DB.prepare(`INSERT INTO rate_limit_buckets(bucket_key_hash,window_started_at,request_count,expires_at)
    VALUES(?,?,1,?) ON CONFLICT(bucket_key_hash) DO UPDATE SET
    request_count=CASE WHEN window_started_at<excluded.window_started_at THEN 1 ELSE request_count+1 END,
    window_started_at=CASE WHEN window_started_at<excluded.window_started_at THEN excluded.window_started_at ELSE window_started_at END,
    expires_at=excluded.expires_at`).bind(key,start,start+windowSeconds*2).run();
  const row=await env.DB.prepare("SELECT request_count FROM rate_limit_buckets WHERE bucket_key_hash=?").bind(key).first();
  return (row?.request_count||0)<=limit;
}
export async function createAdminSession(env,adminId) {
  const bytes=n=>btoa(String.fromCharCode(...crypto.getRandomValues(new Uint8Array(n)))).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
  const token=bytes(32),csrf=bytes(32),expires=new Date(Date.now()+12*60*60*1000).toISOString();
  await env.DB.prepare("INSERT INTO admin_sessions(id,admin_user_id,session_token_hash,csrf_token_hash,expires_at) VALUES(?,?,?,?,?)")
    .bind(crypto.randomUUID(),adminId,await sha256(token),await sha256(csrf),expires).run();
  return { "set-cookie":[
    "adah_session="+token+"; Path=/; Max-Age=43200; Secure; HttpOnly; SameSite=Strict",
    "adah_csrf="+csrf+"; Path=/; Max-Age=43200; Secure; SameSite=Strict"
  ]};
}
export async function requireAdmin(request,env,allowedRoles=["admin"]) {
  if(!env.DB) return {ok:false,response:json({error:"service_unavailable"},503)};
  const token=cookie(request,"adah_session");
  if(!token||token.length>128) return {ok:false,response:json({error:"unauthorized"},401)};
  try {
    const row=await env.DB.prepare(`SELECT s.id AS session_id,s.csrf_token_hash,u.id,u.email,u.display_name,u.is_active,
      GROUP_CONCAT(r.name,',') AS roles
      FROM admin_sessions s JOIN admin_users u ON u.id=s.admin_user_id
      LEFT JOIN admin_user_roles ur ON ur.admin_user_id=u.id LEFT JOIN roles r ON r.id=ur.role_id
      WHERE s.session_token_hash=? AND s.revoked_at IS NULL AND datetime(s.expires_at)>CURRENT_TIMESTAMP
      GROUP BY s.id LIMIT 1`).bind(await sha256(token)).first();
    if(!row||row.is_active!==1) return {ok:false,response:json({error:"unauthorized"},401)};
    const roles=String(row.roles||"").split(",").filter(Boolean);
    if(!allowedRoles.some(role=>roles.includes(role))) return {ok:false,response:json({error:"forbidden"},403)};
    if(!["GET","HEAD","OPTIONS"].includes(request.method.toUpperCase())) {
      if(!validSameOrigin(request)) return {ok:false,response:json({error:"invalid_origin"},403)};
      const csrf=cookie(request,"adah_csrf"),header=request.headers.get("X-CSRF-Token")||"";
      if(!csrf||!constantTimeEqual(csrf,header)||!constantTimeEqual(await sha256(csrf),row.csrf_token_hash))
        return {ok:false,response:json({error:"csrf_failed"},403)};
    }
    await env.DB.prepare("UPDATE admin_sessions SET last_seen_at=CURRENT_TIMESTAMP WHERE id=?").bind(row.session_id).run();
    return {ok:true,sessionId:row.session_id,admin:{id:row.id,email:row.email,name:row.display_name||row.email,roles}};
  } catch { return {ok:false,response:json({error:"service_unavailable"},503)}; }
}
