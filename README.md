# Tend — Voice-First Family Care Circle for Alexa+

> **Amazon Developer Hackathon (Build, Ship, Shape)**  
> **Primary Track:** Alexa+  
> **Mini Challenges:** AWS Builder & Open Source

Tend is an ambient, voice-first family care circle living inside Alexa+, engineered specifically for families supporting an aging parent. Without requiring parents to adopt complex smartphone apps, Tend empowers elders to log routines ("Alexa, tell Tend I took my morning pills") and allows adult children to stay informed ("Alexa, how's Mom doing today?").

---

## Key Highlights

- **Alexa+ Native MCP Implementation:** Exposes 8 focused voice tools conforming to the official Model Context Protocol (spec `2025-11-25`).
- **Sub-500ms Latency ($p95 < 250\text{ ms}$):** Zero LLM calls in the synchronous voice request path. Spoken briefings are built deterministically from $\le 4$ DynamoDB queries.
- **Enterprise-Grade Auth & Security:** Full OAuth 2.1 authorization code flow with PKCE `S256`, RFC 9728 Protected Resource Metadata (PRM), and bare `401 Unauthorized` unauthenticated responses.
- **Interactive Multimodal Care Board:** Supports Alexa screen devices via the MCP App specification (`ui://tend/care-board`) styled according to [`DESIGN.md`](./DESIGN.md).
- **Asynchronous Intelligence (AWS Builder):** Scheduled EventBridge triggers an async Lambda digest worker utilizing Amazon Bedrock (Converse API) to summarize longitudinal trends into pre-cached insights.
- **Open Source Conformance Tool:** Includes `alexa-mcp-check` (`packages/conformance`), an Apache-2.0 automated test suite that validates any MCP server against Alexa+ protocol, auth, and voice linter standards.

---

## Codebase Architecture & MCP SDK References

As required by the Alexa+ hackathon criteria, the Model Context Protocol SDK is directly integrated:

- **Server Entrypoint:** [`apps/mcp-server/src/index.ts`](./apps/mcp-server/src/index.ts)
- **MCP Protocol & Tools:** [`apps/mcp-server/src/server.ts`](./apps/mcp-server/src/server.ts)
- **OAuth 2.1 & RFC 9728 Handlers:** [`apps/mcp-server/src/oauth.ts`](./apps/mcp-server/src/oauth.ts)
- **Core Domain & Repositories:** [`packages/core/src/index.ts`](./packages/core/src/index.ts)
- **Conformance Test Suite:** [`packages/conformance/src/cli.ts`](./packages/conformance/src/cli.ts)
- **AWS CDK Infrastructure:** [`infra/cdk/src/index.ts`](./infra/cdk/src/index.ts)
- **Care Console UI:** [`apps/console/src/index.ts`](./apps/console/src/index.ts)

---

## Monorepo Setup & Verification

Tend uses `pnpm` workspaces:

```bash
# Install dependencies across all packages
pnpm install

# Run complete typechecking across workspaces
pnpm typecheck

# Run linter
pnpm lint

# Run all unit and contract tests
pnpm test

# Run complete verification gate (typecheck + lint + test + conformance)
pnpm verify
```

---

## License

- Core Tend Application: Proprietary (see [`LICENSE`](./LICENSE))
- Alexa+ MCP Conformance Harness: Apache-2.0 (see [`packages/conformance/LICENSE`](./packages/conformance/LICENSE))
