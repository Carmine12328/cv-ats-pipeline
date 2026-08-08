---
name: cv-ats-pipeline-rules
description: Essential guidelines and constraints for modifying the CV ATS Pipeline project.
---

# CV ATS Pipeline - Agent Rules

## Project Context
This is a data-driven CV generator optimized for Applicant Tracking Systems (ATS). It transforms a YAML file (`data/cv.yaml`) into HTML, PDF, and plain text formats using `mustache` and `playwright`.

## Core Guidelines & Constraints

1. **Source of Truth:**
   - ALL content changes must be made in `data/cv.yaml`. 
   - DO NOT manually edit any files in the `dist/` directory. They are auto-generated artifacts.

2. **Building:**
   - After modifying `data/cv.yaml`, `templates/cv.html`, `scripts/build.mjs` or `styles/cv.css`, always run `npm run build` to regenerate the artifacts in `dist/`.

3. **Layout & ATS Principles (CRITICAL - Do NOT break these):**
   - **One column only:** No sidebars, complex grids, or overlapping layouts that confuse ATS parsers.
   - **Text over graphics:** Skills must remain as simple text lists. Do not implement skill bars, star ratings, charts, or icons.
   - **Body content focused:** Keep critical information (like contact details) in the main DOM body (`.cv-header`), not in PDF native headers/footers.
   - **Styling constraints:** The design must stay sober with standard A4 proportions and generous margins (managed via CSS). Preserve and respect the `@media print` rules in `styles/cv.css`.

4. **Tech Stack & Modifying Code:**
   - The build script (`scripts/build.mjs`) uses Node.js (>= 18), `js-yaml`, `mustache`, and `playwright`.
   - HTML structure is managed in `templates/cv.html` using Mustache templating.
   - If adding new sections, make sure to update the labels mapping in `build.mjs` and the corresponding Mustache block in `cv.html`, while preserving the semantic HTML layout (`<section>`, `<article>`, `<ul>`).

5. **Reference Documentation:**
   - For a deeper dive into the architecture, data schema, and pipeline flow, refer to `docs/ai/ai_agent_docs.md`.
