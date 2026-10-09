# MSEO Design System

## الاتجاه البصري

MSEO uses an Arabic-first editorial interface rather than a generic dashboard or template:
- Warm off-white canvas, ink-green text, and a high-contrast lime accent.
- Editorial typography with large Arabic headings, calm reading widths, and generous line height.
- Simple square-edged cards and circular icon containers; restrained shadows and no excessive gradients.
- Shared header, footer, category pages, article reading styles, search modal, and back-to-top controls.

## Typography

- **Body:** Noto Sans Arabic, 16–17px by default, line-height 1.9.
- **Headings:** Cairo, weight 800–900, responsive sizing using `clamp()`.
- **Code:** IBM Plex Mono.
- **Long-form article text:** approximately 17–18px with line-height 2.1 for comfortable mobile reading.
- Arabic pages must set `lang="ar"` and `dir="rtl"`; code snippets and URLs should remain readable in LTR contexts.

## Color and spacing

Tokens are centralized in `assets/css/site.css` and `assets/css/tokens.css`. The primary accent is lime, with deep green used for links and emphasis. Dark mode switches the same semantic tokens rather than duplicating component styles.

## Icons

Use Font Awesome Free Solid icons for interface and navigation, with one icon style per component. Icons are decorative when adjacent text already conveys meaning (`aria-hidden="true"`); icon-only buttons require an Arabic `aria-label`. Avoid emoji as interface icons and avoid mixing icon libraries.

## Framework decision

The project is a static, content-first GitHub Pages site. The current recommendation is **semantic HTML + shared CSS design tokens + native JavaScript ES modules**:
- No Bootstrap dependency: Bootstrap is useful for fast conventional layouts, but its component defaults would need substantial overriding to achieve this distinctive editorial direction.
- No Tailwind runtime/CDN in production. If utility classes are needed later, compile Tailwind during the build.
- No React/Vue layer unless the site grows into a highly interactive application.
- No Java backend: GitHub Pages serves static files; browser interactions are implemented in JavaScript.

If the number of articles and templates grows substantially, evaluate Astro as a static-site generator with content collections, keeping the same visual system and generated HTML output.

## Responsive rules

- Mobile-first layouts; article cards collapse to one column on narrow screens.
- Main body copy should not fall below 16px on mobile.
- Controls have at least 44px target dimensions.
- Honor `prefers-reduced-motion` and provide visible keyboard focus.
- Keep search, theme toggle, and mobile navigation usable without hover.
