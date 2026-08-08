# CV ATS Pipeline - AI Agent Documentation

## Project Overview

This project is a static site/PDF generator for a data-driven, multilingual Curriculum Vitae (CV) optimized for Applicant Tracking Systems (ATS). It transforms YAML source files into four output formats per language: HTML (for web preview and GitHub Pages hosting), PDF (for applications), plain text (for easy pasting into ATS web forms), and DOCX (for portals requiring Word documents).

## Technology Stack

- **Environment:** Node.js (>=20)
- **Data Parsing:** `js-yaml` (v5.x)
- **Templating:** `mustache` (v4.2.0)
- **PDF Generation:** `playwright` (v1.62.x - Headless Chromium)
- **DOCX Generation:** `docx` (v9.x)
- **Styling:** Vanilla CSS3

## Directory Structure

- `/data/cv.yaml`: Italian CV — the primary source of truth for content.
- `/data/cv.en.yaml`: English CV — full translation of the Italian source.
- `/templates/cv.html`: Mustache template file defining the HTML structure (shared across all languages).
- `/styles/cv.css`: Stylesheet designed for both screen viewing and A4 printing.
- `/scripts/build.mjs`: The main Node.js build pipeline script.
- `/scripts/validate.mjs`: Post-build validation script (checks existence, size, and structure of output files).
- `/dist/`: Automatically generated output directory for artifacts (per language: `.html`, `.pdf`, `.txt`, `.docx`, plus shared assets).
- `/assets/`: Static assets copied to dist (`favicon.svg`, `robots.txt`, `social-preview.jpg`, `404.html`).
- `/docs/ai/`: This documentation directory.

## Multi-Language Support

The pipeline supports multiple languages via a `LANGUAGES` array in `build.mjs`:

```js
const LANGUAGES = [
  { code: "IT", label: "IT", title: "Italiano", yamlFile: "cv.yaml", suffix: "" },
  { code: "EN", label: "EN", title: "English", yamlFile: "cv.en.yaml", suffix: "-en" },
];
```

- Each language has its own YAML data file in `/data/`.
- Output files use a suffix convention: `cv.html` (Italian, default), `cv-en.html` (English).
- The HTML template renders a language switcher bar and `hreflang` alternate links for SEO.
- To add a new language, see the `new-cv-language` skill in `.agents/skills/`.

## Build Pipeline (`scripts/build.mjs`)

The `build.mjs` script acts as the core engine. It performs the following steps:

1. **Copy Shared Assets:** Copies `cv.css`, `favicon.svg`, `robots.txt`, `social-preview.jpg`, and `404.html` to `dist/`.
2. **Launch Browser:** Starts a single Playwright Chromium instance, reused across all PDF builds.
3. **Per-Language Processing (loop over `LANGUAGES`):**
   a. **Read Data:** Parses the language's YAML file using `js-yaml`. Ensures `basics.name` is present.
   b. **Prepare View Data:** The `prepareView(data, suffix)` function merges default section labels with any overrides provided in the YAML. It processes arrays (like `skills.items` and `projects.stack`) into comma-separated strings (`items_joined`, `stack_joined`), builds JSON-LD structured data, canonical URLs, hreflang links, and a dynamic download filename (e.g. `Carmine_Annunziata_CV.pdf`).
   c. **Render HTML:** Reads `templates/cv.html`, renders it via `Mustache.render()` with the prepared view data. Adjusts the stylesheet reference to `./cv.css` for the `dist` directory.
   d. **Generate Plain Text:** The `toPlainText(data)` function formats the YAML data into a structured plaintext string.
   e. **Generate DOCX:** The `buildDocx(data, path)` function creates a clean, ATS-optimised Word document using the `docx` library, with proper headings, bold formatting, bullet points, and accent-colored borders.
   f. **Generate PDF:** Uses Playwright to navigate to the generated HTML and print it to PDF using A4 format with zero margins (margins are handled by CSS).
4. **Post-Processing:**
   - Copies `dist/cv.html` to `dist/index.html` for root GitHub Pages access.
   - Generates `dist/sitemap.xml` with all language variant URLs.

## Data Schema (`data/cv.yaml` / `data/cv.en.yaml`)

The YAML schema expects the following main properties:

- `lang`: Language code string (e.g., `"it"`, `"en"`).
- `basics`: Object with `name`, `title`, `location`, `email`, `phone`, `linkedin`, `github`, `website`.
- `summary`: String (multiline).
- `skills`: Array of `{ category, items: [...] }`.
- `experience`: Array of `{ company, role, location, start, end, highlights: [...] }`.
- `projects`: Array of `{ name, url, stack: [...], description, highlights: [...] }`.
- `education`: Array of `{ institution, degree, location, start, end, details }`.
- `certifications`: Array of `{ name, issuer, year }`.
- `languages`: Array of `{ name, level }`.
- `labels`: Object for i18n overrides mapping keys like `summary`, `skills`, `experience`, etc., to custom string titles.

### Date Format Convention

Dates use a human-readable "Month YYYY" format, localised per language:

- **Italian:** `Giu 2022`, `Mag 2019`, `Presente`
- **English:** `Jun 2022`, `May 2019`, `Present`
- **Education (year only):** `2022`, `2015`

## Architecture & Layout Principles

- **One Column Design:** Avoids sidebars to ensure linear text extraction by ATS parsers.
- **Body Content Focused:** Critical information (e.g., contact info) is kept in the standard DOM body (`.cv-header`), avoiding native PDF headers/footers which ATS may ignore.
- **Text over Graphics:** Skills and metrics are strictly text lists. No skill bars or arbitrary graphics.
- **Print Optimization (`@media print` in `styles/cv.css`):**
  - Restricts layout to exactly A4.
  - Removes box shadows and normalizes background colors.
  - Uses `break-inside: avoid` on `.entry` elements to prevent orphan headers across page breaks (not on `.section` to avoid blank space when large sections span pages).
  - Normalizes links (disables blue color for print).
- **SEO & Social:** The HTML template includes OpenGraph/Twitter Card meta tags, JSON-LD structured data (`Person` schema), canonical URLs, and hreflang alternate links.

## Available Commands (NPM Scripts)

- `npm run build`: Executes the full build pipeline (HTML + TXT + DOCX + PDF, all languages).
- `npm run build:pdf`: Alias executing the same pipeline.
- `npm test` / `npm run test`: Runs `scripts/validate.mjs` to verify output files.
- `npm run lint`: Runs ESLint on `scripts/`.
- `npm run format`: Runs Prettier on the entire project.
- `npm run format:check`: Checks Prettier formatting without modifying files.
- `npm run validate`: Runs `build` then `test` sequentially.
