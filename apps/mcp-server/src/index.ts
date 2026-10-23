import { Hono } from "hono";
import { serve } from "@hono/node-server";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { TEND_VERSION, InMemoryTendRepository, type TendRepository } from "@tend/core";
import { createTendMcpServer } from "./server.js";
import { OAuthServer, type OAuthConfig } from "./oauth.js";
import { renderCareBoardHtml } from "./careBoardUi.js";

export interface AppServerOptions {
  repo?: TendRepository;
  defaultCircleId?: string;
  oauthConfig?: Partial<OAuthConfig>;
}

export type AppVariables = {
  circleId?: string;
  userId?: string;
  claims?: unknown;
};

export function createServerApp(options?: AppServerOptions) {
  const app = new Hono<{ Variables: AppVariables }>();
  const repo = options?.repo || new InMemoryTendRepository(true);
  const defaultCircleId = options?.defaultCircleId || "circle-tend-dev";

  const oauthConfig: OAuthConfig = {
    issuer: options?.oauthConfig?.issuer || process.env.BASE_URL || "http://localhost:3000",
    resourceIndicator:
      options?.oauthConfig?.resourceIndicator ||
      process.env.RESOURCE_INDICATOR ||
      "https://tend.care/mcp",
    jwtSecret:
      options?.oauthConfig?.jwtSecret ||
      process.env.JWT_SECRET ||
      "tend-development-signing-key-32-chars-minimum-security",
    defaultCircleId,
  };

  const oauth = new OAuthServer(oauthConfig);

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

  // --- Browser Preview for Care Board UI (DESIGN.md styled) ---
  app.get("/board", async (c) => {
    const html = await renderCareBoardHtml(defaultCircleId, repo);
    return c.html(html);
  });

  // --- Public Compliance Pages (Styled to DESIGN.md) ---
  app.get("/privacy", (c) => {
    return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><title>Tend — Privacy Policy</title>
  <style>
    body { font-family: "SF Pro Text", system-ui, sans-serif; background: #f5f5f7; color: #1d1d1f; padding: 40px 20px; line-height: 1.6; }
    .card { max-width: 700px; margin: 0 auto; background: #fff; border-radius: 18px; padding: 36px; border: 1px solid #e0e0e0; }
    h1 { font-family: "SF Pro Display", system-ui, sans-serif; font-size: 28px; margin-bottom: 16px; color: #0066cc; }
    h2 { font-size: 18px; margin: 20px 0 8px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Tend Privacy Policy</h1>
    <p>Last updated: October 2026</p>
    <h2>1. Data Collection & Purpose</h2>
    <p>Tend collects only information necessary for care circle coordination: elder first names, scheduled medication slots, routine check-ins, and shared family care tasks.</p>
    <h2>2. Data Protection</h2>
    <p>All data is bound cryptographically to your authenticated circle via OAuth 2.1 tokens. We do not sell or share health coordination records with third parties.</p>
    <h2>3. Deletion Rights</h2>
    <p>Care circles can request full record deletion at any time by contacting support or using the Tend Console.</p>
  </div>
</body></html>`);
  });

  app.get("/terms", (c) => {
    return c.html(`<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8"><title>Tend — Terms of Use</title>
  <style>
    body { font-family: "SF Pro Text", system-ui, sans-serif; background: #f5f5f7; color: #1d1d1f; padding: 40px 20px; line-height: 1.6; }
    .card { max-width: 700px; margin: 0 auto; background: #fff; border-radius: 18px; padding: 36px; border: 1px solid #e0e0e0; }
    h1 { font-family: "SF Pro Display", system-ui, sans-serif; font-size: 28px; margin-bottom: 16px; color: #0066cc; }
    h2 { font-size: 18px; margin: 20px 0 8px; }
    .alert { background: #fff3cd; border-left: 4px solid #ff9500; padding: 12px; margin: 16px 0; border-radius: 6px; }
  </style>
</head>
<body>
  <div class="card">
    <h1>Tend Terms of Use</h1>
    <div class="alert">
      <strong>Important Medical Disclaimer:</strong> Tend is an ambient care coordination and communication aid. Tend is NOT a medical device, does not provide medical diagnoses or dosing instructions, and MUST NOT be used for medical emergencies.
    </div>
    <h2>1. Use of Service</h2>
    <p>Tend facilitates communication and task coordination among authorized family members and caregivers.</p>
    <h2>2. User Responsibilities</h2>
    <p>Users must verify critical medication regimens with healthcare providers and independent prescription labels.</p>
  </div>
</body></html>`);
  });

  // --- RFC 9728 Protected Resource Metadata (PRM) ---
  app.get("/.well-known/oauth-protected-resource", (c) => {
    return c.json(oauth.getProtectedResourceMetadata());
  });

  // --- RFC 8414 Authorization Server Metadata ---
  app.get("/.well-known/oauth-authorization-server", (c) => {
    return c.json(oauth.getAuthorizationServerMetadata());
  });
  app.get("/.well-known/openid-configuration", (c) => {
    return c.json(oauth.getAuthorizationServerMetadata());
  });

  // --- OAuth 2.1 Authorize Endpoint ---
  app.get("/oauth/authorize", (c) => {
    const query = c.req.query();
    const result = oauth.handleAuthorize(query);
    if ("redirectUrl" in result && result.redirectUrl) {
      return c.redirect(result.redirectUrl, 302);
    }
    return c.json({ error: result.error, error_description: result.error_description }, (result.status || 400) as any);
  });

  // --- OAuth 2.1 Token Endpoint ---
  app.post("/oauth/token", async (c) => {
    let body: Record<string, string> = {};
    const contentType = c.req.header("content-type") || "";

    if (contentType.includes("application/x-www-form-urlencoded")) {
      const parsed = await c.req.parseBody();
      for (const [key, val] of Object.entries(parsed)) {
        if (typeof val === "string") body[key] = val;
      }
    } else {
      try {
        body = await c.req.json();
      } catch {
        body = {};
      }
    }

    const result = oauth.handleToken(body);
    if ("data" in result) {
      return c.json(result.data, 200);
    }
    return c.json({ error: result.error, error_description: result.error_description }, result.status as any);
  });

  // --- Security Hardening: Body Size Limits & Rate Limiting ---
  const MAX_BODY_BYTES = 100 * 1024; // 100 KB limit for JSON-RPC payloads
  const rateLimitMap = new Map<string, { count: number; resetTime: number }>();

  app.use("/mcp", async (c, next) => {
    const contentLength = Number(c.req.header("content-length") || 0);
    if (contentLength > MAX_BODY_BYTES) {
      return c.text("Payload Too Large: Exceeds 100KB limit", 413);
    }

    const ip = c.req.header("x-forwarded-for") || "local";
    const now = Date.now();
    const entry = rateLimitMap.get(ip) || { count: 0, resetTime: now + 10000 };
    if (now > entry.resetTime) {
      entry.count = 0;
      entry.resetTime = now + 10000;
    }
    entry.count++;
    rateLimitMap.set(ip, entry);

    if (entry.count > 500) {
      c.header("Retry-After", "5");
      return c.text("Too Many Requests: Rate limit exceeded", 429);
    }

    await next();
  });

  // --- Protected Streamable HTTP /mcp endpoint ---
  // Guarded by OAuth middleware: unauthenticated requests return bare 401 (NO WWW-Authenticate header)
  app.use("/mcp", oauth.createAuthMiddleware());

  app.all("/mcp", async (c) => {
    const authenticatedCircleId = (c.get("circleId") as string) || defaultCircleId;
    const mcpServer = createTendMcpServer({ repo, defaultCircleId: authenticatedCircleId });

    const transport = new WebStandardStreamableHTTPServerTransport({
      sessionIdGenerator: undefined, // stateless mode for Alexa+
      enableJsonResponse: true,
    });

    await mcpServer.connect(transport);
    return transport.handleRequest(c.req.raw);
  });

  return { app, repo, oauth };
}

export const { app, repo, oauth } = createServerApp();

const port = Number(process.env.PORT || 3000);
if (process.env.NODE_ENV !== "test") {
  console.log(`[Tend MCP Server] Listening at http://localhost:${port}`);
  console.log(`[Tend MCP Server] Live Care Board: http://localhost:${port}/board`);
  console.log(`[Tend MCP Server] Health: http://localhost:${port}/health`);
  console.log(`[Tend MCP Server] Streamable HTTP: http://localhost:${port}/mcp`);
  serve({ fetch: app.fetch, port });
}

export default app;

