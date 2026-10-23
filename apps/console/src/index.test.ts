import { describe, it, expect } from "vitest";
import { getConsoleMetadata } from "./index.js";

describe("Tend Console Skeleton", () => {
  it("returns console metadata", () => {
    const meta = getConsoleMetadata();
    expect(meta.name).toBe("Tend Console");
    expect(meta.version).toBe("0.1.0");
    expect(meta.status).toBe("ready");
  });
});
