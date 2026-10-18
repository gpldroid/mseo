import { useCallback, useEffect, useState, type FormEvent } from "react";
import { Activity, BookOpen, CheckCircle2, FilePlus2, Github, LogOut, RefreshCw, Search, ShieldCheck, Trash2 } from "lucide-react";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { supabase, supabaseConfigured } from "./lib/supabase";
import AdminTools from "./AdminTools";
import RichTextEditor from "./RichTextEditor";

const arabicLetters: Record<string, string> = { "ا":"a","أ":"a","إ":"i","آ":"aa","ء":"","ؤ":"u","ئ":"i","ب":"b","ت":"t","ث":"th","ج":"j","ح":"h","خ":"kh","د":"d","ذ":"dh","ر":"r","ز":"z","س":"s","ش":"sh","ص":"s","ض":"d","ط":"t","ظ":"z","ع":"a","غ":"gh","ف":"f","ق":"q","ك":"k","ل":"l","م":"m","ن":"n","ه":"h","و":"w","ي":"y","ى":"a","ة":"h","پ":"p","چ":"ch","گ":"g" };
function slugify(value: string) {
  const transliterated = value.normalize("NFKD").replace(/\p{M}/gu, "").split("").map(char => arabicLetters[char] ?? char).join("");
  return transliterated.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

async function triggerContentPublish(slug: string, status: string) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("انتهت جلسة الدخول.");
  const base = ((import.meta.env.VITE_ADMIN_API_URL as string | undefined)?.trim() || "https://mseopro.netlify.app/.netlify/functions").replace(/\/$/, "");
  const response = await fetch(`${base}/publish-content`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    body: JSON.stringify({ slug, status }),
  });
  const result = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(result.error || `فشل تشغيل النشر (${response.status})`);
  return result.message as string;
}

type ContentRow = {
  id: string; slug: string; title: string; summary: string; body_html: string;
  content_type: "article" | "page"; post_type: string; status: "draft" | "published" | "archived";
  seo_title: string; seo_description: string; seo_keywords: string[]; semantic_keywords: string[]; categories: string[]; tags: string[]; cover_image_url: string;
  created_at: string; updated_at: string; published_at: string | null;
};

function Root() {
  const auth = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rows, setRows] = useState<ContentRow[]>([]);
  const [query, setQuery] = useState("");
  const [editing, setEditing] = useState<ContentRow | null>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showEditor, setShowEditor] = useState(false);
  const [form, setForm] = useState({ title: "", slug: "", summary: "", body_html: "", content_type: "article" as "article" | "page", post_type: "article", status: "draft" as "draft" | "published" | "archived", seo_title: "", seo_description: "", seo_keywords: "", semantic_keywords: "", categories: "", tags: "", cover_image_url: "" });
  const isAdmin = auth.role === "admin" || auth.role === "owner";
  const canEdit = isAdmin || auth.role === "editor";

  const load = useCallback(async () => {
    if (!auth.user || !auth.role) return;
    setBusy(true); setError("");
    try {
      const { data, error: e } = await supabase.from("mseo_content_items").select("*").order("updated_at", { ascending: false }).limit(500);
      if (e) throw e;
      setRows((data ?? []) as ContentRow[]);
    } catch (e) { setError(e instanceof Error ? e.message : "تعذر تحميل المحتوى"); }
    finally { setBusy(false); }
  }, [auth.user?.id, auth.role]);

  useEffect(() => { if (auth.user && auth.role) void load(); }, [auth.user?.id, auth.role, load]);

  const startNew = () => {
    setEditing(null);
    setForm({ title: "", slug: "", summary: "", body_html: "", content_type: "article", post_type: "article", status: "draft", seo_title: "", seo_description: "", seo_keywords: "", semantic_keywords: "", categories: "", tags: "", cover_image_url: "" });
    setShowEditor(true);
  };
  const startEdit = (row: ContentRow) => {
    setEditing(row);
    setForm({ title: row.title, slug: row.slug, summary: row.summary ?? "", body_html: row.body_html ?? "", content_type: row.content_type, post_type: row.post_type ?? (row.content_type === "article" ? "article" : "landing"), status: row.status, seo_title: row.seo_title ?? "", seo_description: row.seo_description ?? "", seo_keywords: (row.seo_keywords ?? []).join(", "), semantic_keywords: (row.semantic_keywords ?? []).join(", "), categories: (row.categories ?? []).join(", "), tags: (row.tags ?? []).join(", "), cover_image_url: row.cover_image_url ?? "" });
    setShowEditor(true);
  };
  const save = async (event: FormEvent) => {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    const slug = slugify(form.slug || form.title);
    if (!slug) { setError("أدخل رابطًا مختصرًا صالحًا بالأحرف اللاتينية."); setBusy(false); return; }
    const { data: { user } } = await supabase.auth.getUser();
    const publishedAt = form.status === "published" ? (editing?.published_at ?? new Date().toISOString()) : null;
    const parseTerms = (value: string) => { const seen = new Set<string>(); return value.split(/[,،\n]/).map(x => x.trim()).filter(x => { const key = x.toLocaleLowerCase("ar"); if (!x || seen.has(key)) return false; seen.add(key); return true; }); };
    const payload = { title: form.title.trim(), slug, summary: form.summary, body_html: form.body_html, content_type: form.content_type, post_type: form.post_type, status: form.status, seo_title: form.seo_title, seo_description: form.seo_description, seo_keywords: parseTerms(form.seo_keywords), semantic_keywords: parseTerms(form.semantic_keywords), categories: parseTerms(form.categories), tags: parseTerms(form.tags), cover_image_url: form.cover_image_url, published_at: publishedAt, updated_by: user?.id, ...(editing ? {} : { created_by: user?.id }) };
    const result = editing
      ? await supabase.from("mseo_content_items").update(payload).eq("id", editing.id).select().single()
      : await supabase.from("mseo_content_items").insert(payload).select().single();
    if (result.error) { setError(result.error.message); setBusy(false); return; }
    await supabase.from("mseo_audit_logs").insert({ actor_id: user?.id, action: editing ? "content.updated" : "content.created", entity_type: form.content_type, entity_id: result.data.id, details: { title: form.title } });
    let publishNotice = "تم حفظ المحتوى في Supabase.";
    try { publishNotice = await triggerContentPublish(slug, form.status); }
    catch (publishError) { publishNotice += " لكن تعذّر بدء النشر التلقائي: " + (publishError instanceof Error ? publishError.message : "خطأ غير معروف") + ". تحقق من إعدادات Netlify ثم شغّل البناء يدويًا."; }
    setShowEditor(false); setNotice(publishNotice); await load();
  };
  const remove = async (row: ContentRow) => {
    if (!isAdmin || !window.confirm("هل تريد حذف هذا المحتوى نهائيًا؟")) return;
    const { error: e } = await supabase.from("mseo_content_items").delete().eq("id", row.id);
    if (e) setError(e.message); else {
      try { setNotice(await triggerContentPublish(row.slug, "deleted")); }
      catch (publishError) { setNotice("تم حذف السجل، لكن تعذّر بدء إعادة البناء: " + (publishError instanceof Error ? publishError.message : "خطأ غير معروف")); }
      await load();
    }
  };

  if (auth.loading) return <div className="auth-shell"><div className="login-card"><div className="brand-mark">M</div><h1>MSEO Pro</h1><p>جارٍ التحقق من الجلسة والصلاحيات…</p></div></div>;
  if (!supabaseConfigured) return <div className="auth-shell"><div className="login-card"><h1>MSEO Pro</h1><p>إعداد اتصال قاعدة البيانات غير مكتمل.</p></div></div>;
  if (!auth.user) return <div className="auth-shell"><form className="login-card" onSubmit={async e => { e.preventDefault(); setBusy(true); setError(""); try { await auth.signIn(email, password); } catch (x) { setError(x instanceof Error ? x.message : "فشل تسجيل الدخول"); } finally { setBusy(false); } }}>
    <div className="brand-mark">M</div><p className="eyebrow">MSEO PRO · ADMIN</p><h1>مرحبًا بعودتك</h1><p className="subtext">سجّل الدخول لإدارة المحتوى وتحسين محركات البحث.</p>
    {error && <div className="alert error">{error}</div>}
    <label>البريد الإلكتروني<input type="email" autoComplete="username" required value={email} onChange={e => setEmail(e.target.value)} placeholder="you@example.com"/></label>
    <label>كلمة المرور<input type="password" autoComplete="current-password" required value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••"/></label>
    <button className="btn primary wide" disabled={busy}>{busy ? "جارٍ الدخول…" : "تسجيل الدخول"}</button>
    <div className="or-divider"><span>أو</span></div>
    <button type="button" className="btn secondary wide" disabled={busy} onClick={() => void auth.signInGitHub().catch(x => setError(x instanceof Error ? x.message : "فشل تسجيل الدخول عبر GitHub"))}><Github size={18}/> المتابعة باستخدام GitHub</button>
    <p className="fine-print">يتطلب الدخول حسابًا مُضافًا مسبقًا إلى قائمة مديري MSEO.</p>
    <a className="help-link" href="https://supabase.com/dashboard/project/gjkwrxvlnmshcmsjdcfd/auth/url-configuration" target="_blank" rel="noreferrer">إعدادات المصادقة</a>
  </form></div>;

  if (!auth.role) return <div className="auth-shell"><div className="login-card"><div className="brand-mark">M</div><h1>الحساب غير مخوّل</h1><p>تم تسجيل الدخول، لكن هذا الحساب غير موجود في قائمة صلاحيات MSEO.</p><p className="subtext">اطلب من مدير المشروع إضافتك إلى جدول <code>mseo_admins</code>.</p><button className="btn secondary wide" onClick={() => void auth.signOut()}>تسجيل الخروج</button></div></div>;

  const filtered = rows.filter(r => [r.title, r.slug, r.summary, r.seo_title].some(v => (v ?? "").toLowerCase().includes(query.toLowerCase())));
  const published = rows.filter(r => r.status === "published").length;
  const drafts = rows.filter(r => r.status === "draft").length;
  return <div className="dashboard-shell" dir="rtl">
    <aside className="sidebar"><div className="brand-lockup"><div className="brand-mark">M</div><div><strong>MSEO Pro</strong><small>مركز إدارة المحتوى</small></div></div><div className="side-label">مساحة العمل</div><div className="side-active"><BookOpen size={18}/> المحتوى</div><div className="side-note"><ShieldCheck size={16}/> صلاحية: {auth.role === "admin" ? "مدير" : auth.role === "editor" ? "محرر" : "قارئ"}</div><div className="sidebar-bottom"><span>{auth.user.email}</span><button className="btn secondary wide" onClick={() => void auth.signOut()}><LogOut size={16}/> تسجيل الخروج</button></div></aside>
    <main className="dashboard-main"><header className="topbar"><div><p className="eyebrow">لوحة الإدارة</p><h1>نظرة عامة</h1></div><button className="btn secondary" onClick={() => void load()} disabled={busy}><RefreshCw size={16}/> تحديث البيانات</button></header>
      {(error || notice) && <div className={"alert " + (error ? "error" : "success")}>{error || notice}</div>}
      <section className="welcome-panel"><div><p className="eyebrow">MSEO CONTENT STUDIO</p><h2>مرحبًا، {auth.user.user_metadata?.user_name ?? auth.user.email?.split("@")[0]}</h2><p>أدِر مقالاتك وصفحاتك وبيانات SEO من مكان واحد.</p></div><div className="welcome-icon"><Activity size={28}/></div></section>
      <section className="stats-row"><article className="stat-card"><span>إجمالي المحتوى</span><strong>{rows.length}</strong><small>المقالات والصفحات</small></article><article className="stat-card"><span>منشور</span><strong>{published}</strong><small>متاح للنشر العام</small></article><article className="stat-card"><span>مسودات</span><strong>{drafts}</strong><small>تحتاج إلى استكمال</small></article></section>
      <section className="content-panel"><div className="panel-head"><div><h2>المقالات والصفحات</h2><p>البيانات محفوظة مباشرة في PostgreSQL عبر Supabase.</p></div><div className="toolbar"><label className="search-box"><Search size={16}/><input value={query} onChange={e => setQuery(e.target.value)} placeholder="ابحث في المحتوى…"/></label>{canEdit && <button className="btn primary" onClick={startNew}><FilePlus2 size={16}/> محتوى جديد</button>}</div></div>
      {busy && <p className="empty-state">جارٍ تحميل البيانات…</p>}
      {!busy && !filtered.length && <div className="empty-state"><BookOpen size={30}/><p>لا يوجد محتوى مطابق. أنشئ أول مقال للبدء.</p></div>}
      {!!filtered.length && <div className="table-wrap"><table><thead><tr><th>العنوان</th><th>النوع</th><th>الحالة</th><th>آخر تعديل</th><th>الإجراءات</th></tr></thead><tbody>{filtered.map(row => <tr key={row.id}><td><strong>{row.title}</strong><small className="cell-sub">/{row.slug}</small></td><td>{row.content_type === "article" ? "مقال" : "صفحة"}</td><td><span className={"status " + row.status}>{row.status === "published" ? "منشور" : row.status === "draft" ? "مسودة" : "مؤرشف"}</span></td><td>{new Date(row.updated_at).toLocaleDateString("ar-MA")}</td><td><div className="row-actions">{canEdit && <button className="btn secondary small" onClick={() => startEdit(row)}>تحرير</button>}{isAdmin && <button className="icon-btn danger" aria-label="حذف" onClick={() => void remove(row)}><Trash2 size={15}/></button>}</div></td></tr>)}</tbody></table></div>}
      </section>
      <AdminTools role={auth.role} />
      <footer className="dashboard-footer"><span><CheckCircle2 size={15}/> اتصال Supabase مهيأ</span><span>قاعدة البيانات: mseo panel</span></footer>
    </main>
    {showEditor && <div className="modal-backdrop"><form className="editor-modal" onSubmit={save}><header><div><p className="eyebrow">CONTENT EDITOR</p><h2>{editing ? "تحرير المحتوى" : "إنشاء محتوى"}</h2></div><button type="button" className="icon-btn" onClick={() => setShowEditor(false)}>×</button></header><div className="editor-form">
      <label>العنوان<input required maxLength={180} value={form.title} onChange={e => setForm(v => ({...v, title:e.target.value, seo_title:v.seo_title || e.target.value, slug:v.slug || slugify(e.target.value)}))}/></label>
      <label>الرابط المختصر (أحرف لاتينية)<input required value={form.slug} onChange={e => setForm(v => ({...v, slug:e.target.value}))}/></label>
      <div className="two-col"><label>نوع المحتوى<select value={form.content_type} onChange={e => setForm(v => ({...v, content_type:e.target.value as "article"|"page", post_type:e.target.value === "article" ? "article" : "landing"}))}><option value="article">مقال</option><option value="page">صفحة</option></select></label><label>الحالة<select value={form.status} onChange={e => setForm(v => ({...v, status:e.target.value as ContentRow["status"]}))}><option value="draft">مسودة</option><option value="published">منشور</option><option value="archived">مؤرشف</option></select></label></div>
      <label>التصنيف الفرعي<select value={form.post_type} onChange={e => setForm(v => ({...v, post_type:e.target.value}))}>{form.content_type === "article" ? <><option value="article">مقال عام</option><option value="guide">دليل</option><option value="tutorial">شرح تطبيقي</option><option value="news">أخبار</option><option value="review">مراجعة</option></> : <><option value="landing">صفحة هبوط</option><option value="about">من نحن</option><option value="service">خدمة</option><option value="contact">اتصل بنا</option></>}</select></label><label>ملخص<textarea rows={2} value={form.summary} onChange={e => setForm(v => ({...v, summary:e.target.value}))}/></label><label className="full">محتوى المقال<RichTextEditor key={editing?.id ?? "new-content"} value={form.body_html} onChange={html => setForm(v => ({...v, body_html:html}))}/></label>
      <label>عنوان SEO<input maxLength={180} value={form.seo_title} onChange={e => setForm(v => ({...v, seo_title:e.target.value}))}/></label><label>وصف SEO<textarea rows={2} maxLength={320} value={form.seo_description} onChange={e => setForm(v => ({...v, seo_description:e.target.value}))}/></label>
      <label>الكلمات المفتاحية المستهدفة (SEO)<textarea rows={2} value={form.seo_keywords} onChange={e => setForm(v => ({...v, seo_keywords:e.target.value}))} placeholder="تحسين محركات البحث، SEO، تصدر نتائج البحث"/></label><label>الكلمات الدلالية والمرادفات<textarea rows={2} value={form.semantic_keywords} onChange={e => setForm(v => ({...v, semantic_keywords:e.target.value}))} placeholder="نية البحث، السيو الداخلي، فهرسة الصفحات"/></label><label>التصنيفات المناسبة لهذا النوع<input value={form.categories} onChange={e => setForm(v => ({...v, categories:e.target.value}))} placeholder={form.content_type === "article" ? "ذكاء اصطناعي، برمجة، SEO" : "الرئيسية، الخدمات، الشركة"}/></label><label>الوسوم، مفصولة بفواصل<input value={form.tags} onChange={e => setForm(v => ({...v, tags:e.target.value}))} placeholder="React، Supabase، GitHub"/></label><label>رابط صورة الغلاف<input type="url" value={form.cover_image_url} onChange={e => setForm(v => ({...v, cover_image_url:e.target.value}))}/></label>
      </div><footer><button type="button" className="btn secondary" onClick={() => setShowEditor(false)}>إلغاء</button><button className="btn primary" disabled={busy}>{busy ? "جارٍ الحفظ…" : "حفظ المحتوى"}</button></footer></form></div>}
  </div>;
}
export default function App() { return <AuthProvider><Root/></AuthProvider>; }
