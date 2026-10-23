import type {
  Appointment,
  AuditLogEntry,
  CachedInsight,
  CareCircle,
  CareNote,
  CareTask,
  CheckInEvent,
  DoseEvent,
  Member,
  TaskStatus,
  TendRepository,
} from "./index.js";

export class InMemoryTendRepository implements TendRepository {
  private circles = new Map<string, CareCircle>();
  private members = new Map<string, Member[]>();
  private doses = new Map<string, DoseEvent[]>();
  private checkIns = new Map<string, CheckInEvent[]>();
  private tasks = new Map<string, CareTask[]>();
  private notes = new Map<string, CareNote[]>();
  private appointments = new Map<string, Appointment[]>();
  private auditLogs: AuditLogEntry[] = [];
  private insights = new Map<string, CachedInsight>();

  constructor(seedDefault = true) {
    if (seedDefault) {
      this.seedDefaultData();
    }
  }

  private seedDefaultData() {
    const defaultCircleId = "circle-tend-dev";

    this.circles.set(defaultCircleId, {
      id: defaultCircleId,
      name: "Margaret's Care Circle",
      elderName: "Margaret",
      timezone: "America/New_York",
      createdAt: new Date().toISOString(),
    });

    this.members.set(defaultCircleId, [
      { id: "member-margaret", circleId: defaultCircleId, name: "Margaret", role: "elder" },
      { id: "member-elena", circleId: defaultCircleId, name: "Elena", role: "primary_caregiver", phone: "+15551234567" },
      { id: "member-david", circleId: defaultCircleId, name: "David", role: "caregiver", phone: "+15557654321" },
    ]);

    const today = new Date().toISOString().slice(0, 10);
    this.tasks.set(defaultCircleId, [
      {
        id: "task-401",
        circleId: defaultCircleId,
        title: "Pick up blood pressure medication refill at CVS",
        status: "open",
        dueAt: `${today}T17:00:00Z`,
        createdAt: new Date().toISOString(),
      },
    ]);

    this.appointments.set(defaultCircleId, [
      {
        id: "appt-501",
        circleId: defaultCircleId,
        title: "Dr. Chen Cardiology Follow-up",
        doctor: "Dr. Chen",
        location: "Suite 400 Medical Plaza",
        dateTime: `${today}T14:00:00Z`,
      },
    ]);

    this.insights.set(defaultCircleId, {
      circleId: defaultCircleId,
      summary: "Margaret has taken 100% of morning medications over the past 7 days.",
      adherenceTrend: "consistent",
      generatedAt: new Date().toISOString(),
      modelId: "amazon.nova-micro-v1:0",
    });
  }

  async getCircle(circleId: string): Promise<CareCircle | null> {
    return this.circles.get(circleId) || null;
  }

  async createCircle(circle: CareCircle): Promise<void> {
    this.circles.set(circle.id, circle);
  }

  async getMembers(circleId: string): Promise<Member[]> {
    return this.members.get(circleId) || [];
  }

  async addMember(member: Member): Promise<void> {
    const list = this.members.get(member.circleId) || [];
    list.push(member);
    this.members.set(member.circleId, list);
  }

  async logDose(event: DoseEvent): Promise<DoseEvent> {
    const list = this.doses.get(event.circleId) || [];
    // Idempotent replacement for same date + slot
    const filtered = list.filter((d) => !(d.date === event.date && d.slot === event.slot));
    const record = { ...event, id: event.id || `dose-${Date.now()}` };
    filtered.push(record);
    this.doses.set(event.circleId, filtered);
    return record;
  }

  async getDosesForDate(circleId: string, date: string): Promise<DoseEvent[]> {
    const list = this.doses.get(circleId) || [];
    return list.filter((d) => d.date === date);
  }

  async recordCheckIn(checkIn: CheckInEvent): Promise<CheckInEvent> {
    const list = this.checkIns.get(checkIn.circleId) || [];
    // Idempotent replacement for same date
    const filtered = list.filter((c) => c.date !== checkIn.date);
    const record = { ...checkIn, id: checkIn.id || `checkin-${Date.now()}` };
    filtered.push(record);
    this.checkIns.set(checkIn.circleId, filtered);
    return record;
  }

  async getCheckInForDate(circleId: string, date: string): Promise<CheckInEvent | null> {
    const list = this.checkIns.get(circleId) || [];
    return list.find((c) => c.date === date) || null;
  }

  async listCareTasks(circleId: string, filter?: TaskStatus | "all"): Promise<CareTask[]> {
    const list = this.tasks.get(circleId) || [];
    if (!filter || filter === "all") return list;
    return list.filter((t) => t.status === filter);
  }

  async claimCareTask(circleId: string, taskId: string, claimedBy: string): Promise<CareTask> {
    const list = this.tasks.get(circleId) || [];
    const task = list.find((t) => t.id === taskId);
    if (!task) {
      throw new Error(`Task ${taskId} not found`);
    }
    if (task.claimedBy && task.claimedBy !== claimedBy) {
      throw new Error(`Task ${taskId} already claimed by ${task.claimedBy}`);
    }
    task.claimedBy = claimedBy;
    task.status = "claimed";
    task.claimedAt = new Date().toISOString();
    return task;
  }

  async addCareTask(task: CareTask): Promise<CareTask> {
    const list = this.tasks.get(task.circleId) || [];
    list.push(task);
    this.tasks.set(task.circleId, list);
    return task;
  }

  async addCareNote(note: CareNote): Promise<CareNote> {
    const list = this.notes.get(note.circleId) || [];
    list.unshift(note);
    this.notes.set(note.circleId, list);
    return note;
  }

  async listCareNotes(circleId: string, limit = 10): Promise<CareNote[]> {
    const list = this.notes.get(circleId) || [];
    return list.slice(0, limit);
  }

  async listAppointments(circleId: string, daysAhead = 7): Promise<Appointment[]> {
    const list = this.appointments.get(circleId) || [];
    const now = new Date();
    const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    return list.filter((a) => {
      const dt = new Date(a.dateTime);
      return dt >= now && dt <= future;
    });
  }

  async addAppointment(appointment: Appointment): Promise<Appointment> {
    const list = this.appointments.get(appointment.circleId) || [];
    list.push(appointment);
    this.appointments.set(appointment.circleId, list);
    return appointment;
  }

  async recordAuditLog(entry: AuditLogEntry): Promise<void> {
    this.auditLogs.push(entry);
  }

  async getLatestInsight(circleId: string): Promise<CachedInsight | null> {
    return this.insights.get(circleId) || null;
  }

  async setLatestInsight(circleId: string, insight: CachedInsight): Promise<void> {
    this.insights.set(circleId, insight);
  }
}
