# MSEO dynamic site runtime

The Netlify/GitHub Pages assembly script copies `site-runtime.js` into the public build and adds a loader to generated public HTML pages. It reads only public rows from Supabase:

- `site_settings` with `key=theme` and `is_public=true`
- active rows from `ad_slots`

Theme variables are applied as `--primary-color`, `--secondary-color`, `--ui-radius`, and `--ui-font`. Ad code is trusted administrator-authored HTML/JavaScript and executes in the public page context. Only grant dashboard access to trusted administrators.

For precise placement, add `data-ad-slot="header_top"`, `data-ad-slot="sidebar"`, or `data-ad-slot="footer"` to an element in the site template. If no explicit element exists, the runtime uses common header/sidebar/footer elements. For `after_paragraph`, it inserts after the third paragraph and then at intervals.

The GitHub file editor and Netlify build trigger run as Netlify Functions. Configure these Netlify environment variables (never place the GitHub token in browser code):

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `GITHUB_TOKEN` (repository Contents read/write only)
- `GITHUB_OWNER=gpldroid`
- `GITHUB_REPO=mseo`
- `GITHUB_BRANCH=main`
- `NETLIFY_BUILD_HOOK_URL` (Netlify Build Hook URL)

The dashboard defaults to `https://mseopro.netlify.app/.netlify/functions`; override with `VITE_ADMIN_API_URL` only if functions live elsewhere.


## CMS publishing flow

When an editor saves or deletes content, the dashboard calls the protected `publish-content` Netlify Function. It commits a small sync marker to the configured GitHub branch; that push starts GitHub Pages and (when the Netlify site is connected to the same repository) Netlify builds. During the build, `npm run sync:cms` reads published rows from Supabase and generates static article/page HTML, the article catalogue, and sitemap entries. If the function is not configured, the content remains saved in Supabase and the dashboard shows a warning; configure the server-side variables above to enable automatic publishing.
