import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = "https://gjkwrxvlnmshcmsjdcfd.supabase.co";
const SUPABASE_KEY = "sb_publishable_rGb3srwFQ7aCbHipegsn1A_DmTFCpNX";
const API_URL = SUPABASE_URL + "/functions/v1/mseo-admin-api";
const $ = (id) => document.getElementById(id);
const db = createClient(SUPABASE_URL, SUPABASE_KEY, { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } });
const state = { user: null, role: null, content: [], contentPage: 1, contentPageSize: 10, users: [], media: [], currentView: "overview", toastTimer: null };
const roleLabels = { admin: "مدير النظام", editor: "محرر", viewer: "قارئ", user: "مستخدم" };
const statusLabels = { draft: "مسودة", published: "منشور", archived: "مؤرشف" };
const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const dateLabel = (value) => value ? new Intl.DateTimeFormat("ar-MA", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
const canEdit = () => ["admin", "editor"].includes(state.role);
const isAdmin = () => state.role === "admin";
function toast(message, type = "success") {
  const el = $("toast"); el.textContent = message; el.className = "toast show " + type;
  clearTimeout(state.toastTimer); state.toastTimer = setTimeout(() => el.classList.remove("show"), 4200);
}
function message(id, text, success = false) {
  const el = $(id); if (!el) return; el.textContent = text; el.className = "form-message" + (success ? " success" : "");
}
function setBusy(button, busy, label = "جارٍ التنفيذ…") {
  if (!button) return;
  if (busy) { button.dataset.original = button.textContent; button.textContent = label; button.disabled = true; }
  else { button.textContent = button.dataset.original || button.textContent; button.disabled = false; }
}
async function edge(action, extra = {}) {
  const { data, error } = await db.functions.invoke("mseo-admin-api", { body: { action, ...extra } });
  if (error) {
    let detail = error.message || "تعذر الاتصال بخدمة الإدارة";
    try { const body = await error.context?.json(); if (body?.error) detail = body.error; } catch {}
    throw new Error(detail);
  }
  if (data?.error) throw new Error(data.error);
  return data;
}
async function audit(action, entityType, entityId = null, details = {}) {
  try { await db.from("mseo_audit_logs").insert({ actor_id: state.user.id, action, entity_type: entityType, entity_id: entityId == null ? null : String(entityId), details }); } catch {}
}
function showAuthMessage(text, error = true) { const el = $("authMessage"); el.textContent = text; el.style.color = error ? "#c04444" : "#12865d"; }
function showAuth() { $("authScreen").hidden = false; $("app").hidden = true; }
function showApp() { $("authScreen").hidden = true; $("app").hidden = false; $("loadingState").hidden = true; }
function updateIdentity() {
  const email = state.user?.email || "—", initial = (email[0] || "M").toUpperCase();
  $("userEmail").textContent = email; $("userRole").textContent = roleLabels[state.role] || state.role;
  $("userAvatar").textContent = initial; $("settingsAvatar").textContent = initial;
  $("settingsEmail").textContent = email; $("settingsRole").textContent = roleLabels[state.role] || state.role;
  document.querySelectorAll(".admin-only").forEach(el => { el.hidden = !isAdmin(); });
  document.querySelectorAll("[data-action='new-content']").forEach(el => { el.hidden = !canEdit(); });
  $("newContent").hidden = !canEdit();
}
async function establishSession(session) {
  if (!session?.user) { state.user = null; state.role = null; showAuth(); return; }
  state.user = session.user;
  const { data: access, error } = await db.from("mseo_admins").select("role").eq("user_id", state.user.id).maybeSingle();
  if (error) { showAuth(); showAuthMessage("تعذر التحقق من الصلاحيات. تحقق من اتصال Supabase ثم أعد المحاولة."); return; }
  if (!access || !["admin", "editor", "viewer"].includes(access.role)) {
    $("loginView").hidden = true; $("deniedView").hidden = false; showAuth(); return;
  }
  $("loginView").hidden = false; $("deniedView").hidden = true;
  state.role = access.role; updateIdentity(); showApp();
  await loadOverview();
}
async function signOut() { await db.auth.signOut(); state.user = null; state.role = null; showAuth(); $("loginView").hidden = false; $("deniedView").hidden = true; }
async function loadOverview() {
  $("loadingState").hidden = false;
  try {
    const [counts, recent] = await Promise.all([
      db.from("mseo_content_items").select("id,status,content_type", { count: "exact" }).order("updated_at", { ascending: false }).limit(1000),
      db.from("mseo_content_items").select("id,title,slug,status,content_type,updated_at").order("updated_at", { ascending: false }).limit(5)
    ]);
    if (counts.error) throw counts.error; if (recent.error) throw recent.error;
    const rows = counts.data || [], published = rows.filter(x => x.status === "published").length, drafts = rows.filter(x => x.status === "draft").length;
    $("kpiContent").textContent = String(counts.count ?? rows.length); $("kpiPublished").textContent = String(published); $("kpiDrafts").textContent = String(drafts); $("contentNavCount").textContent = String(rows.length);
    renderChart(rows); renderRecent(recent.data || []);
    if (isAdmin()) {
      try { const users = await edge("users:list", { page: 1 }); $("kpiUsers").textContent = String(users.users?.length ?? "—"); }
      catch { $("kpiUsers").textContent = "—"; }
    }
  } catch (error) { toast("تعذر تحميل الملخص: " + error.message, "error"); }
  finally { $("loadingState").hidden = true; }
}
function renderChart(rows) {
  const values = [{ key: "published", label: "منشور", value: rows.filter(x => x.status === "published").length }, { key: "draft", label: "مسودة", value: rows.filter(x => x.status === "draft").length }, { key: "archived", label: "مؤرشف", value: rows.filter(x => x.status === "archived").length }];
  const max = Math.max(1, ...values.map(x => x.value));
  $("contentChart").innerHTML = values.map(x => '<div class="bar-row"><span>' + x.label + '</span><div class="bar-track"><div class="bar-fill ' + x.key + '" style="width:' + Math.max(x.value ? 3 : 0, x.value / max * 100) + '%"></div></div><strong class="bar-value">' + x.value + '</strong></div>').join("");
}
function renderRecent(rows) {
  $("recentContent").innerHTML = rows.length ? rows.map(x => '<div class="recent-row"><span class="recent-file">▤</span><div class="recent-info"><strong>' + escapeHtml(x.title) + '</strong><small>' + escapeHtml(x.slug) + ' · ' + dateLabel(x.updated_at) + '</small></div><span class="status-pill ' + escapeHtml(x.status) + '">' + (statusLabels[x.status] || x.status) + '</span></div>').join("") : '<p class="empty-cell">لا يوجد محتوى بعد. أنشئ أول مقال من زر «محتوى جديد».</p>';
}
function goView(view) {
  if (view === "users" && !isAdmin()) return toast("هذه الصفحة متاحة للمدير فقط.", "error");
  state.currentView = view;
  document.querySelectorAll(".view").forEach(el => el.hidden = el.id !== "view-" + view);
  document.querySelectorAll(".nav-item[data-view]").forEach(el => el.classList.toggle("active", el.dataset.view === view));
  const titles = { overview: "نظرة عامة", content: "إدارة المحتوى", media: "مكتبة الوسائط", users: "المستخدمون", activity: "سجل النشاط", settings: "الإعدادات" };
  $("pageTitle").textContent = titles[view] || "لوحة الإدارة"; $("sidebar").classList.remove("open");
  if (view === "content") loadContent();
  if (view === "media") loadMedia();
  if (view === "users") loadUsers();
  if (view === "activity") loadActivity();
}
async function loadContent() {
  $("contentRows").innerHTML = '<tr><td colspan="5" class="empty-cell">جارٍ تحميل المحتوى…</td></tr>';
  let query = db.from("mseo_content_items").select("id,slug,title,summary,content_type,status,updated_at,published_at,seo_title,seo_description,seo_keywords,cover_image_url,body_html,created_by,updated_by", { count: "exact" }).order("updated_at", { ascending: false });
  const statusValue = $("contentStatus").value, typeValue = $("contentType").value;
  if (statusValue) query = query.eq("status", statusValue);
  if (typeValue) query = query.eq("content_type", typeValue);
  const search = $("contentSearch").value.trim();
  if (search) query = query.or("title.ilike.%" + search.replace(/[%(),]/g, " ") + "%,slug.ilike.%" + search.replace(/[%(),]/g, " ") + "%");
  const start = (state.contentPage - 1) * state.contentPageSize;
  const { data, error, count } = await query.range(start, start + state.contentPageSize - 1);
  if (error) { $("contentRows").innerHTML = '<tr><td colspan="5" class="empty-cell">تعذر تحميل المحتوى: ' + escapeHtml(error.message) + '</td></tr>'; return; }
  state.content = data || [];
  $("contentRows").innerHTML = state.content.length ? state.content.map(x => '<tr><td><div class="table-title"><span class="table-title-icon">▤</span><div><strong>' + escapeHtml(x.title) + '</strong><small>' + escapeHtml(x.slug) + '</small></div></div></td><td>' + (x.content_type === "page" ? "صفحة" : "مقال") + '</td><td><span class="status-pill ' + escapeHtml(x.status) + '">' + (statusLabels[x.status] || x.status) + '</span></td><td>' + dateLabel(x.updated_at) + '</td><td><div class="row-actions"><button class="icon-button" data-edit="' + x.id + '" title="تحرير">تحرير</button>' + (canEdit() && x.status !== "published" ? '<button class="icon-button" data-publish="' + x.id + '">نشر</button>' : '') + (canEdit() && x.status === "published" ? '<button class="icon-button" data-unpublish="' + x.id + '">إلغاء النشر</button>' : '') + (isAdmin() ? '<button class="icon-button danger" data-delete="' + x.id + '">حذف</button>' : '') + '</div></td></tr>').join("") : '<tr><td colspan="5" class="empty-cell">لا توجد نتائج مطابقة.</td></tr>';
  $("contentPageInfo").textContent = (count || 0) ? "عرض " + (start + 1) + "–" + Math.min(start + state.contentPageSize, count) + " من " + count : "لا توجد عناصر";
  $("prevPage").disabled = state.contentPage <= 1; $("nextPage").disabled = start + state.contentPageSize >= (count || 0);
}
function newContent() {
  if (!canEdit()) return toast("صلاحية القراءة فقط.", "error");
  $("contentForm").reset(); $("contentId").value = ""; $("editorHeading").textContent = "إنشاء محتوى جديد"; $("editorMessage").textContent = "";
  $("contentKind").value = "article"; $("editorPanel").hidden = false; $("contentTitle").focus();
  $("editorPanel").scrollIntoView({ behavior: "smooth", block: "start" });
}
function editContent(id) {
  if (!canEdit()) return toast("صلاحية القراءة فقط.", "error");
  const x = state.content.find(item => item.id === id); if (!x) return;
  $("contentId").value = x.id; $("contentTitle").value = x.title; $("contentSlug").value = x.slug; $("contentKind").value = x.content_type;
  $("contentSummary").value = x.summary || ""; $("contentBody").value = x.body_html || ""; $("seoTitle").value = x.seo_title || "";
  $("seoDescription").value = x.seo_description || ""; $("seoKeywords").value = (x.seo_keywords || []).join(", "); $("coverImage").value = x.cover_image_url || "";
  $("editorHeading").textContent = "تحرير: " + x.title; $("editorMessage").textContent = ""; $("editorPanel").hidden = false;
  $("editorPanel").scrollIntoView({ behavior: "smooth", block: "start" });
}
function formPayload(status) {
  const title = $("contentTitle").value.trim(), slug = $("contentSlug").value.trim();
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) throw new Error("المسار يجب أن يستخدم حروفًا إنجليزية صغيرة وأرقامًا وشرطات فقط.");
  if (!title) throw new Error("العنوان مطلوب.");
  const image = $("coverImage").value.trim();
  if (image && !/^https:\/\//i.test(image)) throw new Error("رابط صورة الغلاف يجب أن يبدأ بـ https://");
  return { title, slug, summary: $("contentSummary").value.trim(), body_html: $("contentBody").value, content_type: $("contentKind").value, status, seo_title: $("seoTitle").value.trim() || title, seo_description: $("seoDescription").value.trim() || $("contentSummary").value.trim(), seo_keywords: $("seoKeywords").value.split(",").map(x => x.trim()).filter(Boolean).slice(0, 30), cover_image_url: image, updated_by: state.user.id };
}
async function saveContent(status) {
  if (!canEdit()) throw new Error("ليس لديك صلاحية تحرير المحتوى.");
  const payload = formPayload(status), id = $("contentId").value, existing = state.content.find(x => x.id === id);
  if (id && existing) {
    const { error: revisionError } = await db.from("mseo_content_revisions").insert({ content_id: id, slug: existing.slug, title: existing.title, body_html: existing.body_html || "", status: existing.status, changed_by: state.user.id });
    if (revisionError) throw revisionError;
  }
  let result;
  if (id) result = await db.from("mseo_content_items").update({ ...payload, published_at: status === "published" ? (existing?.published_at || new Date().toISOString()) : null }).eq("id", id).select().single();
  else result = await db.from("mseo_content_items").insert({ ...payload, created_by: state.user.id, published_at: status === "published" ? new Date().toISOString() : null }).select().single();
  if (result.error) throw result.error;
  const saved = result.data;
  if (status === "published") {
    try {
      const published = await edge("content:publish", { slug: saved.slug, title: saved.title, summary: saved.summary, body_html: saved.body_html, content_type: saved.content_type, seo_title: saved.seo_title, seo_description: saved.seo_description, seo_keywords: saved.seo_keywords, cover_image_url: saved.cover_image_url });
      await audit("content.publish", "content", saved.id, { slug: saved.slug, url: published.url });
      toast("تم النشر بنجاح إلى GitHub Pages.");
    } catch (error) {
      await db.from("mseo_content_items").update({ status: "draft", published_at: null, updated_by: state.user.id }).eq("id", saved.id);
      throw new Error("حُفظ المحتوى كمسودة، لكن النشر لم يكتمل: " + error.message);
    }
  } else {
    await audit(id ? "content.update" : "content.create", "content", saved.id, { slug: saved.slug, status });
    toast(status === "draft" ? "تم حفظ المسودة." : "تم حفظ المحتوى.");
  }
  $("contentId").value = saved.id;
  await loadContent(); await loadOverview();
  return saved;
}
async function saveContentButton(status, button) {
  setBusy(button, true);
  try { await saveContent(status); $("editorPanel").hidden = true; }
  catch (error) { message("editorMessage", error.message); }
  finally { setBusy(button, false); }
}
async function publishExisting(id) {
  const item = state.content.find(x => x.id === id); if (!item) return;
  if (!confirm('نشر "' + item.title + '" إلى GitHub Pages؟')) return;
  try {
    const published = await edge("content:publish", { slug: item.slug, title: item.title, summary: item.summary, body_html: item.body_html, content_type: item.content_type, seo_title: item.seo_title, seo_description: item.seo_description, seo_keywords: item.seo_keywords, cover_image_url: item.cover_image_url });
    const { error } = await db.from("mseo_content_items").update({ status: "published", published_at: item.published_at || new Date().toISOString(), updated_by: state.user.id }).eq("id", item.id);
    if (error) throw error;
    await audit("content.publish", "content", item.id, { slug: item.slug, url: published.url });
    toast("تم النشر إلى GitHub Pages."); await loadContent(); await loadOverview();
  } catch (error) { toast(error.message, "error"); }
}
async function unpublishExisting(id) {
  const item = state.content.find(x => x.id === id); if (!item) return;
  if (!confirm('إلغاء نشر "' + item.title + '"؟ سيُحذف ملفه المنشور من GitHub Pages.')) return;
  try {
    await edge("content:unpublish", { slug: item.slug });
    const { error } = await db.from("mseo_content_items").update({ status: "draft", published_at: null, updated_by: state.user.id }).eq("id", item.id);
    if (error) throw error;
    await audit("content.unpublish", "content", item.id, { slug: item.slug });
    toast("تم إلغاء النشر."); await loadContent(); await loadOverview();
  } catch (error) { toast(error.message, "error"); }
}
async function deleteContent(id) {
  if (!isAdmin()) return;
  const item = state.content.find(x => x.id === id); if (!item || !confirm('حذف "' + item.title + '" نهائيًا من قاعدة البيانات؟')) return;
  try {
    if (item.status === "published") await edge("content:unpublish", { slug: item.slug });
    const { error } = await db.from("mseo_content_items").delete().eq("id", id); if (error) throw error;
    await audit("content.delete", "content", id, { slug: item.slug });
    toast("تم حذف المحتوى."); await loadContent(); await loadOverview();
  } catch (error) { toast(error.message, "error"); }
}
async function loadUsers() {
  if (!isAdmin()) return;
  $("userRows").innerHTML = '<tr><td colspan="6" class="empty-cell">جارٍ تحميل المستخدمين…</td></tr>';
  try {
    const result = await edge("users:list", { page: 1 }); state.users = result.users || []; renderUsers();
  } catch (error) { $("userRows").innerHTML = '<tr><td colspan="6" class="empty-cell">' + escapeHtml(error.message) + '</td></tr>'; }
}
function renderUsers() {
  const search = $("userSearch").value.trim().toLowerCase(), users = state.users.filter(u => (u.email || "").toLowerCase().includes(search));
  $("userRows").innerHTML = users.length ? users.map(u => {
    const banned = Boolean(u.banned_until && new Date(u.banned_until) > new Date());
    return '<tr><td><div class="table-title"><span class="table-title-icon">♙</span><div><strong>' + escapeHtml(u.email || "بدون بريد") + '</strong><small>' + escapeHtml(u.id.slice(0, 8)) + '…</small></div></div></td><td>' + dateLabel(u.created_at) + '</td><td>' + dateLabel(u.last_sign_in_at) + '</td><td><select class="user-role-select" data-role-user="' + u.id + '" ' + (u.id === state.user.id ? "disabled" : "") + '><option value="user" ' + (u.role === "user" ? "selected" : "") + '>مستخدم</option><option value="viewer" ' + (u.role === "viewer" ? "selected" : "") + '>قارئ</option><option value="editor" ' + (u.role === "editor" ? "selected" : "") + '>محرر</option><option value="admin" ' + (u.role === "admin" ? "selected" : "") + '>مدير</option></select></td><td><span class="status-pill ' + (banned ? "archived" : u.email_confirmed ? "published" : "draft") + '">' + (banned ? "حساب معطّل" : u.email_confirmed ? "بريد مؤكد" : "بانتظار التأكيد") + '</span></td><td><div class="row-actions"><button class="icon-button" data-ban-user="' + u.id + '" data-banned="' + banned + '" ' + (u.id === state.user.id || u.role === "admin" ? "disabled" : "") + '>' + (banned ? "تفعيل" : "تعطيل") + '</button><button class="icon-button danger" data-delete-user="' + u.id + '" ' + (u.id === state.user.id ? "disabled" : "") + '>حذف</button></div></td></tr>';
  }).join("") : '<tr><td colspan="6" class="empty-cell">لا توجد حسابات مطابقة.</td></tr>';
  $("userPageInfo").textContent = "المعروض: " + users.length + " — أول 50 مستخدمًا";
}
async function changeRole(userId, role) {
  if (!confirm("تأكيد تغيير صلاحية هذا الحساب إلى «" + (roleLabels[role] || role) + "»؟")) { await loadUsers(); return; }
  try { await edge("users:update-role", { user_id: userId, role }); toast("تم تحديث الصلاحية."); await loadUsers(); await loadOverview(); }
  catch (error) { toast(error.message, "error"); await loadUsers(); }
}
async function changeBan(userId, banned) {
  const target = state.users.find(u => u.id === userId);
  if (!target || !confirm((banned ? "تعطيل" : "إعادة تفعيل") + " حساب " + target.email + "؟")) return;
  try { await edge("users:ban", { user_id: userId, banned }); toast(banned ? "تم تعطيل الحساب." : "تمت إعادة تفعيل الحساب."); await loadUsers(); }
  catch (error) { toast(error.message, "error"); }
}
async function deleteUser(userId) {
  const target = state.users.find(u => u.id === userId);
  if (!target || !confirm("حذف حساب " + target.email + " نهائيًا؟ لا يمكن التراجع عن ذلك.")) return;
  try { await edge("users:delete", { user_id: userId }); toast("تم حذف الحساب."); await loadUsers(); await loadOverview(); }
  catch (error) { toast(error.message, "error"); }
}
async function loadMedia() {
  $("mediaGrid").innerHTML = '<p class="empty-cell">جارٍ تحميل الوسائط…</p>';
  const { data, error } = await db.storage.from("mseo-media").list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });
  if (error) { $("mediaGrid").innerHTML = '<p class="empty-cell">' + escapeHtml(error.message) + '</p>'; return; }
  state.media = (data || []).filter(f => f.name && f.id);
  $("mediaGrid").innerHTML = state.media.length ? state.media.map(f => {
    const { data: url } = db.storage.from("mseo-media").getPublicUrl(f.name);
    const isImage = /^image\//.test(f.metadata?.mimetype || "") || /\.(png|jpe?g|webp|gif|svg)$/i.test(f.name);
    return '<article class="media-card"><div class="media-thumb">' + (isImage ? '<img loading="lazy" src="' + escapeHtml(url.publicUrl) + '" alt="' + escapeHtml(f.name) + '">' : '<span>▧</span>') + '</div><div class="media-meta"><strong title="' + escapeHtml(f.name) + '">' + escapeHtml(f.name) + '</strong><small>' + (f.metadata?.size ? (f.metadata.size / 1024).toFixed(0) + " KB" : "ملف وسائط") + '</small><div class="media-actions"><button class="icon-button" data-copy-url="' + escapeHtml(url.publicUrl) + '">نسخ الرابط</button>' + (isAdmin() ? '<button class="icon-button danger" data-delete-media="' + escapeHtml(f.name) + '">حذف</button>' : '') + '</div></div></article>';
  }).join("") : '<p class="empty-cell">المكتبة فارغة. ارفع صورة للبدء.</p>';
}
async function uploadMedia(files) {
  for (const file of files) {
    if (file.size > 10 * 1024 * 1024) { toast(file.name + ": الحجم أكبر من 10 MB.", "error"); continue; }
    if (!/^image\/(jpeg|png|webp|gif|svg\+xml)$/.test(file.type)) { toast(file.name + ": نوع الملف غير مسموح.", "error"); continue; }
    const safeName = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g, "-").replace(/^-+|-+$/g, "").slice(-100) || "image";
    const path = new Date().toISOString().slice(0, 10) + "/" + crypto.randomUUID() + "-" + safeName;
    const { error } = await db.storage.from("mseo-media").upload(path, file, { upsert: false, contentType: file.type, cacheControl: "3600" });
    if (error) { toast("فشل رفع " + file.name + ": " + error.message, "error"); continue; }
    await audit("media.upload", "media", path, { name: file.name, size: file.size });
  }
  $("mediaUpload").value = ""; await loadMedia(); toast("اكتملت معالجة ملفات الوسائط.");
}
async function deleteMedia(path) {
  if (!isAdmin() || !confirm("حذف هذا الملف من مكتبة الوسائط؟")) return;
  const { error } = await db.storage.from("mseo-media").remove([path]);
  if (error) return toast(error.message, "error");
  await audit("media.delete", "media", path); toast("تم حذف الملف."); await loadMedia();
}
async function loadActivity() {
  $("activityList").innerHTML = '<p class="empty-cell">جارٍ تحميل السجل…</p>';
  const { data, error } = await db.from("mseo_audit_logs").select("id,actor_id,action,entity_type,entity_id,details,created_at").order("created_at", { ascending: false }).limit(100);
  if (error) { $("activityList").innerHTML = '<p class="empty-cell">' + escapeHtml(error.message) + '</p>'; return; }
  const labels = { "content.publish": "نشر محتوى", "content.unpublish": "إلغاء نشر محتوى", "content.create": "إنشاء محتوى", "content.update": "تعديل محتوى", "content.delete": "حذف محتوى", "user.role.update": "تغيير صلاحية مستخدم", "user.delete": "حذف مستخدم", "media.upload": "رفع ملف وسائط", "media.delete": "حذف ملف وسائط" };
  $("activityList").innerHTML = data?.length ? data.map(x => '<div class="activity-row"><span class="activity-icon">◷</span><div><strong>' + escapeHtml(labels[x.action] || x.action) + '</strong><small>' + escapeHtml(x.entity_type) + (x.entity_id ? " · " + escapeHtml(x.entity_id) : "") + (x.details?.slug ? " · " + escapeHtml(x.details.slug) : "") + '</small></div><time>' + dateLabel(x.created_at) + '</time></div>').join("") : '<p class="empty-cell">لا توجد أحداث مسجلة بعد.</p>';
}
async function updatePassword(event) {
  event.preventDefault(); const a = $("newPassword").value, b = $("confirmPassword").value;
  if (a.length < 10) return message("passwordMessage", "استخدم 10 أحرف على الأقل.");
  if (a !== b) return message("passwordMessage", "كلمتا المرور غير متطابقتين.");
  const { error } = await db.auth.updateUser({ password: a });
  if (error) return message("passwordMessage", error.message);
  $("passwordForm").reset(); message("passwordMessage", "تم تحديث كلمة المرور.", true);
}
async function login(event) {
  event.preventDefault(); const button = $("loginForm").querySelector("button[type=submit]"); setBusy(button, true, "جارٍ تسجيل الدخول…"); showAuthMessage("");
  const { error } = await db.auth.signInWithPassword({ email: $("email").value.trim(), password: $("password").value });
  setBusy(button, false);
  if (error) return showAuthMessage(error.message === "Invalid login credentials" ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." : error.message);
  $("password").value = "";
}
async function githubLogin() {
  const { error } = await db.auth.signInWithOAuth({ provider: "github", options: { redirectTo: window.location.href.split("#")[0] } });
  if (error) showAuthMessage("تعذر بدء GitHub OAuth: " + error.message);
}
async function signup() {
  const email = $("email").value.trim(), password = $("password").value;
  if (!email || password.length < 8) return showAuthMessage("أدخل بريدًا صالحًا وكلمة مرور من 8 أحرف على الأقل.");
  const { data, error } = await db.auth.signUp({ email, password });
  if (error) return showAuthMessage(error.message);
  if (data.session) await establishSession(data.session);
  showAuthMessage("تم إنشاء الحساب. لن تتمكن من دخول لوحة الإدارة حتى يمنحك المدير دورًا في mseo_admins؛ تحقق من بريدك لتأكيد الحساب إذا طُلب ذلك.", false);
}
async function resetPassword() {
  const email = $("email").value.trim();
  if (!email) return showAuthMessage("أدخل البريد الإلكتروني أولًا.");
  const { error } = await db.auth.resetPasswordForEmail(email, { redirectTo: window.location.href.split("#")[0] });
  if (error) return showAuthMessage(error.message);
  showAuthMessage("إذا كان الحساب موجودًا، ستصلك رسالة لاستعادة كلمة المرور.", false);
}
function bindEvents() {
  $("loginForm").addEventListener("submit", login);
  $("githubLogin").addEventListener("click", githubLogin);
  $("forgotPassword").addEventListener("click", resetPassword);
  $("signupButton").addEventListener("click", signup);
  $("deniedSignOut").addEventListener("click", signOut);
  $("signOut").addEventListener("click", signOut);
  $("mobileMenu").addEventListener("click", () => $("sidebar").classList.toggle("open"));
  document.querySelectorAll("[data-view]").forEach(el => el.addEventListener("click", () => goView(el.dataset.view)));
  document.querySelectorAll("[data-action='new-content']").forEach(el => el.addEventListener("click", () => { goView("content"); newContent(); }));
  $("newContent").addEventListener("click", newContent); $("closeEditor").addEventListener("click", () => $("editorPanel").hidden = true);
  $("contentForm").addEventListener("submit", e => { e.preventDefault(); saveContentButton("published", $("publishContent")); });
  $("saveDraft").addEventListener("click", () => saveContentButton("draft", $("saveDraft")));
  $("contentTitle").addEventListener("input", () => { if (!$("contentId").value) $("contentSlug").value = $("contentTitle").value.normalize("NFKD").toLowerCase().replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, ""); if (!$("seoTitle").value) $("seoTitle").value = $("contentTitle").value; });
  $("contentSummary").addEventListener("input", () => { if (!$("seoDescription").value) $("seoDescription").value = $("contentSummary").value; });
  $("contentRows").addEventListener("click", e => { const b = e.target.closest("button"); if (!b) return; if (b.dataset.edit) editContent(b.dataset.edit); if (b.dataset.publish) publishExisting(b.dataset.publish); if (b.dataset.unpublish) unpublishExisting(b.dataset.unpublish); if (b.dataset.delete) deleteContent(b.dataset.delete); });
  $("contentSearch").addEventListener("input", () => { state.contentPage = 1; clearTimeout(state.searchTimer); state.searchTimer = setTimeout(loadContent, 250); });
  $("contentStatus").addEventListener("change", () => { state.contentPage = 1; loadContent(); }); $("contentType").addEventListener("change", () => { state.contentPage = 1; loadContent(); });
  $("prevPage").addEventListener("click", () => { if (state.contentPage > 1) { state.contentPage--; loadContent(); } });
  $("nextPage").addEventListener("click", () => { state.contentPage++; loadContent(); });
  $("mediaUpload").addEventListener("change", e => { if (canEdit() && e.target.files?.length) uploadMedia([...e.target.files]); else if (!canEdit()) toast("لا تملك صلاحية رفع الوسائط.", "error"); });
  $("mediaGrid").addEventListener("click", async e => { const b = e.target.closest("button"); if (!b) return; if (b.dataset.copyUrl) { try { await navigator.clipboard.writeText(b.dataset.copyUrl); toast("تم نسخ الرابط."); } catch { prompt("انسخ الرابط:", b.dataset.copyUrl); } } if (b.dataset.deleteMedia) deleteMedia(b.dataset.deleteMedia); });
  $("refreshUsers").addEventListener("click", loadUsers); $("userSearch").addEventListener("input", renderUsers);
  $("userRows").addEventListener("change", e => { const el = e.target.closest("[data-role-user]"); if (el) changeRole(el.dataset.roleUser, el.value); });
  $("userRows").addEventListener("click", e => { const ban = e.target.closest("[data-ban-user]"); if (ban) changeBan(ban.dataset.banUser, ban.dataset.banned !== "true"); const el = e.target.closest("[data-delete-user]"); if (el) deleteUser(el.dataset.deleteUser); });
  $("refreshActivity").addEventListener("click", loadActivity); $("passwordForm").addEventListener("submit", updatePassword);
}
bindEvents();
db.auth.onAuthStateChange((_event, session) => { queueMicrotask(() => establishSession(session)); });
const { data: { session } } = await db.auth.getSession();
await establishSession(session);
