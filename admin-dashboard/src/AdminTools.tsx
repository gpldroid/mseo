import { useCallback, useEffect, useMemo, useState } from "react";
import { Code2, Palette, RefreshCw, Save, ShieldCheck, Trash2, Megaphone, Eye, EyeOff } from "lucide-react";
import { supabase } from "./lib/supabase";

type AdSlot = { id: string; name: string; code: string; location: string; is_active: boolean; notes: string; updated_at: string };
type Theme = { primary: string; secondary: string; font: string; radius: number };
type RepoFile = { path: string; content: string; sha: string };

const DEFAULT_THEME: Theme = { primary: "#6559e8", secondary: "#171a32", font: "Cairo", radius: 12 };
const LOCATIONS = [
  ["header_top", "أعلى الهيدر"],
  ["after_paragraph", "بين الفقرات (يتطلب علامة موضع بالمقال)"],
  ["sidebar", "القائمة الجانبية"],
  ["footer", "الفوتر"],
];

function apiBase() {
  return ((import.meta.env.VITE_ADMIN_API_URL as string | undefined)?.trim() || "https://mseopro.netlify.app/.netlify/functions").replace(/\/$/, "");
}
async function apiRequest(path: string, method = "GET", body?: unknown) {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) throw new Error("انتهت الجلسة؛ سجّل الدخول مجددًا.");
  const response = await fetch(`${apiBase()}/${path}`, {
    method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${session.access_token}` },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.error || `فشل الطلب (${response.status})`);
  return payload;
}

export default function AdminTools({ role }: { role: string }) {
  const [tab, setTab] = useState<"ads" | "theme" | "github">("ads");
  const [ads, setAds] = useState<AdSlot[]>([]);
  const [theme, setTheme] = useState<Theme>(DEFAULT_THEME);
  const [draftTheme, setDraftTheme] = useState<Theme>(DEFAULT_THEME);
  const [adForm, setAdForm] = useState({ id: "", name: "", code: "", location: "header_top", notes: "", is_active: false });
  const [file, setFile] = useState<RepoFile>({ path: "config.json", content: "", sha: "" });
  const [filePath, setFilePath] = useState("config.json");
  const [commitMessage, setCommitMessage] = useState("Update site config from MSEO dashboard");
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  const flash = (message: string) => { setNotice(message); setError(""); };
  const fail = (e: unknown) => { setError(e instanceof Error ? e.message : "حدث خطأ غير متوقع"); setNotice(""); };

  const loadAds = useCallback(async () => {
    const { data, error: e } = await supabase.from("ad_slots").select("*").order("updated_at", { ascending: false });
    if (e) throw e;
    setAds((data ?? []) as AdSlot[]);
  }, []);
  const loadTheme = useCallback(async () => {
    const { data, error: e } = await supabase.from("site_settings").select("value").eq("key", "theme").maybeSingle();
    if (e) throw e;
    const next = { ...DEFAULT_THEME, ...(data?.value as Partial<Theme> | undefined) };
    setTheme(next); setDraftTheme(next);
  }, []);
  useEffect(() => { void Promise.all([loadAds(), loadTheme()]).catch(fail); }, [loadAds, loadTheme]);

  useEffect(() => {
    document.documentElement.style.setProperty("--primary-color", draftTheme.primary);
    document.documentElement.style.setProperty("--secondary-color", draftTheme.secondary);
    document.documentElement.style.setProperty("--ui-radius", `${draftTheme.radius}px`);
    document.documentElement.style.setProperty("--ui-font", draftTheme.font);
  }, [draftTheme]);

  const saveAd = async () => {
    setBusy(true);
    try {
      const payload = { name: adForm.name.trim(), code: adForm.code, location: adForm.location, notes: adForm.notes, is_active: adForm.is_active, updated_at: new Date().toISOString() };
      if (!payload.name) throw new Error("اسم الإعلان مطلوب.");
      const result = adForm.id
        ? await supabase.from("ad_slots").update(payload).eq("id", adForm.id)
        : await supabase.from("ad_slots").insert({ ...payload, created_by: (await supabase.auth.getUser()).data.user?.id });
      if (result.error) throw result.error;
      setAdForm({ id: "", name: "", code: "", location: "header_top", notes: "", is_active: false });
      await loadAds(); flash("تم حفظ الإعلان.");
    } catch (e) { fail(e); } finally { setBusy(false); }
  };
  const toggleAd = async (ad: AdSlot) => {
    try {
      const { error: e } = await supabase.from("ad_slots").update({ is_active: !ad.is_active, updated_at: new Date().toISOString() }).eq("id", ad.id);
      if (e) throw e;
      await loadAds(); flash(ad.is_active ? "تم إيقاف الإعلان." : "تم تفعيل الإعلان.");
    } catch (e) { fail(e); }
  };
  const deleteAd = async (ad: AdSlot) => {
    if (!window.confirm(`حذف الإعلان «${ad.name}»؟`)) return;
    const { error: e } = await supabase.from("ad_slots").delete().eq("id", ad.id);
    if (e) fail(e); else { await loadAds(); flash("تم حذف الإعلان."); }
  };
  const saveTheme = async () => {
    setBusy(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      const { error: e } = await supabase.from("site_settings").upsert({ key: "theme", value: draftTheme, is_public: true, updated_by: user?.id, updated_at: new Date().toISOString() });
      if (e) throw e;
      setTheme(draftTheme); flash("تم حفظ إعدادات المظهر في Supabase.");
    } catch (e) { fail(e); } finally { setBusy(false); }
  };
  const loadFile = async () => {
    setBusy(true);
    try {
      const data = await apiRequest(`github-file?path=${encodeURIComponent(filePath)}`);
      setFile({ path: data.path, content: data.content ?? "", sha: data.sha ?? "" });
      flash("تم تحميل الملف من GitHub.");
    } catch (e) { fail(e); } finally { setBusy(false); }
  };
  const saveFile = async () => {
    setBusy(true);
    try {
      const data = await apiRequest("github-file", "PUT", { path: file.path || filePath, content: file.content, sha: file.sha, message: commitMessage });
      setFile(v => ({ ...v, sha: data.sha ?? v.sha }));
      flash(`تم إنشاء commit: ${String(data.commit ?? "").slice(0, 12)}`);
    } catch (e) { fail(e); } finally { setBusy(false); }
  };
  const triggerBuild = async () => {
    setBusy(true);
    try { await apiRequest("netlify-build", "POST", {}); flash("تم إرسال طلب بناء جديد إلى Netlify."); }
    catch (e) { fail(e); } finally { setBusy(false); }
  };
  const activeCount = useMemo(() => ads.filter(a => a.is_active).length, [ads]);
  const canManage = role === "admin" || role === "owner" || role === "editor";

  return <section className="content-panel admin-tools" dir="rtl">
    <div className="panel-head"><div><h2>أدوات إدارة الموقع</h2><p>الإعلانات والمظهر وملفات المستودع — تغييرات مباشرة مع صلاحيات الإدارة.</p></div>
      <div className="tools-tabs">
        <button className={tab === "ads" ? "btn primary" : "btn secondary"} onClick={() => setTab("ads")}><Megaphone size={15}/> الإعلانات</button>
        <button className={tab === "theme" ? "btn primary" : "btn secondary"} onClick={() => setTab("theme")}><Palette size={15}/> المظهر</button>
        <button className={tab === "github" ? "btn primary" : "btn secondary"} onClick={() => setTab("github")}><Code2 size={15}/> GitHub / Netlify</button>
      </div>
    </div>
    {(error || notice) && <div className={`alert ${error ? "error" : "success"}`}>{error || notice}</div>}
    {!canManage && <div className="alert error">حسابك يملك صلاحية القراءة فقط؛ يلزم دور محرر أو مدير لتعديل الإعدادات.</div>}

    {tab === "ads" && <div className="tools-grid">
      <div className="tool-card"><h3><Megaphone size={18}/> مدير الإعلانات</h3><p className="muted">الإعلانات النشطة: {activeCount} من {ads.length}. لا تُفعّل إلا أكواد الجهات التي تثق بها.</p>
        <div className="form-grid">
          <label>اسم الإعلان<input value={adForm.name} onChange={e => setAdForm(v => ({...v,name:e.target.value}))} placeholder="مثال: AdSense أعلى المقال"/></label>
          <label>مكان العرض<select value={adForm.location} onChange={e => setAdForm(v => ({...v,location:e.target.value}))}>{LOCATIONS.map(([value,label]) => <option key={value} value={value}>{label}</option>)}</select></label>
          <label className="full">كود HTML / JavaScript<textarea rows={6} value={adForm.code} onChange={e => setAdForm(v => ({...v,code:e.target.value}))} placeholder={'ضع كود الإعلان هنا…'} /></label>
          <label className="full">ملاحظات<input value={adForm.notes} onChange={e => setAdForm(v => ({...v,notes:e.target.value}))} placeholder="معرّف الحملة أو تعليمات"/></label>
          <label className="checkbox-line"><input type="checkbox" checked={adForm.is_active} onChange={e => setAdForm(v => ({...v,is_active:e.target.checked}))}/> تفعيل الإعلان</label>
        </div>
        <div className="tools-actions"><button className="btn primary" disabled={busy || !canManage} onClick={() => void saveAd()}><Save size={15}/> {adForm.id ? "تحديث الإعلان" : "إضافة إعلان"}</button>{adForm.id && <button className="btn secondary" onClick={() => setAdForm({id:"",name:"",code:"",location:"header_top",notes:"",is_active:false})}>إلغاء التحرير</button>}</div>
      </div>
      <div className="tool-card"><h3>الإعلانات المحفوظة</h3>
        {!ads.length && <p className="muted">لم تُضف إعلانات بعد.</p>}
        {ads.map(ad => <article className="ad-row" key={ad.id}><div><strong>{ad.name}</strong><small>{LOCATIONS.find(x => x[0] === ad.location)?.[1] ?? ad.location}</small><span className={ad.is_active ? "pill active" : "pill"}>{ad.is_active ? "نشط" : "متوقف"}</span></div><div className="row-actions"><button className="icon-btn" title={ad.is_active ? "تعطيل" : "تفعيل"} onClick={() => void toggleAd(ad)}>{ad.is_active ? <EyeOff size={15}/> : <Eye size={15}/>}</button><button className="btn secondary small" onClick={() => setAdForm({id:ad.id,name:ad.name,code:ad.code,location:ad.location,notes:ad.notes ?? "",is_active:ad.is_active})}>تحرير</button><button className="icon-btn danger" onClick={() => void deleteAd(ad)}><Trash2 size={15}/></button></div></article>)}
      </div>
    </div>}

    {tab === "theme" && <div className="tools-grid">
      <div className="tool-card"><h3><Palette size={18}/> مخصص المظهر المباشر</h3><p className="muted">التغييرات تظهر في المعاينة فورًا؛ الحفظ يكتبها في جدول site_settings.</p>
        <div className="form-grid">
          <label>اللون الأساسي<input type="color" value={draftTheme.primary} onChange={e => setDraftTheme(v => ({...v,primary:e.target.value}))}/><code>{draftTheme.primary}</code></label>
          <label>اللون الثانوي<input type="color" value={draftTheme.secondary} onChange={e => setDraftTheme(v => ({...v,secondary:e.target.value}))}/><code>{draftTheme.secondary}</code></label>
          <label>الخط<select value={draftTheme.font} onChange={e => setDraftTheme(v => ({...v,font:e.target.value}))}><option>Cairo</option><option>Inter</option><option>Tahoma</option><option>Arial</option></select></label>
          <label>استدارة الزوايا: {draftTheme.radius}px<input type="range" min="0" max="28" value={draftTheme.radius} onChange={e => setDraftTheme(v => ({...v,radius:Number(e.target.value)}))}/></label>
        </div>
        <div className="tools-actions"><button className="btn primary" disabled={busy || !canManage} onClick={() => void saveTheme()}><Save size={15}/> حفظ المظهر</button><button className="btn secondary" onClick={() => setDraftTheme(theme)}>تراجع</button></div>
      </div>
      <div className="tool-card"><h3>معاينة فورية</h3><div className="theme-preview" style={{background:draftTheme.secondary,borderRadius:draftTheme.radius,fontFamily:draftTheme.font}}><div className="preview-mark" style={{background:draftTheme.primary}}>M</div><strong>عنوان الموقع</strong><p>هذا مثال لمعاينة الألوان والخط واستدارة العناصر.</p><button style={{background:draftTheme.primary,borderRadius:draftTheme.radius}}>زر أساسي</button><div className="preview-chip" style={{borderRadius:draftTheme.radius}}>بطاقة محتوى تجريبية</div></div><p className="muted">للتطبيق على الموقع العام، أدرج مُحمّل الإعدادات المرفق في ملف التكامل.</p></div>
    </div>}

    {tab === "github" && <div className="tools-grid">
      <div className="tool-card"><h3><Code2 size={18}/> محرر ملفات GitHub</h3><p className="muted">يعمل عبر Netlify Function محمية بخادم؛ لا يوضع Personal Access Token في المتصفح.</p>
        <div className="form-grid"><label className="full">مسار الملف داخل المستودع<input value={filePath} onChange={e => setFilePath(e.target.value)} placeholder="config.json أو content/example.md"/></label></div>
        <div className="tools-actions"><button className="btn secondary" disabled={busy || !canManage} onClick={() => void loadFile()}><RefreshCw size={15}/> تحميل الملف</button></div>
        <label className="code-label">محتوى الملف<textarea className="code-editor" spellCheck={false} rows={15} value={file.content} onChange={e => setFile(v => ({...v,content:e.target.value}))} placeholder="حمّل ملفًا من المستودع لبدء التحرير…"/></label>
        <label>رسالة Commit<input value={commitMessage} onChange={e => setCommitMessage(e.target.value)}/></label>
        <div className="tools-actions"><button className="btn primary" disabled={busy || !canManage || !file.sha || !file.content} onClick={() => void saveFile()}><Save size={15}/> حفظ وإنشاء Commit</button><button className="btn secondary" disabled={busy || !canManage} onClick={() => void triggerBuild()}><RefreshCw size={15}/> تشغيل بناء Netlify</button></div>
      </div>
      <div className="tool-card"><h3><ShieldCheck size={18}/> إعداد الاتصال الآمن</h3><p>تحتاج الوظائف إلى متغيرات بيئة في Netlify، ولا تحتاج إلى وضع أي رمز سري في الواجهة:</p><ul className="setup-list"><li><code>GITHUB_TOKEN</code> — رمز بصلاحية Contents: Read and write للمستودع.</li><li><code>GITHUB_OWNER</code> — <code>gpldroid</code></li><li><code>GITHUB_REPO</code> — <code>mseo</code></li><li><code>GITHUB_BRANCH</code> — <code>main</code></li><li><code>NETLIFY_BUILD_HOOK_URL</code> — رابط Build Hook من إعدادات Netlify.</li><li><code>SUPABASE_URL</code> و<code>SUPABASE_PUBLISHABLE_KEY</code> للتحقق من جلسة المدير.</li></ul><p className="muted">عنوان API الحالي: <code>{apiBase()}</code>. إذا كانت لوحة الإدارة تعمل على GitHub Pages، تستخدم الوظائف المنشورة على Netlify.</p><a href="https://app.netlify.com/sites/mseopro/settings/deploys#build-hooks" target="_blank" rel="noreferrer">إعداد Build Hook في Netlify ↗</a></div>
    </div>}
    <footer className="dashboard-footer"><span><ShieldCheck size={15}/> محمي بصلاحيات Supabase RLS</span><span>يُحفظ الإعداد عند الضغط على حفظ</span></footer>
  </section>;
}
