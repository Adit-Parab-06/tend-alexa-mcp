import { describe, it, expect } from "vitest";
import { runAlexaMcpChecks } from "./checker.js";

describe("alexa-mcp-check Conformance Framework", () => {
  it("passes all checks against a compliant Alexa+ MCP server", async () => {
    // Compliant fetch mock
    const compliantFetch: typeof fetch = async (input, init) => {
      const urlStr = input.toString();
      const parsed = new URL(urlStr);

      if (parsed.pathname === "/mcp" && (!init?.headers || !("authorization" in (init.headers as any)))) {
        return new Response("Unauthorized", {
          status: 401,
          headers: {}, // NO WWW-Authenticate header
        });
      }

      if (parsed.pathname === "/.well-known/oauth-protected-resource") {
        return new Response(
          JSON.stringify({
            resource: "https://tend.care/mcp",
            authorization_servers: ["http://localhost:3000"],
            bearer_methods_supported: ["header"],
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        );
      }

      if (parsed.pathname === "/.well-known/oauth-authorization-server") {
        return new Response(
          JSON.stringify({
            issuer: "http://localhost:3000",
            code_challenge_methods_supported: ["S256"],
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        );
      }

      if (parsed.pathname === "/oauth/authorize" && parsed.searchParams.get("code_challenge_method") === "plain") {
        return new Response(
          JSON.stringify({ error: "invalid_request", error_description: "plain PKCE rejected" }),
          { status: 400, headers: { "content-type": "application/json" } }
        );
      }

      return new Response("Not Found", { status: 404 });
    };

    const report = await runAlexaMcpChecks("http://localhost:3000", compliantFetch);
    expect(report.totalChecks).toBe(4);
    expect(report.passedChecks).toBe(4);
    expect(report.failedChecks).toBe(0);
  });

  it("fails against a deliberately broken fixture violating Alexa+ rules", async () => {
    // Deliberately broken server returning WWW-Authenticate and advertising plain PKCE
    const brokenFetch: typeof fetch = async (input) => {
      const urlStr = input.toString();
      const parsed = new URL(urlStr);

      if (parsed.pathname === "/mcp") {
        return new Response("Unauthorized", {
          status: 401,
          headers: {
            "www-authenticate": 'Bearer realm="tend"', // VIOLATION! Alexa+ forbids this
          },
        });
      }

      if (parsed.pathname === "/.well-known/oauth-authorization-server") {
        return new Response(
          JSON.stringify({
            issuer: "http://localhost:3000",
            code_challenge_methods_supported: ["plain"], // VIOLATION! Must be S256 only
          }),
          { status: 200, headers: { "content-type": "application/json" } }
        );
      }

      return new Response("Not Found", { status: 404 });
    };

    const report = await runAlexaMcpChecks("http://localhost:3000", brokenFetch);
    expect(report.failedChecks).toBeGreaterThan(0);
    const bare401Check = report.results.find((r) => r.id === "AUTH-01");
    expect(bare401Check?.passed).toBe(false);
    expect(bare401Check?.message).toContain("Forbidden WWW-Authenticate header was present");
  });
});
