import { createClient } from "@supabase/supabase-js";

// Vite inlines VITE_* variables at build time. Keep environment overrides for
// local/staging deployments, but provide the public project configuration as a
// safe fallback so the deployed Netlify dashboard does not depend on .env.local.
const DEFAULT_SUPABASE_URL = "https://gjkwrxvlnmshcmsjdcfd.supabase.co";
const DEFAULT_SUPABASE_PUBLISHABLE_KEY = "sb_publishable_rGb3srwFQ7aCbHipegsn1A_DmTFCpNX";

const url = (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() || DEFAULT_SUPABASE_URL;
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string | undefined)?.trim() || DEFAULT_SUPABASE_PUBLISHABLE_KEY;

export const supabaseConfigured = Boolean(url && key);
export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

export type AdminRole = "admin" | "editor" | "viewer";
export type ContentStatus = "draft" | "published" | "archived";
export type ContentItem = {
  id: string; title: string; slug: string; summary: string; body_html: string;
  content_type: "article" | "page"; status: ContentStatus; seo_title: string;
  seo_description: string; cover_image_url: string; created_at: string; updated_at: string;
};