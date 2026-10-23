# AGENTS.md — Tend (Alexa+ MCP add-on)

## Mission
Voice-first family care coordination, exposed as an MCP server for Alexa+.

## Stack
TypeScript/Node 22, pnpm workspaces (apps/mcp-server, apps/console, packages/core, packages/conformance, infra/cdk), Hono, official @modelcontextprotocol/sdk (version supporting spec 2025-11-25), Zod, Vitest, AWS CDK v2, DynamoDB single-table, Bedrock.

## Commands
`pnpm typecheck` | `pnpm lint` | `pnpm test` | `pnpm test:int` | `pnpm verify` (all + conformance + latency)

## Alexa+ Hard Requirements
- Streamable HTTP, stateless. Unauthenticated => 401 with NO `WWW-Authenticate` header.
- RFC 9728 PRM; AS metadata at `/.well-known/oauth-authorization-server` with `S256`.
- OAuth 2.1 code + PKCE S256; `resource` on authorize AND token; Bearer in header only.
- p95 < 250 ms locally. No LLM calls or network fan-out in the request path.

## Tool Design
<= 8 tools, verb_noun names, one-sentence descriptions. Every tool returns `{ speech (<=280 chars, plain words, no markdown), data }`. Risky actions need `confirm=true`.

## Safety
Never give medical advice or dosing guidance. Record and coordinate only. State clearly that the service is not for medical emergencies.

## Security
No secrets in repo (`.env.example` only). Zod-validate all input. Authorize every tool call against `circleId` from the token. Audit-log every write.

## UI Guidelines
Whenever writing any UI (MCP App Care Board `ui://tend/care-board`, `apps/console`, or web views), strictly use `DESIGN.md` at the repo root for reference (Apple design language, colors, typography, surfaces).

## Process
Plan artifact first. Small commits. Tests ship with code. Do not refactor unrelated files.
When docs or tools misbehave, append to `FRICTION.md` (task, steps, expected, actual, severity, workaround, suggestion).
