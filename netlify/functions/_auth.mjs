const allowedOrigins = new Set(["https://mseopro.netlify.app", "https://gpldroid.github.io"]);
export function corsHeaders(event) {
  const origin = event.headers.origin || "";
  return {
    "Access-Control-Allow-Origin": allowedOrigins.has(origin) ? origin : "https://mseopro.netlify.app",
    "Access-Control-Allow-Headers": "authorization, content-type",
    "Access-Control-Allow-Methods": "GET, PUT, POST, OPTIONS",
    "Vary": "Origin",
    "Content-Type": "application/json; charset=utf-8",
    "Cache-Control": "no-store",
  };
}
export function json(statusCode, body, headers) {
  return { statusCode, headers, body: JSON.stringify(body) };
}
export async function requireAdmin(event, minimum = "editor") {
  const token = (event.headers.authorization || "").replace(/^Bearer\s+/i, "").trim();
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_PUBLISHABLE_KEY;
  if (!token || !url || !key) throw Object.assign(new Error("Authentication service is not configured"), { statusCode: 500 });
  const userResponse = await fetch(`${url}/auth/v1/user`, { headers: { apikey: key, Authorization: `Bearer ${token}` } });
  if (!userResponse.ok) throw Object.assign(new Error("Your session is invalid or expired"), { statusCode: 401 });
  const user = await userResponse.json();
  const rolesResponse = await fetch(`${url}/rest/v1/mseo_admins?user_id=eq.${encodeURIComponent(user.id)}&select=role&limit=1`, {
    headers: { apikey: key, Authorization: `Bearer ${token}` },
  });
  if (!rolesResponse.ok) throw Object.assign(new Error("Could not verify dashboard permissions"), { statusCode: 403 });
  const rows = await rolesResponse.json();
  const role = rows?.[0]?.role;
  if (!["admin", "editor"].includes(role) || (minimum === "admin" && role !== "admin")) {
    throw Object.assign(new Error("Insufficient permissions"), { statusCode: 403 });
  }
  return { user, role };
}
