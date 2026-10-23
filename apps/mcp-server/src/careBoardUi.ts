import type { TendRepository } from "@tend/core";

/**
 * Renders the MCP App Care Board UI (ui://tend/care-board)
 * Strictly conforms to DESIGN.md (Apple design language, Action Blue #0066cc, SF Pro typography)
 */
export async function renderCareBoardHtml(circleId: string, repo: TendRepository): Promise<string> {
  const circle = await repo.getCircle(circleId);
  const elderName = circle?.elderName || "Mom";
  const today = new Date().toISOString().slice(0, 10);

  const [doses, checkIn, tasks, appointments, notes, insight] = await Promise.all([
    repo.getDosesForDate(circleId, today),
    repo.getCheckInForDate(circleId, today),
    repo.listCareTasks(circleId, "all"),
    repo.listAppointments(circleId, 7),
    repo.listCareNotes(circleId, 5),
    repo.getLatestInsight(circleId),
  ]);

  const takenCount = doses.filter((d) => d.status === "taken").length;
  const morningDose = doses.find((d) => d.slot === "morning");
  const eveningDose = doses.find((d) => d.slot === "evening");

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Tend Care Board — ${elderName}</title>
  <style>
    :root {
      --primary: #0066cc;
      --primary-focus: #0071e3;
      --ink: #1d1d1f;
      --ink-muted: #7a7a7a;
      --canvas: #ffffff;
      --canvas-parchment: #f5f5f7;
      --surface-pearl: #fafafc;
      --hairline: #e0e0e0;
      --success: #34c759;
      --warning: #ff9500;
      --font-display: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-text: "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--canvas-parchment);
      color: var(--ink);
      font-family: var(--font-text);
      font-size: 16px;
      line-height: 1.47;
      letter-spacing: -0.01em;
      padding: 24px;
      -webkit-font-smoothing: antialiased;
    }
    .container {
      max-width: 800px;
      margin: 0 auto;
    }
    header {
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      border-bottom: 1px solid var(--hairline);
      padding-bottom: 16px;
    }
    h1 {
      font-family: var(--font-display);
      font-size: 34px;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--ink);
    }
    .badge {
      display: inline-flex;
      align-items: center;
      padding: 4px 10px;
      border-radius: 980px;
      font-size: 13px;
      font-weight: 500;
      background: var(--surface-pearl);
      border: 1px solid var(--hairline);
    }
    .badge-success {
      background: #e8f8ed;
      color: #1b7a37;
      border-color: #c4ebd0;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
      gap: 16px;
      margin-bottom: 24px;
    }
    .card {
      background: var(--canvas);
      border: 1px solid var(--hairline);
      border-radius: 18px;
      padding: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }
    .card-title {
      font-size: 13px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--ink-muted);
      margin-bottom: 12px;
    }
    .status-large {
      font-family: var(--font-display);
      font-size: 24px;
      font-weight: 600;
      margin-bottom: 6px;
    }
    .insight-card {
      background: linear-gradient(135deg, #f0f7ff 0%, #ffffff 100%);
      border: 1px solid #cce4ff;
    }
    .insight-text {
      color: var(--primary);
      font-size: 14px;
      font-weight: 500;
    }
    ul.task-list {
      list-style: none;
    }
    li.task-item {
      padding: 10px 0;
      border-bottom: 1px solid var(--hairline);
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 14px;
    }
    li.task-item:last-child { border-bottom: none; }
    .footer-note {
      text-align: center;
      font-size: 12px;
      color: var(--ink-muted);
      margin-top: 32px;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <div>
        <span class="badge">Tend Care Circle</span>
        <h1 style="margin-top: 8px;">${elderName}'s Care Board</h1>
      </div>
      <div>
        <span class="badge badge-success">Live Status</span>
      </div>
    </header>

    ${insight ? `
    <div class="card insight-card" style="margin-bottom: 20px;">
      <div class="card-title" style="color: var(--primary);">Bedrock Longitudinal Care Insight</div>
      <p class="insight-text">${insight.summary}</p>
    </div>` : ''}

    <div class="grid">
      <!-- Medications Card -->
      <div class="card">
        <div class="card-title">Medication Adherence (Today)</div>
        <div class="status-large">${takenCount > 0 ? "Morning Dose Taken" : "Awaiting Dose"}</div>
        <p style="color: var(--ink-muted); font-size: 14px;">
          Morning: <strong>${morningDose ? morningDose.status : 'Pending'}</strong><br/>
          Evening: <strong>${eveningDose ? eveningDose.status : 'Scheduled'}</strong>
        </p>
      </div>

      <!-- Check-in Card -->
      <div class="card">
        <div class="card-title">Daily Well-Being Check-In</div>
        <div class="status-large">${checkIn ? (checkIn.status === 'fine' ? "Feeling Well" : checkIn.status) : "No Check-In Yet"}</div>
        <p style="color: var(--ink-muted); font-size: 14px;">
          ${checkIn?.note ? `"${checkIn.note}"` : 'Checked in via Echo Show voice'}
        </p>
      </div>
    </div>

    <!-- Care Tasks & Appointments -->
    <div class="grid">
      <div class="card">
        <div class="card-title">Family Care Tasks</div>
        <ul class="task-list">
          ${tasks.length === 0 ? '<li class="task-item">No tasks scheduled</li>' : tasks.map(t => `
            <li class="task-item">
              <span>${t.title}</span>
              <span class="badge ${t.status === 'claimed' ? 'badge-success' : ''}">${t.status}${t.claimedBy ? ` (${t.claimedBy})` : ''}</span>
            </li>
          `).join('')}
        </ul>
      </div>

      <div class="card">
        <div class="card-title">Upcoming Appointments</div>
        <ul class="task-list">
          ${appointments.length === 0 ? '<li class="task-item">No upcoming visits</li>' : appointments.map(a => `
            <li class="task-item">
              <div>
                <strong>${a.title}</strong><br/>
                <small style="color: var(--ink-muted);">${a.doctor || ''} &bull; ${new Date(a.dateTime).toLocaleDateString()}</small>
              </div>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>

    <!-- Recent Family Notes -->
    <div class="card">
      <div class="card-title">Recent Care Notes</div>
      <ul class="task-list">
        ${notes.length === 0 ? '<li class="task-item">No family notes yet</li>' : notes.map(n => `
          <li class="task-item">
            <div>
              <strong>${n.author}:</strong> ${n.content}
            </div>
            <small style="color: var(--ink-muted);">${new Date(n.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</small>
          </li>
        `).join('')}
      </ul>
    </div>

    <div class="footer-note">
      Tend is for family care coordination and does not provide medical advice or handle medical emergencies.
    </div>
  </div>
</body>
</html>`;
}
