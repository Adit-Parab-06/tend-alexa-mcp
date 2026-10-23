import { describe, it, expect, beforeEach } from "vitest";
import {
  TEND_VERSION,
  VoiceResponseSchema,
  InMemoryTendRepository,
  generateDailyBriefing,
} from "./index.js";

describe("Tend Core Domain & Briefing Engine", () => {
  let repo: InMemoryTendRepository;
  const circleId = "circle-tend-dev";

  beforeEach(() => {
    repo = new InMemoryTendRepository(true);
  });

  it("exports current version", () => {
    expect(TEND_VERSION).toBe("0.1.0");
  });

  it("validates voice response schema constraint", () => {
    const valid = VoiceResponseSchema.safeParse({
      speech: "All morning meds recorded.",
      data: { status: "recorded", time: "09:00" },
    });
    expect(valid.success).toBe(true);

    const tooLongSpeech = VoiceResponseSchema.safeParse({
      speech: "x".repeat(281),
      data: {},
    });
    expect(tooLongSpeech.success).toBe(false);
  });

  it("performs idempotent medication logging", async () => {
    const today = new Date().toISOString().slice(0, 10);
    await repo.logDose({
      circleId,
      date: today,
      slot: "morning",
      status: "taken",
      timestamp: new Date().toISOString(),
    });

    // Second log with same date and slot updates idempotently
    await repo.logDose({
      circleId,
      date: today,
      slot: "morning",
      status: "taken",
      notes: "Updated with notes",
      timestamp: new Date().toISOString(),
    });

    const doses = await repo.getDosesForDate(circleId, today);
    expect(doses.length).toBe(1);
    expect(doses[0].notes).toBe("Updated with notes");
  });

  it("generates deterministic daily briefing within 280 chars", async () => {
    const today = new Date().toISOString().slice(0, 10);
    await repo.logDose({
      circleId,
      date: today,
      slot: "morning",
      status: "taken",
      timestamp: new Date().toISOString(),
    });
    await repo.recordCheckIn({
      circleId,
      date: today,
      status: "fine",
      timestamp: new Date().toISOString(),
    });

    const start = performance.now();
    const briefing = await generateDailyBriefing(circleId, repo, today);
    const duration = performance.now() - start;

    expect(briefing.speech.length).toBeLessThanOrEqual(280);
    expect(briefing.speech).toContain("Margaret's pills are taken");
    expect(briefing.speech).toContain("checked in and is doing fine");
    expect(briefing.data.dosesTaken).toBe(1);
    expect(duration).toBeLessThan(20); // Sub-20ms local execution
  });

  it("claims open tasks and prevents duplicate claims by siblings", async () => {
    const task = await repo.claimCareTask(circleId, "task-401", "Elena");
    expect(task.status).toBe("claimed");
    expect(task.claimedBy).toBe("Elena");

    // Second sibling attempt throws duplicate claim conflict
    await expect(repo.claimCareTask(circleId, "task-401", "David")).rejects.toThrow(
      "already claimed by Elena"
    );
  });
});
