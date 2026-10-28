#!/usr/bin/env node

/**
 * FR-I18N-04: i18n key consistency checker for vi ↔ en locales.
 *
 * Compares all translation JSON files between the Vietnamese (vi) and
 * English (en) locale directories. Reports:
 *   - Missing namespace files in either locale
 *   - JSON syntax / reading errors in any file
 *   - Missing keys (including arbitrarily nested keys) between locales
 *
 * Exit codes:
 *   0 — all keys and namespace files match, all JSON valid
 *   1 — inconsistencies detected (missing keys, missing files, or JSON errors)
 *   2 — fatal runtime error (e.g. missing entire locale directory)
 */

import { readdir, readFile } from "node:fs/promises";
import { join, resolve } from "node:path";
import { existsSync } from "node:fs";

export const DEFAULT_LOCALES_DIR = resolve(
  import.meta.dirname,
  "..",
  "src",
  "services",
  "i18n",
  "locales"
);

export const LOCALE_VI = "vi";
export const LOCALE_EN = "en";

/**
 * Flatten a nested object into dot-separated key paths.
 * e.g. { a: { b: "x" } } → ["a.b"]
 *
 * @param {Record<string, unknown>} obj
 * @param {string} prefix
 * @returns {string[]}
 */
export function flattenKeys(obj, prefix = "") {
  const keys = [];
  if (!obj || typeof obj !== "object") return keys;
  for (const [key, value] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === "object" && !Array.isArray(value)) {
      keys.push(...flattenKeys(value, fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

/**
 * Read and parse a JSON file safely, returning { data, error }.
 *
 * @param {string} filePath
 * @returns {Promise<{ data: Record<string, unknown> | null, error: string | null }>}
 */
export async function readJsonFile(filePath) {
  try {
    const content = await readFile(filePath, "utf-8");
    const data = JSON.parse(content);
    if (typeof data !== "object" || data === null || Array.isArray(data)) {
      return { data: null, error: "Root JSON value must be an object" };
    }
    return { data, error: null };
  } catch (err) {
    return { data: null, error: err.message || "Failed to read or parse JSON" };
  }
}

/**
 * List all .json files in a locale directory.
 *
 * @param {string} localeDir
 * @returns {Promise<string[]>}
 */
export async function listNamespaceFiles(localeDir) {
  try {
    const entries = await readdir(localeDir);
    return entries.filter((f) => f.endsWith(".json")).sort();
  } catch {
    return [];
  }
}

/**
 * Compare keys and namespaces between two locales.
 *
 * @param {string} localesDir
 * @returns {Promise<{
 *   missingFilesVi: string[],
 *   missingFilesEn: string[],
 *   invalidJsonFiles: Array<{ file: string, locale: string, error: string }>,
 *   missingInVi: Map<string, string[]>,
 *   missingInEn: Map<string, string[]>,
 *   hasErrors: boolean
 * }>}
 */
export async function compareLocales(localesDir = process.env.LOCALES_DIR || DEFAULT_LOCALES_DIR) {
  const viDir = join(localesDir, LOCALE_VI);
  const enDir = join(localesDir, LOCALE_EN);

  if (!existsSync(enDir)) {
    console.error(`❌ EN locale directory not found: ${enDir}`);
    process.exit(2);
  }
  if (!existsSync(viDir)) {
    console.error(`❌ VI locale directory not found: ${viDir}`);
    console.error("   Please create the VI locale directory with translation files.");
    process.exit(2);
  }

  const enFiles = await listNamespaceFiles(enDir);
  const viFiles = await listNamespaceFiles(viDir);

  const missingFilesVi = enFiles.filter((f) => !viFiles.includes(f));
  const missingFilesEn = viFiles.filter((f) => !enFiles.includes(f));

  /** @type {Array<{ file: string, locale: string, error: string }>} */
  const invalidJsonFiles = [];
  /** @type {Map<string, string[]>} */
  const missingInVi = new Map();
  /** @type {Map<string, string[]>} */
  const missingInEn = new Map();

  // For files missing in VI: report all keys from EN as missing in VI
  for (const file of missingFilesVi) {
    const enPath = join(enDir, file);
    const { data: enObj, error } = await readJsonFile(enPath);
    if (error) {
      invalidJsonFiles.push({ file, locale: LOCALE_EN, error });
    } else if (enObj) {
      const keys = flattenKeys(enObj);
      if (keys.length > 0) missingInVi.set(file, keys);
    }
  }

  // For files missing in EN: report all keys from VI as missing in EN
  for (const file of missingFilesEn) {
    const viPath = join(viDir, file);
    const { data: viObj, error } = await readJsonFile(viPath);
    if (error) {
      invalidJsonFiles.push({ file, locale: LOCALE_VI, error });
    } else if (viObj) {
      const keys = flattenKeys(viObj);
      if (keys.length > 0) missingInEn.set(file, keys);
    }
  }

  // Files present in both locales: compare keys
  const commonFiles = enFiles.filter((f) => viFiles.includes(f));
  for (const file of commonFiles) {
    const enPath = join(enDir, file);
    const viPath = join(viDir, file);

    const { data: enObj, error: enErr } = await readJsonFile(enPath);
    if (enErr) invalidJsonFiles.push({ file, locale: LOCALE_EN, error: enErr });

    const { data: viObj, error: viErr } = await readJsonFile(viPath);
    if (viErr) invalidJsonFiles.push({ file, locale: LOCALE_VI, error: viErr });

    if (enObj && viObj) {
      const enKeys = new Set(flattenKeys(enObj));
      const viKeys = new Set(flattenKeys(viObj));

      const keysOnlyInEn = [...enKeys].filter((k) => !viKeys.has(k)).sort();
      const keysOnlyInVi = [...viKeys].filter((k) => !enKeys.has(k)).sort();

      if (keysOnlyInEn.length > 0) {
        missingInVi.set(file, keysOnlyInEn);
      }
      if (keysOnlyInVi.length > 0) {
        missingInEn.set(file, keysOnlyInVi);
      }
    }
  }

  const hasErrors =
    missingFilesVi.length > 0 ||
    missingFilesEn.length > 0 ||
    invalidJsonFiles.length > 0 ||
    missingInVi.size > 0 ||
    missingInEn.size > 0;

  return {
    missingFilesVi,
    missingFilesEn,
    invalidJsonFiles,
    missingInVi,
    missingInEn,
    hasErrors,
  };
}

/**
 * Print a report of missing keys grouped by file.
 */
function printMissingKeysReport(label, missingMap) {
  if (missingMap.size === 0) return;

  console.log(`\n${label}`);
  console.log("─".repeat(60));

  let totalKeys = 0;
  for (const [file, keys] of missingMap) {
    console.log(`\n  📄 ${file} (${keys.length} key${keys.length > 1 ? "s" : ""}):`);
    for (const key of keys) {
      console.log(`     • ${key}`);
      totalKeys++;
    }
  }
  console.log(
    `\n  Total: ${totalKeys} missing key${totalKeys !== 1 ? "s" : ""} across ${missingMap.size} file${missingMap.size !== 1 ? "s" : ""}`
  );
}

// ── Main CLI Runner ──────────────────────────────────────────
async function main() {
  console.log("🔍 Checking i18n key consistency between VI and EN locales...\n");

  const localesDir = process.env.LOCALES_DIR || DEFAULT_LOCALES_DIR;
  const {
    missingFilesVi,
    missingFilesEn,
    invalidJsonFiles,
    missingInVi,
    missingInEn,
    hasErrors,
  } = await compareLocales(localesDir);

  if (!hasErrors) {
    console.log("✅ All i18n keys and namespace files are consistent between VI and EN locales.");
    process.exit(0);
  }

  if (missingFilesVi.length > 0) {
    console.log("\n❌ Missing namespace files in VI (present in EN):");
    console.log("─".repeat(60));
    for (const file of missingFilesVi) {
      console.log(`  • ${file}`);
    }
  }

  if (missingFilesEn.length > 0) {
    console.log("\n❌ Missing namespace files in EN (present in VI):");
    console.log("─".repeat(60));
    for (const file of missingFilesEn) {
      console.log(`  • ${file}`);
    }
  }

  if (invalidJsonFiles.length > 0) {
    console.log("\n❌ Invalid JSON files:");
    console.log("─".repeat(60));
    for (const { file, locale, error } of invalidJsonFiles) {
      console.log(`  • [${locale}] ${file}: ${error}`);
    }
  }

  printMissingKeysReport("⚠️  Keys present in EN but missing in VI:", missingInVi);
  printMissingKeysReport("⚠️  Keys present in VI but missing in EN:", missingInEn);

  console.log("\n❌ i18n key check failed. Please resolve the errors above.\n");
  process.exit(1);
}

// Run directly if invoked as script
const isMainModule = import.meta.url === `file://${process.argv[1]?.replace(/\\/g, "/")}`;
if (isMainModule || process.argv[1]?.endsWith("check-i18n-keys.mjs")) {
  main().catch((err) => {
    console.error("❌ Fatal error:", err.message);
    process.exit(2);
  });
}
