import { describe, it, expect } from "vitest";
import { createServerApp } from "./index.js";

describe("Tend MCP Server Skeleton", () => {
  it("responds to /health endpoint", async () => {
    const app = createServerApp();
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; version: string };
    expect(body.status).toBe("ok");
    expect(body.version).toBe("0.1.0");
  });
});
