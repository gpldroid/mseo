# MSEO Admin Dashboard (React + Vite)

This app is an independent React/Vite admin interface for the existing MSEO Supabase project. It intentionally reuses the existing schema: mseo_admins, mseo_content_items, mseo_audit_logs, and the mseo-media bucket. It does not create duplicate profiles/posts tables.

## Local development

    cp .env.example .env.local
    # Set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
    npm install
    npm run dev

The browser key must be the Supabase publishable/anon key only. Never use a service-role key, database password, or GitHub personal access token in a Vite variable.

## Authentication setup

1. In Supabase Auth, enable Email provider and GitHub provider if OAuth is wanted.
2. Configure the GitHub OAuth App callback URL shown in Supabase Auth provider settings.
3. Add the production dashboard origin to Supabase Auth URL Configuration (Site URL and Redirect URLs).
4. The app checks mseo_admins after login. A signed-in user without an approved role sees an access-denied screen. Signup does not grant admin rights.
5. admin can manage users and delete content/media; editor can edit content and upload media; viewer can read. RLS and the existing mseo-admin-api Edge Function remain authoritative.

## Existing schema

The project already has mseo_admins, mseo_content_items, mseo_content_revisions, and mseo_audit_logs, with RLS enabled. Do not apply a second generic profiles/posts schema over the production project. The dashboard expects the existing mseo-media bucket and the mseo-admin-api function for privileged Auth user management.

## Deploy to Vercel or Netlify

Recommended: create a Vercel/Netlify project connected to gpldroid/mseo, set Root Directory to admin-dashboard, build command to npm run build, output directory to dist. Add VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY as environment variables for Production and Preview. Pushes to main will deploy after the feature branch is reviewed and merged.

For GitHub Pages under a subpath, set VITE_BASE_PATH=/mseo/admin-dashboard/ and configure the hosting path and OAuth redirect URL accordingly. Vercel/Netlify is simpler for an independent dashboard URL.

## Security notes

- The dashboard is a public client. Publishable keys are not secrets; RLS is mandatory.
- Never trust client-side route hiding as authorization.
- Do not expose service-role keys, GitHub tokens, or server credentials in VITE_ variables.
- Media uploads are restricted to JPEG, PNG, WebP, and GIF (10 MB client-side limit; server bucket restrictions apply).
- Review Supabase Auth leaked-password protection in Dashboard > Authentication > Settings.
