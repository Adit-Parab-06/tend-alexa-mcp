export interface ConformanceCheckResult {
  id: string;
  name: string;
  passed: boolean;
  message: string;
  durationMs?: number;
}

export interface ConformanceReport {
  targetUrl: string;
  timestamp: string;
  totalChecks: number;
  passedChecks: number;
  failedChecks: number;
  results: ConformanceCheckResult[];
}

export async function runAlexaMcpChecks(baseUrl: string, fetchFn: typeof fetch = fetch): Promise<ConformanceReport> {
  const normalizedUrl = baseUrl.replace(/\/+$/, "");
  const results: ConformanceCheckResult[] = [];

  // Check 1: Bare 401 Unauthenticated Response
  try {
    const t0 = performance.now();
    const res = await fetchFn(`${normalizedUrl}/mcp`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", id: 1, method: "tools/list" }),
    });
    const duration = Math.round(performance.now() - t0);
    const wwwAuth = res.headers.get("www-authenticate");

    if (res.status === 401 && !wwwAuth) {
      results.push({
        id: "AUTH-01",
        name: "Bare 401 on Unauthenticated Request",
        passed: true,
        message: "Endpoint returns 401 with NO WWW-Authenticate header.",
        durationMs: duration,
      });
    } else if (res.status !== 401) {
      results.push({
        id: "AUTH-01",
        name: "Bare 401 on Unauthenticated Request",
        passed: false,
        message: `Expected 401 Unauthorized but received ${res.status}.`,
        durationMs: duration,
      });
    } else {
      results.push({
        id: "AUTH-01",
        name: "Bare 401 on Unauthenticated Request",
        passed: false,
        message: `Forbidden WWW-Authenticate header was present: "${wwwAuth}".`,
        durationMs: duration,
      });
    }
  } catch (err: any) {
    results.push({
      id: "AUTH-01",
      name: "Bare 401 on Unauthenticated Request",
      passed: false,
      message: `Failed to connect: ${err.message}`,
    });
  }

  // Check 2: RFC 9728 Protected Resource Metadata (PRM)
  try {
    const t0 = performance.now();
    const res = await fetchFn(`${normalizedUrl}/.well-known/oauth-protected-resource`);
    const duration = Math.round(performance.now() - t0);

    if (res.status === 200) {
      const data = await res.json();
      if (data.resource && Array.isArray(data.authorization_servers) && data.authorization_servers.length > 0) {
        results.push({
          id: "DISC-01",
          name: "RFC 9728 Protected Resource Metadata",
          passed: true,
          message: `Valid PRM metadata found for resource ${data.resource}.`,
          durationMs: duration,
        });
      } else {
        results.push({
          id: "DISC-01",
          name: "RFC 9728 Protected Resource Metadata",
          passed: false,
          message: "Response missing resource or authorization_servers fields.",
          durationMs: duration,
        });
      }
    } else {
      results.push({
        id: "DISC-01",
        name: "RFC 9728 Protected Resource Metadata",
        passed: false,
        message: `HTTP ${res.status} returned from /.well-known/oauth-protected-resource`,
        durationMs: duration,
      });
    }
  } catch (err: any) {
    results.push({
      id: "DISC-01",
      name: "RFC 9728 Protected Resource Metadata",
      passed: false,
      message: `Failed to fetch PRM: ${err.message}`,
    });
  }

  // Check 3: Authorization Server Metadata (S256 PKCE)
  try {
    const t0 = performance.now();
    const res = await fetchFn(`${normalizedUrl}/.well-known/oauth-authorization-server`);
    const duration = Math.round(performance.now() - t0);

    if (res.status === 200) {
      const data = await res.json();
      const s256Supported = data.code_challenge_methods_supported?.includes("S256");
      const plainOmitted = !data.code_challenge_methods_supported?.includes("plain");

      if (s256Supported && plainOmitted) {
        results.push({
          id: "AUTH-02",
          name: "Authorization Server Metadata (S256 PKCE)",
          passed: true,
          message: "AS metadata advertises S256 PKCE exclusively.",
          durationMs: duration,
        });
      } else {
        results.push({
          id: "AUTH-02",
          name: "Authorization Server Metadata (S256 PKCE)",
          passed: false,
          message: `S256 missing or plain PKCE advertised: ${JSON.stringify(data.code_challenge_methods_supported)}`,
          durationMs: duration,
        });
      }
    } else {
      results.push({
        id: "AUTH-02",
        name: "Authorization Server Metadata (S256 PKCE)",
        passed: false,
        message: `HTTP ${res.status} returned from /.well-known/oauth-authorization-server`,
        durationMs: duration,
      });
    }
  } catch (err: any) {
    results.push({
      id: "AUTH-02",
      name: "Authorization Server Metadata (S256 PKCE)",
      passed: false,
      message: `Failed to fetch AS metadata: ${err.message}`,
    });
  }

  // Check 4: S256 PKCE Enforcement on Authorize
  try {
    const t0 = performance.now();
    const res = await fetchFn(
      `${normalizedUrl}/oauth/authorize?response_type=code&client_id=test&redirect_uri=https://example.com/cb&code_challenge=xyz&code_challenge_method=plain&resource=https://tend.care/mcp`
    );
    const duration = Math.round(performance.now() - t0);

    if (res.status === 400) {
      results.push({
        id: "AUTH-03",
        name: "Plain PKCE Rejection",
        passed: true,
        message: "Endpoint successfully rejected code_challenge_method=plain with 400 Bad Request.",
        durationMs: duration,
      });
    } else {
      results.push({
        id: "AUTH-03",
        name: "Plain PKCE Rejection",
        passed: false,
        message: `Expected 400 Bad Request for plain PKCE, received ${res.status}.`,
        durationMs: duration,
      });
    }
  } catch (err: any) {
    results.push({
      id: "AUTH-03",
      name: "Plain PKCE Rejection",
      passed: false,
      message: `Failed to test PKCE rejection: ${err.message}`,
    });
  }

  const passed = results.filter((r) => r.passed).length;
  return {
    targetUrl: normalizedUrl,
    timestamp: new Date().toISOString(),
    totalChecks: results.length,
    passedChecks: passed,
    failedChecks: results.length - passed,
    results,
  };
}
