---
name: new-cv-section-workflow
description: Workflow for adding a completely new section to the CV without breaking the build or layout.
---

# New CV Section Workflow

When the user asks to add a completely new section (e.g., "Publications", "Awards", "Volunteering") to the CV Pipeline, you must follow these exact steps to maintain the ATS layout principles and build integrity.

### Step 1: Update `data/cv.yaml`
Add the new data array or object to the YAML file structure.
**Crucial:** You must also add an entry to the `labels` object at the bottom of the YAML file for i18n support (e.g., `publications: "Publications"`).

### Step 2: Update `scripts/build.mjs`
Modify the `prepareView(data)` function in `scripts/build.mjs` to map the new label fallback and process the data if needed.
```javascript
// Example addition in build.mjs:
data.labels.publications = data.labels.publications || 'Publications';

// If the section has items that need joining (like tags or skills), add logic here before rendering.
```

### Step 3: Update `templates/cv.html`
Add the new section using standard semantic HTML and Mustache templating. Place it appropriately inside the template body. Use the existing structure as a guide to ensure consistent CSS rendering:
```html
{{#publications.length}}
<section class="section">
  <h2>{{labels.publications}}</h2>
  <div class="section-content">
    {{#publications}}
    <article class="entry">
      <div class="entry-header">
        <h3 class="entry-title">{{title}}</h3>
        <span class="entry-date">{{year}}</span>
      </div>
      <div class="entry-details">{{publisher}}</div>
      {{#description}}
      <p class="entry-description">{{description}}</p>
      {{/description}}
    </article>
    {{/publications}}
  </div>
</section>
{{/publications.length}}
```

### Step 4: Build and Verify
Run `npm run build` to generate the new HTML, TXT, and PDF artifacts. 
Ensure the build passes and the new layout still conforms to the strict one-column ATS constraints defined in `docs/ai/ai_agent_docs.md`.
