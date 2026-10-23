import { describe, it, expect } from "vitest";
import { createEmptyReport } from "./index.js";

describe("alexa-mcp-check Conformance Framework", () => {
  it("initializes an empty report structure", () => {
    const report = createEmptyReport("http://localhost:3000");
    expect(report.targetUrl).toBe("http://localhost:3000");
    expect(report.totalChecks).toBe(0);
    expect(report.passedChecks).toBe(0);
    expect(Array.isArray(report.results)).toBe(true);
  });
});
