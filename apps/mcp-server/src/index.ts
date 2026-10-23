import { Hono } from "hono";
import { WebStandardStreamableHTTPServerTransport } from "@modelcontextprotocol/sdk/server/webStandardStreamableHttp.js";
import { TEND_VERSION, InMemoryTendRepository, type TendRepository } from "@tend/core";
import { createTendMcpServer } from "./server.js";
import { OAuthServer, type OAuthConfig } from "./oauth.js";

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

export const { app } = createServerApp();
export default app;
