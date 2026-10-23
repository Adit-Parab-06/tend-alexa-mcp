import { describe, it, expect, beforeEach } from "vitest";
import crypto from "crypto";
import { createServerApp } from "./index.js";
import { OAuthServer } from "./oauth.js";

describe("OAuth 2.1, RFC 9728 Discovery & Negative Security Tests", () => {
  let serverInstance: ReturnType<typeof createServerApp>;
  const resource = "https://tend.care/mcp";

  beforeEach(() => {
    serverInstance = createServerApp({
      oauthConfig: {
        issuer: "http://localhost:3000",
        resourceIndicator: resource,
        jwtSecret: "test-secret-key-at-least-32-characters-long",
        defaultCircleId: "circle-tend-dev",
      },
    });
  });

  function generatePkce() {
    const verifier = OAuthServer.base64UrlEncode(crypto.randomBytes(32));
    const challenge = OAuthServer.sha256Base64Url(verifier);
    return { verifier, challenge };
  }

  // --- Discovery Metadata ---
  it("serves RFC 9728 Protected Resource Metadata (PRM)", async () => {
    const res = await serverInstance.app.request("/.well-known/oauth-protected-resource");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.resource).toBe(resource);
    expect(body.authorization_servers).toContain("http://localhost:3000");
    expect(body.bearer_methods_supported).toEqual(["header"]);
  });

  it("serves AS metadata advertising only S256 PKCE", async () => {
    const res = await serverInstance.app.request("/.well-known/oauth-authorization-server");
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.issuer).toBe("http://localhost:3000");
    expect(body.code_challenge_methods_supported).toEqual(["S256"]);
    expect(body.response_types_supported).toEqual(["code"]);
  });

  // --- Hard Alexa+ 401 Requirement ---
  it("returns bare 401 with NO WWW-Authenticate header when unauthenticated", async () => {
    const res = await serverInstance.app.request("/mcp", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
    });

    expect(res.status).toBe(401);
    expect(res.headers.get("www-authenticate")).toBeNull();
  });

  it("rejects query-string tokens with bare 401", async () => {
    const res = await serverInstance.app.request("/mcp?access_token=some-token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
    });

    expect(res.status).toBe(401);
    expect(res.headers.get("www-authenticate")).toBeNull();
  });

  // --- Negative Tests on Authorize ---
  it("rejects authorization when PKCE method is plain instead of S256", async () => {
    const { challenge } = generatePkce();
    const query = new URLSearchParams({
      response_type: "code",
      client_id: "alexa-client-tend",
      redirect_uri: "https://pitangui.amazon.com/api/skill/link/vendor",
      code_challenge: challenge,
      code_challenge_method: "plain", // Rejected!
      resource,
    });

    const res = await serverInstance.app.request(`/oauth/authorize?${query.toString()}`);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("invalid_request");
    expect(body.error_description).toContain("must be S256");
  });

  it("rejects authorization when resource parameter is missing or mismatched", async () => {
    const { challenge } = generatePkce();
    const query = new URLSearchParams({
      response_type: "code",
      client_id: "alexa-client-tend",
      redirect_uri: "https://pitangui.amazon.com/api/skill/link/vendor",
      code_challenge: challenge,
      code_challenge_method: "S256",
      resource: "https://evil.attacker.com/mcp", // Mismatched!
    });

    const res = await serverInstance.app.request(`/oauth/authorize?${query.toString()}`);
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error).toBe("invalid_target");
  });

  // --- Negative Tests on Token ---
  it("rejects token exchange when code_verifier is missing", async () => {
    const { challenge } = generatePkce();
    // Authorize first
    const authQuery = new URLSearchParams({
      response_type: "code",
      client_id: "alexa-client-tend",
      redirect_uri: "https://pitangui.amazon.com/api/skill/link/vendor",
      code_challenge: challenge,
      code_challenge_method: "S256",
      resource,
    });
    const authRes = await serverInstance.app.request(`/oauth/authorize?${authQuery.toString()}`);
    expect(authRes.status).toBe(302);
    const code = new URL(authRes.headers.get("location")!).searchParams.get("code")!;

    // Token call without verifier
    const tokenRes = await serverInstance.app.request("/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        resource,
      }),
    });
    expect(tokenRes.status).toBe(400);
    const body = await tokenRes.json();
    expect(body.error).toBe("invalid_grant");
  });

  it("rejects token exchange when code_verifier does not match challenge", async () => {
    const { challenge } = generatePkce();
    const authQuery = new URLSearchParams({
      response_type: "code",
      client_id: "alexa-client-tend",
      redirect_uri: "https://pitangui.amazon.com/api/skill/link/vendor",
      code_challenge: challenge,
      code_challenge_method: "S256",
      resource,
    });
    const authRes = await serverInstance.app.request(`/oauth/authorize?${authQuery.toString()}`);
    const code = new URL(authRes.headers.get("location")!).searchParams.get("code")!;

    const tokenRes = await serverInstance.app.request("/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        code_verifier: "wrong-verifier-123456789012345678901234567890",
        resource,
      }),
    });
    expect(tokenRes.status).toBe(400);
    const body = await tokenRes.json();
    expect(body.error).toBe("invalid_grant");
  });

  it("rejects token exchange when resource parameter does not match", async () => {
    const { challenge, verifier } = generatePkce();
    const authQuery = new URLSearchParams({
      response_type: "code",
      client_id: "alexa-client-tend",
      redirect_uri: "https://pitangui.amazon.com/api/skill/link/vendor",
      code_challenge: challenge,
      code_challenge_method: "S256",
      resource,
    });
    const authRes = await serverInstance.app.request(`/oauth/authorize?${authQuery.toString()}`);
    const code = new URL(authRes.headers.get("location")!).searchParams.get("code")!;

    const tokenRes = await serverInstance.app.request("/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        code_verifier: verifier,
        resource: "https://other.service.com", // Mismatched resource!
      }),
    });
    expect(tokenRes.status).toBe(400);
    const body = await tokenRes.json();
    expect(body.error).toBe("invalid_target");
  });

  it("prevents authorization code replay attacks", async () => {
    const { challenge, verifier } = generatePkce();
    const authQuery = new URLSearchParams({
      response_type: "code",
      client_id: "alexa-client-tend",
      redirect_uri: "https://pitangui.amazon.com/api/skill/link/vendor",
      code_challenge: challenge,
      code_challenge_method: "S256",
      resource,
    });
    const authRes = await serverInstance.app.request(`/oauth/authorize?${authQuery.toString()}`);
    const code = new URL(authRes.headers.get("location")!).searchParams.get("code")!;

    // First exchange succeeds
    const firstTokenRes = await serverInstance.app.request("/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        code_verifier: verifier,
        resource,
      }),
    });
    expect(firstTokenRes.status).toBe(200);

    // Replay with identical code must fail
    const replayRes = await serverInstance.app.request("/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        grant_type: "authorization_code",
        code,
        code_verifier: verifier,
        resource,
      }),
    });
    expect(replayRes.status).toBe(400);
    const body = await replayRes.json();
    expect(body.error).toBe("invalid_grant");
  });

  it("rejects expired or forged tokens on /mcp with bare 401", async () => {
    // Forged token
    const forgedToken = "eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjMifQ.forged_signature";
    const res = await serverInstance.app.request("/mcp", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${forgedToken}`,
      },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
    });

    expect(res.status).toBe(401);
    expect(res.headers.get("www-authenticate")).toBeNull();
  });

  // --- End-to-End Happy Path with Token Rotation ---
  it("completes full OAuth 2.1 flow, authenticates /mcp, and rotates refresh tokens", async () => {
    const { challenge, verifier } = generatePkce();

    // 1. Authorize
    const authQuery = new URLSearchParams({
      response_type: "code",
      client_id: "alexa-client-tend",
      redirect_uri: "https://pitangui.amazon.com/api/skill/link/vendor",
      code_challenge: challenge,
      code_challenge_method: "S256",
      resource,
      state: "xyz987",
    });
    const authRes = await serverInstance.app.request(`/oauth/authorize?${authQuery.toString()}`);
    expect(authRes.status).toBe(302);
    const redirectUrl = new URL(authRes.headers.get("location")!);
    expect(redirectUrl.searchParams.get("state")).toBe("xyz987");
    const code = redirectUrl.searchParams.get("code")!;

    // 2. Token Exchange
    const tokenRes = await serverInstance.app.request("/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        code_verifier: verifier,
        resource,
      }).toString(),
    });
    expect(tokenRes.status).toBe(200);
    const tokenData = await tokenRes.json();
    expect(tokenData.access_token).toBeDefined();
    expect(tokenData.refresh_token).toBeDefined();
    expect(tokenData.token_type).toBe("Bearer");

    // 3. Authenticated Call to /mcp
    const mcpRes = await serverInstance.app.request("/mcp", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        accept: "application/json, text/event-stream",
        authorization: `Bearer ${tokenData.access_token}`,
      },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "initialize",
        params: {
          protocolVersion: "2025-11-25",
          capabilities: {},
          clientInfo: { name: "alexa-client", version: "1.0.0" },
        },
      }),
    });
    expect(mcpRes.status).toBe(200);

    // 4. Refresh Token Grant with Rotation
    const refreshRes = await serverInstance.app.request("/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: tokenData.refresh_token,
        resource,
      }),
    });
    expect(refreshRes.status).toBe(200);
    const refreshData = await refreshRes.json();
    expect(refreshData.access_token).toBeDefined();
    expect(refreshData.refresh_token).toBeDefined();
    expect(refreshData.refresh_token).not.toBe(tokenData.refresh_token); // Rotated!

    // 5. Old refresh token must be invalidated
    const oldRefreshRes = await serverInstance.app.request("/oauth/token", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        grant_type: "refresh_token",
        refresh_token: tokenData.refresh_token, // Old token!
        resource,
      }),
    });
    expect(oldRefreshRes.status).toBe(400);
  });
});
