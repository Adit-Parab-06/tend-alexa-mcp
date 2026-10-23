import crypto from "crypto";
import type { Context, MiddlewareHandler } from "hono";

export interface OAuthConfig {
  issuer: string;
  resourceIndicator: string;
  jwtSecret: string;
  defaultCircleId: string;
}

export interface AuthCodeRecord {
  code: string;
  clientId: string;
  redirectUri: string;
  codeChallenge: string;
  codeChallengeMethod: string;
  resource: string;
  circleId: string;
  memberId: string;
  expiresAt: number;
  used: boolean;
}

export interface RefreshTokenRecord {
  token: string;
  clientId: string;
  circleId: string;
  memberId: string;
  resource: string;
  expiresAt: number;
  used: boolean;
}

export interface TokenClaims {
  sub: string;
  circleId: string;
  aud: string;
  iss: string;
  iat: number;
  exp: number;
}

export class OAuthServer {
  private codes = new Map<string, AuthCodeRecord>();
  private refreshTokens = new Map<string, RefreshTokenRecord>();

  constructor(public readonly config: OAuthConfig) {}

  // --- Base64URL Helpers ---
  static base64UrlEncode(buffer: Buffer): string {
    return buffer
      .toString("base64")
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");
  }

  static base64UrlDecode(str: string): Buffer {
    let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    return Buffer.from(base64, "base64");
  }

  static sha256Base64Url(input: string): string {
    const hash = crypto.createHash("sha256").update(input).digest();
    return OAuthServer.base64UrlEncode(hash);
  }

  // --- JWT Signing & Verification ---
  signJwt(claims: Omit<TokenClaims, "iat" | "exp" | "iss">, expiresInSeconds = 3600): string {
    const now = Math.floor(Date.now() / 1000);
    const fullClaims: TokenClaims = {
      ...claims,
      iss: this.config.issuer,
      iat: now,
      exp: now + expiresInSeconds,
    };

    const header = { alg: "HS256", typ: "JWT" };
    const encodedHeader = OAuthServer.base64UrlEncode(Buffer.from(JSON.stringify(header)));
    const encodedPayload = OAuthServer.base64UrlEncode(Buffer.from(JSON.stringify(fullClaims)));

    const signature = crypto
      .createHmac("sha256", this.config.jwtSecret)
      .update(`${encodedHeader}.${encodedPayload}`)
      .digest();
    const encodedSignature = OAuthServer.base64UrlEncode(signature);

    return `${encodedHeader}.${encodedPayload}.${encodedSignature}`;
  }

  verifyJwt(token: string): TokenClaims | null {
    try {
      const parts = token.split(".");
      if (parts.length !== 3) return null;

      const [encodedHeader, encodedPayload, encodedSignature] = parts;
      const expectedSignature = crypto
        .createHmac("sha256", this.config.jwtSecret)
        .update(`${encodedHeader}.${encodedPayload}`)
        .digest();
      const expectedEncoded = OAuthServer.base64UrlEncode(expectedSignature);

      if (encodedSignature !== expectedEncoded) return null;

      const payloadJson = OAuthServer.base64UrlDecode(encodedPayload).toString("utf-8");
      const claims = JSON.parse(payloadJson) as TokenClaims;

      const now = Math.floor(Date.now() / 1000);
      if (claims.exp && claims.exp < now) return null; // expired
      if (claims.iss && claims.iss !== this.config.issuer) return null; // issuer mismatch
      if (claims.aud && claims.aud !== this.config.resourceIndicator) return null; // resource mismatch

      return claims;
    } catch {
      return null;
    }
  }

  // --- RFC 9728 Protected Resource Metadata ---
  getProtectedResourceMetadata() {
    return {
      resource: this.config.resourceIndicator,
      authorization_servers: [this.config.issuer],
      scopes_supported: ["tend:read", "tend:write"],
      bearer_methods_supported: ["header"],
      resource_documentation: `${this.config.issuer}/docs`,
    };
  }

  // --- RFC 8414 Authorization Server Metadata ---
  getAuthorizationServerMetadata() {
    return {
      issuer: this.config.issuer,
      authorization_endpoint: `${this.config.issuer}/oauth/authorize`,
      token_endpoint: `${this.config.issuer}/oauth/token`,
      response_types_supported: ["code"],
      grant_types_supported: ["authorization_code", "refresh_token"],
      code_challenge_methods_supported: ["S256"], // Only S256 supported
      token_endpoint_auth_methods_supported: ["none", "client_secret_post"],
      scopes_supported: ["tend:read", "tend:write"],
    };
  }

  // --- Authorization Endpoint Handler ---
  handleAuthorize(query: Record<string, string>) {
    const {
      response_type,
      client_id,
      redirect_uri,
      code_challenge,
      code_challenge_method,
      resource,
      state,
      circleId = this.config.defaultCircleId,
      memberId = "member-elena",
    } = query;

    if (response_type !== "code") {
      return { error: "unsupported_response_type", status: 400 };
    }

    if (!code_challenge) {
      return { error: "invalid_request", error_description: "Missing code_challenge", status: 400 };
    }

    if (code_challenge_method !== "S256") {
      return {
        error: "invalid_request",
        error_description: "code_challenge_method must be S256. Plain PKCE is not permitted.",
        status: 400,
      };
    }

    if (!resource || resource !== this.config.resourceIndicator) {
      return {
        error: "invalid_target",
        error_description: `resource parameter must match ${this.config.resourceIndicator}`,
        status: 400,
      };
    }

    if (!redirect_uri) {
      return { error: "invalid_request", error_description: "Missing redirect_uri", status: 400 };
    }

    const code = `auth_${crypto.randomBytes(24).toString("hex")}`;
    this.codes.set(code, {
      code,
      clientId: client_id || "alexa-client-tend",
      redirectUri: redirect_uri,
      codeChallenge: code_challenge,
      codeChallengeMethod: code_challenge_method,
      resource,
      circleId,
      memberId,
      expiresAt: Date.now() + 5 * 60 * 1000, // 5 min expiry
      used: false,
    });

    const redirectUrl = new URL(redirect_uri);
    redirectUrl.searchParams.set("code", code);
    if (state) {
      redirectUrl.searchParams.set("state", state);
    }

    return { redirectUrl: redirectUrl.toString(), status: 302 };
  }

  // --- Token Endpoint Handler ---
  handleToken(body: Record<string, string>) {
    const { grant_type } = body;

    if (grant_type === "authorization_code") {
      const { code, code_verifier, resource, redirect_uri } = body;

      if (!code) {
        return { error: "invalid_request", error_description: "Missing code parameter", status: 400 };
      }

      const authRecord = this.codes.get(code);
      if (!authRecord) {
        return { error: "invalid_grant", error_description: "Invalid or expired authorization code", status: 400 };
      }

      // Replay attack protection: If code is already used, invalidate and reject
      if (authRecord.used) {
        this.codes.delete(code);
        return { error: "invalid_grant", error_description: "Authorization code has already been used", status: 400 };
      }

      if (Date.now() > authRecord.expiresAt) {
        this.codes.delete(code);
        return { error: "invalid_grant", error_description: "Authorization code expired", status: 400 };
      }

      if (!code_verifier) {
        return { error: "invalid_grant", error_description: "Missing code_verifier", status: 400 };
      }

      // Verify PKCE S256
      const calculatedChallenge = OAuthServer.sha256Base64Url(code_verifier);
      if (calculatedChallenge !== authRecord.codeChallenge) {
        return { error: "invalid_grant", error_description: "PKCE verification failed", status: 400 };
      }

      // RFC 8707 Resource validation
      if (!resource || resource !== authRecord.resource) {
        return {
          error: "invalid_target",
          error_description: `resource parameter must match authorized resource ${authRecord.resource}`,
          status: 400,
        };
      }

      if (redirect_uri && redirect_uri !== authRecord.redirectUri) {
        return { error: "invalid_grant", error_description: "redirect_uri mismatch", status: 400 };
      }

      // Mark code as used immediately
      authRecord.used = true;

      // Issue tokens
      const accessToken = this.signJwt({
        sub: authRecord.memberId,
        circleId: authRecord.circleId,
        aud: authRecord.resource,
      });

      const refreshToken = `ref_${crypto.randomBytes(32).toString("hex")}`;
      this.refreshTokens.set(refreshToken, {
        token: refreshToken,
        clientId: authRecord.clientId,
        circleId: authRecord.circleId,
        memberId: authRecord.memberId,
        resource: authRecord.resource,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000, // 30 days
        used: false,
      });

      return {
        status: 200,
        data: {
          access_token: accessToken,
          token_type: "Bearer",
          expires_in: 3600,
          refresh_token: refreshToken,
          scope: "tend:read tend:write",
          circleId: authRecord.circleId,
        },
      };
    } else if (grant_type === "refresh_token") {
      const { refresh_token, resource } = body;

      if (!refresh_token) {
        return { error: "invalid_request", error_description: "Missing refresh_token", status: 400 };
      }

      const record = this.refreshTokens.get(refresh_token);
      if (!record || record.used || Date.now() > record.expiresAt) {
        return { error: "invalid_grant", error_description: "Invalid or expired refresh token", status: 400 };
      }

      if (resource && resource !== record.resource) {
        return { error: "invalid_target", error_description: "resource mismatch on refresh", status: 400 };
      }

      // Refresh token rotation: Invalidate old refresh token
      record.used = true;
      this.refreshTokens.delete(refresh_token);

      const newAccessToken = this.signJwt({
        sub: record.memberId,
        circleId: record.circleId,
        aud: record.resource,
      });

      const newRefreshToken = `ref_${crypto.randomBytes(32).toString("hex")}`;
      this.refreshTokens.set(newRefreshToken, {
        token: newRefreshToken,
        clientId: record.clientId,
        circleId: record.circleId,
        memberId: record.memberId,
        resource: record.resource,
        expiresAt: Date.now() + 30 * 24 * 60 * 60 * 1000,
        used: false,
      });

      return {
        status: 200,
        data: {
          access_token: newAccessToken,
          token_type: "Bearer",
          expires_in: 3600,
          refresh_token: newRefreshToken,
          scope: "tend:read tend:write",
          circleId: record.circleId,
        },
      };
    }

    return { error: "unsupported_grant_type", status: 400 };
  }

  // --- Auth Middleware for Protected Routes (e.g. /mcp) ---
  // Alexa+ Hard Requirement: Unauthenticated => 401 with NO WWW-Authenticate header
  // Bearer in header only; query string tokens must be rejected.
  createAuthMiddleware(): MiddlewareHandler {
    return async (c: Context, next) => {
      // Reject query-string tokens
      const queryToken = c.req.query("access_token") || c.req.query("token");
      if (queryToken) {
        // Explicitly return bare 401 with NO WWW-Authenticate header
        return c.text("Unauthorized: Query string tokens are prohibited.", 401);
      }

      const authHeader = c.req.header("authorization");
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        // Bare 401 unauthenticated
        return c.text("Unauthorized", 401);
      }

      const token = authHeader.slice(7).trim();
      const claims = this.verifyJwt(token);
      if (!claims) {
        // Invalid or expired token: bare 401
        return c.text("Unauthorized: Invalid token", 401);
      }

      // Attach verified claims to request context
      c.set("claims", claims);
      c.set("circleId", claims.circleId);
      c.set("userId", claims.sub);

      await next();
    };
  }
}
