import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distPath = path.resolve(__dirname, "../dist");

const filesToCheck = [
  "cv.html",
  "cv-en.html",
  "cv.pdf",
  "cv-en.pdf",
  "cv.txt",
  "cv-en.txt",
  "cv.css",
  "favicon.svg",
  "robots.txt",
  "sitemap.xml",
];

let hasErrors = false;
let passedCount = 0;

console.log("Validating dist/ artifacts...");

for (const file of filesToCheck) {
  const filePath = path.join(distPath, file);

  if (!fs.existsSync(filePath)) {
    console.error(`❌ Check failed: File missing -> ${file}`);
    hasErrors = true;
    continue;
  }

  const stats = fs.statSync(filePath);
  if (stats.size === 0) {
    console.error(`❌ Check failed: File empty -> ${file}`);
    hasErrors = true;
    continue;
  }

  const content = fs.readFileSync(filePath, "utf8");
  let passed = true;

  if (file.endsWith(".html")) {
    const requiredStrings = ["<main", "cv-header", "</html>"];
    for (const str of requiredStrings) {
      if (!content.includes(str)) {
        console.error(`❌ Check failed: ${file} is missing '${str}'`);
        passed = false;
      }
    }
  } else if (file.startsWith("cv") && file.endsWith(".txt")) {
    const name = "Carmine Annunziata";
    if (!content.includes(name)) {
      console.error(`❌ Check failed: ${file} is missing name '${name}'`);
      passed = false;
    }
  }

  if (!passed) {
    hasErrors = true;
  } else {
    console.log(`✅ Passed: ${file}`);
    passedCount++;
  }
}

console.log(`\nSummary: ${passedCount}/${filesToCheck.length} files passed checks.`);

if (hasErrors) {
  console.error("Validation failed!");
  process.exit(1);
} else {
  console.log("All validation checks passed successfully.");
  process.exit(0);
}
