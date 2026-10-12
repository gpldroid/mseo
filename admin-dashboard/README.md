# MSEO Pro Control Center

A responsive Arabic-first CMS dashboard built with React, Vite, TypeScript, Supabase Auth/Postgres/Storage, and Recharts. The dashboard is deployed independently from the public static site and uses the MCMS schema in the Supabase project **CMS Project**.

## What it manages

- Articles and pages with draft, review, scheduled, published, and archived states
- Editorial metadata: slug, locale, excerpt, categories, tags, featured image, SEO title/description, and canonical URL
- Automatic content revisions and workspace audit events
- Normalized categories/tags and content-to-taxonomy relationships (with legacy arrays retained for static-site publishing)
- Private media storage with signed preview URLs
- Site configuration and GitHub publishing history
- Workspace members and role-aware screens
- Responsive RTL interface with search, filtering, pagination, status charts, and dark visual styling

## Data architecture

- `mcms_workspaces` and `mcms_workspace_members`: workspace and access control
- `mcms_sites`: site URL, GitHub repository/branch and content paths
- `mcms_content`: article/page content, SEO metadata, status, and version
- `mcms_content_revisions`: snapshots created by database triggers
- `mcms_categories`, `mcms_tags`, `mcms_content_categories`, `mcms_content_tags`: normalized taxonomy
- `mcms_media`: metadata for private Storage objects in the `mcms-media` bucket
- `mcms_publish_runs`: publish job status and GitHub commit URLs
- `mcms_audit_log`: workspace audit trail

RLS policies remain authoritative; hiding a screen in React is not an authorization boundary. Roles are `owner`, `admin`, `editor`, `publisher`, and `viewer`. The browser uses only the Supabase publishable key.

## Publishing

The `mcms-publish` Edge Function requires a valid Supabase JWT and a publisher/owner/admin membership. It writes an HTML page into the configured `articles/` or `pages/` directory and updates `data/articles.json` for articles, which is the public site's catalogue. This preserves the static site's existing URL pattern and makes new articles discoverable from the homepage and archive.

Set `GITHUB_TOKEN` as a Supabase Edge Function secret with write access to `gpldroid/mseo`. Never expose that token in Vite variables. If the token is absent, content can still be drafted in the CMS but publishing will return a clear configuration error.

## Local development

```bash
cp .env.example .env.local
# Optionally set VITE_SUPABASE_URL and VITE_SUPABASE_PUBLISHABLE_KEY
npm install
npm run dev
```

The application includes a safe public-project fallback so the deployed Netlify dashboard can connect without a committed `.env.local`. Environment variables override the fallback for local/staging builds.

## Deployment

For Netlify, connect `gpldroid/mseo`, set the base directory/root directory to `admin-dashboard`, build command to `npm run build`, and publish directory to `dist`. Keep the dashboard origin in Supabase Auth URL Configuration (Site URL and Redirect URLs).

## Security notes

- Do not put service-role keys, database passwords, or GitHub tokens in frontend variables.
- Keep RLS enabled on all MCMS tables and review Supabase security/performance advisors after schema changes.
- Media is stored in a private bucket; the UI uses signed URLs for temporary previews.
- New signups do not automatically receive workspace membership.
