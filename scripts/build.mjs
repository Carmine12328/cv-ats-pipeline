#!/usr/bin/env node
/**
 * Build pipeline: data/cv.yaml + data/cv.en.yaml → dist/ (HTML + PDF + TXT per language)
 */
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import * as yaml from "js-yaml";
import Mustache from "mustache";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const TEMPLATE_PATH = join(ROOT, "templates", "cv.html");
const CSS_PATH = join(ROOT, "styles", "cv.css");
const DIST = join(ROOT, "dist");
const FAVICON_SRC = join(ROOT, "assets", "favicon.svg");
const FAVICON_DEST = join(DIST, "favicon.svg");
const ROBOTS_SRC = join(ROOT, "assets", "robots.txt");
const ROBOTS_DEST = join(DIST, "robots.txt");
const SITEMAP_DEST = join(DIST, "sitemap.xml");
const SOCIAL_SRC = join(ROOT, "assets", "social-preview.jpg");
const SOCIAL_DEST = join(DIST, "social-preview.jpg");
const NOT_FOUND_SRC = join(ROOT, "assets", "404.html");
const NOT_FOUND_DEST = join(DIST, "404.html");
const SITE_URL = "https://carmine12328.github.io/cv-ats-pipeline/";

// ---------------------------------------------------------------------------
// Language configuration
// Each entry: { code, label, title, yamlFile, suffix }
// suffix is appended to output filenames: "" → cv.html, "-en" → cv-en.html
// ---------------------------------------------------------------------------
const LANGUAGES = [
  { code: "IT", label: "IT", title: "Italiano", yamlFile: "cv.yaml", suffix: "" },
  { code: "EN", label: "EN", title: "English", yamlFile: "cv.en.yaml", suffix: "-en" },
];

const DEFAULT_LABELS = {
  summary: "Professional Summary",
  skills: "Skills",
  experience: "Experience",
  projects: "Projects",
  education: "Education",
  certifications: "Certifications",
  languages: "Languages",
  languagesCertifications: "Languages & Certifications",
};

function prepareView(data, currentSuffix) {
  const labels = { ...DEFAULT_LABELS, ...(data.labels || {}) };
  if (!(data.labels || {}).languagesCertifications) {
    const isItalianOverride = Boolean((data.labels || {}).languages);
    const joiner = isItalianOverride ? "e" : "&";
    labels.languagesCertifications = `${labels.languages} ${joiner} ${labels.certifications}`;
  }
  const skills = (data.skills || []).map((s) => ({
    ...s,
    items_joined: Array.isArray(s.items) ? s.items.join(", ") : s.items,
  }));
  const projects = (data.projects || []).map((p) => ({
    ...p,
    stack_joined: Array.isArray(p.stack) ? p.stack.join(", ") : p.stack,
  }));

  const b = data.basics || {};
  const sameAs = [b.linkedin, b.github, b.website].filter(Boolean);
  const jsonLdObj = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: b.name,
    jobTitle: b.title,
    url: SITE_URL,
    ...(b.email && { email: `mailto:${b.email}` }),
    ...(b.phone && { telephone: b.phone }),
    ...(b.location && { address: { "@type": "PostalAddress", addressLocality: b.location } }),
    ...(sameAs.length && { sameAs }),
  };
  const jsonLd = JSON.stringify(jsonLdObj, null, 2);

  // Build language navigation for the template
  const languages_nav = LANGUAGES.map((l) => ({
    code: l.label,
    href: `cv${l.suffix}.html`,
    title: l.title,
    active: l.suffix === currentSuffix,
  }));

  return {
    ...data,
    lang: data.lang || "it",
    jsonLd,
    labels,
    summary: typeof data.summary === "string" ? data.summary.trim() : data.summary,
    skills,
    projects,
    experience: data.experience || [],
    education: data.education || [],
    certifications: data.certifications || [],
    languages: data.languages || [],
    languages_nav,
    langSuffix: currentSuffix,
  };
}

function toPlainText(data) {
  const L = { ...DEFAULT_LABELS, ...(data.labels || {}) };
  const b = data.basics || {};
  const lines = [];

  lines.push(b.name || "");
  lines.push(b.title || "");
  const contact = [b.location, b.email, b.phone, b.linkedin, b.github, b.website]
    .filter(Boolean)
    .join(" | ");
  if (contact) lines.push(contact);
  lines.push("");

  if (data.summary) {
    lines.push(L.summary.toUpperCase());
    lines.push(String(data.summary).trim());
    lines.push("");
  }

  if (data.skills?.length) {
    lines.push(L.skills.toUpperCase());
    for (const s of data.skills) {
      const items = Array.isArray(s.items) ? s.items.join(", ") : s.items;
      lines.push(`${s.category}: ${items}`);
    }
    lines.push("");
  }

  if (data.experience?.length) {
    lines.push(L.experience.toUpperCase());
    for (const e of data.experience) {
      lines.push(`${e.role} — ${e.company}`);
      const meta = [e.start && e.end ? `${e.start} – ${e.end}` : null, e.location]
        .filter(Boolean)
        .join(" | ");
      if (meta) lines.push(meta);
      for (const h of e.highlights || []) {
        lines.push(`• ${h}`);
      }
      lines.push("");
    }
  }

  if (data.projects?.length) {
    lines.push(L.projects.toUpperCase());
    for (const p of data.projects) {
      lines.push(p.name + (p.url ? ` (${p.url})` : ""));
      if (p.stack?.length) lines.push(p.stack.join(", "));
      if (p.description) lines.push(p.description);
      for (const h of p.highlights || []) {
        lines.push(`• ${h}`);
      }
      lines.push("");
    }
  }

  if (data.education?.length) {
    lines.push(L.education.toUpperCase());
    for (const ed of data.education) {
      lines.push(`${ed.degree} — ${ed.institution}`);
      const meta = [ed.start && ed.end ? `${ed.start} – ${ed.end}` : null, ed.location]
        .filter(Boolean)
        .join(" | ");
      if (meta) lines.push(meta);
      if (ed.details) lines.push(ed.details);
      lines.push("");
    }
  }

  if (data.certifications?.length) {
    lines.push(L.certifications.toUpperCase());
    for (const c of data.certifications) {
      const parts = [c.name, c.issuer, c.year ? `(${c.year})` : null].filter(Boolean);
      lines.push(parts.join(" — ").replace(" — (", " ("));
    }
    lines.push("");
  }

  if (data.languages?.length) {
    lines.push((L.languages || "Languages").toUpperCase());
    for (const lang of data.languages) {
      lines.push(`${lang.name}: ${lang.level}`);
    }
    lines.push("");
  }

  return lines.join("\n").trimEnd() + "\n";
}

async function buildPdf(htmlPath, pdfPath) {
  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(pathToFileURL(htmlPath).href, {
      waitUntil: "networkidle",
    });
    await page.pdf({
      path: pdfPath,
      format: "A4",
      printBackground: true,
      margin: {
        top: "0",
        right: "0",
        bottom: "0",
        left: "0",
      },
    });
  } finally {
    await browser.close();
  }
}

async function main() {
  await mkdir(DIST, { recursive: true });

  const template = await readFile(TEMPLATE_PATH, "utf8");

  // Copy shared assets (once)
  await copyFile(CSS_PATH, join(DIST, "cv.css"));
  await copyFile(FAVICON_SRC, FAVICON_DEST);
  await copyFile(ROBOTS_SRC, ROBOTS_DEST);
  await copyFile(SOCIAL_SRC, SOCIAL_DEST);
  await copyFile(NOT_FOUND_SRC, NOT_FOUND_DEST);

  // Build each language
  for (const langCfg of LANGUAGES) {
    const dataPath = join(ROOT, "data", langCfg.yamlFile);
    const raw = await readFile(dataPath, "utf8");
    const data = yaml.load(raw);
    if (!data?.basics?.name) {
      throw new Error(`${langCfg.yamlFile} must define basics.name`);
    }

    const view = prepareView(data, langCfg.suffix);

    // Render HTML — rewrite CSS path for dist
    let html = Mustache.render(template, view);
    html = html.replace(/href="\.\.\/styles\/cv\.css"/g, 'href="./cv.css"');

    const outHtml = join(DIST, `cv${langCfg.suffix}.html`);
    const outPdf = join(DIST, `cv${langCfg.suffix}.pdf`);
    const outTxt = join(DIST, `cv${langCfg.suffix}.txt`);

    await writeFile(outHtml, html, "utf8");
    await writeFile(outTxt, toPlainText(data), "utf8");
    console.log(`Wrote ${outHtml}`);
    console.log(`Wrote ${outTxt}`);

    await buildPdf(outHtml, outPdf);
    console.log(`Wrote ${outPdf}`);
  }

  // Sitemap — include all language variants
  const today = new Date().toISOString().split("T")[0];
  const urlEntries = LANGUAGES.map(
    (l) => `  <url>
    <loc>${SITE_URL}cv${l.suffix}.html</loc>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>${l.suffix === "" ? "1.0" : "0.8"}</priority>
  </url>`,
  ).join("\n");
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>
`;
  await writeFile(SITEMAP_DEST, sitemap, "utf8");

  console.log("Build complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
