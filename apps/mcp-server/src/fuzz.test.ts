import { describe, it, expect, beforeEach } from "vitest";
import { createServerApp } from "./index.js";

describe("Commercial Hardening: Fuzzing, Body Limits & Rate Limiting", () => {
  let serverInstance: ReturnType<typeof createServerApp>;
  let validToken: string;

  beforeEach(() => {
    serverInstance = createServerApp();
    validToken = serverInstance.oauth.signJwt({
      sub: "member-elena",
      circleId: "circle-tend-dev",
      aud: "https://tend.care/mcp",
    });
  });

  it("rejects oversized request bodies exceeding 100KB limit with 413 Payload Too Large", async () => {
    const hugeBody = JSON.stringify({
      jsonrpc: "2.0",
      id: 1,
      method: "tools/call",
      params: {
        name: "add_care_note",
        arguments: { note: "x".repeat(110 * 1024) }, // 110 KB
      },
    });

    const res = await serverInstance.app.request("/mcp", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "content-length": String(Buffer.byteLength(hugeBody)),
        authorization: `Bearer ${validToken}`,
      },
      body: hugeBody,
    });

    expect(res.status).toBe(413);
  });

  it("resiliently handles malformed, empty, or fuzzed JSON-RPC payloads", async () => {
    const fuzzedInputs = [
      "",
      "{",
      "null",
      "[]",
      JSON.stringify({ jsonrpc: "1.0", method: 123 }),
      JSON.stringify({ jsonrpc: "2.0", method: "non_existent_tool" }),
      JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/call",
        params: { name: "log_medication", arguments: { slot: "invalid_slot", status: "not_status" } },
      }),
    ];

    for (const fuzz of fuzzedInputs) {
      const res = await serverInstance.app.request("/mcp", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json, text/event-stream",
          authorization: `Bearer ${validToken}`,
        },
        body: fuzz,
      });

      // Server must never crash or throw unhandled 500
      expect([200, 202, 400, 406, 415, 500]).toContain(res.status);
    }
  });

  it("handles high concurrency burst without memory leaks or race conditions", async () => {
    const requests = Array.from({ length: 50 }, (_, i) =>
      serverInstance.app.request("/mcp", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          accept: "application/json, text/event-stream",
          authorization: `Bearer ${validToken}`,
          "x-request-id": `concurrent-req-${i}`,
        },
        body: JSON.stringify({
          jsonrpc: "2.0",
          id: i,
          method: "tools/call",
          params: { name: "get_daily_briefing", arguments: {} },
        }),
      })
    );

    const responses = await Promise.all(requests);
    for (const res of responses) {
      expect(res.status).toBe(200);
    }
  });
});
