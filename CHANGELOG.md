# CHANGELOG

## v1.4.0 (Modified by Simon)
- **Desktop About Split-Pane Layout**: Fixed, non-scrollable left profile panel paired with an independently scrollable right content column (`Bio`, `Selected Publications`, `News`).
- **Scrollable News Section**: Added a bounded-height container (`max-h-60`) with a standalone vertical scrollbar for homepage News items.
- **Publications DOI & PDF Updates**: Linked card titles directly to `https://doi.org/<doi>`, added a dedicated inline DOI display row (hidden when `presentation` is set), added downloadable `pdf` BibTeX attachment support, and removed `DOI` and `BibTeX` card buttons.
- **Meeting Abstracts**: Added `presentation = {oral}` / `{poster}` badges and filters, removed the duplicate date next to the conference name, and added `award` / `awards` BibTeX parsing with a dedicated card row.
- **Multi-Paragraph Abstracts**: Preserved `\par`, blank lines, and paragraph breaks inside BibTeX `abstract` and `description` fields.
- **Medium Blog Integration**: Added `/blog` powered by a server-side Medium RSS proxy (`/api/medium/`) reading `medium_username` directly from `content/blog.toml` (without a search/handle input bar).
- **English-Only & Attribution**: Removed Chinese localization (`content_zh` and Chinese messages), updated footer attribution to `Built with PRISM - Modified by Simon`, and configured Next.js `output: 'standalone'`.

## v1.3.3 on May 13, 2026
- Fixed disabled i18n mode so browser language and stored locale preferences cannot override the default locale.
- Added inline formatting for BibTeX publication titles, including `\textit`, `\emph`, `\textbf`, `\textsc`, superscript, and subscript commands.

## v1.3.2 on Mar 19, 2026
- Added Markdown rendering for card items.

## v1.3.1 on Feb 24, 2026
- Fixed SSR/client mismatch from font stylesheet toggling. Updated font settings to be deterministic.

## v1.3.0 on Feb 22, 2026
- Added support for i18n. Set `enabled = true` in config.toml to enable this feature.
- Fixed some cases where the navigation bar indicator not working correctly.

## v1.2.1 on Feb 19, 2026
- Updated the navigation bar implementation to make it more responsive, dynamic, and natural.
- The demo site is updated as well.

## v1.2.0 on Dec 6, 2025

- Added GitHub Actions workflow for automatic deployment to GitHub Pages.
- Fixed publication highlighting with site owner name.
- Fixed co-author underline.
- Fixed broken "view all" link when one-page mode is disabled.
- Updated docs and deployment guide.

## v1.1.0 on Nov 23, 2025

- Added support for one-page mode. Set `enable_one_page_mode = true` in config.toml to enable this feature. All subpages will be rendered on the same page.
- Added more flexible settings for social icons. You may leave the config blank to hide the display of any social icon.

## v1.0.0 on Nov 18, 2025

- Initial release
