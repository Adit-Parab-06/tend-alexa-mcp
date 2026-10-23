import { TEND_VERSION } from "@tend/core";
import { renderConsoleHtml } from "./consoleUi.js";

export function getConsoleMetadata() {
  return {
    name: "Tend Console",
    version: TEND_VERSION,
    status: "ready",
    features: [
      "medication_schedule_editor",
      "circle_member_management",
      "invite_by_code",
      "notification_escalation_preferences",
      "privacy_data_export",
      "account_deletion",
      "scripted_demo_runner",
    ],
  };
}

export { renderConsoleHtml };
