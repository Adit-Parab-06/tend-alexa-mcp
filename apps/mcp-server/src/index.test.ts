import { describe, it, expect, beforeEach } from "vitest";
import { createServerApp } from "./index.js";
import { InMemoryTendRepository } from "@tend/core";

describe("Tend MCP Server Core & Tool Invocation", () => {
  let serverInstance: ReturnType<typeof createServerApp>;
  let validToken: string;

  beforeEach(() => {
    const repo = new InMemoryTendRepository(true);
    serverInstance = createServerApp({ repo, defaultCircleId: "circle-tend-dev" });
    validToken = serverInstance.oauth.signJwt({
      sub: "member-elena",
      circleId: "circle-tend-dev",
      aud: "https://tend.care/mcp",
    });
  });

  // Helper to send JSON-RPC requests over Streamable HTTP POST /mcp
  async function callMcpRpc(method: string, params: Record<string, unknown> = {}, id: number | string = 1) {
    const req = new Request("http://localhost:3000/mcp", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        authorization: `Bearer ${validToken}`,
        "x-request-id": `test-rpc-${id}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id,
        method,
        params,
      }),
    });

    const res = await serverInstance.app.request(req);
    expect(res.status).toBe(200);

    const text = await res.text();
    // In JSON response mode or SSE mode, parse the message
    if (text.startsWith("event: message") || text.includes("data: {")) {
      const dataLine = text.split("\n").find((l) => l.startsWith("data: "));
      if (dataLine) {
        return JSON.parse(dataLine.replace("data: ", ""));
      }
    }
    return JSON.parse(text);
  }

  it("responds to /health endpoint with metadata", async () => {
    const res = await serverInstance.app.request("/health");
    expect(res.status).toBe(200);
    const body = (await res.json()) as { status: string; version: string; name: string };
    expect(body.status).toBe("ok");
    expect(body.version).toBe("0.1.0");
    expect(body.name).toBe("tend-mcp-server");
  });

  it("handles protocol initialization and advertises capabilities", async () => {
    const rpc = await callMcpRpc("initialize", {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "alexa-plus-client", version: "1.0.0" },
    });

    expect(rpc.result).toBeDefined();
    expect(rpc.result.serverInfo.name).toBe("tend-mcp-server");
    expect(rpc.result.capabilities.tools).toBeDefined();
    expect(rpc.result.capabilities.resources).toBeDefined();
  });

  it("lists all 8 voice tools with single-sentence descriptions", async () => {
    // First initialize protocol
    await callMcpRpc("initialize", {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "alexa-plus-client", version: "1.0.0" },
    });

    const rpc = await callMcpRpc("tools/list", {});
    const tools = rpc.result.tools as Array<{ name: string; description: string; inputSchema: unknown }>;

    expect(tools.length).toBe(8);

    const toolNames = tools.map((t) => t.name).sort();
    expect(toolNames).toEqual([
      "add_care_note",
      "claim_care_task",
      "get_daily_briefing",
      "list_appointments",
      "list_care_tasks",
      "log_medication",
      "notify_circle",
      "record_check_in",
    ]);

    // Verify all tool descriptions are single sentences
    for (const tool of tools) {
      expect(tool.description).toBeTruthy();
      expect(tool.description.split(".").filter(Boolean).length).toBeLessThanOrEqual(2);
    }
  });

  it("executes log_medication and record_check_in", async () => {
    await callMcpRpc("initialize", {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "alexa-plus-client", version: "1.0.0" },
    });

    // 1. log_medication
    const medRpc = await callMcpRpc("tools/call", {
      name: "log_medication",
      arguments: { slot: "morning", status: "taken", notes: "with breakfast" },
    });
    expect(medRpc.result.content[0].text).toContain("morning medication as taken");

    // 2. record_check_in
    const checkInRpc = await callMcpRpc("tools/call", {
      name: "record_check_in",
      arguments: { status: "fine", note: "feeling refreshed" },
    });
    expect(checkInRpc.result.content[0].text).toContain("doing fine today");
  });

  it("executes get_daily_briefing with spoken output under 280 chars", async () => {
    await callMcpRpc("initialize", {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "alexa-plus-client", version: "1.0.0" },
    });

    const briefingRpc = await callMcpRpc("tools/call", {
      name: "get_daily_briefing",
      arguments: {},
    });

    const payload = JSON.parse(briefingRpc.result.content[0].text);
    expect(payload.speech).toBeDefined();
    expect(payload.speech.length).toBeLessThanOrEqual(280);
    expect(payload.speech).toContain("Margaret's update");
    expect(payload.data.circleId).toBe("circle-tend-dev");
  });

  it("executes task coordination: list_care_tasks and claim_care_task", async () => {
    await callMcpRpc("initialize", {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "alexa-plus-client", version: "1.0.0" },
    });

    // List tasks
    const listRpc = await callMcpRpc("tools/call", {
      name: "list_care_tasks",
      arguments: { filter: "open" },
    });
    expect(listRpc.result.content[0].text).toContain("Pick up blood pressure");

    // Claim task
    const claimRpc = await callMcpRpc("tools/call", {
      name: "claim_care_task",
      arguments: { taskId: "task-401" },
    });
    expect(claimRpc.result.content[0].text).toContain("claimed the task");
  });

  it("handles notify_circle confirmation safeguard", async () => {
    await callMcpRpc("initialize", {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "alexa-plus-client", version: "1.0.0" },
    });

    // Unconfirmed call -> asks for confirmation
    const unconfirmed = await callMcpRpc("tools/call", {
      name: "notify_circle",
      arguments: { message: "Mom has not responded to calls", confirm: false },
    });
    const unconfirmedData = JSON.parse(unconfirmed.result.content[0].text);
    expect(unconfirmedData.speech).toContain("requires confirmation");

    // Confirmed call -> dispatches alert
    const confirmed = await callMcpRpc("tools/call", {
      name: "notify_circle",
      arguments: { message: "Mom has not responded to calls", confirm: true },
    });
    const confirmedData = JSON.parse(confirmed.result.content[0].text);
    expect(confirmedData.speech).toContain("Urgent alert dispatched");
  });

  it("serves ui://tend/care-board HTML resource conforming to DESIGN.md", async () => {
    await callMcpRpc("initialize", {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "alexa-plus-client", version: "1.0.0" },
    });

    const resourceRpc = await callMcpRpc("resources/read", {
      uri: "ui://tend/care-board",
    });

    const contents = resourceRpc.result.contents[0];
    expect(contents.mimeType).toBe("text/html");
    expect(contents.text).toContain("Tend Care Board");
    expect(contents.text).toContain("#0066cc"); // Action Blue
    expect(contents.text).toContain("SF Pro Display"); // SF Pro font
    expect(contents.text).toContain("Medication Adherence");
  });

  // --- Phase 4 Latency Gate Test: p95 < 250ms across 100 calls ---
  it("passes Phase 4 gate: p95 latency under 250ms across 100 tool calls", async () => {
    await callMcpRpc("initialize", {
      protocolVersion: "2025-11-25",
      capabilities: {},
      clientInfo: { name: "alexa-plus-client", version: "1.0.0" },
    });

    const latencies: number[] = [];
    const iterations = 100;

    for (let i = 0; i < iterations; i++) {
      const t0 = performance.now();
      await callMcpRpc(
        "tools/call",
        {
          name: "get_daily_briefing",
          arguments: {},
        },
        i + 100
      );
      const elapsed = performance.now() - t0;
      latencies.push(elapsed);
    }

    latencies.sort((a, b) => a - b);
    const p50 = latencies[Math.floor(iterations * 0.5)];
    const p95 = latencies[Math.floor(iterations * 0.95)];
    const max = latencies[iterations - 1];

    console.log(`[Latency Gate] p50: ${p50.toFixed(2)}ms, p95: ${p95.toFixed(2)}ms, max: ${max.toFixed(2)}ms`);

    expect(p95).toBeLessThan(250); // Hard Alexa+ requirement: p95 < 250ms locally
  });
});
