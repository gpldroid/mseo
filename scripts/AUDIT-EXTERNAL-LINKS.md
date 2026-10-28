# External-link audit

Run from the repository root with Node.js:

\`\`\`sh
node scripts/audit-external-links.mjs > external-links-audit.csv
\`\`\`

The CSV includes the source HTML file, URL, hostname, visible anchor text, \`rel\`, \`target\`, a triage classification, and how many times the exact URL appears. The summary is written to stderr so the redirected CSV stays parseable.

## How to use the report

1. Filter \`classification\` for \`manual-review\`, \`promotional-or-affiliate-review\`, or \`security-review-missing-noopener\`.
2. Review the destination and the surrounding paragraph in the source article before changing anything.
3. Keep useful, editorially relevant citations. Do not remove a link just because it points outside the site.
4. Investigate redirects, HTTP status, and destination quality separately; this script intentionally makes no network requests.
5. Treat the categories as hints only. A static scan cannot prove that a link is spam or that it caused a search-ranking issue.

The script is read-only and does not change article content.
