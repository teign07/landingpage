import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, join, normalize } from "node:path";
import { fileURLToPath } from "node:url";

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const filesToScan = ["index.html", "styles.css", "app.js"];
const ignored = [
  /^#/,
  /^mailto:/i,
  /^tel:/i,
  /^https?:\/\//i,
  /^data:/i,
  /^javascript:/i,
  /^about:/i,
];

const references = new Set();

function cleanReference(value) {
  const trimmed = value.trim().replace(/^['"]|['"]$/g, "");
  if (!trimmed || ignored.some((pattern) => pattern.test(trimmed))) return null;
  return trimmed.split("#")[0].split("?")[0];
}

function addReference(fromFile, rawValue) {
  const cleaned = cleanReference(rawValue);
  if (!cleaned) return;
  references.add(JSON.stringify({ fromFile, value: cleaned }));
}

for (const file of filesToScan) {
  const absolute = join(root, file);
  const source = readFileSync(absolute, "utf8");

  for (const match of source.matchAll(/(?:src|href)=["']([^"']+)["']/g)) {
    addReference(file, match[1]);
  }

  for (const match of source.matchAll(/url\(([^)]+)\)/g)) {
    addReference(file, match[1]);
  }

  for (const match of source.matchAll(/["'](\.\.?\/assets\/[^"']+)["']/g)) {
    addReference(file, match[1]);
  }
}

const missing = [];

for (const encoded of references) {
  const { fromFile, value } = JSON.parse(encoded);
  const fromDir = dirname(join(root, fromFile));
  const candidate = normalize(join(fromDir, value));

  if (!candidate.startsWith(root) || !existsSync(candidate)) {
    missing.push(fromFile + " -> " + value);
    continue;
  }

  if (!statSync(candidate).isFile()) {
    missing.push(fromFile + " -> " + value + " is not a file");
  }
}

if (missing.length) {
  console.error("Missing static references:");
  for (const item of missing) console.error("- " + item);
  process.exit(1);
}

console.log("Checked " + references.size + " local static references. All good.");

