# GitHub OAuth redirect configuration

The admin dashboard supports these production URLs:

- GitHub Pages: `https://gpldroid.github.io/mseo/admin-dashboard/`
- Netlify: `https://mseopro.netlify.app/admin-dashboard/`

The GitHub OAuth flow sends users back to the matching dashboard URL. Supabase Auth must allow both URLs:

1. Open the Supabase project actually used by the deployed dashboard.
2. Go to **Authentication → URL Configuration**.
3. Add both URLs above to **Redirect URLs** (the redirect allow list).
4. Set **Site URL** to the preferred canonical dashboard URL, for example `https://mseopro.netlify.app/admin-dashboard/`.
5. In **Authentication → Providers → GitHub**, keep the GitHub OAuth callback URL set to the Supabase Auth callback shown in that project. It is normally `https://<project-ref>.supabase.co/auth/v1/callback`; do not set the GitHub provider callback to the dashboard URL.

If Supabase rejects a requested `redirectTo` because it is not allow-listed, it may redirect to the configured Site URL instead. That can make an old path such as `/mcms` reappear even when the frontend requests a different destination.

Note: GitHub Pages and Netlify are separate origins, so both dashboard URLs must be allow-listed. Do not point the frontend at a different Supabase project until its schema and credentials have been verified.
