# CV ATS Pipeline - AI Agent Documentation

## Project Overview
This project is a static site/PDF generator for a data-driven Curriculum Vitae (CV) optimized for Applicant Tracking Systems (ATS). It transforms a YAML source file into three output formats: HTML (for web preview), PDF (for applications), and plain text (for easy pasting into ATS web forms).

## Technology Stack
- **Environment:** Node.js (>=18)
- **Data Parsing:** `js-yaml` (v4.1.0)
- **Templating:** `mustache` (v4.2.0)
- **PDF Generation:** `playwright` (v1.49.0 - Headless Chromium)
- **Styling:** Vanilla CSS3

## Directory Structure
- `/data/cv.yaml`: The single source of truth for the CV content.
- `/templates/cv.html`: Mustache template file defining the HTML structure.
- `/styles/cv.css`: Stylesheet designed for both screen viewing and A4 printing.
- `/scripts/build.mjs`: The main Node.js build pipeline script.
- `/dist/`: Automatically generated output directory for artifacts (`cv.html`, `cv.css`, `cv.txt`, `cv.pdf`).

## Build Pipeline (`scripts/build.mjs`)
The `build.mjs` script acts as the core engine. It performs the following sequential steps:
1. **Read Data:** Parses `data/cv.yaml` using `js-yaml`. Ensures `basics.name` is present.
2. **Prepare View Data:** The `prepareView(data)` function merges default section labels with any overrides provided in the YAML. It processes arrays (like `skills.items` and `projects.stack`) into comma-separated strings (`items_joined`, `stack_joined`) to make Mustache templating simpler.
3. **Generate Plain Text:** The `toPlainText(data)` function formats the YAML data into a structured plaintext string, ideal for copying and pasting into restrictive ATS portals.
4. **Render HTML:** Reads `templates/cv.html`, renders it via `Mustache.render()` with the prepared view data. Adjusts the stylesheet reference to a relative `./cv.css` for the `dist` directory.
5. **Write Intermediate Artifacts:** Copies `cv.css` and writes the rendered HTML to `dist/cv.html` and plaintext to `dist/cv.txt`.
6. **Generate PDF:** Uses Playwright to launch a headless Chromium instance, navigate to the generated `dist/cv.html`, and print it to `dist/cv.pdf` using A4 format with zero margins (margins are handled by CSS).

## Data Schema (`data/cv.yaml`)
The YAML schema expects the following main properties:
- `basics`: Object with `name`, `title`, `location`, `email`, `phone`, `linkedin`, `github`, `website`.
- `summary`: String (multiline).
- `skills`: Array of `{ category, items: [...] }`.
- `experience`: Array of `{ company, role, location, start, end, highlights: [...] }`.
- `projects`: Array of `{ name, url, stack: [...], description, highlights: [...] }`.
- `education`: Array of `{ institution, degree, location, start, end, details }`.
- `certifications`: Array of `{ name, issuer, year }`.
- `languages`: Array of `{ name, level }`.
- `labels`: Object for i18n overrides mapping keys like `summary`, `skills`, `experience`, etc., to custom string titles.

## Architecture & Layout Principles
- **One Column Design:** Avoids sidebars to ensure linear text extraction by ATS parsers.
- **Body Content Focused:** Critical information (e.g., contact info) is kept in the standard DOM body (`.cv-header`), avoiding native PDF headers/footers which ATS may ignore.
- **Text over Graphics:** Skills and metrics are strictly text lists. No skill bars or arbitrary graphics.
- **Print Optimization (`@media print` in `styles/cv.css`):** 
  - Restricts layout to exactly A4.
  - Removes box shadows and normalizes background colors.
  - Prevents page breaks inside elements using `break-inside: avoid` on `.section` and `.entry`.
  - Normalizes links (disables blue color for print).

## Available Commands (NPM Scripts)
- `npm run build`: Executes the full build pipeline (HTML + TXT + PDF).
- `npm run build:pdf`: Alias executing the same pipeline (useful as a semantic alias when specifically targeting PDF output).
