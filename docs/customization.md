# Customizing Your CV

This pipeline is data-driven, which means you rarely need to touch HTML or CSS. Your single source of truth is the `data/cv.yaml` file.

## Editing Content (`data/cv.yaml`)

Open `data/cv.yaml` in your favorite text editor. The file is structured into logical sections:

- **basics**: Your personal details (name, title, contact info). These are rendered at the top of the CV.
- **summary**: A short professional summary.
- **skills**: List your technical skills grouped by category. Keep these as simple text keywords.
- **experience**: Your work history. Use action verbs and include metrics where possible!
- **projects**: Notable side projects or open-source contributions.
- **education** & **certifications**: Your academic background.
- **languages**: Spoken languages and proficiency.

### Changing Section Titles (i18n)

By default, the templates might use certain titles for sections. You can override them using the `labels` section at the bottom of the YAML file.

```yaml
labels:
  summary: "Profile"
  experience: "Work Experience"
```

## Best Practices for ATS

To ensure maximum compatibility with Applicant Tracking Systems, please keep the following in mind:

1. **Keep it simple:** Do not add complex graphics or skill bars. ATS parsers prefer simple text lists.
2. **Standard sections:** Use standard names for sections (like "Experience" and "Education") so the parser knows what it's looking at.
3. **One column:** The layout is intentionally single-column. Do not try to force a multi-column layout.

## Editing Styles

If you absolutely must change the visual appearance, you can edit `styles/cv.css`.

The stylesheet is built to look good on screen and perfectly formatted for A4 paper via the `@media print` query. When adjusting styles, always run a build and check `dist/cv.pdf` to ensure you haven't broken the print layout!
