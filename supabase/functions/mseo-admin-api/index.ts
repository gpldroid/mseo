import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import sanitizeHtml from "npm:sanitize-html@2.13.0";

const allowedOrigins = new Set(
  (Deno.env.get("DASHBOARD_ORIGINS") ?? "https://gpldroid.github.io,https://mseopro.netlify.app")
    .split(",").map((value) => value.trim()).filter(Boolean),
);
const originAllowed = (origin: string) =>
  allowedOrigins.has(origin) || origin.startsWith("http://localhost:");
const corsHeaders = (origin: string) => ({
  "Access-Control-Allow-Origin": originAllowed(origin) ? origin : "null",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-client-info",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Vary": "Origin",
});
const json = (body: unknown, status = 200, origin = "") => new Response(JSON.stringify(body), {
  status, headers: { ...corsHeaders(origin), "Content-Type": "application/json; charset=utf-8" },
});
const escapeHtml = (value: unknown) => String(value ?? "").replace(/[&<>"']/g, (c) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
}[c]!));
const slugOk = (slug: string) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && slug.length <= 100;

Deno.serve(async (req) => {
  const origin = req.headers.get("origin") ?? "";
  const reply = (body: unknown, status = 200) => json(body, status, origin);
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders(origin) });
  if (req.method !== "POST") return reply({ error: "Method not allowed" }, 405);
  if (origin && !originAllowed(origin)) {
    return reply({ error: "Origin not allowed" }, 403);
  }
  const url = Deno.env.get("SUPABASE_URL");
  const anon = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY");
  const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!url || !anon || !serviceKey) return reply({ error: "Server environment is incomplete" }, 500);
  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return reply({ error: "Sign-in required" }, 401);
  const userClient = createClient(url, anon, { global: { headers: { Authorization: authHeader } }, auth: { persistSession: false } });
  const { data: { user }, error: authError } = await userClient.auth.getUser();
  if (authError || !user) return reply({ error: "Invalid session" }, 401);
  const adminClient = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });
  const { data: access, error: accessError } = await adminClient.from("mseo_admins").select("role").eq("user_id", user.id).maybeSingle();
  if (accessError) return reply({ error: "Unable to verify role" }, 500);
  if (!access || !["admin", "editor", "viewer"].includes(access.role)) return reply({ error: "Dashboard access denied" }, 403);

  let payload: Record<string, unknown>;
  try { payload = await req.json(); } catch { return reply({ error: "Invalid JSON" }, 400); }
  const action = String(payload.action ?? "");
  if (action === "users:list") {
    if (access.role !== "admin") return reply({ error: "Admin role required" }, 403);
    const page = Math.max(1, Math.min(1000, Number(payload.page ?? 1)));
    const { data, error } = await adminClient.auth.admin.listUsers({ page, perPage: 50 });
    if (error) return reply({ error: "Unable to list users" }, 500);
    const ids = (data.users ?? []).map((u) => u.id);
    const { data: roles, error: roleError } = await adminClient.from("mseo_admins").select("user_id,role,created_at").in("user_id", ids);
    if (roleError) return reply({ error: "Unable to load roles" }, 500);
    const roleMap = new Map((roles ?? []).map((r) => [r.user_id, r.role]));
    return reply({ users: (data.users ?? []).map((u) => ({ id: u.id, email: u.email, created_at: u.created_at, last_sign_in_at: u.last_sign_in_at, role: roleMap.get(u.id) ?? "user", email_confirmed: Boolean(u.email_confirmed_at), banned_until: u.banned_until })) });
  }
  if (action === "users:update-role") {
    if (access.role !== "admin") return reply({ error: "Admin role required" }, 403);
    const targetId = String(payload.user_id ?? "");
    const role = String(payload.role ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(targetId) || !["admin", "editor", "viewer", "user"].includes(role)) return reply({ error: "Invalid user or role" }, 400);
    if (targetId === user.id && role !== "admin") return reply({ error: "You cannot remove your own admin access here" }, 400);
    const { data: target, error: targetError } = await adminClient.auth.admin.getUserById(targetId);
    if (targetError || !target.user) return reply({ error: "User not found" }, 404);
    const { count, error: countError } = await adminClient.from("mseo_admins").select("user_id", { count: "exact", head: true }).eq("role", "admin");
    if (countError) return reply({ error: "Unable to verify admin count" }, 500);
    const { data: targetRole } = await adminClient.from("mseo_admins").select("role").eq("user_id", targetId).maybeSingle();
    if (targetRole?.role === "admin" && role !== "admin" && (count ?? 0) <= 1) return reply({ error: "Cannot remove the last admin" }, 409);
    let result;
    if (role === "user") result = await adminClient.from("mseo_admins").delete().eq("user_id", targetId);
    else result = await adminClient.from("mseo_admins").upsert({ user_id: targetId, role }, { onConflict: "user_id" });
    if (result.error) return reply({ error: "Unable to update role" }, 500);
    await adminClient.from("mseo_audit_logs").insert({ actor_id: user.id, action: "user.role.update", entity_type: "user", entity_id: targetId, details: { role } });
    return reply({ ok: true });
  }
  if (action === "users:ban") {
    if (access.role !== "admin") return reply({ error: "Admin role required" }, 403);
    const targetId = String(payload.user_id ?? "");
    const banned = payload.banned === true;
    if (!/^[0-9a-f-]{36}$/i.test(targetId) || targetId === user.id) return reply({ error: "Invalid target user" }, 400);
    const { data: targetRole } = await adminClient.from("mseo_admins").select("role").eq("user_id", targetId).maybeSingle();
    if (targetRole?.role === "admin" && banned) return reply({ error: "Admin accounts cannot be suspended here" }, 409);
    const { error } = await adminClient.auth.admin.updateUserById(targetId, { ban_duration: banned ? "876000h" : "none" });
    if (error) return reply({ error: "Unable to update account status" }, 500);
    await adminClient.from("mseo_audit_logs").insert({ actor_id: user.id, action: banned ? "user.suspend" : "user.activate", entity_type: "user", entity_id: targetId });
    return reply({ ok: true });
  }
  if (action === "users:delete") {
    if (access.role !== "admin") return reply({ error: "Admin role required" }, 403);
    const targetId = String(payload.user_id ?? "");
    if (!/^[0-9a-f-]{36}$/i.test(targetId) || targetId === user.id) return reply({ error: "Invalid target user" }, 400);
    const { data: targetRole } = await adminClient.from("mseo_admins").select("role").eq("user_id", targetId).maybeSingle();
    const { count } = await adminClient.from("mseo_admins").select("user_id", { count: "exact", head: true }).eq("role", "admin");
    if (targetRole?.role === "admin" && (count ?? 0) <= 1) return reply({ error: "Cannot delete the last admin" }, 409);
    const { error } = await adminClient.auth.admin.deleteUser(targetId);
    if (error) return reply({ error: "Unable to delete user" }, 500);
    await adminClient.from("mseo_audit_logs").insert({ actor_id: user.id, action: "user.delete", entity_type: "user", entity_id: targetId });
    return reply({ ok: true });
  }
  if (action === "content:unpublish") {
    if (!["admin", "editor"].includes(access.role)) return reply({ error: "Editor role required" }, 403);
    const token = Deno.env.get("GITHUB_TOKEN");
    const owner = Deno.env.get("GITHUB_OWNER") ?? "gpldroid";
    const repo = Deno.env.get("GITHUB_REPO") ?? "mseo";
    const branch = Deno.env.get("GITHUB_BRANCH") ?? "main";
    if (!token) return reply({ error: "GitHub publishing is not configured. Add GITHUB_TOKEN in Supabase Edge Function secrets." }, 503);
    if (owner !== "gpldroid" || repo !== "mseo") return reply({ error: "Repository target is locked to gpldroid/mseo" }, 403);
    const slug = String(payload.slug ?? "");
    if (!slugOk(slug)) return reply({ error: "Invalid content slug" }, 400);
    const apiBase = "https://api.github.com/repos/" + owner + "/" + repo + "/contents/articles/" + slug + ".html";
    const headers = { Authorization: "Bearer " + token, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    const currentFile = await fetch(apiBase + "?ref=" + encodeURIComponent(branch), { headers });
    if (currentFile.status === 404) return reply({ ok: true, alreadyAbsent: true });
    if (!currentFile.ok) return reply({ error: "GitHub read failed", status: currentFile.status }, 502);
    const file = await currentFile.json();
    const removed = await fetch(apiBase, { method: "DELETE", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ message: "cms: unpublish " + slug, sha: file.sha, branch }) });
    const removedData = await removed.json().catch(() => ({}));
    if (!removed.ok) return reply({ error: "GitHub unpublish failed", status: removed.status, detail: removedData.message ?? "GitHub API error" }, 502);
    await adminClient.from("mseo_audit_logs").insert({ actor_id: user.id, action: "content.unpublish", entity_type: "content", entity_id: slug, details: { branch } });
    return reply({ ok: true, commit: removedData.commit?.sha ?? null });
  }
  if (action === "content:publish") {
    if (!["admin", "editor"].includes(access.role)) return reply({ error: "Editor role required" }, 403);
    const token = Deno.env.get("GITHUB_TOKEN");
    const owner = Deno.env.get("GITHUB_OWNER") ?? "gpldroid";
    const repo = Deno.env.get("GITHUB_REPO") ?? "mseo";
    const branch = Deno.env.get("GITHUB_BRANCH") ?? "main";
    if (!token) return reply({ error: "GitHub publishing is not configured. Add GITHUB_TOKEN in Supabase Edge Function secrets." }, 503);
    if (owner !== "gpldroid" || repo !== "mseo") return reply({ error: "Repository target is locked to gpldroid/mseo" }, 403);
    const slug = String(payload.slug ?? "");
    const title = String(payload.title ?? "").trim();
    const summary = String(payload.summary ?? "").trim();
    const bodyHtml = String(payload.body_html ?? "");
    const seoTitle = String(payload.seo_title ?? title).trim();
    const seoDescription = String(payload.seo_description ?? summary).trim();
    const keywords = Array.isArray(payload.seo_keywords) ? payload.seo_keywords.map(String).join(", ") : "";
    const cover = String(payload.cover_image_url ?? "").trim();
    const type = payload.content_type === "page" ? "WebPage" : "Article";
    if (!slugOk(slug) || !title || title.length > 180 || bodyHtml.length > 500000 || seoDescription.length > 320) return reply({ error: "Invalid content fields" }, 400);
    const safeBody = sanitizeHtml(bodyHtml, {
      allowedTags: sanitizeHtml.defaults.allowedTags.concat(["img", "h1", "h2", "h3", "figure", "figcaption", "iframe"]),
      allowedAttributes: { ...sanitizeHtml.defaults.allowedAttributes, a: ["href", "name", "target", "rel"], img: ["src", "alt", "title", "width", "height", "loading"], iframe: ["src", "title", "width", "height", "loading", "allow", "allowfullscreen"], "*": ["class"] },
      allowedIframeHostnames: ["www.youtube.com", "youtube.com", "www.youtube-nocookie.com", "player.vimeo.com"],
      transformTags: { a: sanitizeHtml.simpleTransform("a", { rel: "noopener noreferrer", target: "_blank" }, true) },
    });
    const base = "https://gpldroid.github.io/mseo";
    const articleUrl = base + "/articles/" + slug + ".html";
    const metadata = [
      '<!doctype html>', '<html lang="ar" dir="rtl">', '<head>', '<meta charset="utf-8">',
      '<meta name="viewport" content="width=device-width,initial-scale=1">',
      '<meta name="robots" content="index,follow,max-image-preview:large">',
      '<title>' + escapeHtml(seoTitle || title) + ' | MSEO</title>',
      '<meta name="description" content="' + escapeHtml(seoDescription || summary) + '">',
      '<meta property="article:section" content="غير مصنف">',
      '<meta name="keywords" content="' + escapeHtml(keywords) + '">',
      '<link rel="canonical" href="' + articleUrl + '">',
      '<meta property="og:type" content="' + (type === "Article" ? "article" : "website") + '">',
      '<meta property="og:title" content="' + escapeHtml(seoTitle || title) + '">',
      '<meta property="og:description" content="' + escapeHtml(seoDescription || summary) + '">',
      ...(cover ? ['<meta property="og:image" content="' + escapeHtml(cover) + '">'] : []),
      '<meta name="twitter:card" content="summary_large_image">',
      '<script type="application/ld+json">' + JSON.stringify({ "@context": "https://schema.org", "@type": type, headline: title, description: summary, mainEntityOfPage: articleUrl, ...(cover ? { image: cover } : {}) }).replace(/</g, "\\u003c") + '</script>',
      '<link rel="stylesheet" href="../assets/css/style.css">', '<link rel="stylesheet" href="../assets/css/site.css">', '</head>',
      '<body><div data-site-header></div><main class="site-container site-section"><article class="site-card"><h1>' + escapeHtml(title) + '</h1>' + (summary ? '<p class="article-summary">' + escapeHtml(summary) + '</p>' : '') + safeBody + '</article></main><div data-site-footer></div><script src="../assets/js/site.js" defer></script></body></html>',
    ];
    const content = btoa(unescape(encodeURIComponent(metadata.join("\n") + "\n")));
    const apiBase = "https://api.github.com/repos/" + owner + "/" + repo + "/contents/articles/" + slug + ".html";
    const headers = { Authorization: "Bearer " + token, Accept: "application/vnd.github+json", "X-GitHub-Api-Version": "2022-11-28" };
    const get = await fetch(apiBase + "?ref=" + encodeURIComponent(branch), { headers });
    let sha: string | undefined;
    if (get.ok) sha = (await get.json()).sha;
    else if (get.status !== 404) return reply({ error: "GitHub read failed", status: get.status }, 502);
    const put = await fetch(apiBase, { method: "PUT", headers: { ...headers, "Content-Type": "application/json" }, body: JSON.stringify({ message: "cms: " + (sha ? "update " : "publish ") + slug, content, branch, ...(sha ? { sha } : {}) }) });
    const putData = await put.json().catch(() => ({}));
    if (!put.ok) return reply({ error: "GitHub publish failed", status: put.status, detail: putData.message ?? "GitHub API error" }, 502);
    await adminClient.from("mseo_audit_logs").insert({ actor_id: user.id, action: "content.publish", entity_type: "content", entity_id: slug, details: { title, branch } });
    return reply({ ok: true, url: articleUrl, commit: putData.commit?.sha ?? null });
  }
  return reply({ error: "Unknown action" }, 400);
});