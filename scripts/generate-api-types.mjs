import { spawnSync } from "node:child_process";

const schemaUrl = process.env.OPENAPI_URL ?? "http://localhost:3001/docs-json";
const outputPath = "src/services/api/generated/api-schema.d.ts";

const result = spawnSync(
  process.platform === "win32" ? "npx.cmd" : "npx",
  ["openapi-typescript", schemaUrl, "-o", outputPath],
  { stdio: "inherit" }
);

process.exit(result.status ?? 1);
