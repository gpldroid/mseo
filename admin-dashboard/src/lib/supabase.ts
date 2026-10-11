import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined;

export const supabaseConfigured = Boolean(url && key);
export const supabase = createClient(
  url || "https://example.supabase.co",
  key || "missing-publishable-key",
  { auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true } },
);

export type AdminRole = "admin" | "editor" | "viewer";
export type ContentStatus = "draft" | "published" | "archived";
export type ContentItem = {
  id: string; title: string; slug: string; summary: string; body_html: string;
  content_type: "article" | "page"; status: ContentStatus; seo_title: string;
  seo_description: string; cover_image_url: string; created_at: string; updated_at: string;
};