import { useEffect, useMemo, useState, type FormEvent } from "react";
import { Routes, Route } from "react-router-dom";
import { Activity, BarChart3, BookOpen, Check, ChevronLeft, ChevronRight, FilePlus2, FileText, Image, LayoutDashboard, LogOut, Menu, Search, Settings, ShieldCheck, Trash2, Upload, Users, Github, LockKeyhole, Eye, EyeOff, RefreshCw, X } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import { supabase, supabaseConfigured, type AdminRole, type ContentItem, type ContentStatus } from "./lib/supabase";

type View = "overview" | "content" | "media" | "users" | "activity" | "settings";
const roleName: Record<AdminRole, string> = { admin: "مدير النظام", editor: "محرر", viewer: "قارئ" };
const statusName: Record<ContentStatus, string> = { draft: "مسودة", published: "منشور", archived: "مؤرشف" };
const emptyForm = { title: "", slug: "", summary: "", body_html: "", content_type: "article" as "article" | "page", status: "draft" as ContentStatus, seo_title: "", seo_description: "", cover_image_url: "" };
type FormValue = typeof emptyForm;
function App() { return <AuthProvider><Routes><Route path="*" element={<Dashboard />} /></Routes></AuthProvider>; }

function Dashboard() {
  const auth = useAuth();
  const [view, setView] = useState<View>("overview");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [content, setContent] = useState<ContentItem[]>([]);
  const [media, setMedia] = useState<Array<{name:string; id:string; metadata?:{size?:number; mimetype?:string}}>>([]);
  const [users, setUsers] = useState<Array<{id:string; email:string; role:string; banned_until?:string|null; created_at?:string}>>([]);
  const [usersPage, setUsersPage] = useState(1);
  const [usersHasNext, setUsersHasNext] = useState(false);
  const [activity, setActivity] = useState<Array<{id:number; action:string; entity_type:string; entity_id:string|null; created_at:string; details:Record<string,unknown>}>>([]);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [sort, setSort] = useState<"updated_at"|"title"|"status">("updated_at");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editingId, setEditingId] = useState<string|null>(null);
  const [form, setForm] = useState<FormValue>(emptyForm);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const pageSize = 10;
  const isAdmin = auth.role === "admin";
  const canEdit = auth.role === "admin" || auth.role === "editor";

  const flash = (message: string, isError = false) => { setNotice(isError ? "" : message); setError(isError ? message : ""); window.setTimeout(() => { setNotice(""); setError(""); }, 5000); };
  const edge = async (action: string, payload: Record<string, unknown> = {}) => {
    const { data, error: invokeError } = await supabase.functions.invoke("mseo-admin-api", { body: { action, ...payload } });
    if (invokeError) throw invokeError;
    if (data?.error) throw new Error(String(data.error));
    return data;
  };
  const loadContent = async () => {
    const { data, error: queryError } = await supabase.from("mseo_content_items").select("*").order("updated_at", { ascending: false }).limit(1000);
    if (queryError) throw queryError;
    setContent((data ?? []) as ContentItem[]);
  };
  const loadMedia = async () => {
    const { data, error: queryError } = await supabase.storage.from("mseo-media").list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });
    if (queryError) throw queryError;
    setMedia((data ?? []).filter(f => f.id) as typeof media);
  };
  const loadUsers = async (targetPage = usersPage) => {
    const data = await edge("users:list", { page: targetPage });
    const rows = (data.users ?? []).map((u: Record<string, unknown>) => ({ id:String(u.id), email:String(u.email ?? ""), role:String(u.role ?? "user"), banned_until: u.banned_until as string|null|undefined, created_at: u.created_at as string|undefined }));
    setUsers(rows); setUsersHasNext(rows.length === 50);
  };
  const loadActivity = async () => {
    const { data, error: queryError } = await supabase.from("mseo_audit_logs").select("id,action,entity_type,entity_id,created_at,details").order("created_at", { ascending: false }).limit(100);
    if (queryError) throw queryError;
    setActivity((data ?? []) as typeof activity);
  };
  const reload = async () => {
    if (!auth.user || !auth.role) return;
    setBusy(true);
    try { await Promise.all([loadContent(), loadMedia()]); if (isAdmin) await Promise.all([loadUsers(), loadActivity()]); }
    catch (e) { flash(e instanceof Error ? e.message : "تعذر تحميل البيانات.", true); }
    finally { setBusy(false); }
  };
  useEffect(() => { if (auth.user && auth.role) void reload(); }, [auth.user?.id, auth.role]);
  useEffect(() => { setPage(1); }, [search, statusFilter, typeFilter, sort]);

  const filteredContent = useMemo(() => content.filter(item => {
    const q = search.trim().toLocaleLowerCase();
    return (!q || [item.title, item.slug, item.summary].some(v => (v ?? "").toLocaleLowerCase().includes(q))) &&
      (statusFilter === "all" || item.status === statusFilter) && (typeFilter === "all" || item.content_type === typeFilter);
  }).sort((a,b) => sort === "title" ? a.title.localeCompare(b.title, "ar") : sort === "status" ? a.status.localeCompare(b.status) : Date.parse(b.updated_at)-Date.parse(a.updated_at)), [content, search, statusFilter, typeFilter, sort]);
  const pageCount = Math.max(1, Math.ceil(filteredContent.length / pageSize));
  const shownContent = filteredContent.slice((page-1)*pageSize, page*pageSize);
  const totalPublished = content.filter(x=>x.status==="published").length;
  const totalDrafts = content.filter(x=>x.status==="draft").length;
  const chartData = [{name:"منشور",value:totalPublished},{name:"مسودة",value:totalDrafts},{name:"مؤرشف",value:content.filter(x=>x.status==="archived").length}];

  const openEditor = (item?: ContentItem) => {
    setEditingId(item?.id ?? null);
    setForm(item ? { title:item.title, slug:item.slug, summary:item.summary ?? "", body_html:item.body_html ?? "", content_type:item.content_type, status:item.status, seo_title:item.seo_title ?? "", seo_description:item.seo_description ?? "", cover_image_url:item.cover_image_url ?? "" } : emptyForm);
    setEditorOpen(true);
  };
  const saveContent = async (event: FormEvent) => {
    event.preventDefault();
    if (!auth.user || !canEdit) return;
    setBusy(true);
    try {
      const slug = form.slug.trim().toLowerCase().replace(/[^a-z0-9-]+/g,"-").replace(/^-+|-+$/g,"");
      if (!slug) throw new Error("أدخل رابطًا مختصرًا صالحًا (Slug).");
      const previous = editingId ? content.find(item => item.id === editingId) : undefined;
      const requestedStatus = form.status;
      if (previous?.status === "published" && (requestedStatus !== "published" || previous.slug !== slug)) {
        await edge("content:unpublish", { slug: previous.slug });
      }
      const databaseStatus = requestedStatus === "published" ? (previous?.status === "published" ? "published" : "draft") : requestedStatus;
      const payload = { ...form, status: databaseStatus, slug, updated_by:auth.user.id, ...(editingId ? {} : {created_by:auth.user.id}) };
      let contentId = editingId;
      if (editingId) {
        const { error: updateError } = await supabase.from("mseo_content_items").update(payload).eq("id", editingId);
        if (updateError) throw updateError;
      } else {
        const { data, error: insertError } = await supabase.from("mseo_content_items").insert(payload).select("id").single();
        if (insertError) throw insertError;
        contentId = data.id;
      }
      if (requestedStatus === "published") {
        await edge("content:publish", { slug, title:form.title, summary:form.summary, body_html:form.body_html, seo_title:form.seo_title, seo_description:form.seo_description, seo_keywords:[], cover_image_url:form.cover_image_url, content_type:form.content_type });
        const { error: publishError } = await supabase.from("mseo_content_items").update({status:"published",published_at:new Date().toISOString(),updated_by:auth.user.id}).eq("id",contentId);
        if (publishError) throw publishError;
      } else if (requestedStatus === "archived" && previous?.status !== "published") {
        const { error: archiveError } = await supabase.from("mseo_content_items").update({status:"archived",updated_by:auth.user.id}).eq("id",contentId);
        if (archiveError) throw archiveError;
      }
      await supabase.from("mseo_audit_logs").insert({actor_id:auth.user.id, action:editingId?"content.update":"content.create", entity_type:"content", entity_id:contentId, details:{slug,status:requestedStatus}});
      setEditorOpen(false); await loadContent(); flash(requestedStatus==="published"?"تم حفظ المحتوى ونشره إلى GitHub Pages.":"تم حفظ المحتوى.");
    } catch (e) { flash(e instanceof Error ? e.message : "تعذر حفظ المحتوى.", true); }
    finally { setBusy(false); }
  };
  const deleteContent = async (item: ContentItem) => {
    if (!isAdmin || !window.confirm("حذف المحتوى «"+item.title+"» نهائيًا؟")) return;
    const { error: deleteError } = await supabase.from("mseo_content_items").delete().eq("id", item.id);
    if (deleteError) flash(deleteError.message,true); else { await loadContent(); flash("تم حذف المحتوى."); }
  };
  const uploadFiles = async (files: FileList|null) => {
    if (!files || !auth.user || !canEdit) return;
    setBusy(true);
    try {
      for (const file of Array.from(files)) {
        if (file.size > 10*1024*1024) throw new Error(file.name+": الحجم الأقصى 10MB.");
        if (!["image/jpeg","image/png","image/webp","image/gif"].includes(file.type)) throw new Error(file.name+": صيغة الصورة غير مدعومة.");
        const safe = file.name.normalize("NFKD").replace(/[^a-zA-Z0-9._-]+/g,"-").slice(-90) || "image";
        const path = new Date().toISOString().slice(0,10)+"/"+crypto.randomUUID()+"-"+safe;
        const { error: uploadError } = await supabase.storage.from("mseo-media").upload(path,file,{upsert:false,contentType:file.type,cacheControl:"3600"});
        if (uploadError) throw uploadError;
        await supabase.from("mseo_audit_logs").insert({actor_id:auth.user.id,action:"media.upload",entity_type:"media",entity_id:path,details:{name:file.name,size:file.size}});
      }
      await loadMedia(); flash("تم رفع الوسائط.");
    } catch (e) { flash(e instanceof Error ? e.message : "تعذر رفع الملفات.",true); }
    finally { setBusy(false); }
  };
  const removeMedia = async (name:string) => {
    if (!isAdmin || !window.confirm("حذف الملف؟")) return;
    const { error: removeError } = await supabase.storage.from("mseo-media").remove([name]);
    if (removeError) flash(removeError.message,true); else { await loadMedia(); flash("تم حذف الملف."); }
  };
  const updateUserRole = async (id:string, role:string) => {
    if (!isAdmin) return;
    try { await edge("users:update-role", {user_id:id, role}); await loadUsers(); flash("تم تحديث الدور."); }
    catch (e) { flash(e instanceof Error ? e.message : "فشل تحديث الدور.",true); }
  };
  const toggleBan = async (id:string, banned:boolean) => {
    if (!isAdmin || !window.confirm(banned ? "تعطيل هذا الحساب؟" : "إعادة تفعيل هذا الحساب؟")) return;
    try { await edge("users:ban", {user_id:id,banned}); await loadUsers(); flash("تم تحديث حالة الحساب."); }
    catch (e) { flash(e instanceof Error ? e.message : "فشل تحديث الحساب.",true); }
  };
  const signIn = async (event:FormEvent) => {
    event.preventDefault(); setBusy(true);
    try { await auth.signIn(loginEmail.trim(),loginPassword); setLoginPassword(""); }
    catch (e) { flash(e instanceof Error ? e.message : "تعذر تسجيل الدخول.",true); }
    finally { setBusy(false); }
  };
  const resetPassword = async () => {
    if (!loginEmail.trim()) return flash("أدخل البريد الإلكتروني أولًا.",true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(loginEmail.trim(),{redirectTo:window.location.origin});
    if (resetError) flash(resetError.message,true); else flash("إذا كان البريد مسجلًا، ستصلك رسالة استعادة.");
  };
  const signUp = async () => {
    if (!loginEmail.trim() || loginPassword.length<8) return flash("أدخل بريدًا صالحًا وكلمة مرور من 8 أحرف على الأقل.",true);
    const {error: signUpError} = await supabase.auth.signUp({email:loginEmail.trim(),password:loginPassword});
    if (signUpError) flash(signUpError.message,true); else flash("تم إرسال تعليمات تأكيد الحساب. يجب أن يمنحك مدير النظام دورًا قبل الدخول.");
  };
  const updatePassword = async (event:FormEvent) => {
    event.preventDefault();
    if (newPassword.length<10) return flash("استخدم 10 أحرف على الأقل.",true);
    const {error: updateError} = await supabase.auth.updateUser({password:newPassword});
    if (updateError) flash(updateError.message,true); else {setNewPassword("");flash("تم تحديث كلمة المرور.");}
  };

  if (!supabaseConfigured) return <div className="config-error"><ShieldCheck size={34}/><h1>يلزم إعداد Supabase</h1><p>انسخ .env.example إلى .env.local وأدخل رابط المشروع والمفتاح العام فقط، ثم أعد تشغيل Vite.</p></div>;
  if (auth.loading) return <div className="loading-screen"><span className="spinner"/> جارٍ التحقق من الجلسة والصلاحيات…</div>;
  if (!auth.user) return <main className="login-page"><section className="login-visual"><div className="brand"><span className="brand-icon">M</span><span><b>MSEO</b><small>CONTROL CENTER</small></span></div><div><p className="eyebrow">CONTENT OPERATIONS</p><h1>كل محتواك.<br/><em>تحكم واحد.</em></h1><p>مساحة عمل لإدارة المحتوى والوسائط والمستخدمين مع صلاحيات محكومة من قاعدة البيانات.</p></div><div className="visual-foot"><ShieldCheck/> Supabase Auth · Row Level Security</div></section><section className="login-card"><span className="eyebrow">مرحبًا بعودتك</span><h2>تسجيل الدخول</h2><p className="muted">استخدم حسابًا مُصرّحًا له في مساحة MSEO.</p><form onSubmit={signIn} className="form-stack"><label>البريد الإلكتروني<input type="email" autoComplete="username" required value={loginEmail} onChange={e=>setLoginEmail(e.target.value)} placeholder="name@example.com"/></label><label>كلمة المرور<div className="password-field"><input type={showPassword?"text":"password"} autoComplete="current-password" required value={loginPassword} onChange={e=>setLoginPassword(e.target.value)} placeholder="••••••••"/><button type="button" className="icon-btn" onClick={()=>setShowPassword(v=>!v)} aria-label="إظهار كلمة المرور">{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label><button className="btn primary full" disabled={busy}>{busy?"جارٍ التحقق…":"تسجيل الدخول"} <ChevronLeft size={17}/></button></form><button className="btn secondary full" onClick={()=>void auth.signInGitHub().catch(e=>flash(e.message,true))}><Github size={18}/> المتابعة باستخدام GitHub</button><div className="login-links"><button onClick={()=>void resetPassword()}>نسيت كلمة المرور؟</button><button onClick={()=>void signUp()}>إنشاء حساب</button></div><p className="fine-print">إنشاء حساب لا يمنح صلاحية الإدارة تلقائيًا.</p></section></main>;
  if (!auth.role) return <div className="denied"><ShieldCheck size={42}/><h1>الحساب غير مخوّل</h1><p>تم تسجيل الدخول، لكن لا يوجد دور في mseo_admins. اطلب من مسؤول النظام منحك صلاحية.</p><button className="btn secondary" onClick={()=>void auth.signOut()}>تسجيل الخروج</button></div>;

  const menu: {id:View;label:string;icon:typeof LayoutDashboard;adminOnly?:boolean}[] = [
    {id:"overview",label:"نظرة عامة",icon:LayoutDashboard},{id:"content",label:"إدارة المحتوى",icon:FileText},{id:"media",label:"مكتبة الوسائط",icon:Image},{id:"users",label:"المستخدمون",icon:Users,adminOnly:true},{id:"activity",label:"سجل النشاط",icon:Activity,adminOnly:true},{id:"settings",label:"الإعدادات",icon:Settings},
  ];
  const title = menu.find(x=>x.id===view)?.label ?? "لوحة التحكم";
  const go = (next:View) => { if ((next==="users"||next==="activity")&&!isAdmin) return; setView(next);setMobileOpen(false);setEditorOpen(false); };
  const nav = <>{menu.filter(x=>!x.adminOnly||isAdmin).map(item=>{const Icon=item.icon;return <button key={item.id} className={"nav-link "+(view===item.id?"selected":"")} onClick={()=>go(item.id)}><Icon size={18}/><span>{item.label}</span>{item.id==="content"&&<small>{content.length}</small>}</button>})}</>;
  return <div className="app-shell"><aside className={"sidebar "+(mobileOpen?"open":"")}><div className="brand"><span className="brand-icon">M</span><span><b>MSEO</b><small>CONTROL CENTER</small></span></div><div className="workspace-tag">مساحة الإدارة <span className="online-dot"/></div><nav>{nav}</nav><div className="sidebar-bottom"><div className="signed-user"><div className="avatar">{(auth.user.email??"M").slice(0,1).toUpperCase()}</div><div className="user-meta"><strong>{auth.user.email}</strong><small>{roleName[auth.role]}</small></div></div><button className="nav-link logout" onClick={()=>void auth.signOut()}><LogOut size={17}/> تسجيل الخروج</button></div></aside><div className="main-column"><header className="topbar"><button className="icon-btn mobile-toggle" onClick={()=>setMobileOpen(v=>!v)} aria-label="فتح القائمة"><Menu/></button><div><div className="breadcrumbs">MSEO <ChevronLeft size={13}/> ADMIN</div><h1>{title}</h1></div><div className="top-actions"><span className="secure-chip"><ShieldCheck size={15}/> اتصال محمي</span><button className="icon-btn" onClick={()=>void reload()} title="تحديث البيانات"><RefreshCw size={17}/></button></div></header>{(notice||error)&&<div className={"toast "+(error?"toast-error":"")}>{error||notice}<button onClick={()=>{setError("");setNotice("");}}><X size={16}/></button></div>}
  <main className="page-content">
  {view==="overview"&&<><div className="page-intro"><div><p className="eyebrow">نظرة عامة</p><h2>أهلًا بك في مساحة العمل</h2><p className="muted">ملخص المحتوى وصحة مساحة الإدارة.</p></div><button className="btn primary" onClick={()=>{go("content");openEditor();}} disabled={!canEdit}><FilePlus2 size={17}/> محتوى جديد</button></div><div className="stat-grid"><Stat icon={FileText} label="إجمالي المحتوى" value={content.length} note="مقالات وصفحات"/><Stat icon={Check} label="منشور" value={totalPublished} note="ظاهر للزوار"/><Stat icon={BookOpen} label="مسودات" value={totalDrafts} note="قيد الإعداد"/>{isAdmin&&<Stat icon={Users} label="المستخدمون" value={users.length} note="أول صفحة من القائمة"/>}</div><div className="dashboard-grid"><section className="panel chart-panel"><div className="panel-heading"><div><h3>حالة المحتوى</h3><p className="muted">توزيع العناصر حسب الحالة</p></div><BarChart3/></div><div className="chart"><ResponsiveContainer width="100%" height="100%"><BarChart data={chartData}><CartesianGrid strokeDasharray="3 3" stroke="#243148"/><XAxis dataKey="name" stroke="#94a3b8"/><YAxis allowDecimals={false} stroke="#94a3b8"/><Tooltip contentStyle={{background:"#111b2d",border:"1px solid #2a3851",borderRadius:12}}/><Bar dataKey="value" fill="#8b7cff" radius={[7,7,0,0]}/></BarChart></ResponsiveContainer></div></section><section className="panel"><div className="panel-heading"><div><h3>إجراءات سريعة</h3><p className="muted">انتقل مباشرةً إلى المهمة</p></div></div><div className="quick-list"><button onClick={()=>{openEditor();go("content");}} disabled={!canEdit}><FilePlus2/><span><b>إنشاء محتوى</b><small>مقال أو صفحة جديدة</small></span><ChevronLeft/></button><button onClick={()=>go("media")}><Image/><span><b>مكتبة الوسائط</b><small>رفع صور ونسخ الروابط</small></span><ChevronLeft/></button><button onClick={()=>go("content")}><Search/><span><b>البحث في المحتوى</b><small>تصفية المسودات والمنشور</small></span><ChevronLeft/></button></div></section></div><section className="panel"><div className="panel-heading"><div><h3>آخر التحديثات</h3><p className="muted">أحدث العناصر التي تم تعديلها</p></div><button className="text-link" onClick={()=>go("content")}>عرض الكل <ChevronLeft size={15}/></button></div><ContentTable items={[...content].sort((a,b)=>Date.parse(b.updated_at)-Date.parse(a.updated_at)).slice(0,5)} onEdit={openEditor} canEdit={canEdit} onDelete={deleteContent} isAdmin={isAdmin}/></section></>}
  {view==="content"&&<><div className="page-intro"><div><p className="eyebrow">إدارة المحتوى</p><h2>المقالات والصفحات</h2><p className="muted">بحث، تصفية، ترتيب وتحرير المحتوى المخزن في Supabase.</p></div><button className="btn primary" disabled={!canEdit} onClick={()=>openEditor()}><FilePlus2 size={17}/> إضافة محتوى</button></div><div className="panel"><div className="filters"><label className="search-input"><Search size={17}/><input value={search} onChange={e=>setSearch(e.target.value)} placeholder="ابحث بالعنوان أو الرابط…"/></label><select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)}><option value="all">كل الحالات</option><option value="draft">مسودة</option><option value="published">منشور</option><option value="archived">مؤرشف</option></select><select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)}><option value="all">كل الأنواع</option><option value="article">مقال</option><option value="page">صفحة</option></select><select value={sort} onChange={e=>setSort(e.target.value as typeof sort)}><option value="updated_at">الأحدث تعديلًا</option><option value="title">العنوان</option><option value="status">الحالة</option></select></div><ContentTable items={shownContent} onEdit={openEditor} canEdit={canEdit} onDelete={deleteContent} isAdmin={isAdmin}/><div className="table-footer"><span>{filteredContent.length} عنصرًا · الصفحة {page} من {pageCount}</span><div className="pager"><button className="btn secondary small" disabled={page<=1} onClick={()=>setPage(p=>p-1)}><ChevronRight size={15}/> السابق</button><button className="btn secondary small" disabled={page>=pageCount} onClick={()=>setPage(p=>p+1)}>التالي <ChevronLeft size={15}/></button></div></div></div></>}
  {view==="media"&&<><div className="page-intro"><div><p className="eyebrow">مكتبة الوسائط</p><h2>الصور والملفات</h2><p className="muted">JPEG وPNG وWebP وGIF، بحد أقصى 10MB للملف.</p></div>{canEdit&&<label className="btn primary upload-btn"><Upload size={17}/> رفع صور<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" multiple onChange={e=>void uploadFiles(e.target.files)} disabled={busy}/></label>}</div><div className="media-grid">{media.map(file=>{const {data}=supabase.storage.from("mseo-media").getPublicUrl(file.name);return <article className="media-card" key={file.id}><div className="media-preview"><img src={data.publicUrl} alt={file.name} loading="lazy" onError={e=>{e.currentTarget.style.display="none";}}/></div><div className="media-info"><strong title={file.name}>{file.name.split("/").pop()}</strong><small>{file.metadata?.size?Math.round(file.metadata.size/1024)+" KB":"ملف وسائط"}</small><div className="media-actions"><button className="btn secondary small" onClick={()=>void navigator.clipboard.writeText(data.publicUrl).then(()=>flash("تم نسخ الرابط.")).catch(()=>flash("تعذر نسخ الرابط.",true))}>نسخ الرابط</button>{isAdmin&&<button className="icon-btn danger" onClick={()=>void removeMedia(file.name)} aria-label="حذف الملف"><Trash2 size={16}/></button>}</div></div></article>})}{media.length===0&&<div className="empty-state"><Image size={32}/><h3>لا توجد وسائط</h3><p>ارفع أول صورة لاستخدامها في المحتوى.</p></div>}</div></>}
  {view==="users"&&isAdmin&&<><div className="page-intro"><div><p className="eyebrow">إدارة الوصول</p><h2>المستخدمون والصلاحيات</h2><p className="muted">تغيير الدور والتفعيل يتم عبر Edge Function موثوقة.</p></div><button className="btn secondary" onClick={()=>void loadUsers()}><RefreshCw size={16}/> تحديث</button></div><div className="panel"><div className="table-wrap"><table><thead><tr><th>الحساب</th><th>الدور</th><th>الحالة</th><th>تاريخ التسجيل</th><th>الإجراء</th></tr></thead><tbody>{users.map(u=><tr key={u.id}><td><strong>{u.email||u.id}</strong><small className="cell-sub">{u.id.slice(0,8)}…</small></td><td><select value={u.role} onChange={e=>void updateUserRole(u.id,e.target.value)}><option value="admin">مدير</option><option value="editor">محرر</option><option value="viewer">قارئ</option><option value="user">مستخدم</option></select></td><td><span className={"status "+(u.banned_until?"archived":"published")}>{u.banned_until?"معطّل":"نشط"}</span></td><td>{u.created_at?new Date(u.created_at).toLocaleDateString("ar-MA"):"—"}</td><td><button className="btn secondary small" onClick={()=>void toggleBan(u.id,!u.banned_until)}>{u.banned_until?"إعادة تفعيل":"تعطيل"}</button></td></tr>)}</tbody></table></div>{users.length===0&&<p className="empty-row">لا توجد بيانات مستخدمين أو تعذر جلبها.</p>}<div className="table-footer"><span>صفحة المستخدمين {usersPage} · المعروض {users.length}</span><div className="pager"><button className="btn secondary small" disabled={usersPage<=1} onClick={()=>{setUsersPage(p=>p-1);void loadUsers(usersPage-1);}}><ChevronRight size={15}/> السابق</button><button className="btn secondary small" disabled={!usersHasNext} onClick={()=>{setUsersPage(p=>p+1);void loadUsers(usersPage+1);}}>التالي <ChevronLeft size={15}/></button></div></div></div></>}
  {view==="activity"&&isAdmin&&<><div className="page-intro"><div><p className="eyebrow">المراجعة والتدقيق</p><h2>سجل النشاط</h2><p className="muted">آخر 100 حدث مسجل في قاعدة البيانات.</p></div><button className="btn secondary" onClick={()=>void loadActivity()}><RefreshCw size={16}/> تحديث</button></div><div className="panel"><div className="activity-list">{activity.map(row=><div className="activity-row" key={row.id}><span className="activity-icon"><Activity size={17}/></span><div><strong>{row.action}</strong><small>{row.entity_type}{row.entity_id?" · "+row.entity_id:""}</small></div><time>{new Date(row.created_at).toLocaleString("ar-MA")}</time></div>)}{activity.length===0&&<p className="empty-row">لا توجد أحداث مسجلة.</p>}</div></div></>}
  {view==="settings"&&<><div className="page-intro"><div><p className="eyebrow">الحساب والتفضيلات</p><h2>الإعدادات</h2><p className="muted">إدارة الجلسة وتحديث كلمة المرور.</p></div></div><div className="settings-grid"><section className="panel settings-panel"><div className="panel-heading"><div><h3>الملف الشخصي</h3><p className="muted">معلومات الحساب الحالي</p></div><LockKeyhole/></div><label>البريد الإلكتروني<input value={auth.user.email??""} readOnly/></label><label>الدور<input value={roleName[auth.role]} readOnly/></label><p className="fine-print">الأدوار تُدار من جدول mseo_admins، ولا يمكن تغييرها من الملف الشخصي.</p></section><section className="panel settings-panel"><div className="panel-heading"><div><h3>تغيير كلمة المرور</h3><p className="muted">استخدم كلمة مرور طويلة وفريدة.</p></div><ShieldCheck/></div><form onSubmit={updatePassword} className="form-stack"><label>كلمة المرور الجديدة<input type="password" minLength={10} required value={newPassword} onChange={e=>setNewPassword(e.target.value)} autoComplete="new-password"/></label><button className="btn primary">تحديث كلمة المرور</button></form></section></div></>}
  </main></div>
  {editorOpen&&<div className="modal-backdrop" role="presentation" onMouseDown={e=>{if(e.target===e.currentTarget)setEditorOpen(false);}}><section className="editor-modal" role="dialog" aria-modal="true" aria-labelledby="editor-title"><header><div><p className="eyebrow">محرر المحتوى</p><h2 id="editor-title">{editingId?"تعديل المحتوى":"إنشاء محتوى"}</h2></div><button className="icon-btn" onClick={()=>setEditorOpen(false)} aria-label="إغلاق"><X/></button></header><form onSubmit={saveContent} className="editor-form"><label>العنوان<input required maxLength={180} value={form.title} onChange={e=>setForm(v=>({...v,title:e.target.value,seo_title:v.seo_title||e.target.value}))}/></label><div className="two-col"><label>الرابط المختصر (Slug)<input required value={form.slug} onChange={e=>setForm(v=>({...v,slug:e.target.value.toLowerCase().replace(/[^a-z0-9-]/g,"-")}))} placeholder="my-article"/></label><label>النوع<select value={form.content_type} onChange={e=>setForm(v=>({...v,content_type:e.target.value as FormValue["content_type"]}))}><option value="article">مقال</option><option value="page">صفحة</option></select></label></div><label>الملخص<textarea rows={2} value={form.summary} onChange={e=>setForm(v=>({...v,summary:e.target.value}))}/></label><label>المحتوى (HTML)<textarea rows={8} value={form.body_html} onChange={e=>setForm(v=>({...v,body_html:e.target.value}))} placeholder="اكتب محتوى HTML للمقال…"/></label><div className="two-col"><label>عنوان SEO<input value={form.seo_title} onChange={e=>setForm(v=>({...v,seo_title:e.target.value}))}/></label><label>رابط صورة الغلاف<input type="url" value={form.cover_image_url} onChange={e=>setForm(v=>({...v,cover_image_url:e.target.value}))}/></label></div><label>وصف SEO<textarea rows={2} value={form.seo_description} onChange={e=>setForm(v=>({...v,seo_description:e.target.value}))}/></label><label>الحالة<select value={form.status} onChange={e=>setForm(v=>({...v,status:e.target.value as ContentStatus}))}><option value="draft">مسودة</option><option value="published">منشور</option><option value="archived">مؤرشف</option></select></label><footer><button type="button" className="btn secondary" onClick={()=>setEditorOpen(false)}>إلغاء</button><button className="btn primary" disabled={busy}>{busy?"جارٍ الحفظ…":"حفظ المحتوى"}</button></footer></form></section></div>}
  {busy&&<div className="busy-indicator"><span className="spinner"/> جارٍ تنفيذ العملية…</div>}
  </div>;
}
function Stat({icon:Icon,label,value,note}:{icon:typeof FileText;label:string;value:number;note:string}) { return <article className="stat-card"><div className="stat-icon"><Icon size={19}/></div><span>{label}</span><strong>{value}</strong><small>{note}</small></article>; }
function ContentTable({items,onEdit,canEdit,onDelete,isAdmin}:{items:ContentItem[];onEdit:(item:ContentItem)=>void;canEdit:boolean;onDelete:(item:ContentItem)=>void;isAdmin:boolean}) {
  return <div className="table-wrap"><table><thead><tr><th>العنوان</th><th>النوع</th><th>الحالة</th><th>آخر تحديث</th><th>الإجراءات</th></tr></thead><tbody>{items.map(item=><tr key={item.id}><td><strong>{item.title}</strong><small className="cell-sub">/{item.slug}</small></td><td>{item.content_type==="article"?"مقال":"صفحة"}</td><td><span className={"status "+item.status}>{statusName[item.status]}</span></td><td>{new Date(item.updated_at).toLocaleDateString("ar-MA")}</td><td><div className="row-actions">{canEdit&&<button className="btn secondary small" onClick={()=>onEdit(item)}>تحرير</button>}{isAdmin&&<button className="icon-btn danger" onClick={()=>onDelete(item)} aria-label="حذف"><Trash2 size={16}/></button>}</div></td></tr>)}</tbody></table>{items.length===0&&<p className="empty-row">لا توجد عناصر تطابق البحث.</p>}</div>;
}
export default App;