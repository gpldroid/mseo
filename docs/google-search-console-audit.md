# Google Search Console URL inspection audit

This repository includes a **read-only** audit of URLs listed in the production sitemap. It calls the Search Console URL Inspection API to report the index information Google currently has for each URL. It does not submit URLs for indexing, change Search Console settings, or use the Indexing API.

## 1. Create and configure a Google Cloud project

1. Create or select a project in [Google Cloud Console](https://console.cloud.google.com/).
2. Enable **Google Search Console API** for that project.
3. Create a service account. A service-account key is used by this script; treat the JSON key as a password.
4. In Search Console, open the URL-prefix property `https://fastseo.site/` and add the service-account email as a user with the minimum role that allows URL inspection. Use read-only access where supported.
5. Generate a JSON key only if required by your organization's policy. Never commit the JSON file, private key, access token, or credentials to this repository.

The service account must be explicitly granted access to the Search Console property; creating a Cloud project alone does not grant access to the property.

## 2. Run locally

Requires Node.js 20 or newer. No npm packages are needed.

Provide the complete service-account JSON through an environment variable (do not paste it into a source file):

```sh
export GOOGLE_SERVICE_ACCOUNT_JSON='{"type":"service_account", ...}'
export SEARCH_CONSOLE_SITE_URL='https://fastseo.site/'
export SEARCH_CONSOLE_SITEMAP_URL='https://fastseo.site/sitemap.xml'
node scripts/search-console-audit.mjs
```

The script writes a dated CSV report in the current directory. Override the output path with `SEARCH_CONSOLE_REPORT_PATH`. Set `SEARCH_CONSOLE_MAX_URLS` to a positive integer to limit the audit; the default is 2,000 URLs. The script only inspects URLs on the configured site's origin and under its URL prefix, supports sitemap indexes, deduplicates URLs, and applies a conservative request delay.

Useful columns include:

- `coverageState`: Search Console's current indexed/coverage description.
- `verdict`: high-level status (`PASS`, `NEUTRAL`, or `FAIL`).
- `robotsTxtState`, `indexingState`, `pageFetchState`: crawl, noindex, and fetch signals.
- `googleCanonical` versus `userCanonical`: helps spot canonical mismatches.
- `lastCrawlTime`: last recorded Google crawl time, when available.
- `inspectionResultLink`: direct link to inspect the URL in Search Console.

An API error is recorded per URL in the CSV; if any URL fails inspection, the script exits non-zero so automation can flag the run.

## 3. Run from GitHub Actions

Add the following repository Actions secrets:

- `GOOGLE_SERVICE_ACCOUNT_JSON`: the full JSON key contents.
- Optional `SEARCH_CONSOLE_SITE_URL`: defaults to `https://fastseo.site/`.
- Optional `SEARCH_CONSOLE_SITEMAP_URL`: defaults to `https://fastseo.site/sitemap.xml`.

Use **Actions → Search Console URL inspection audit → Run workflow**. The workflow is manual by default, with an optional weekly schedule. It uploads the CSV as a workflow artifact. Do not expose secrets in logs or add them as ordinary repository variables.

## Important limitations

- URL Inspection API reports Google's **indexed-version** information; it does not test a live URL or expose every reason shown in the Page indexing report.
- The API is for inspecting URLs one at a time, subject to Google quotas. This audit only checks sitemap URLs; pages excluded from the sitemap will not be discovered by this run.
- This does not call an API that requests indexing. For a small number of URLs, use Search Console's URL Inspection UI to request indexing manually. Sitemap submission and requests to recrawl do not guarantee inclusion in Search results.
- Never use Google's Indexing API for ordinary articles or static HTML pages; it is intended for supported job-posting and livestream structured-data cases.
