# CV ATS Pipeline

[![Build CV](https://github.com/Carmine12328/cv-ats-pipeline/actions/workflows/build.yml/badge.svg)](https://github.com/Carmine12328/cv-ats-pipeline/actions/workflows/build.yml)

Data-driven curriculum vitae: **YAML → HTML → PDF** (+ plain `.txt` for ATS paste forms). Built for real Full Stack Developer applications — single column, selectable text, standard section titles.

## Quick start

```bash
npm install
npx playwright install chromium
npm run build
```

Outputs in `dist/`:

| File | Use |
|------|-----|
| `cv.pdf` | Attach to applications / email |
| `cv.html` | Preview in browser |
| `cv.txt` | Paste into portals that ask for plain text |

## Customize content

Edit only [`data/cv.yaml`](data/cv.yaml):

1. Replace `basics` (name, title, contact links)
2. Rewrite `summary` to match the role you target
3. Keep `skills` as keyword lists (no skill bars)
4. Update `experience` bullets: **verb + context + result**
5. Add/remove `projects`, `education`, `certifications` as needed

Optional: change `labels` for English section titles (`Experience`, `Skills`, …) or keep Italian.

For a specific job posting, duplicate the YAML (e.g. `data/cv.en.yaml`) and tweak summary + a few keywords — then point the build script at that file if you extend it, or temporarily swap the file.

## Scripts

| Command | What it does |
|---------|----------------|
| `npm run build` | Render HTML + TXT + PDF |
| `npm run build:pdf` | Same pipeline (PDF always generated; useful alias) |

Stack: Node.js ≥ 18, `js-yaml`, `mustache`, `playwright`.

## Layout principles (do not break for ATS)

- **One column** — no sidebars
- Critical info only in the document body (not PDF headers/footers, not icons/images)
- Skills as **text lists**, not bars or graphics
- Sober typography, A4, generous margins (~14mm)
- Keywords in the body (stack, tools, domain)

## Pre-send checklist

- [ ] Name, email, phone, LinkedIn, GitHub are correct and clickable in the PDF
- [ ] Target title matches the role (e.g. Full Stack Developer)
- [ ] Summary mentions stack and impact relevant to **this** job
- [ ] Experience bullets include metrics where honest
- [ ] No typos; open `dist/cv.pdf` and skim once
- [ ] File size and page count look reasonable (prefer ~1 page; 2 if long experience)
- [ ] If the portal wants plain text, paste from `dist/cv.txt`
- [ ] Prefer PDF with selectable text (this pipeline) over scanned images

## Project layout

```
data/cv.yaml          # content source of truth
templates/cv.html     # Mustache HTML template
styles/cv.css         # A4 single-column styles
scripts/build.mjs     # build pipeline
dist/                 # generated artifacts
```

## License

Private / personal use — replace placeholder data with your own before sending.
