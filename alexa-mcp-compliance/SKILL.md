---
name: alexa-mcp-compliance
description: Checklist and compliance reference for Alexa+ MCP add-ons, covering protocol requirements, OAuth 2.1, voice tool design, MCP Apps UI, and certification standards.
---

# Alexa+ MCP Compliance & Certification Guide

This skill provides an authoritative checklist and compliance reference for building and verifying an Alexa+ Model Context Protocol (MCP) add-on.

## Official References & Source URLs
- **Alexa+ MCP Toolkit Overview:** https://developer.amazon.com/docs/alexaplus/add-ons/mcp-toolkit-overview.html
- **Alexa+ MCP QuickStart:** https://developer.amazon.com/docs/alexaplus/add-ons/mcp-toolkit-quickstart.html
- **Alexa+ Add-on Certification Requirements:** https://developer.amazon.com/docs/alexaplus/add-ons/certification-requirements.html
- **Alexa+ Add-on Design Guide:** https://developer.amazon.com/docs/alexaplus/add-ons/design-guide.html
- **Model Context Protocol Spec (2025-11-25):** https://spec.modelcontextprotocol.io/
- **RFC 9728 (OAuth 2.0 Protected Resource Metadata):** https://datatracker.ietf.org/doc/rfc9728/

---

## 1. Technical Protocol & Transport Checklist

- [ ] **Streamable HTTP Transport:** MCP server must use Streamable HTTP (stateless, HTTP POST for RPC, no deprecated standalone SSE-only transport).
- [ ] **Version Negotiation:** Supports MCP specification version `2025-11-25`.
- [ ] **Latency Budget:** Round-trip response must complete in `< 500 ms` (Local target: $p95 < 250\text{ ms}$). No blocking LLM calls or outbound network fan-outs during request processing.
- [ ] **Remote Accessibility:** Publicly accessible HTTPS endpoint (or TLS-terminating tunnel such as `cloudflared` for local testing).

---

## 2. Authentication & Authorization Checklist

- [ ] **Bare 401 Response:** Unauthenticated requests to `/mcp` or protected endpoints must return HTTP 401 with **NO** `WWW-Authenticate` response header.
- [ ] **Protected Resource Metadata (RFC 9728):** Published at `/.well-known/oauth-protected-resource` indicating authorization server and resource identifier.
- [ ] **Authorization Server Metadata:** Published at `/.well-known/oauth-authorization-server` declaring supported response types, grant types, and PKCE challenge methods (`code_challenge_methods_supported: ["S256"]`).
- [ ] **OAuth 2.1 Authorization Code Flow:**
  - Requires PKCE with `code_challenge_method=S256`. Plain PKCE must be rejected.
  - Requires the `resource` parameter on both `/oauth/authorize` and `/oauth/token`.
- [ ] **Bearer Token Handling:**
  - Bearer tokens accepted in the `Authorization: Bearer <token>` HTTP header only.
  - Query parameter tokens must be explicitly rejected.
  - Token claims must bind the session to the authenticated circle and identity.

---

## 3. Voice-First Tool Design Checklist

- [ ] **Tool Count:** At most 8 tools per add-on to ensure clean model context and avoid selection ambiguity.
- [ ] **Naming:** Clean `verb_noun` identifiers (e.g. `log_medication`, `get_daily_briefing`, `claim_care_task`).
- [ ] **Descriptions:** Exactly one concise sentence per tool, optimized for LLM dispatch.
- [ ] **Payload Structure:** Each tool response must include:
  - `speech`: Short spoken string ($\le 280$ characters, natural spoken vocabulary, no markdown or URLs).
  - `data`: Structured JSON object containing full machine-readable detail.
- [ ] **Explicit Confirmation:** Irreversible or urgent side-effects (e.g., notifying emergency contacts or broad escalations) require an explicit confirmation step (`confirm=true`).

---

## 4. MCP App UI & Multimodal Checklist

- [ ] **MCP App Resource:** UI declared as an MCP App resource (e.g. `ui://tend/care-board`).
- [ ] **Design Language Adherence:** Strictly follow `DESIGN.md` (Apple-inspired palette, typography hierarchy, responsive touch targets).
- [ ] **Device Adaptability:** Responsive layout for Echo Show screen dimensions (fullscreen vs. inline cards).
- [ ] **Accessibility:** Support for Alexa screen magnification, captions, high contrast, and screen readers.

---

## 5. Certification & Policy Checklist

- [ ] **End-to-End Task Completion:** Users must complete their intended workflow entirely through voice or on-screen Alexa+ interaction without external redirects.
- [ ] **Safety Boundaries:**
  - No medical diagnosis, prescribing, or clinical advice.
  - Explicit disclaimer that the tool is for care circle coordination and not for medical emergencies.
- [ ] **Privacy & Data Minimization:** Collect only necessary health/schedule data. Token-scoped isolation for all records.
- [ ] **Metadata & Assets:**
  - Add-on name $\le 30$ characters.
  - Short description $\le 123$ characters.
  - Full description $\le 4000$ characters.
  - 6 icon sizes (72, 64, 88, 126, 180, 241 px) and 600x900 carousel image.
  - Valid Privacy Policy and Terms of Service URLs.
