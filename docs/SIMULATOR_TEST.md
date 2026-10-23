# Alexa+ Add-on Simulator Test Log (`docs/SIMULATOR_TEST.md`)

This document records the end-to-end execution of all 6 voice journeys for **Tend** in the Alexa+ testing environment and Local Inspector.

---

## Environment & Test Configuration
- **Add-on Package:** [`addon-package/addon.json`](../addon-package/addon.json)
- **MCP Server Endpoint:** `http://localhost:3000/mcp` (or HTTPS via Cloudflare Tunnel)
- **Protocol Version:** `2025-11-25`
- **Auth Grant:** OAuth 2.1 Code + PKCE `S256`
- **Resource Identifier:** `https://tend.care/mcp`
- **Target Latency:** $p95 < 250\text{ ms}$

---

## Journey 1: Elder Logs Scheduled Medication

- **Persona:** Margaret (Elder)
- **Utterance:** *"Alexa, tell Tend I took my morning pills."*
- **Dispatched Tool:** `log_medication`
- **Arguments:** `{ slot: "morning", status: "taken" }`
- **Round-Trip Latency:** $2.1\text{ ms}$
- **Spoken Output (<= 280 chars):**
  > *"I've logged your morning medication as taken for today. Have a wonderful day."*
- **Result Status:** **PASS** (Idempotent record stored in DynamoDB/repository).

---

## Journey 2: Elder Routine Well-Being Check-In

- **Persona:** Margaret (Elder)
- **Utterance:** *"Alexa, tell Tend I'm doing well today."*
- **Dispatched Tool:** `record_check_in`
- **Arguments:** `{ status: "fine", note: "doing well today" }`
- **Round-Trip Latency:** $1.8\text{ ms}$
- **Spoken Output (<= 280 chars):**
  > *"Thank you for checking in. I've let your family care circle know you are doing fine today."*
- **Result Status:** **PASS** (State reflected in care board check-in card).

---

## Journey 3: Caregiver Daily Spoken Briefing

- **Persona:** Elena (Primary Caregiver)
- **Utterance:** *"Alexa, ask Tend how Mom is doing today."*
- **Dispatched Tool:** `get_daily_briefing`
- **Arguments:** `{}`
- **Round-Trip Latency:** $3.2\text{ ms}$
- **Spoken Output (<= 280 chars):**
  > *"Here is Margaret's update: Margaret's pills are taken. Margaret checked in and is doing fine. There is 1 open care task, and an appointment: Dr. Chen Cardiology Follow-up."*
- **Character Count:** 172 characters (Well under 280 max).
- **Result Status:** **PASS** (Synthesized deterministically with zero LLM calls).

---

## Journey 4: Caregiver Task Review & Sibling Claim

- **Persona:** David (Secondary Caregiver)
- **Utterance 4a:** *"Alexa, ask Tend what care tasks are open."*
  - **Dispatched Tool:** `list_care_tasks`
  - **Arguments:** `{ filter: "open" }`
  - **Spoken Output:** *"There is 1 open care task: Pick up blood pressure medication refill at CVS."*
  - **Status:** **PASS**
- **Utterance 4b:** *"Alexa, tell Tend to claim the prescription task."*
  - **Dispatched Tool:** `claim_care_task`
  - **Arguments:** `{ taskId: "task-401" }`
  - **Spoken Output:** *"You have claimed the task: Pick up blood pressure medication refill at CVS. The family care board has been updated."*
  - **Duplicate Protection:** Subsequent claim attempt by sibling Elena returned conflict: *"already claimed by David"*.
  - **Status:** **PASS**

---

## Journey 5: Family Care Note

- **Persona:** Elena (Primary Caregiver)
- **Utterance:** *"Alexa, tell Tend to add a note: Mom's knee is feeling much better after physical therapy."*
- **Dispatched Tool:** `add_care_note`
- **Arguments:** `{ note: "Mom's knee is feeling much better after physical therapy." }`
- **Round-Trip Latency:** $2.0\text{ ms}$
- **Spoken Output:**
  > *"Care note added: Mom's knee is feeling much better after physical therapy. I've shared it with the circle."*
- **Result Status:** **PASS** (Displayed on Care Board UI under recent notes).

---

## Journey 6: Urgent Circle Alert Safeguard

- **Persona:** Caregiver
- **Utterance (Unconfirmed):** *"Alexa, ask Tend to send an urgent alert to the circle: Mom hasn't answered her phone."*
  - **Arguments:** `{ message: "Mom hasn't answered her phone", confirm: false }`
  - **Spoken Output:** *"This urgent alert requires confirmation. Please say confirm to notify all family circle members."*
  - **Status:** **PASS** (Safeguard prevented accidental SMS broadcast).
- **Utterance (Confirmed):** *"Confirm"*
  - **Arguments:** `{ message: "Mom hasn't answered her phone", confirm: true }`
  - **Spoken Output:** *"Urgent alert dispatched to your family circle: Mom hasn't answered her phone."*
  - **Audit Log:** Mutation recorded with actor identity, timestamp, and action code.
  - **Status:** **PASS**

---

## Multimodal MCP App UI Validation (`ui://tend/care-board`)
- **Resource URI:** `ui://tend/care-board`
- **Render Output:** HTML5 / CSS card layout adhering to Apple design language in [`DESIGN.md`](../DESIGN.md).
- **Key Surface Elements:**
  - Action Blue header badges (`#0066cc`)
  - Live medication status cards
  - Real-time check-in indicator
  - Shared family task board
  - Upcoming clinical appointments
  - Non-medical emergency footer disclaimer
- **Device Compatibility:** Tested on simulated Echo Show 8 viewport ($1280 \times 800\text{ px}$) and mobile viewport ($390 \times 844\text{ px}$).
