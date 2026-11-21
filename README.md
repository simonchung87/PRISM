<div align="center">
  <img src="./logo.png" alt="PRISM Logo" height="100"/>
</div>

# PRISM

**English** · [中文](README_cn.md) · [Demo](https://prism-demo.pages.dev)  · [Changelog](CHANGELOG.md)

**If you like this project, please give it a star ⭐️**

PRISM stands for **P**ortfolio & **R**esearch **I**nterface **S**ite **M**aker. It is a modern, configurable, and high-performance personal website template built with Next.js, Tailwind CSS, and TypeScript. It is designed for researchers, developers, and academics to showcase their work, publications, and portfolio with ease.

Feel free to customize your own version of PRISM with coding agents.

![PRISM Preview](screenshot.png)

## ✨ Features

*   **📄 Configuration-Driven**: Manage your site's content using `TOML`, `Markdown`, and `BibTeX` files in the `content/` directory.
*   **📚 BibTeX Publications & Meeting Abstracts**: Render peer-reviewed papers and conference/meeting abstracts directly from `.bib` files with search, Year/Type/Presentation filtering, copyable BibTeX citations, downloadable PDFs, and multi-paragraph abstract formatting.
*   **🎤 Oral & Poster Presentation Indicators**: Mark meeting abstracts with `presentation = {oral}` or `presentation = {poster}` to display a dedicated presentation header badge, structured venue/location metadata, and `All / Oral / Poster` filtering.
*   **✍️ Live Medium Blog Integration**: Dedicated **Blog** page (`/blog`) that fetches articles live from a Medium `@username` RSS feed via a server-side API route, displaying clickable article titles, publication dates/times, and platform labels.
*   **📰 Scrollable News Section**: Bounded-height News container with a standalone scrollbar on the About page so long update histories stay compact.
*   **🎨 Modern Design**: Clean, responsive UI with serif/sans-serif typography pairing, Framer Motion animations, Dark Mode support, and an English-only layout.
*   **⚡️ Next.js Standalone Server**: Built on Next.js 15 with App Router and `output: 'standalone'` to support server-side API routes cleanly.

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

### 2. Homepage & Scrollable News (`content/about.toml` & `content/news.toml`)
Customize the "About" section, "Selected Publications", and "News" on the homepage.

*   Add entries to `content/news.toml` using `[[news]]` blocks (`date` and `content`).
*   The **News** section renders inside a bounded-height container (`max-h-60`) with a standalone vertical scrollbar so long lists do not stretch the About page.

```toml
[[news]]
date = "2026-11"
content = "New article series published on Medium."
```

### 3. Publications, PDFs & Multi-Paragraph Abstracts (`content/publications.bib`)
Export your publications to `content/publications.bib`. Supported custom BibTeX fields:

*   `pdf = {filename.pdf}` or `pdf = {https://example.com/paper.pdf}`: Adds a downloadable **PDF** button to the entry card. Place local PDF files in `public/papers/` and reference them by filename (e.g., `pdf = {sample-paper.pdf}`), or provide a root-relative path (`/pdfs/...`) or external URL.
*   `abstract = {...}`: Separate paragraphs with blank lines or `\par`. Multi-paragraph abstracts (and descriptions) are preserved and rendered as spaced `<p>` paragraphs rather than collapsed into a single block.
*   `selected = {true}`, `preview = {example.png}`, `code = {https://...}`, `description = {...}`: Optional display helpers (all custom tags are automatically excluded from copyable BibTeX citations).

Inline BibTeX formatting commands (`\textit{}`, `\emph{}`, `\textbf{}`, `\textsc{}`, `\textsuperscript{}`, `\textsubscript{}`) are also supported in titles and text fields.

### 4. Meeting Abstracts (`content/abstracts.toml` & `content/abstracts.bib`)
Create dedicated conference or meeting abstract pages using `type = "publication"` in `content/abstracts.toml`:

```toml
type = "publication"
title = "Meeting Abstracts"
description = "Conference abstracts and scientific meeting presentations, indicating oral talks and poster sessions."
source = "abstracts.bib"
```

In `content/abstracts.bib`, add `presentation = {oral}` or `presentation = {poster}` (alongside `booktitle`, `address`/`location`, `month`, `year`, and optional `pdf`):

```bibtex
@inproceedings{example2025,
  title = {Example Conference Abstract},
  author = {Your Name and Collaborator},
  booktitle = {Annual Physics Meeting 2025},
  year = {2025},
  month = mar,
  address = {Boston, MA, USA},
  presentation = {oral},
  pdf = {sample-paper.pdf},
  abstract = {First paragraph of the abstract.

Second paragraph of the abstract.}
}
```

Entries with `presentation` automatically display:
*   A prominent **Oral Presentation** or **Poster Presentation** header badge and date.
*   A structured venue metadata row (`Conference · Location · Date`).
*   **All / Oral / Poster** filter controls next to the search bar and inside the **Filters** panel, plus text search matching `"oral"`, `"poster"`, title, author, venue, and location.

### 5. Medium Blog Page (`content/blog.toml`)
Add a **Blog** page backed by a Medium RSS feed by setting `type = "blog"` in `content/blog.toml` and adding it to `[[navigation]]` in `content/config.toml`:

```toml
type = "blog"
title = "Blog"
description = "Technical notes, essays, and research reflections fetched live from Medium."
medium_username = "your_medium_handle"
platform = "Medium"
limit = 10
```

*   Articles are fetched live from `https://medium.com/feed/@<username>` through the server-side `/api/medium/` route (avoiding browser CORS issues).
*   Each card shows the clickable article title (linking directly to Medium), publication date/time, and platform label (`Medium`).
*   Visitors can also enter another `@username` in the feed bar on `/blog` to preview any public Medium feed.

### 6. Adding Other Custom Pages
Create a `.toml` file in `content/` and add an entry to `[[navigation]]` in `content/config.toml`. Supported page types:
*   `text`: Renders Markdown content (e.g., CVs, Bio).
*   `card`: Renders a list of Markdown-capable cards (e.g., Projects, Awards, Services, Teaching).
*   `publication`: Renders BibTeX-backed Publications or Meeting Abstracts lists with search and filters.
*   `blog`: Fetches and renders live articles from a Medium RSS feed.

## 📦 Deployment

This project uses Next.js `output: 'standalone'` to support server-side API routes such as `/api/medium/`.

```bash
npm run build
npm run start
```

The production server binds and serves the built Next.js application including `/api/medium/`.

## 📂 Project Structure

```
PRISM/
├── content/              # Site config, Markdown, TOML, and BibTeX files (English-only)
├── public/
│   └── papers/           # Paper preview images and downloadable PDF attachments
├── src/
│   ├── app/
│   │   ├── api/medium/   # Server-side Medium RSS feed proxy route
│   │   ├── [slug]/       # Dynamic subpages (/publications, /abstracts, /blog, etc.)
│   │   └── page.tsx      # Homepage (About, Selected Publications, Scrollable News)
│   ├── components/       # UI components (PublicationsList, BlogPage, News, Footer, etc.)
│   ├── lib/              # BibTeX/TOML parsers, config loaders, and stores
│   └── types/            # TypeScript definitions
└── next.config.ts        # Next.js configuration (standalone output)
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

