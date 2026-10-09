# Project map

```text
mseo/
├── index.html                 # Home and searchable article discovery
├── pages/                     # Category hubs and policy pages
├── articles/                  # Crawlable, standalone editorial pages
├── assets/
│   ├── css/
│   │   ├── site.css            # Shared visual system and components
│   │   └── tokens.css          # Typography, spacing and motion tokens
│   ├── js/
│   │   ├── site.js             # Small browser bootstrap
│   │   └── modules/            # Feature-oriented ES modules
│   └── favicon.svg
├── data/articles.json          # Article catalogue
├── scripts/                    # Build, sitemap and validation utilities
├── sitemap.xml
├── robots.txt
├── package.json
└── ARCHITECTURE.md
```

The site is static-first. Do not move article content into client-only rendering: HTML pages should remain directly accessible to crawlers, no-JavaScript visitors, and link previews.
