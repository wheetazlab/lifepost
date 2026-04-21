# Lifepost — Ghost Theme

A clean, content-first Ghost theme for lifestyle blogs covering food, travel, tech, and everyday life. Built on the official Ghost Source theme foundation with a warm cream/orange editorial aesthetic, full dark-mode support, a Cmd+K search palette, reading-progress bar, responsive category grids, member-access badges, a membership pricing page, and a flexible collection template for trip or recipe round-ups.

---

## Table of contents

- [Features](#features)
- [Requirements](#requirements)
- [Installation](#installation)
- [Design settings reference](#design-settings-reference)
- [Templates](#templates)
  - [Default (`default.hbs`)](#default-defaulthbs)
  - [Home (`home.hbs`, `index.hbs`)](#home-homehbs-indexhbs)
  - [Post (`post.hbs`)](#post-posthbs)
  - [Page (`page.hbs`)](#page-pagehbs)
  - [Tag and Author (`tag.hbs`, `author.hbs`)](#tag-and-author-taghbs-authorhbs)
  - [Collection (`custom-collection.hbs`)](#collection-custom-collectionhbs)
  - [Membership (`membership.hbs`)](#membership-membershiphbs)
- [Category strip](#category-strip)
- [Member access badges](#member-access-badges)
- [Accessibility](#accessibility)
- [Development](#development)
  - [Project layout](#project-layout)
  - [Scripts](#scripts)
  - [Asset pipeline](#asset-pipeline)
  - [Locales](#locales)
- [Release workflow](#release-workflow)
- [Support](#support)
- [License](#license)

---

## Features

- **Dark / Light / Auto colour scheme** — follows the system preference by default; a sun/moon toggle in the nav bar stores the override in `localStorage`.
- **Seven heading fonts** — choose *Fraunces*, *Playfair Display*, *Source Serif 4*, or *IBM Plex Serif* for a serif voice, or *Sora*, *Space Grotesk*, or *Inter* for sans — all in Design settings. Body copy uses Inter at all times for consistent readability.
- **Narrow typography option** — tighter line-width mode for long-form reading.
- **Custom background + accent colours** — hex colour pickers in the Design panel for background, success (green), danger (red), star (gold), on-accent text, header scrim, and code-block background/text.
- **Three navigation layouts** — Logo on the left, Logo in the middle, or Stacked (logo above nav).
- **Cmd+K / "/" search palette** — keyboard shortcuts that trigger Ghost's built-in search overlay.
- **Reading-progress bar** — thin indicator at the top of every post (toggleable per site).
- **Related posts** — up to three posts sharing the primary tag, shown below the article (toggleable).
- **Email-capture CTA** — sign-up prompt banner on the home page and at the end of each post (requires Ghost Members).
- **Category strip** — scrollable tag grid on the home page (toggleable); order controlled via the tag's meta-title field.
- **Featured-post treatment** — the home page's first featured post gets a larger hero card with a "Featured" pill.
- **Member-access badges** — posts set to *Members only* or *Paid* automatically show a coloured lock pill on every card (home, tag archives, author archives, related posts).
- **Membership pricing page** — a built-in template that renders Ghost tiers as pricing cards wired directly to Ghost Portal. Zero-configuration for free tier; paid cards appear automatically when paid tiers are defined.
- **Collection template** — a custom page template that builds a chronological list of every post tagged with the page's primary tag. Drop-in for trips, recipe collections, reading lists, or any series.
- **PhotoSwipe lightbox** — click any image in post content to open a full-screen, swipeable gallery.
- **Code-block copy buttons** — hover any fenced code block for a one-click copy button.
- **Frosted-glass nav on scroll** — the top bar gains a subtle blur once the page scrolls.
- **Nav overflow handling** — nav menus of more than five items automatically collapse the overflow into a dropdown to preserve the header layout.
- **Bluesky / Mastodon / Threads / TikTok / Spotify / YouTube / YouTube Music / Apple / LinkedIn icons** — in addition to the built-in Facebook and Twitter/X icons Ghost provides.

## Requirements

- **Ghost 6.0.0** or later
- **Node.js 24** (LTS) for theme development — enforced in CI
- A Ghost site with **Members** enabled if you want to use the email CTA or Membership page

## Installation

1. Download the latest `.zip` from the [releases page](https://github.com/wheetazlab/lifepost/releases).
2. In Ghost Admin go to **Settings → Design → Change theme → Upload theme**.
3. Select the zip file and click **Activate**.

Every release is validated by [GScan](https://gscan.ghost.org/) before it ships.

## Design settings reference

All options are available under **Settings → Design → Customize**.

| Setting | Group | Options / type | Default |
|---|---|---|---|
| Colour scheme | Site | `Auto`, `Light`, `Dark` | `Auto` |
| Heading font | Site | `Fraunces`, `Playfair Display`, `Source Serif 4`, `IBM Plex Serif`, `Sora`, `Space Grotesk`, `Inter` | `Fraunces` |
| Typography | Site | `Default`, `Narrow` | `Default` |
| Background colour | Site | Hex colour | `#fbf7f1` (warm cream) |
| Success accent | Site | Hex colour | `#059669` |
| Danger accent | Site | Hex colour | `#c0392b` |
| Star accent | Site | Hex colour | `#f4b400` |
| On-accent text | Site | Hex colour | `#15171a` |
| Header scrim | Site | Hex colour | `#000000` |
| Code background | Site | Hex colour | `#0f1115` |
| Code text | Site | Hex colour | `#e6e7eb` |
| Navigation layout | Site | `Logo on the left`, `Logo in the middle`, `Stacked` | `Logo on the left` |
| Email signup text | Site | Text | `Get new posts delivered to your inbox` |
| Footer text | Site | Text | *(empty — falls back to the Ghost default)* |
| Primary header | Homepage | Text | `A blog theme for all of lifes events` |
| Secondary header | Homepage | Text | `Subscribe now!` |
| Show category strip | Homepage | Boolean | `true` |
| Show reading progress | Post | Boolean | `true` |
| Show related posts | Post | Boolean | `true` |

The site-wide accent (orange, `#ff671f`) and the body font (Inter) are intentionally not exposed — they define the brand.

## Templates

### Default (`default.hbs`)

The outermost layout every other template extends via `{{!< default}}`. Emits `<head>` (Ghost head, theme CSS/JS, font-display optimisation), the nav bar (`partials/components/navbar.hbs`), a skip-to-content link, a `<main id="site-main">` block for child templates, the footer, the PhotoSwipe modal, and `{{ghost_foot}}`. Honours the `color_scheme` setting by writing `data-theme` on `<html>`.

### Home (`home.hbs`, `index.hbs`)

`home.hbs` is the canonical homepage template — hero block (primary/secondary headers from settings), optional category strip, a featured-post hero card, a paginated post list, and the email CTA banner. `index.hbs` is a thin fallback for older Ghost installs and renders the same layout.

### Post (`post.hbs`)

Single post template. Emits the full article via `partials/components/article.hbs`, optionally followed by related posts (`partials/components/related-posts.hbs`) and the email CTA. The reading-progress bar is injected client-side.

### Page (`page.hbs`)

Generic static page — uses the article partial so page content is rendered with the same typography as posts.

### Tag and Author (`tag.hbs`, `author.hbs`)

Archive listings. Each renders a header (tag or author metadata + optional cover image) followed by a paginated grid of post cards. Empty states are handled inline — no partial required.

### Collection (`custom-collection.hbs`)

A custom **page** template for building a chronological list of every post tagged with the page's primary tag.

1. Create a Ghost **page** (e.g. "Panama 2024").
2. Assign it the **Collection** template from the page-settings sidebar.
3. Create a tag whose slug matches what you want to collect (e.g. `panama-2024`) and set it as the page's **primary tag**.
4. Tag each post you want in the collection with that same tag.

The collection title, label pill, and accent colour are driven by the primary tag — set the tag's accent colour in Ghost Admin → Tags.

### Membership (`membership.hbs`)

A page template that displays your Ghost subscription tiers as pricing cards.

1. Create a new **Page** in Ghost Admin (e.g. "Subscribe").
2. In the page-settings sidebar open **Template** and select **Membership**.
3. Optionally set the page excerpt — it becomes the subtitle under the hero heading.
4. Publish the page and add it to your navigation.

The **Free** tier is always shown. **Paid** tiers appear automatically when active paid tiers are configured under **Settings → Members & Tiers**. Each paid card shows the tier name, description, monthly price, optional annual price with savings callout, benefits list, and a Subscribe button wired to Ghost Portal for that specific tier. Any body content you write in the page editor renders below the tier cards.

## Category strip

By default the home-page strip shows every **public** tag in alphabetical order.

- **Show / hide a tag** — set visibility to **Public** or **Internal** in Ghost Admin → Tags. Internal tags are hidden from the strip and from tag archive pages entirely.
- **Custom sort order** — open a tag → scroll to the **SEO** section → enter a number in the **Meta title** field (e.g. `1`, `2`, `10`). Tags render in ascending numeric order; tags without a meta-title number fall to the end. Use gaps in your numbering (1, 10, 20…) so you can slot new tags in later without renumbering everything.

The meta-title value is used only for ordering — it is never shown to visitors.

## Member access badges

Posts with their **Access** setting (Ghost editor sidebar) set to anything other than "Public" display a small badge on every post card site-wide.

| Access level | Badge |
|---|---|
| Public | *(no badge)* |
| Members only | Blue "Members" pill |
| Paid members only | Red "Paid" pill |

To gate a post: open it → **Settings** → change **Access**. No theme changes needed.

## Accessibility

- WCAG AA contrast in both light and dark modes (accent button text uses the high-contrast `on_accent_color` setting).
- Skip-to-content link exposed on keyboard focus.
- Keyboard focus trap in the search modal with return-focus on close.
- `<nav>` landmarks and semantic headings throughout — validated by the release workflow.
- Every `<img>` requires alt text — also validated by the release workflow.

## Development

### Project layout

```
.
├── default.hbs                 # outer layout
├── home.hbs, index.hbs         # homepage
├── post.hbs, page.hbs          # single post / page
├── tag.hbs, author.hbs         # archives
├── custom-collection.hbs       # collection page template
├── membership.hbs              # membership page template
├── partials/
│   ├── category-strip.hbs
│   ├── pswp.hbs                # PhotoSwipe modal markup
│   ├── components/             # reusable blocks
│   └── icons/                  # inline social-icon partials
├── assets/
│   ├── css/screen.css          # source CSS (compiled → built/)
│   ├── js/main.js              # source JS (compiled → built/)
│   ├── fonts/
│   ├── images/
│   └── built/                  # gulp output + hand-maintained theme overrides
├── locales/                    # i18n strings (en, de, fr, sv, …)
├── gulpfile.js                 # build pipeline
└── package.json                # scripts, Ghost config, theme settings
```

### Scripts

```bash
# Install dependencies
npm install

# Watch CSS + JS and reload the browser via LiveReload
npm run dev

# Validate with GScan (same check the marketplace runs)
npm test

# Build a distributable zip
npm run zip
```

### Asset pipeline

Gulp (ESM, Node 24) compiles source assets in `assets/css/` and `assets/js/` into `assets/built/`:

- **CSS** — `screen.css` → PostCSS with `postcss-easy-import`, `autoprefixer`, and `cssnano` → `built/screen.css`.
- **JS** — everything in `assets/js/*.js` → concatenated, uglified → `built/main.min.js`.

Two files inside `assets/built/` are **hand-maintained** and loaded after the compiled output:

- `assets/built/lifepost.css` — theme overlay styles (dark-mode, membership cards, related-posts grid, member badges, reading-progress bar, etc.).
- `assets/built/lifepost.js` — runtime enhancements (theme toggle, category-strip sort, Cmd+K shortcut, copy buttons, reading progress, frosted nav).

Edit these directly — they are not regenerated by gulp. The release CI enforces a minimum comment density on them so blocks stay documented.

### Locales

Localisation strings live in `locales/*.json`. Add a new locale by dropping a file whose name matches the Ghost locale code (e.g. `es.json`). Every key that exists in `en.json` must exist in the new file — GScan will flag missing translations at activation time.

## Release workflow

Pushing a Git tag that matches `v*` triggers `.github/workflows/release.yml`, which runs a series of **hard-fail** gates before publishing a GitHub Release with the built `.zip` attached:

- `README.md` quality — must be ≥ 40 lines with an installation section.
- `package.json` fields — `name`, `version`, `description`, `author`, `license`, `main`, `repository`, `gpm`, `gpm.type`, `engines.ghost`, `gpm.screenshots`.
- **Ghost attribution** — every non-partial template must start with either `{{!< default}}` or a template-name comment.
- **No hardcoded `/assets/` paths** in templates (use `{{asset}}`).
- **Every `<img>` has `alt=`**.
- **Every top-level template has `<nav>`** landmarks via the nav-bar partial.
- **`{{ghost_head}}` is present** in `default.hbs`.
- **HTMLHint** linting on all `.hbs` files.
- **File-structure check** — `default.hbs`, `post.hbs`, and `package.json` exist.
- **Unused-partials check** — no orphan partials in `partials/`.
- **Empty-state fallbacks** — `tag.hbs`, `author.hbs`, and archive templates must handle zero-post states.
- **Comment density** — `assets/built/lifepost.css`, `assets/built/lifepost.js`, and the `.hbs` templates must have at least five comment blocks each.
- **Featured-post styling** — the homepage featured block must have dedicated CSS.
- **Dead-CSS-class scan** — every class defined in `assets/css/screen.css` must be referenced in at least one `.hbs` or `.js` file.
- **Unstyled-class scan** (inverse of above) — every `gh-*` class used in a `.hbs` `class="…"` attribute or as a `.gh-*` selector in `assets/js/**/*.js` must have a matching rule in `assets/css/screen.css` or `assets/built/lifepost.css`. Catches the case where a refactor deletes CSS but leaves the template markup behind.
- **Missing-partial-reference scan** — every `{{> partial}}` call must resolve to an actual file.
- **GScan** validation (same as `npm test`).
- **Zip build** — `npm run zip` produces `lifepost.zip`, which is attached to the release.

A second workflow, [`audit.yml`](.github/workflows/audit.yml) (named **Live Audit** in the Actions tab), runs against the deployed template site at `https://lifepost.swheetlife.com`. It is **manual-only** — trigger it from the GitHub **Actions → Live Audit → Run workflow** button whenever you want a fresh live health-check. It runs five jobs in parallel:

- **Lighthouse (SEO + Accessibility)** — runs `npx lighthouse@latest` in headless Chrome against the homepage and fails if the **Accessibility** or **SEO** score drops below **90%**. The Best-Practices score is logged but informational. The full HTML report is uploaded as the `lighthouse-report` artifact.
- **Pa11y (WCAG2AA)** — runs Pa11y against the homepage with the `WCAG2AA` standard, hiding the Ghost Portal (`#/portal/`) links which intentionally live off-screen. Fails on any `error`-level accessibility issue. The JSON report is uploaded as the `pa11y-report` artifact.
- **SSL + Ghost iframe embed** — checks the TLS certificate via `openssl s_client`, confirms `HEAD /` returns 2xx, and then parses the response headers to ensure neither `X-Frame-Options` nor `Content-Security-Policy: frame-ancestors` would block the site from being embedded in `*.ghost.org` admin preview iframes. This is critical: a misconfigured proxy that sets `X-Frame-Options: DENY` will silently break Ghost's theme-preview feature.
- **Responsive matrix (browser × viewport)** — a 3 × 2 matrix (Chromium / Firefox / WebKit × mobile / desktop) runs [`.github/scripts/audit-browser.js`](.github/scripts/audit-browser.js) via Playwright against the live site. Catches rendering regressions that only show up in a specific browser engine or at a specific viewport width.
- **Kitchen-sink Ghost content types** *(optional)* — if the repository variable `KITCHEN_SINK_URL` is set to a post URL that exercises every Ghost editor card type (markdown, HTML, gallery, bookmark, button, callout, product, toggle, NFT, audio, video, file, email, email-cta, signup, header), this job runs Pa11y against it. Skipped with a warning when the variable is unset.

All jobs upload their artifacts on both success and failure so a passing run still produces reviewable reports.

## Support

Open an issue on [GitHub](https://github.com/wheetazlab/lifepost/issues).

## License

MIT © Stephen Wheet
