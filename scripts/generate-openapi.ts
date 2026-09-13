import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

import { app } from "../server/app.js";

const outputPath = resolve("docs/openapi.json");
const response = await app.request("/api/openapi.json");

if (!response.ok) {
  throw new Error(`OpenAPI generation failed with HTTP ${response.status}`);
}

const document = await response.json();
const output = `${JSON.stringify(document, null, 2)}\n`;

if (process.argv.includes("--check")) {
  const current = await readFile(outputPath, "utf8").catch(() => "");
  if (current !== output) {
    console.error("docs/openapi.json is out of date. Run npm run openapi:generate.");
    process.exitCode = 1;
  } else {
    console.log("docs/openapi.json matches the live route definitions.");
  }
} else {
  await writeFile(outputPath, output, "utf8");
  console.log(`Generated ${outputPath}`);
}
