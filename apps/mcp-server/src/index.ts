import { Hono } from "hono";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { TEND_VERSION, InMemoryTendRepository, type TendRepository } from "@tend/core";
import { createTendMcpServer } from "./server.js";

export interface AppServerOptions {
  repo?: TendRepository;
  defaultCircleId?: string;
}

export function createServerApp(options?: AppServerOptions) {
  const app = new Hono();
  const repo = options?.repo || new InMemoryTendRepository(true);
  const defaultCircleId = options?.defaultCircleId || "circle-tend-dev";

  // Structured Logging & Request ID Middleware
  app.use("*", async (c, next) => {
    const start = performance.now();
    const requestId =
      c.req.header("x-request-id") ||
      `req-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    c.header("x-request-id", requestId);

    await next();

    const durationMs = Math.round(performance.now() - start);
    console.log(
      JSON.stringify({
        level: "info",
        timestamp: new Date().toISOString(),
        requestId,
        method: c.req.method,
        path: c.req.path,
        status: c.res.status,
        durationMs,
      })
    );
  });

  // Health check endpoint
  app.get("/health", (c) => {
    return c.json({
      status: "ok",
      name: "tend-mcp-server",
      version: TEND_VERSION,
      timestamp: new Date().toISOString(),
    });
  });

  // Streamable HTTP /mcp endpoint
  // In stateless mode, a fresh transport instance is created per request
  app.all("/mcp", async (c) => {
    const mcpServer = createTendMcpServer({ repo, defaultCircleId });
    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless mode for Alexa+
      enableJsonResponse: true,
    });

    await mcpServer.connect(transport);
    return transport.handleRequest(c.req.raw);
  });

  return { app, repo };
}

export const { app } = createServerApp();
export default app;
