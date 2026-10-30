#!/usr/bin/env node

/**
 * Tests for FR-I18N-04: i18n key consistency checker.
 *
 * Uses Node.js built-in test runner (`node --test`).
 * Zero external dependencies.
 *
 * Test cases covered:
 *   1. flattenKeys utility with flat and deeply nested objects
 *   2. readJsonFile with valid JSON, malformed JSON, and non-object JSON
 *   3. compareLocales:
 *      a. All keys and namespaces matching → success (exit 0, hasErrors: false)
 *      b. Missing keys in VI → detected
 *      c. Missing keys in EN → detected
 *      d. Deeply nested key mismatch → detected with dot notation path
 *      e. Missing entire namespace file in VI → detected
 *      f. Missing entire namespace file in EN → detected
 *      g. Malformed/invalid JSON syntax → detected and reported
 *   4. CLI execution via child_process testing process exit codes:
 *      a. Exit code 0 on full match
 *      b. Exit code 1 on missing key / missing file / invalid JSON
 *      c. Exit code 2 when a locale directory does not exist
 */

import { describe, it, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, writeFileSync, rmSync, existsSync } from "node:fs";
import { join } from "node:path";
import { execFileSync } from "node:child_process";
import {
  flattenKeys,
  readJsonFile,
  compareLocales,
} from "../check-i18n-keys.mjs";

const SCRIPT_PATH = join(import.meta.dirname, "..", "check-i18n-keys.mjs");
const TMP_DIR = join(import.meta.dirname, ".tmp-i18n-test");

function setupTmp() {
  if (existsSync(TMP_DIR)) {
    rmSync(TMP_DIR, { recursive: true, force: true });
  }
  mkdirSync(join(TMP_DIR, "locales", "en"), { recursive: true });
  mkdirSync(join(TMP_DIR, "locales", "vi"), { recursive: true });
}

function cleanupTmp() {
  if (existsSync(TMP_DIR)) {
    rmSync(TMP_DIR, { recursive: true, force: true });
  }
}

function writeJson(locale, namespace, data) {
  const file = join(TMP_DIR, "locales", locale, `${namespace}.json`);
  writeFileSync(file, typeof data === "string" ? data : JSON.stringify(data, null, 2), "utf-8");
}

function runCli(localesDir) {
  try {
    const stdout = execFileSync("node", [SCRIPT_PATH], {
      cwd: join(import.meta.dirname, "..", ".."),
      env: { ...process.env, LOCALES_DIR: localesDir },
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "pipe"],
    });
    return { exitCode: 0, stdout, stderr: "" };
  } catch (err) {
    return {
      exitCode: err.status ?? 1,
      stdout: err.stdout?.toString() || "",
      stderr: err.stderr?.toString() || "",
    };
  }
}

// ─────────────────────────────────────────────────────────────
describe("Unit: flattenKeys", () => {
  it("flattens a flat object", () => {
    const obj = { a: "1", b: "2" };
    assert.deepEqual(flattenKeys(obj).sort(), ["a", "b"]);
  });

  it("flattens deeply nested objects with dot notation", () => {
    const obj = {
      level1: {
        level2: {
          level3: "value",
          another: "value2",
        },
      },
      top: "topValue",
    };
    assert.deepEqual(flattenKeys(obj).sort(), [
      "level1.level2.another",
      "level1.level2.level3",
      "top",
    ]);
  });

  it("handles empty object", () => {
    assert.deepEqual(flattenKeys({}), []);
  });
});

// ─────────────────────────────────────────────────────────────
describe("Unit: readJsonFile", () => {
  beforeEach(setupTmp);
  afterEach(cleanupTmp);

  it("parses valid JSON correctly", async () => {
    writeJson("en", "test", { hello: "world" });
    const { data, error } = await readJsonFile(
      join(TMP_DIR, "locales", "en", "test.json")
    );
    assert.equal(error, null);
    assert.deepEqual(data, { hello: "world" });
  });

  it("returns error on malformed JSON", async () => {
    writeJson("en", "bad", "{ invalid json: 123");
    const { data, error } = await readJsonFile(
      join(TMP_DIR, "locales", "en", "bad.json")
    );
    assert.equal(data, null);
    assert.ok(error && error.length > 0);
  });

  it("returns error when root is not an object", async () => {
    writeJson("en", "array", ["not", "an", "object"]);
    const { data, error } = await readJsonFile(
      join(TMP_DIR, "locales", "en", "array.json")
    );
    assert.equal(data, null);
    assert.ok(error?.includes("Root JSON value must be an object"));
  });
});

// ─────────────────────────────────────────────────────────────
describe("Integration: compareLocales programmatic", () => {
  beforeEach(setupTmp);
  afterEach(cleanupTmp);

  it("passes when all files and keys match exactly", async () => {
    const content = { title: "Title", actions: { save: "Save" } };
    writeJson("en", "common", content);
    writeJson("vi", "common", content);

    const res = await compareLocales(join(TMP_DIR, "locales"));
    assert.equal(res.hasErrors, false);
    assert.equal(res.missingFilesVi.length, 0);
    assert.equal(res.missingFilesEn.length, 0);
    assert.equal(res.invalidJsonFiles.length, 0);
    assert.equal(res.missingInVi.size, 0);
    assert.equal(res.missingInEn.size, 0);
  });

  it("detects keys missing in VI", async () => {
    writeJson("en", "common", { title: "Title", desc: "Desc" });
    writeJson("vi", "common", { title: "Tiêu đề" });

    const res = await compareLocales(join(TMP_DIR, "locales"));
    assert.equal(res.hasErrors, true);
    assert.deepEqual(res.missingInVi.get("common.json"), ["desc"]);
  });

  it("detects keys missing in EN", async () => {
    writeJson("en", "common", { title: "Title" });
    writeJson("vi", "common", { title: "Tiêu đề", extra: "Thêm" });

    const res = await compareLocales(join(TMP_DIR, "locales"));
    assert.equal(res.hasErrors, true);
    assert.deepEqual(res.missingInEn.get("common.json"), ["extra"]);
  });

  it("detects deeply nested missing keys", async () => {
    writeJson("en", "auth", {
      inputs: {
        password: {
          validation: {
            required: "Required",
            min: "At least 6 chars",
          },
        },
      },
    });
    writeJson("vi", "auth", {
      inputs: {
        password: {
          validation: {
            required: "Bắt buộc",
          },
        },
      },
    });

    const res = await compareLocales(join(TMP_DIR, "locales"));
    assert.equal(res.hasErrors, true);
    assert.deepEqual(res.missingInVi.get("auth.json"), [
      "inputs.password.validation.min",
    ]);
  });

  it("detects missing namespace file in VI", async () => {
    writeJson("en", "common", { a: "1" });
    writeJson("en", "profile", { b: "2" });
    writeJson("vi", "common", { a: "1" });

    const res = await compareLocales(join(TMP_DIR, "locales"));
    assert.equal(res.hasErrors, true);
    assert.deepEqual(res.missingFilesVi, ["profile.json"]);
    assert.deepEqual(res.missingInVi.get("profile.json"), ["b"]);
  });

  it("detects missing namespace file in EN", async () => {
    writeJson("en", "common", { a: "1" });
    writeJson("vi", "common", { a: "1" });
    writeJson("vi", "admin", { c: "3" });

    const res = await compareLocales(join(TMP_DIR, "locales"));
    assert.equal(res.hasErrors, true);
    assert.deepEqual(res.missingFilesEn, ["admin.json"]);
    assert.deepEqual(res.missingInEn.get("admin.json"), ["c"]);
  });

  it("detects malformed JSON files", async () => {
    writeJson("en", "common", { a: "1" });
    writeJson("vi", "common", "{ bad json content");

    const res = await compareLocales(join(TMP_DIR, "locales"));
    assert.equal(res.hasErrors, true);
    assert.equal(res.invalidJsonFiles.length, 1);
    assert.equal(res.invalidJsonFiles[0].file, "common.json");
    assert.equal(res.invalidJsonFiles[0].locale, "vi");
  });
});

// ─────────────────────────────────────────────────────────────
describe("E2E: CLI process exit codes", () => {
  beforeEach(setupTmp);
  afterEach(cleanupTmp);

  it("exits with 0 when all keys match", () => {
    writeJson("en", "home", { title: "Home" });
    writeJson("vi", "home", { title: "Trang chủ" });

    const { exitCode, stdout } = runCli(join(TMP_DIR, "locales"));
    assert.equal(exitCode, 0);
    assert.ok(stdout.includes("All i18n keys and namespace files are consistent"));
  });

  it("exits with 1 when keys or files are missing", () => {
    writeJson("en", "home", { title: "Home", extra: "1" });
    writeJson("vi", "home", { title: "Trang chủ" });

    const { exitCode, stdout } = runCli(join(TMP_DIR, "locales"));
    assert.equal(exitCode, 1);
    assert.ok(stdout.includes("i18n key check failed"));
  });

  it("exits with 2 when VI directory does not exist", () => {
    rmSync(join(TMP_DIR, "locales", "vi"), { recursive: true, force: true });
    writeJson("en", "home", { title: "Home" });

    const { exitCode, stderr } = runCli(join(TMP_DIR, "locales"));
    assert.equal(exitCode, 2);
    assert.ok(stderr.includes("VI locale directory not found"));
  });
});
