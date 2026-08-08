---
name: new-cv-language
description: Workflow for adding a new language translation to the CV pipeline.
---

# Adding a New CV Language

## Overview

The pipeline supports multiple language variants via separate YAML data files. Each produces its own HTML, PDF, and TXT output with a language switcher linking between them.

## Steps

### 1. Create the data file

- Copy `data/cv.yaml` to `data/cv.{lang}.yaml` (e.g., `cv.fr.yaml`)
- Set `lang: {lang}` (e.g., `lang: fr`)
- Translate all text content: `summary`, `experience.highlights`, `skills.category`, `education`, `languages`, `labels`
- Keep structure, dates, company names, and technical terms unchanged

### 2. Register the language in build.mjs

Add an entry to the `LANGUAGES` array in `scripts/build.mjs`:

```js
{ code: "FR", label: "FR", title: "Français", yamlFile: "cv.fr.yaml", suffix: "-fr" }
```

The `suffix` controls output filenames: `cv-fr.html`, `cv-fr.pdf`, `cv-fr.txt`.

### 3. Build and verify

Run `npm run build`. The script automatically:

- Produces HTML/PDF/TXT for the new language
- Updates the sitemap with the new URL
- Renders the language switcher with all configured languages

### Conventions

- Italian (`cv.yaml`) uses no suffix → `cv.html` (backward-compatible default)
- All other languages use `-{lang}` suffix → `cv-{lang}.html`
- The language switcher is auto-generated from the `LANGUAGES` array — no template changes needed
