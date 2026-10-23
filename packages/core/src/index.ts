import { z } from "zod";

export const TEND_VERSION = "0.1.0";

// --- Voice Response Contract ---
export const VoiceResponseSchema = z.object({
  speech: z.string().max(280),
  data: z.record(z.unknown()),
});
export type VoiceResponse<T = Record<string, unknown>> = {
  speech: string;
  data: T;
};

// --- Member & Circle Domain ---
export const MemberRoleSchema = z.enum(["elder", "primary_caregiver", "caregiver"]);
export type MemberRole = z.infer<typeof MemberRoleSchema>;

export interface Member {
  id: string;
  circleId: string;
  name: string;
  role: MemberRole;
  phone?: string;
  email?: string;
}

export interface CareCircle {
  id: string;
  name: string;
  elderName: string;
  timezone: string;
  createdAt: string;
}

// --- Dose Events ---
export const DoseSlotSchema = z.enum(["morning", "afternoon", "evening", "bedtime"]);
export type DoseSlot = z.infer<typeof DoseSlotSchema>;

export const DoseStatusSchema = z.enum(["taken", "skipped"]);
export type DoseStatus = z.infer<typeof DoseStatusSchema>;

export interface DoseEvent {
  id?: string;
  circleId: string;
  date: string; // YYYY-MM-DD
  slot: DoseSlot;
  status: DoseStatus;
  notes?: string;
  loggedBy?: string;
  timestamp: string;
}

// --- Check-In Events ---
export const CheckInStatusSchema = z.enum(["fine", "great", "tired", "needs_help"]);
export type CheckInStatus = z.infer<typeof CheckInStatusSchema>;

export interface CheckInEvent {
  id?: string;
  circleId: string;
  date: string; // YYYY-MM-DD
  status: CheckInStatus;
  note?: string;
  timestamp: string;
}

// --- Care Tasks ---
export const TaskStatusSchema = z.enum(["open", "claimed", "completed"]);
export type TaskStatus = z.infer<typeof TaskStatusSchema>;

export interface CareTask {
  id: string;
  circleId: string;
  title: string;
  status: TaskStatus;
  dueAt?: string;
  claimedBy?: string;
  claimedAt?: string;
  createdAt: string;
}

// --- Care Notes ---
export interface CareNote {
  id: string;
  circleId: string;
  author: string;
  content: string;
  timestamp: string;
}

// --- Appointments ---
export interface Appointment {
  id: string;
  circleId: string;
  title: string;
  doctor?: string;
  location?: string;
  dateTime: string;
}

// --- Audit Log ---
export interface AuditLogEntry {
  id: string;
  circleId: string;
  action: string;
  actorId: string;
  timestamp: string;
  payloadHash?: string;
}

// --- Cached Bedrock Insight ---
export interface CachedInsight {
  circleId: string;
  summary: string;
  adherenceTrend: string;
  generatedAt: string;
  modelId: string;
}

// --- Repository Interface ---
export interface TendRepository {
  getCircle(circleId: string): Promise<CareCircle | null>;
  createCircle(circle: CareCircle): Promise<void>;
  getMembers(circleId: string): Promise<Member[]>;
  addMember(member: Member): Promise<void>;
  logDose(event: DoseEvent): Promise<DoseEvent>;
  getDosesForDate(circleId: string, date: string): Promise<DoseEvent[]>;
  recordCheckIn(checkIn: CheckInEvent): Promise<CheckInEvent>;
  getCheckInForDate(circleId: string, date: string): Promise<CheckInEvent | null>;
  listCareTasks(circleId: string, filter?: TaskStatus | "all"): Promise<CareTask[]>;
  claimCareTask(circleId: string, taskId: string, claimedBy: string): Promise<CareTask>;
  addCareTask(task: CareTask): Promise<CareTask>;
  addCareNote(note: CareNote): Promise<CareNote>;
  listCareNotes(circleId: string, limit?: number): Promise<CareNote[]>;
  listAppointments(circleId: string, daysAhead?: number): Promise<Appointment[]>;
  addAppointment(appointment: Appointment): Promise<Appointment>;
  recordAuditLog(entry: AuditLogEntry): Promise<void>;
  getLatestInsight(circleId: string): Promise<CachedInsight | null>;
  setLatestInsight(circleId: string, insight: CachedInsight): Promise<void>;
}

export * from "./briefing.js";
export * from "./inMemoryRepo.js";

