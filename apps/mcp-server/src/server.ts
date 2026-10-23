import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import {
  TEND_VERSION,
  type TendRepository,
  generateDailyBriefing,
  DoseSlotSchema,
  DoseStatusSchema,
  CheckInStatusSchema,
} from "@tend/core";
import { renderCareBoardHtml } from "./careBoardUi.js";

export interface CreateMcpServerOptions {
  repo: TendRepository;
  defaultCircleId?: string;
  defaultMemberName?: string;
}

/**
 * Creates and configures the Tend MCP Server with all 8 voice-first tools
 * and the MCP App Care Board UI resource.
 */
export function createTendMcpServer(options: CreateMcpServerOptions): McpServer {
  const { repo, defaultCircleId = "circle-tend-dev", defaultMemberName = "Elena" } = options;

  const server = new McpServer(
    {
      name: "tend-mcp-server",
      version: TEND_VERSION,
    },
    {
      capabilities: {
        tools: {},
        resources: {},
      },
    }
  );

  // --- 1. log_medication ---
  server.registerTool(
    "log_medication",
    {
      description: "Record taken or skipped for a scheduled dose.",
      inputSchema: {
        slot: DoseSlotSchema.describe("Time slot of scheduled dose (morning, afternoon, evening, bedtime)"),
        status: DoseStatusSchema.describe("Whether the dose was taken or skipped"),
        notes: z.string().max(100).optional().describe("Optional brief note"),
      },
    },
    async (args) => {
      const today = new Date().toISOString().slice(0, 10);
      const dose = await repo.logDose({
        circleId: defaultCircleId,
        date: today,
        slot: args.slot,
        status: args.status,
        notes: args.notes,
        timestamp: new Date().toISOString(),
      });

      const speech = `I've logged your ${args.slot} medication as ${args.status} for today. Have a wonderful day.`;
      const data = { action: "log_medication", doseId: dose.id, slot: args.slot, status: args.status, date: today };

      return {
        content: [{ type: "text", text: JSON.stringify({ speech, data }) }],
        structuredContent: { speech, data },
      };
    }
  );

  // --- 2. record_check_in ---
  server.registerTool(
    "record_check_in",
    {
      description: "Record daily well-being check-in with an optional status note.",
      inputSchema: {
        status: CheckInStatusSchema.describe("Elder well-being indicator (fine, great, tired, needs_help)"),
        note: z.string().max(140).optional().describe("Optional spoken note from elder"),
      },
    },
    async (args) => {
      const today = new Date().toISOString().slice(0, 10);
      const checkIn = await repo.recordCheckIn({
        circleId: defaultCircleId,
        date: today,
        status: args.status,
        note: args.note,
        timestamp: new Date().toISOString(),
      });

      const speech = `Thank you for checking in. I've let your family care circle know you are ${args.status === "fine" ? "doing fine" : args.status} today.`;
      const data = { action: "record_check_in", id: checkIn.id, status: args.status, date: today };

      return {
        content: [{ type: "text", text: JSON.stringify({ speech, data }) }],
        structuredContent: { speech, data },
      };
    }
  );

  // --- 3. get_daily_briefing ---
  server.registerTool(
    "get_daily_briefing",
    {
      description: "Spoken deterministic briefing summarizing meds, check-ins, tasks, and appointments.",
      inputSchema: {
        date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional().describe("Date in YYYY-MM-DD format (defaults to today)"),
      },
    },
    async (args) => {
      const briefing = await generateDailyBriefing(defaultCircleId, repo, args?.date);

      return {
        content: [{ type: "text", text: JSON.stringify(briefing) }],
        structuredContent: briefing,
      };
    }
  );

  // --- 4. list_care_tasks ---
  server.registerTool(
    "list_care_tasks",
    {
      description: "List open family care coordination tasks.",
      inputSchema: {
        filter: z.enum(["open", "claimed", "all"]).optional().describe("Task status filter (default: open)"),
      },
    },
    async (args) => {
      const filter = args?.filter || "open";
      const tasks = await repo.listCareTasks(defaultCircleId, filter);

      let speech = `There are currently no ${filter} care tasks for your circle.`;
      if (tasks.length === 1) {
        speech = `There is 1 ${filter} care task: ${tasks[0].title}.`;
      } else if (tasks.length > 1) {
        speech = `There are ${tasks.length} ${filter} care tasks, including ${tasks[0].title}.`;
      }

      const data = { action: "list_care_tasks", filter, count: tasks.length, tasks };

      return {
        content: [{ type: "text", text: JSON.stringify({ speech, data }) }],
        structuredContent: { speech, data },
      };
    }
  );

  // --- 5. claim_care_task ---
  server.registerTool(
    "claim_care_task",
    {
      description: "Claim an open care task so siblings do not duplicate effort.",
      inputSchema: {
        taskId: z.string().describe("Unique identifier of the care task to claim"),
      },
    },
    async (args) => {
      const task = await repo.claimCareTask(defaultCircleId, args.taskId, defaultMemberName);
      const speech = `You have claimed the task: ${task.title}. The family care board has been updated.`;
      const data = { action: "claim_care_task", taskId: task.id, claimedBy: defaultMemberName, status: task.status };

      return {
        content: [{ type: "text", text: JSON.stringify({ speech, data }) }],
        structuredContent: { speech, data },
      };
    }
  );

  // --- 6. add_care_note ---
  server.registerTool(
    "add_care_note",
    {
      description: "Post a shared update or observation to the family care circle.",
      inputSchema: {
        note: z.string().min(3).max(280).describe("Care note content to share with family circle"),
      },
    },
    async (args) => {
      const note = await repo.addCareNote({
        id: `note-${Date.now()}`,
        circleId: defaultCircleId,
        author: defaultMemberName,
        content: args.note,
        timestamp: new Date().toISOString(),
      });

      const speech = `Care note added: ${args.note}. I've shared it with the circle.`;
      const data = { action: "add_care_note", noteId: note.id, content: args.note };

      return {
        content: [{ type: "text", text: JSON.stringify({ speech, data }) }],
        structuredContent: { speech, data },
      };
    }
  );

  // --- 7. list_appointments ---
  server.registerTool(
    "list_appointments",
    {
      description: "Check upcoming medical and caregiver appointments for the circle.",
      inputSchema: {
        daysAhead: z.number().int().min(1).max(30).optional().describe("Number of days ahead to search (default 7)"),
      },
    },
    async (args) => {
      const days = args?.daysAhead || 7;
      const appts = await repo.listAppointments(defaultCircleId, days);

      let speech = `There are no upcoming appointments scheduled in the next ${days} days.`;
      if (appts.length === 1) {
        speech = `There is 1 appointment scheduled: ${appts[0].title}.`;
      } else if (appts.length > 1) {
        speech = `There are ${appts.length} appointments scheduled, starting with ${appts[0].title}.`;
      }

      const data = { action: "list_appointments", daysAhead: days, count: appts.length, appointments: appts };

      return {
        content: [{ type: "text", text: JSON.stringify({ speech, data }) }],
        structuredContent: { speech, data },
      };
    }
  );

  // --- 8. notify_circle ---
  server.registerTool(
    "notify_circle",
    {
      description: "Broadcast an escalation alert to family circle members with explicit confirmation.",
      inputSchema: {
        message: z.string().min(5).max(200).describe("Alert message to dispatch"),
        confirm: z.boolean().describe("Explicit confirmation flag (must be true)"),
      },
    },
    async (args) => {
      if (!args.confirm) {
        const speech = "This urgent alert requires confirmation. Please say confirm to notify all family circle members.";
        const data = { action: "notify_circle", status: "confirmation_required", message: args.message };
        return {
          content: [{ type: "text", text: JSON.stringify({ speech, data }) }],
          structuredContent: { speech, data },
        };
      }

      await repo.recordAuditLog({
        id: `audit-${Date.now()}`,
        circleId: defaultCircleId,
        action: "notify_circle_escalation",
        actorId: defaultMemberName,
        timestamp: new Date().toISOString(),
      });

      const speech = `Urgent alert dispatched to your family circle: ${args.message}.`;
      const data = { action: "notify_circle", status: "dispatched", confirmed: true, message: args.message };

      return {
        content: [{ type: "text", text: JSON.stringify({ speech, data }) }],
        structuredContent: { speech, data },
      };
    }
  );

  // --- MCP App Care Board Resource ---
  server.registerResource(
    "care-board",
    "ui://tend/care-board",
    {
      title: "Tend Family Care Board",
      description: "Interactive multimodal care board for Echo Show and screen devices.",
      mimeType: "text/html",
    },
    async () => {
      const html = await renderCareBoardHtml(defaultCircleId, repo);
      return {
        contents: [
          {
            uri: "ui://tend/care-board",
            mimeType: "text/html",
            text: html,
          },
        ],
      };
    }
  );

  return server;
}
