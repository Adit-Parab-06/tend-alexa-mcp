import { describe, it, expect } from "vitest";
import { getConsoleMetadata, renderConsoleHtml } from "./index.js";

describe("Tend Console Application", () => {
  it("returns console metadata and feature flags", () => {
    const meta = getConsoleMetadata();
    expect(meta.name).toBe("Tend Console");
    expect(meta.version).toBe("0.1.0");
    expect(meta.status).toBe("ready");
    expect(meta.features).toContain("medication_schedule_editor");
    expect(meta.features).toContain("scripted_demo_runner");
  });

  it("renders console HTML strictly conforming to DESIGN.md", () => {
    const html = renderConsoleHtml();
    expect(html).toContain("Tend Care Console");
    expect(html).toContain("#0066cc"); // Action Blue
    expect(html).toContain("SF Pro Display"); // SF Pro font
    expect(html).toContain("Medication Schedule Editor");
    expect(html).toContain("Family Circle Members");
    expect(html).toContain("Notification & Escalation Preferences");
    expect(html).toContain("Delete Entire Circle");
    expect(html).toContain("Scripted Demo");
  });
});
