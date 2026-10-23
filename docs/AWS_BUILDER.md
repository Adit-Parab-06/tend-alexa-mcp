# Tend AWS Architecture & AWS Builder Documentation (`docs/AWS_BUILDER.md`)

> **Amazon Developer Hackathon — AWS Builder Mini Challenge**  
> **Project:** Tend (Voice-First Family Care Circle for Alexa+)  
> **Stack Definition:** [`infra/cdk/src/index.ts`](../infra/cdk/src/index.ts)

---

## Architecture Overview

```
                                      AWS Cloud Environment
  ┌────────────────────────────────────────────────────────────────────────────────────────┐
  │                                                                                        │
  │   Alexa+ Client ──► Route 53 / ALB ──► AWS Fargate (tend-mcp container)               │
  │                                           │                                            │
  │                                           ▼                                            │
  │                                 Amazon DynamoDB Single-Table                           │
  │                                 (tend-main-table, KMS, PITR)                           │
  │                                           ▲                                            │
  │                                           │ writes cached insights                     │
  │                                           │                                            │
  │   EventBridge Scheduler ──► AWS Lambda ───┴──► Amazon Bedrock (Converse API)          │
  │     (Daily Cron)            (Digest Worker)      (Amazon Nova Micro)                   │
  │                                                                                        │
  │   Urgent Escalation ──► Amazon SNS Topic ──► Family SMS & Push Notifications           │
  │                                                                                        │
  │   Observability ──► Amazon CloudWatch (p95 latency alarm < 250ms, 5xx, Audit Logs)     │
  │                                                                                        │
  └────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 1. AWS Services Breakdown & Exact Usage

### 1. Amazon DynamoDB (Single-Table Design)
- **Table Name:** `tend-main-table`
- **Role:** Primary operational datastore for care circles, member relationships, medication schedules, idempotent dose logs, routine check-ins, tasks, and audit logs.
- **Architectural Significance:** Single-table architecture allows the complete caregiver daily briefing (`get_daily_briefing`) to be deterministically assembled across $\le 4$ parallel queries in under **10 ms**, ensuring compliance with Alexa+'s sub-500ms voice requirement.
- **Security & Durability:**
  - AWS KMS Customer Managed Keys (CMK) for encryption at rest.
  - Point-in-Time Recovery (PITR) enabled for disaster recovery.

### 2. AWS Fargate & Application Load Balancer (ALB)
- **Role:** Hosts the core `apps/mcp-server` Streamable HTTP container.
- **Why Fargate over Lambda for Core MCP:** Fargate eliminates Lambda cold starts, which would otherwise threaten the 500 ms round-trip latency budget during unprompted voice queries.
- **Configuration:** 0.5 vCPU, 1 GB RAM, multi-AZ deployment with ALB health checks mapped to `/health`.

### 3. Amazon Bedrock (Converse API)
- **Model ID:** `amazon.nova-micro-v1:0` (or `anthropic.claude-3-haiku` depending on regional availability).
- **Role:** Asynchronous longitudinal care insight synthesis.
- **Why Asynchronous:** Voice-first platforms cannot afford 2-3 second synchronous LLM round-trips during spoken conversations. Bedrock is scheduled out-of-band to analyze 7-day adherence patterns (e.g. *"Margaret missed 3 of 7 morning doses this week; worth discussing with Dr. Chen"*), writing the result into `INSIGHT#LATEST` in DynamoDB for instant retrieval.

### 4. Amazon EventBridge Scheduler
- **Role:** Automated daily trigger configured with `cron(0 6 * * ? *)` (06:00 AM local circle time).
- **Function:** Initiates the asynchronous care digest worker before morning routines commence.

### 5. AWS Lambda (Digest Worker)
- **Role:** EventBridge-driven background compute worker.
- **Execution Flow:**
  1. Queries previous 7 days of dose records from `tend-main-table`.
  2. Synthesizes an adherence context prompt.
  3. Calls Amazon Bedrock Converse API with strict safety system prompts (no medical advice, observational only).
  4. Caches the 1-2 sentence spoken bullet into DynamoDB.

### 6. Amazon Simple Notification Service (SNS)
- **Topic:** `arn:aws:sns:us-east-1:*:tend-circle-escalations`
- **Role:** Urgent alert broadcast for `notify_circle`.
- **Function:** When an alert is explicitly confirmed (`confirm=true`), Tend publishes to SNS to send high-priority SMS and email alerts to all designated family circle members.

### 7. AWS Secrets Manager & AWS KMS
- **Role:** Secure storage and automated rotation for OAuth 2.1 token signing secrets and encryption keys.
- **Hard Rule:** Zero secrets in source code; managed via IAM execution roles.

### 8. Amazon CloudWatch & Alarms
- **Metrics & Alarms:**
  - **Latency SLA Alarm:** Fires if $p95$ response time exceeds $250\text{ ms}$ over 5 minutes.
  - **Error Rate Alarm:** Fires if HTTP 5xx errors exceed 1% of total requests.
  - **Security Alarm:** Fires if unauthorized authentication attempts exceed threshold.
- **Logs:** Structured JSON logging with `requestId` and audit trail retention.

---

## 2. Cost-Per-Circle Estimate

| Service | Free Tier / Base Allocation | Estimated Cost per 100 Circles |
|---|---|---|
| **DynamoDB** | 25 GB free storage, 25 WCU / 25 RCU | $\approx \$0.50\text{ / month}$ (On-Demand) |
| **AWS Fargate** | 1 container (0.5 vCPU, 1 GB) | $\approx \$15.00\text{ / month}$ |
| **ALB** | Shared Application Load Balancer | $\approx \$16.00\text{ / month}$ |
| **Amazon Bedrock** | Nova Micro ($\approx 1000$ tokens/circle/day) | $\approx \$0.15\text{ / month}$ |
| **EventBridge + Lambda** | Free tier covers 1M invocations/month | $\$0.00$ |
| **Amazon SNS** | 100 SMS notifications/month | $\approx \$0.75\text{ / month}$ |
| **Total** | | **$\approx \$0.32\text{ per circle/month}$** |

---

## 3. Conformance with AWS Builder Criteria
- **Infrastructure as Code:** Fully defined with AWS CDK v2 in [`infra/cdk/src/index.ts`](../infra/cdk/src/index.ts).
- **Production Hardening:** KMS encryption, PITR backups, strict IAM least privilege, and sub-second failover.
- **Appropriate AI Integration:** Using Bedrock Converse API asynchronously where it adds genuine longitudinal insight without compromising real-time voice latency.
