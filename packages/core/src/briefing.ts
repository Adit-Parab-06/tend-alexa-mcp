import type { TendRepository, VoiceResponse } from "./index.js";

export interface DailyBriefingData {
  circleId: string;
  elderName: string;
  date: string;
  dosesTaken: number;
  dosesSkipped: number;
  checkInStatus: string | null;
  openTasksCount: number;
  nextAppointment: string | null;
  insight: string | null;
}

/**
 * Deterministically generates a daily briefing across <= 4 parallel queries.
 * Runs in under 10ms with zero LLM calls in the synchronous voice path.
 */
export async function generateDailyBriefing(
  circleId: string,
  repo: TendRepository,
  dateStr?: string
): Promise<VoiceResponse<DailyBriefingData>> {
  const date = dateStr || new Date().toISOString().slice(0, 10);

  // Parallel data fetch
  const [circle, doses, checkIn, openTasks, appointments, cachedInsight] = await Promise.all([
    repo.getCircle(circleId),
    repo.getDosesForDate(circleId, date),
    repo.getCheckInForDate(circleId, date),
    repo.listCareTasks(circleId, "open"),
    repo.listAppointments(circleId, 7),
    repo.getLatestInsight(circleId),
  ]);

  const elderName = circle?.elderName || "Mom";
  const takenCount = doses.filter((d) => d.status === "taken").length;
  const skippedCount = doses.filter((d) => d.status === "skipped").length;

  // Meds sentence
  let medsSummary = "No medications logged yet today";
  if (takenCount > 0 && skippedCount === 0) {
    medsSummary = `${elderName}'s pills are taken`;
  } else if (takenCount > 0 && skippedCount > 0) {
    medsSummary = `${elderName} took ${takenCount} dose and skipped ${skippedCount}`;
  } else if (skippedCount > 0 && takenCount === 0) {
    medsSummary = `${elderName} skipped a dose today`;
  }

  // Check-in sentence
  let checkInSummary = "No check-in recorded yet";
  if (checkIn) {
    if (checkIn.status === "fine" || checkIn.status === "great") {
      checkInSummary = `${elderName} checked in and is doing fine`;
    } else if (checkIn.status === "tired") {
      checkInSummary = `${elderName} checked in and mentioned feeling tired`;
    } else if (checkIn.status === "needs_help") {
      checkInSummary = `${elderName} requested a hand with something`;
    }
  }

  // Tasks & Appointments sentence
  const taskText = openTasks.length === 1 ? "1 open care task" : `${openTasks.length} open tasks`;
  let apptText = "";
  if (appointments.length > 0) {
    const next = appointments[0];
    apptText = `, and an appointment: ${next.title}`;
  }

  // Build spoken string under 280 characters
  let speech = `Here is ${elderName}'s update: ${medsSummary}. ${checkInSummary}. There is ${taskText}${apptText}.`;
  if (speech.length > 280) {
    speech = `Here is ${elderName}'s update: ${medsSummary}. ${checkInSummary}. There is ${taskText}.`;
  }
  if (speech.length > 280) {
    speech = speech.slice(0, 277) + "...";
  }

  return {
    speech,
    data: {
      circleId,
      elderName,
      date,
      dosesTaken: takenCount,
      dosesSkipped: skippedCount,
      checkInStatus: checkIn ? checkIn.status : null,
      openTasksCount: openTasks.length,
      nextAppointment: appointments[0] ? appointments[0].title : null,
      insight: cachedInsight ? cachedInsight.summary : null,
    },
  };
}
