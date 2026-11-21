<div align="center">
  <img src="./logo.png" alt="PRISM Logo" height="100"/>
</div>

# PRISM

**English** · [Changelog](#changelog)

**If you like this project, please give it a star ⭐️**

PRISM stands for **P**ortfolio & **R**esearch **I**nterface **S**ite **M**aker. It is a modern, configurable, and high-performance personal website template built with Next.js, Tailwind CSS, and TypeScript. It is designed for researchers, developers, and academics to showcase their work, publications, and portfolio with ease.

Feel free to customize your own version of PRISM with coding agents.

![PRISM Preview](screenshot.png)

## ✨ Features

*   **📄 Configuration-Driven**: Manage your site's content using `TOML`, `Markdown`, and `BibTeX` files in the `content/` directory (English-only).
*   **📚 BibTeX Publications & Meeting Abstracts**: Render peer-reviewed papers and conference/meeting abstracts from `.bib` files with search, Year/Type/Presentation filtering, clickable DOI-linked titles, inline DOI display (on publications), downloadable PDFs, and multi-paragraph abstract formatting.
*   **🎤 Oral, Poster & Award Indicators**: Mark meeting abstracts with `presentation = {oral}` or `presentation = {poster}` and `award = {...}` to display a presentation header badge (with single date placement), structured venue/location metadata, dedicated award callout rows, and `All / Oral / Poster` filtering.
*   **✍️ Medium Blog Integration**: Dedicated **Blog** page (`/blog`) that pre-renders articles from your configured `medium_username` in `content/blog.toml` at build time and refreshes live on the client, displaying clickable article titles, publication dates/times, and platform labels.
*   **🖥️ Desktop Split-Pane About Layout & Scrollable News**: On desktop screens, the About page keeps the left profile panel fixed and non-scrollable while the right content column (Bio, Selected Publications, and News) scrolls independently, with a dedicated bounded scrollbar on the News section.
*   **🎨 Modern Design**: Clean, responsive UI with serif/sans-serif typography pairing, Framer Motion animations, Dark Mode support, and customized footer attribution (`Built with PRISM - Modified by Simon`).
*   **⚡️ Static Site Export (`/out`)**: Built on Next.js 15 with `output: 'export'` so `npm run build` outputs a complete static site to `/out` ready to host anywhere (GitHub Pages, Cloudflare Pages, Netlify, Vercel, S3, or any web server).

## 🚀 Getting Started

### Prerequisites

*   Node.js 22 or later
*   npm

### Installation

1.  **Clone the repository:**

    ```bash
    git clone https://github.com/simonchung87/PRISM.git
    cd PRISM
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Run the development server:**

    ```bash
    npm run dev
    ```

    Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🛠️ Configuration & New Features

All content lives in the `content/` directory (configured for English-only mode).

### 1. Global Site Config (`content/config.toml`)
Configure your site title, author details, social links, and navigation menu here:

```toml
[site]
title = "Your Name"
description = "Personal website of Your Name"
favicon = "/favicon.svg"

[author]
name = "Your Name"
title = "PhD Student / Researcher"
institution = "Your University"
avatar = "/bio.jpg"

[features]
enable_likes = true
enable_one_page_mode = false

[i18n]
enabled = false
locales = ["en"]
default_locale = "en"
mode = "fixed"
fixed_locale = "en"
persist = false
switcher = false
```

### 2. Desktop Split-Pane Homepage & Scrollable News (`content/about.toml` & `content/news.toml`)
Customize the "About" section, "Selected Publications", and "News" on the homepage:

*   **Desktop Split Layout**: On `lg:` desktop viewports, the left column (avatar, name, contact links, research interests, and like button) remains fixed and non-scrollable, while the right column (Bio, Selected Publications, and News) scrolls independently. On smaller screens, both columns stack normally.
*   **Scrollable News**: Add entries to `content/news.toml` using `[[news]]` blocks (`date` and `content`). The **News** section renders inside a bounded-height container (`max-h-60`) with a standalone vertical scrollbar so long histories stay compact.

```toml
[[news]]
date = "2026-11"
content = "New article series published on Medium."
```

### 3. Publications, DOI Links, PDFs & Multi-Paragraph Abstracts (`content/publications.bib`)
Export your publications to `content/publications.bib`. Supported BibTeX fields and card behaviors:

*   **Clickable Title, Month/Year & Inline DOI Display**: When `doi = {...}` is set on a publication entry, the card title links directly to `https://doi.org/<doi>`. A compact month/year badge and a dedicated **DOI** badge appear in the bottom action row right after the `PDF` and `Abstract` buttons (the inline DOI badge is hidden whenever `presentation` is present, and standalone `DOI` / `BibTeX` buttons have been removed).
*   **Downloadable PDFs**: Set `pdf = {filename.pdf}` or `pdf = {https://example.com/paper.pdf}` to show a **PDF** download button on the entry card. Place local PDF files in `public/papers/` and reference them by filename (e.g., `pdf = {sample-paper.pdf}`), or provide a root-relative path or external URL.
*   **Multi-Paragraph Abstracts**: Separate paragraphs in `abstract = {...}` or `description = {...}` with blank lines or `\par` to render spaced `<p>` paragraphs.
*   **Additional Helpers**: `selected = {true}`, `preview = {example.png}`, `code = {https://...}`, and inline BibTeX formatting commands (`\textit{}`, `\emph{}`, `\textbf{}`, `\textsc{}`, `\textsuperscript{}`, `\textsubscript{}`).

### 4. Meeting Abstracts (`content/abstracts.toml` & `content/abstracts.bib`)
Create dedicated conference or meeting abstract pages using `type = "publication"` in `content/abstracts.toml`:

```toml
type = "publication"
title = "Meeting Abstracts"
description = "Conference abstracts and scientific meeting presentations, indicating oral talks and poster sessions."
source = "abstracts.bib"
```

In `content/abstracts.bib`, add `presentation = {oral}` or `presentation = {poster}` alongside `booktitle`, `address`/`location`, `month`, `year`, and optional `award` / `pdf`:

```bibtex
@inproceedings{example2025,
  title = {Example Conference Abstract},
  author = {Your Name and Collaborator},
  booktitle = {Annual Physics Meeting 2025},
  year = {2025},
  month = mar,
  address = {Boston, MA, USA},
  presentation = {oral},
  award = {Best Student Oral Presentation Award},
  pdf = {sample-paper.pdf},
  abstract = {First paragraph of the abstract.

Second paragraph of the abstract.}
}
```

Entries with `presentation` automatically display:
*   A prominent **Oral Presentation** or **Poster Presentation** header badge with the date shown once on the right of the header bar.
*   A structured venue metadata row (`Conference · Location`) without duplicating the date.
*   A dedicated **Award** callout row directly below the title and above the authors when `award` or `awards` is present (supports multiple awards separated by `;`).
*   **All / Oral / Poster** filter controls next to the search bar and inside the **Filters** panel, plus text search matching `"oral"`, `"poster"`, award names, title, author, venue, and location.
*   The inline DOI box is automatically disabled/hidden when `presentation` is set.

### 5. Medium Blog Page (`content/blog.toml`)
Add a **Blog** page backed by your Medium RSS feed by setting `type = "blog"` in `content/blog.toml` and adding it to `[[navigation]]` in `content/config.toml`:

```toml
type = "blog"
title = "Blog"
description = "Technical notes, essays, and research reflections fetched live from Medium."
medium_username = "your_medium_handle"
platform = "Medium"
limit = 10
```

*   Articles are fetched at build time from `https://medium.com/feed/@<medium_username>` and baked into the static `/out` HTML, with silent client-side RSS refresh on page load and no search or handle input bar shown on the page.
*   Each card shows the clickable article title (linking directly to Medium), publication date/time, and platform label (`Medium`).

### 6. Adding Other Custom Pages
Create a `.toml` file in `content/` and add an entry to `[[navigation]]` in `content/config.toml`. Supported page types:
*   `text`: Renders Markdown content (e.g., CVs, Bio).
*   `card`: Renders a list of Markdown-capable cards (e.g., Projects, Awards, Services, Teaching).
*   `publication`: Renders BibTeX-backed Publications or Meeting Abstracts lists with search and filters.
*   `blog`: Renders articles from the configured Medium RSS feed (pre-fetched at build time + live client refresh).

## 📦 Deployment (Static Export in `/out`)

This project uses Next.js `output: 'export'` so you can deploy the generated `out/` folder on any static hosting provider (GitHub Pages, Cloudflare Pages, Netlify, Vercel, Amazon S3, Nginx, Apache, etc.).

```bash
npm run build
```

Running `npm run build` generates the complete static website into the `out/` directory. Upload or serve the contents of `out/` anywhere.

## 📂 Project Structure

```
PRISM/
├── content/              # Site config, Markdown, TOML, and BibTeX files (English-only)
├── public/
│   └── papers/           # Paper preview images and downloadable PDF attachments
├── out/                  # Generated static site output (created by `npm run build`)
├── src/
│   ├── app/
│   │   ├── [slug]/       # Dynamic subpages (/publications, /abstracts, /blog, etc.)
│   │   └── page.tsx      # Homepage (Fixed Profile + Scrollable Bio/Publications/News)
│   ├── components/       # UI components (PublicationsList, BlogPage, News, Footer, etc.)
│   ├── lib/              # BibTeX/TOML/Medium parsers, config loaders, and stores
│   └── types/            # TypeScript definitions
└── next.config.ts        # Next.js configuration (static export to /out)
```

<a id="changelog"></a>
## 📝 Changelog

For full release history, see [CHANGELOG.md](CHANGELOG.md).

### Recent Customizations (Modified by Simon)
*   **Desktop About Layout**: Separated the desktop About page into a fixed, non-scrollable left profile column (preserving original profile sizing with no divider) and an independently scrollable right content column (`Bio`, `Selected Publications`, and `News`).
*   **Publications Cards, Date & DOI Behavior**:
    *   Linked each publication title directly to `https://doi.org/<doi>` when a DOI is present.
    *   Moved the publication month/year and inline **DOI** badge into the bottom action row right after the `PDF` and `Abstract` buttons (removing the year from behind the journal name and hiding the DOI box when `presentation` is set).
    *   Removed the `DOI` and `BibTeX` action buttons and the expandable BibTeX drawer from cards.
    *   Added `pdf` BibTeX field support for downloadable local (`public/papers/`) or external PDF attachments.
    *   Preserved `\par`, blank lines, and line breaks as spaced paragraphs for multi-paragraph abstracts and descriptions.
*   **Meeting Abstracts Page**:
    *   Added support for `presentation = {oral}` and `presentation = {poster}` badges with `All / Oral / Poster` filtering.
    *   Removed the duplicate date next to the conference name so the date appears once in the top presentation header bar.
    *   Added BibTeX `award` / `awards` parsing (semicolon-separated) and placed the Award callout row directly below the title and above the authors.
*   **Medium Blog Page**:
    *   Added a dedicated `/blog` page pre-rendering `medium_username` RSS articles at build time with silent client-side RSS refresh, displaying clickable titles, publication dates/times, and platform labels.
    *   Removed the Medium username search bar so the page cleanly loads only the `medium_username` configured in `content/blog.toml`.
*   **Homepage News, Static Export & Site Updates**:
    *   Added a bounded-height News container (`max-h-60`) with a standalone vertical scrollbar on the About page.
    *   Removed the Chinese localization (`content_zh` and Chinese UI strings) to keep the site English-only.
    *   Updated footer attribution to `Built with PRISM - Modified by Simon`.
    *   Cleaned up `README.md` (removed Chinese and Demo links) and configured Next.js static export (`output: 'export'`) so `npm run build` generates a host-anywhere static site in `/out`.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
