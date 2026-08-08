#!/usr/bin/env node
/**
 * Build pipeline: data/cv.yaml → dist/cv.html + dist/cv.pdf + dist/cv.txt
 */
import { readFile, writeFile, mkdir, copyFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import yaml from "js-yaml";
import Mustache from "mustache";
import { chromium } from "playwright";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const DATA_PATH = join(ROOT, "data", "cv.yaml");
const TEMPLATE_PATH = join(ROOT, "templates", "cv.html");
const CSS_PATH = join(ROOT, "styles", "cv.css");
const DIST = join(ROOT, "dist");
const OUT_HTML = join(DIST, "cv.html");
const OUT_CSS = join(DIST, "cv.css");
const OUT_PDF = join(DIST, "cv.pdf");
const OUT_TXT = join(DIST, "cv.txt");

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

function prepareView(data) {
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

  return {
    ...data,
    labels,
    summary: typeof data.summary === "string" ? data.summary.trim() : data.summary,
    skills,
    projects,
    experience: data.experience || [],
    education: data.education || [],
    certifications: data.certifications || [],
    languages: data.languages || [],
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

  const raw = await readFile(DATA_PATH, "utf8");
  const data = yaml.load(raw);
  if (!data?.basics?.name) {
    throw new Error("data/cv.yaml must define basics.name");
  }

  const view = prepareView(data);
  const template = await readFile(TEMPLATE_PATH, "utf8");

  // Self-contained HTML in dist: copy CSS next to HTML and point stylesheet there
  let html = Mustache.render(template, view);
  html = html.replace(/href="\.\.\/styles\/cv\.css"/, 'href="./cv.css"');

  await copyFile(CSS_PATH, OUT_CSS);
  await writeFile(OUT_HTML, html, "utf8");
  await writeFile(OUT_TXT, toPlainText(data), "utf8");

  console.log(`Wrote ${OUT_HTML}`);
  console.log(`Wrote ${OUT_TXT}`);

  await buildPdf(OUT_HTML, OUT_PDF);
  console.log(`Wrote ${OUT_PDF}`);
  console.log("Build complete.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
