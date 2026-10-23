#!/usr/bin/env node
import { runAlexaMcpChecks } from "./checker.js";

async function main() {
  const args = process.argv.slice(2);
  const targetUrl = args[0] || "http://localhost:3000";

  console.log(`\n======================================================`);
  console.log(`  alexa-mcp-check (v0.1.0) — Alexa+ Conformance Suite  `);
  console.log(`  Target: ${targetUrl}                                `);
  console.log(`======================================================\n`);

  const report = await runAlexaMcpChecks(targetUrl);

  for (const result of report.results) {
    const symbol = result.passed ? "✓ PASS" : "✗ FAIL";
    console.log(`[${symbol}] [${result.id}] ${result.name}`);
    console.log(`        → ${result.message} (${result.durationMs ?? 0}ms)\n`);
  }

  console.log(`------------------------------------------------------`);
  console.log(`Total: ${report.totalChecks} | Passed: ${report.passedChecks} | Failed: ${report.failedChecks}`);
  console.log(`------------------------------------------------------\n`);

  if (report.failedChecks > 0) {
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== "test") {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
