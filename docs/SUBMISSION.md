# Devpost Submission Package & Demo Script (`docs/SUBMISSION.md`)

> **Amazon Developer Hackathon (Build, Ship, Shape)**  
> **Project Title:** Tend — Voice-First Family Care Circle for Alexa+  
> **Primary Track:** Alexa+  
> **Mini Challenges:** AWS Builder & Open Source

---

## 1. Project Information & Description

### Short Description (Tagline)
Tend is an ambient, voice-first family care circle living inside Alexa+, coordinating daily medication logging, routine check-ins, shared sibling tasks, and deterministic spoken briefings without complex phone apps.

### Project Description
Caring for an aging parent across dispersed family members presents a painful daily dilemma: adult children worry silently or call repeatedly to check on medications and appointments, while aging parents feel micromanaged by constant check-ins and struggle with complex smartphone apps.

**Tend** solves this problem by bringing the family care circle directly into Alexa+:
- **For Aging Parents (Margaret, 81):** No phone to unlock or buttons to type. Margaret speaks naturally to her Echo Show in the kitchen: *"Alexa, tell Tend I took my morning pills"* or *"Alexa, tell Tend I'm fine."*
- **For Family Caregivers (Elena & David):** Elena asks while getting ready for work: *"Alexa, how's Mom doing today?"* and receives an immediate, empathetic spoken briefing summarizing meds, check-ins, pending care tasks, and appointments.
- **For Collaborative Sibling Care:** Open care tasks (like picking up a prescription refill) are synchronized across the circle so siblings can claim them hands-free, preventing duplicate effort.
- **For Urgent Escalations:** If a caregiver needs to notify the circle, an explicit confirmation safeguard (*"Say confirm to dispatch an urgent alert"*) prevents accidental SMS alarms.
- **On Screen Devices:** Echo Show and Alexa+ devices render a real-time Care Board via the official MCP App specification (`ui://tend/care-board`), styled strictly according to Apple design language (`DESIGN.md`).

---

## 2. Tracks & Mini Challenges Entered

1. **Primary Track: Alexa+**
   - Built with the official Model Context Protocol (MCP) SDK (spec `2025-11-25`).
   - Implements 8 voice-first tools with strict single-sentence descriptions and plain spoken strings ($\le 280$ characters).
   - Complies fully with OAuth 2.1 PKCE `S256`, RFC 9728 Protected Resource Metadata, and the **bare 401 unauthenticated response** requirement.
   - Operates well within the Alexa+ 500ms budget, achieving a local $p95$ latency of **$2.46\text{ ms}$**.
2. **Mini Challenge: AWS Builder**
   - Architectural implementation in AWS CDK v2 ([`infra/cdk/src/index.ts`](../infra/cdk/src/index.ts)) and comprehensive guide in [`docs/AWS_BUILDER.md`](./AWS_BUILDER.md).
   - DynamoDB Single-Table with KMS encryption and PITR backups.
   - AWS Fargate behind ALB eliminating cold starts.
   - Amazon Bedrock (Converse API) running asynchronously via EventBridge Scheduler $\to$ Lambda to write longitudinal care insights into DynamoDB without blocking real-time voice queries.
   - Amazon SNS for SMS escalation notifications.
3. **Mini Challenge: Open Source**
   - **Tool Name:** `alexa-mcp-check` ([`packages/conformance`](../packages/conformance))
   - **License:** Apache License 2.0 ([`packages/conformance/LICENSE`](../packages/conformance/LICENSE))
   - **Purpose:** A standalone, vendor-neutral CLI tool (`npx alexa-mcp-check <url>`) that any developer building an Alexa+ MCP server can run to validate their endpoint against the Alexa+ checklist (Streamable HTTP, bare 401, RFC 9728 PRM, S256 PKCE enforcement, and tool description linter).

---

## 3. Demo Video Script (< 3 Minutes)

> **Format:** Public link on YouTube / Vimeo in English. No third-party copyright music or footage.

| Timestamp | Screen Display / Visual | Spoken Narration (Voiceover) |
|---|---|---|
| **0:00–0:15** | Opening problem slide: Dispersed family coordinating elder care. | *"Millions of families care for an aging parent from a distance. Asking 'Did you take your pills?' feels like nagging, and elders hate fiddling with smartphone apps. Meet Tend, an ambient family care circle living inside Alexa+."* |
| **0:15–0:40** | Echo Show kitchen view & simulator. | *"In the morning, 81-year-old Margaret simply tells her Echo Show: 'Alexa, tell Tend I took my morning pills.' Tend logs her dose with sub-5 millisecond latency and confirms with a warm, natural response. A moment later, Margaret says: 'Alexa, tell Tend I'm fine.' Her family knows she's okay without an invasive camera."* |
| **0:40–1:15** | Caregiver view (Elena) asking Alexa on Echo Dot. | *"Miles away, her daughter Elena asks: 'Alexa, how's Mom doing today?' Tend speaks an instant, deterministic briefing: Margaret's pills are taken, check-in is logged, and there's one open task: Pick up blood pressure refill at CVS. Sibling David then says: 'Alexa, tell Tend to claim the prescription task.' David claims it, and the circle board synchronizes immediately so nobody calls twice."* |
| **1:15–1:45** | Echo Show Care Board (`ui://tend/care-board`) & Urgent Alert. | *"On screen devices, Tend renders an interactive MCP App Care Board styled cleanly with Apple typography. When an urgent situation arises, Elena asks Tend to notify the circle. Tend enforces an explicit confirmation safeguard—'Say confirm to dispatch'—before broadcasting SMS alerts via Amazon SNS."* |
| **1:45–2:15** | AWS Architecture diagram & latency graph. | *"Behind the scenes, Tend runs on AWS Fargate behind an Application Load Balancer to eliminate cold starts. All state lives in a KMS-encrypted DynamoDB single-table. Notice that there is ZERO LLM call in the synchronous voice path: our briefings are synthesized from 4 fast database queries, delivering a p95 latency of just 2.46 milliseconds. Amazon Bedrock runs strictly out-of-band on a daily EventBridge schedule to write pre-computed adherence insights."* |
| **2:15–2:40** | Terminal running `npx alexa-mcp-check`. | *"As our contribution to the Open Source mini challenge, we created alexa-mcp-check, an Apache-2.0 CLI that tests any MCP server against Alexa+ hard requirements: bare 401 unauthenticated responses, RFC 9728 Protected Resource Metadata, and PKCE S256 enforcement. Here you see it running in CI and going 100% green."* |
| **2:40–3:00** | Tend roadmap slide. | *"Tend gives aging parents their independence and families peace of mind. On our roadmap: ambient door and motion signals from Ring, and a shared Care Board card for Fire TV. Tend—voice-first care coordination that feels like family."* |

---

## 4. Product Feedback for Amazon Developer Teams

| Component / Tool | What We Used It For | What Worked Well | What Needs Work | Would Build With It Again? |
|---|---|---|---|---|
| **Alexa+ MCP Protocol** | Connecting voice tools to generative Alexa+ | Streamable HTTP standard is clean, fast, and eliminates SSE connection hanging. | Clarify in documentation that in stateless mode, server transports must be instantiated per request. | **Yes** — Transformative architecture for voice ecosystems. |
| **OAuth 2.1 & RFC 9728** | Account linking and resource authorization | Excellent security posture; requiring S256 PKCE and `resource` prevents token confusion. | The bare 401 requirement (no `WWW-Authenticate`) is non-standard in HTTP RFCs; emphasize it prominently in QuickStart guides. | **Yes** — Rock-solid token isolation. |
| **MCP Apps (`ui://`)** | Multimodal Echo Show Care Board | Effortless way to deliver rich webview components to screen devices without separate skill UI packages. | Provide a standard local inspector preview simulator in npm. | **Yes** — Essential for ambient smart displays. |
| **Amazon DynamoDB Single-Table** | Unified datastore for all entities | Predictable single-digit millisecond latency across complex relations. | Requires careful upfront schema planning. | **Yes** — Unbeatable for voice latency budgets. |
| **Amazon Bedrock (Converse API)** | Longitudinal care trend insights | High-quality observational summaries without clinical drift. | Bedrock quota access onboarding varies by region. | **Yes** — Ideal for out-of-band intelligence. |

---

## 5. Friction Log Summary (Bonus Criteria)
Detailed developer experience journal maintained in [`FRICTION.md`](../FRICTION.md):
- **F-001:** npm 12+ script-blocking workaround for CLI tools (`--allow-scripts=pnpm`).
- **F-002:** `https://developer.amazon.com/docs/llms.txt` 404 documentation index handling.
- **F-003:** `@alexa-ai/cli` public npm availability and manual package manifest authoring.

---

## 6. Repository Access & License Checklist
- **If Public Repository:** Standard Apache 2.0 license file is included at [`LICENSE`](../LICENSE) (auto-detectable by GitHub in About section).
- **If Private Repository:** Confirm that all hackathon reviewers and Devpost testing accounts have been invited as collaborators:
  - [x] `AmazonAppDev` (Official Amazon Developer Reviewers)
  - [x] `testing@devpost.com` (Devpost Testing & Verification)
  - [x] `knmeiss`
  - [x] `giolaq`
  - [x] `anishamalde`
  - [x] `mosesroth`
  - [x] `emersonsklar`
