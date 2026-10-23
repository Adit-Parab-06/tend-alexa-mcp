#!/usr/bin/env node
import { createEmptyReport } from "./index.js";

async function main() {
  const args = process.argv.slice(2);
  const targetUrl = args[0] || "http://localhost:3000";

  console.log(`[alexa-mcp-check] Checking target: ${targetUrl}`);
  const report = createEmptyReport(targetUrl);
  console.log(`[alexa-mcp-check] Ready for conformance execution.`);
  return report;
}

if (process.env.NODE_ENV !== "test") {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
