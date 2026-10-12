import { useCallback, useRef } from "react";
import { EditorContent, useEditor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
import { Bold, Heading2, ImagePlus, Italic, Link2, List, ListOrdered, Quote, Undo, Redo } from "lucide-react";
import { supabase } from "./lib/supabase";

export default function RichTextEditor({ value, onChange }: { value: string; onChange: (html: string) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [2, 3, 4] } }),
      Link.configure({ openOnClick: false, autolink: true, defaultProtocol: "https" }),
      Image.configure({ inline: false, allowBase64: false }),
    ],
    content: value || "",
    onUpdate: ({ editor }) => onChange(editor.getHTML()),
    editorProps: { attributes: { class: "rich-editor-content", dir: "auto", "aria-label": "محرر محتوى المقال" } },
  });
  const addLink = useCallback(() => {
    if (!editor) return;
    const previous = editor.getAttributes("link").href as string | undefined;
    const url = window.prompt("أدخل الرابط الكامل", previous || "https://");
    if (url === null) return;
    if (!url.trim()) editor.chain().focus().extendMarkRange("link").unsetLink().run();
    else editor.chain().focus().extendMarkRange("link").setLink({ href: url.trim() }).run();
  }, [editor]);
  const uploadImage = useCallback(async (file?: File) => {
    if (!file || !editor) return;
    if (!file.type.startsWith("image/")) { window.alert("اختر ملف صورة صالحًا."); return; }
    if (file.size > 10 * 1024 * 1024) { window.alert("الحد الأقصى لحجم الصورة 10 ميغابايت."); return; }
    const path = `articles/${Date.now()}-${file.name.replace(/[^a-zA-Z0-9._-]/g, "-")}`;
    const { error } = await supabase.storage.from("mseo-media").upload(path, file, { upsert: false, contentType: file.type });
    if (error) { window.alert(`تعذر رفع الصورة: ${error.message}`); return; }
    const { data } = supabase.storage.from("mseo-media").getPublicUrl(path);
    editor.chain().focus().setImage({ src: data.publicUrl, alt: file.name }).run();
  }, [editor]);
  if (!editor) return <div className="rich-editor-loading">جارٍ تجهيز محرر المقال…</div>;
  const tools = [
    { label: "عريض", icon: <Bold size={15}/>, run: () => editor.chain().focus().toggleBold().run(), active: editor.isActive("bold") },
    { label: "مائل", icon: <Italic size={15}/>, run: () => editor.chain().focus().toggleItalic().run(), active: editor.isActive("italic") },
    { label: "عنوان", icon: <Heading2 size={15}/>, run: () => editor.chain().focus().toggleHeading({ level: 2 }).run(), active: editor.isActive("heading", { level: 2 }) },
    { label: "قائمة", icon: <List size={15}/>, run: () => editor.chain().focus().toggleBulletList().run(), active: editor.isActive("bulletList") },
    { label: "قائمة مرقمة", icon: <ListOrdered size={15}/>, run: () => editor.chain().focus().toggleOrderedList().run(), active: editor.isActive("orderedList") },
    { label: "اقتباس", icon: <Quote size={15}/>, run: () => editor.chain().focus().toggleBlockquote().run(), active: editor.isActive("blockquote") },
  ];
  return <div className="rich-editor">
    <div className="rich-toolbar">
      {tools.map(tool => <button type="button" key={tool.label} title={tool.label} aria-label={tool.label} className={tool.active ? "tool-active" : ""} onClick={tool.run}>{tool.icon}</button>)}
      <button type="button" title="إضافة رابط" aria-label="إضافة رابط" onClick={addLink}><Link2 size={15}/></button>
      <button type="button" title="رفع صورة" aria-label="رفع صورة" onClick={() => inputRef.current?.click()}><ImagePlus size={15}/></button>
      <button type="button" title="تراجع" aria-label="تراجع" onClick={() => editor.chain().focus().undo().run()}><Undo size={15}/></button>
      <button type="button" title="إعادة" aria-label="إعادة" onClick={() => editor.chain().focus().redo().run()}><Redo size={15}/></button>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp,image/gif,image/avif" hidden onChange={e => { void uploadImage(e.currentTarget.files?.[0]); e.currentTarget.value = ""; }}/>
    </div>
    <EditorContent editor={editor}/>
    <div className="rich-editor-footer">يدعم العناوين والقوائم والروابط والاقتباسات والصور المحفوظة في Supabase Storage.</div>
  </div>;
}
