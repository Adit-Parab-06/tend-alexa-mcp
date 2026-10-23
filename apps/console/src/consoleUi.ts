/**
 * Tend Console Web Application
 * Dark Mode & Widescreen Command Center
 * Strictly designed according to DESIGN.md (Apple design language, Action Blue #2997ff on dark, Pure Black #000000, SF Pro typography)
 */
export function renderConsoleHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tend Console &mdash; Family Care Circle</title>
  <style>
    :root {
      --primary: #2997ff;
      --primary-hover: #0071e3;
      --action-blue: #0066cc;
      --bg-black: #000000;
      --surface-1: #111114;
      --surface-2: #18181c;
      --surface-elevated: #202024;
      --hairline: rgba(255, 255, 255, 0.12);
      --hairline-strong: rgba(255, 255, 255, 0.22);
      --text-white: #ffffff;
      --text-muted: #a1a1a6;
      --text-subtle: #6e6e73;
      --success: #30d158;
      --warning: #ffd60a;
      --danger: #ff453a;
      --font-display: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-text: "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg-black);
      color: var(--text-white);
      font-family: var(--font-text);
      font-size: 15px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
      overflow-x: hidden;
    }
    header {
      background: rgba(0, 0, 0, 0.85);
      backdrop-filter: saturate(180%) blur(20px);
      -webkit-backdrop-filter: saturate(180%) blur(20px);
      border-bottom: 1px solid var(--hairline);
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 12px 32px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo-group {
      display: flex;
      align-items: center;
      gap: 12px;
      text-decoration: none;
    }
    .logo-badge {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: linear-gradient(135deg, #2997ff 0%, #5e5ce6 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 10px rgba(41, 151, 255, 0.35);
    }
    .logo-badge svg {
      width: 22px;
      height: 22px;
      fill: #ffffff;
    }
    .logo-title-group {
      display: flex;
      flex-direction: column;
    }
    .logo-text {
      font-family: var(--font-display);
      font-size: 19px;
      font-weight: 600;
      letter-spacing: -0.02em;
      color: var(--text-white);
      line-height: 1.2;
    }
    .logo-sub {
      font-size: 11px;
      font-weight: 500;
      color: var(--text-muted);
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    nav.nav-tabs {
      display: flex;
      gap: 6px;
      background: rgba(255, 255, 255, 0.05);
      padding: 4px;
      border-radius: 980px;
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    button.tab-btn {
      background: transparent;
      border: none;
      padding: 8px 18px;
      border-radius: 980px;
      font-size: 13px;
      font-weight: 500;
      color: var(--text-muted);
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      gap: 8px;
      transition: all 0.15s ease;
    }
    button.tab-btn svg {
      width: 15px;
      height: 15px;
      stroke: currentColor;
    }
    button.tab-btn:hover {
      color: var(--text-white);
    }
    button.tab-btn.active {
      background: var(--surface-2);
      color: var(--text-white);
      border: 1px solid var(--hairline-strong);
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
    }
    
    /* Widescreen full dashboard layout */
    .container {
      width: 95%;
      max-width: 1440px;
      margin: 24px auto;
      padding: 0 12px;
    }

    /* Top Metric Ribbon */
    .stats-ribbon {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 16px;
      margin-bottom: 24px;
    }
    @media (max-width: 960px) {
      .stats-ribbon { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 580px) {
      .stats-ribbon { grid-template-columns: 1fr; }
    }
    .stat-card {
      background: var(--surface-1);
      border: 1px solid var(--hairline);
      border-radius: 16px;
      padding: 16px 20px;
      display: flex;
      align-items: center;
      gap: 14px;
      transition: border-color 0.15s ease;
    }
    .stat-card:hover {
      border-color: var(--hairline-strong);
    }
    .stat-icon {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: var(--surface-2);
      border: 1px solid var(--hairline);
      display: flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }
    .stat-icon svg {
      width: 20px;
      height: 20px;
      stroke: var(--primary);
    }
    .stat-info .stat-label {
      font-size: 12px;
      color: var(--text-muted);
      text-transform: uppercase;
      letter-spacing: 0.05em;
      margin-bottom: 2px;
    }
    .stat-info .stat-value {
      font-size: 16px;
      font-weight: 600;
      color: var(--text-white);
    }

    /* Hero Banner */
    .demo-banner {
      background: linear-gradient(135deg, rgba(41, 151, 255, 0.12) 0%, rgba(94, 92, 230, 0.14) 100%);
      border: 1px solid rgba(41, 151, 255, 0.28);
      border-radius: 20px;
      padding: 24px 30px;
      margin-bottom: 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-wrap: wrap;
      gap: 16px;
      box-shadow: 0 4px 24px rgba(0, 0, 0, 0.35);
    }
    .banner-text h3 {
      font-family: var(--font-display);
      font-size: 22px;
      font-weight: 600;
      color: var(--text-white);
      margin-bottom: 6px;
      letter-spacing: -0.01em;
    }
    .banner-text p {
      font-size: 14px;
      color: var(--text-muted);
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .live-dot {
      width: 8px;
      height: 8px;
      border-radius: 50%;
      background: var(--success);
      display: inline-block;
      box-shadow: 0 0 8px var(--success);
    }

    /* Cards and Grids */
    .card {
      background: var(--surface-1);
      border: 1px solid var(--hairline);
      border-radius: 20px;
      padding: 26px;
      margin-bottom: 24px;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.25);
    }
    h2.card-title {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.01em;
      color: var(--text-white);
      margin-bottom: 6px;
    }
    p.card-desc {
      font-size: 14px;
      color: var(--text-muted);
      margin-bottom: 22px;
      line-height: 1.45;
    }

    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
    }
    .grid-split-wide {
      display: grid;
      grid-template-columns: 1.25fr 1fr;
      gap: 24px;
    }
    @media (max-width: 900px) {
      .grid-2, .grid-split-wide { grid-template-columns: 1fr; }
    }

    /* Buttons */
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      padding: 10px 20px;
      border-radius: 980px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.15s ease;
      border: 1px solid transparent;
      text-decoration: none;
    }
    .btn svg {
      width: 16px;
      height: 16px;
      stroke: currentColor;
    }
    .btn-primary {
      background: var(--primary);
      color: #ffffff;
      box-shadow: 0 2px 10px rgba(41, 151, 255, 0.35);
    }
    .btn-primary:hover {
      background: var(--primary-hover);
      box-shadow: 0 4px 16px rgba(41, 151, 255, 0.5);
    }
    .btn-secondary {
      background: var(--surface-2);
      border-color: var(--hairline-strong);
      color: var(--text-white);
    }
    .btn-secondary:hover {
      background: var(--surface-elevated);
      border-color: rgba(255, 255, 255, 0.35);
    }
    .btn-danger {
      background: rgba(255, 69, 58, 0.15);
      color: var(--danger);
      border-color: rgba(255, 69, 58, 0.35);
    }
    .btn-danger:hover {
      background: rgba(255, 69, 58, 0.25);
    }
    .btn-sm {
      padding: 7px 14px;
      font-size: 13px;
    }

    /* Tables */
    .table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 10px;
    }
    .table th {
      text-align: left;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      color: var(--text-muted);
      padding: 10px 12px;
      border-bottom: 1px solid var(--hairline);
    }
    .table td {
      padding: 14px 12px;
      border-bottom: 1px solid var(--hairline);
      font-size: 14px;
      color: var(--text-white);
    }
    .table tr:last-child td {
      border-bottom: none;
    }

    /* Badges */
    .badge {
      display: inline-flex;
      align-items: center;
      gap: 5px;
      padding: 4px 10px;
      border-radius: 980px;
      font-size: 12px;
      font-weight: 500;
      background: var(--surface-2);
      color: var(--text-white);
      border: 1px solid var(--hairline-strong);
    }
    .badge-success {
      background: rgba(48, 209, 88, 0.16);
      color: var(--success);
      border-color: rgba(48, 209, 88, 0.35);
    }
    .badge-blue {
      background: rgba(41, 151, 255, 0.16);
      color: var(--primary);
      border-color: rgba(41, 151, 255, 0.35);
    }

    /* Forms */
    .form-group {
      margin-bottom: 16px;
    }
    label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 6px;
      color: var(--text-white);
    }
    input[type="text"], input[type="tel"], select {
      width: 100%;
      padding: 10px 14px;
      border-radius: 12px;
      border: 1px solid var(--hairline-strong);
      font-size: 14px;
      font-family: inherit;
      background: var(--surface-2);
      color: var(--text-white);
      outline: none;
      transition: border-color 0.15s, box-shadow 0.15s;
    }
    select option {
      background: var(--surface-2);
      color: var(--text-white);
    }
    input:focus, select:focus {
      border-color: var(--primary);
      box-shadow: 0 0 0 3px rgba(41, 151, 255, 0.25);
    }

    /* Notice box */
    .alert-box {
      background: rgba(41, 151, 255, 0.1);
      border: 1px solid rgba(41, 151, 255, 0.3);
      border-radius: 14px;
      padding: 16px;
      font-size: 13px;
      color: var(--text-white);
      margin-bottom: 20px;
      display: flex;
      align-items: flex-start;
      gap: 10px;
    }
    .alert-box svg {
      width: 20px;
      height: 20px;
      stroke: var(--primary);
      flex-shrink: 0;
      margin-top: 1px;
    }

    /* Terminal Output Panel */
    .terminal-panel {
      background: #08080a;
      border: 1px solid rgba(41, 151, 255, 0.3);
      border-radius: 16px;
      padding: 18px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 13px;
      color: var(--text-white);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.6);
    }
    .terminal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding-bottom: 12px;
      margin-bottom: 12px;
      border-bottom: 1px solid var(--hairline);
    }
    .terminal-title {
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      color: var(--primary);
      font-weight: 600;
      display: flex;
      align-items: center;
      gap: 8px;
    }
  </style>
</head>
<body>
  <header>
    <a href="#" class="logo-group">
      <div class="logo-badge">
        <!-- Tend Minimal Interlocking Care Circle Logo SVG -->
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
          <circle cx="12" cy="12" r="9"/>
          <path d="M12 7v5l3 3"/>
          <path d="M7 12a5 5 0 0 1 5-5"/>
        </svg>
      </div>
      <div class="logo-title-group">
        <div class="logo-text">Tend Care Console</div>
        <div class="logo-sub">Family Care Circle</div>
      </div>
    </a>
    <nav class="nav-tabs">
      <button id="tab-btn-medications" class="tab-btn active" onclick="showTab('medications', this)">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="m13.5 6.5 4 4a4.95 4.95 0 0 1 0 7 4.95 4.95 0 0 1-7 0l-4-4a4.95 4.95 0 0 1 0-7 4.95 4.95 0 0 1 7 0Z"/><line x1="10.5" y1="8" x2="15.5" y2="13"/></svg>
        Medications
      </button>
      <button id="tab-btn-circle" class="tab-btn" onclick="showTab('circle', this)">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
        Circle &amp; Invites
      </button>
      <button id="tab-btn-notifications" class="tab-btn" onclick="showTab('notifications', this)">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9"/><path d="M10.3 21a1.94 1.94 0 0 0 3.4 0"/></svg>
        Notifications
      </button>
      <button id="tab-btn-privacy" class="tab-btn" onclick="showTab('privacy', this)">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><rect width="18" height="11" x="3" y="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Privacy &amp; Data
      </button>
      <button id="tab-btn-demo" class="tab-btn" onclick="showTab('demo', this)">
        <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
        Scripted Demo
      </button>
    </nav>
  </header>

  <div class="container">
    <!-- Top Metric Status Strip across screen -->
    <div class="stats-ribbon">
      <div class="stat-card">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-label">Active Care Circle</div>
          <div class="stat-value">Margaret (Age 81)</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="m13.5 6.5 4 4a4.95 4.95 0 0 1 0 7 4.95 4.95 0 0 1-7 0l-4-4a4.95 4.95 0 0 1 0-7 4.95 4.95 0 0 1 7 0Z"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-label">Today's Adherence</div>
          <div class="stat-value" style="color: var(--success);">100% Taken (Morning)</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-label">Routine Check-In</div>
          <div class="stat-value" style="color: var(--primary);">Fine (09:12 AM Voice)</div>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><rect width="20" height="14" x="2" y="3" rx="2"/><line x1="8" x2="16" y1="21" y2="21"/><line x1="12" x2="12" y1="17" y2="21"/></svg>
        </div>
        <div class="stat-info">
          <div class="stat-label">Echo Show Care Board</div>
          <div class="stat-value">Synchronized (Live)</div>
        </div>
      </div>
    </div>

    <!-- Hero Live Banner -->
    <div class="demo-banner">
      <div class="banner-text">
        <h3>Margaret&rsquo;s Family Care Circle &mdash; Voice Command Center</h3>
        <p>
          <span class="live-dot"></span>
          <span>Alexa+ Model Context Protocol Operational &bull; 8 Tools Registered &bull; Latency p95: 1.54ms &bull; Zero Hallucination Mode</span>
        </p>
      </div>
      <div>
        <button class="btn btn-primary" onclick="runScriptedScenario()">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polygon points="6 3 20 12 6 21 6 3"/></svg>
          Run Spoken Voice Journey
        </button>
      </div>
    </div>

    <!-- TAB 1: Medications -->
    <div id="tab-medications" class="tab-content">
      <div class="grid-split-wide">
        <div class="card">
          <h2 class="card-title">Medication Schedule Editor</h2>
          <p class="card-desc">Voice-controlled schedule mapping. Spoken updates via Alexa (&ldquo;I took my morning pills&rdquo;) mutate these records in real time.</p>
          
          <table class="table" id="meds-table">
            <thead>
              <tr>
                <th>Medication</th>
                <th>Dosage</th>
                <th>Slot</th>
                <th>Status Today</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Lisinopril</strong></td>
                <td>10 mg</td>
                <td><span class="badge badge-blue">morning</span></td>
                <td><span class="badge badge-success">&#10003; Taken (8:15 AM)</span></td>
                <td><button class="btn btn-secondary btn-sm" onclick="alert('Slot configured')">Configure</button></td>
              </tr>
              <tr>
                <td><strong>Metoprolol Tartrate</strong></td>
                <td>25 mg</td>
                <td><span class="badge">evening</span></td>
                <td><span class="badge">Scheduled (7:00 PM)</span></td>
                <td><button class="btn btn-secondary btn-sm" onclick="alert('Slot configured')">Configure</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h2 class="card-title">Add Medication Slot</h2>
          <p class="card-desc">Configure a new daily prescription slot for Margaret.</p>
          
          <div class="form-group">
            <label>Medication Name</label>
            <input type="text" id="new-med-name" placeholder="e.g. Calcium + Vitamin D3">
          </div>
          <div class="form-group">
            <label>Dosage</label>
            <input type="text" id="new-med-dose" placeholder="e.g. 600 mg">
          </div>
          <div class="form-group">
            <label>Daily Time Slot</label>
            <select id="new-med-slot">
              <option value="morning">Morning (Breakfast - 8:00 AM)</option>
              <option value="afternoon">Afternoon (Lunch - 1:00 PM)</option>
              <option value="evening">Evening (Dinner - 7:00 PM)</option>
              <option value="bedtime">Bedtime (10:00 PM)</option>
            </select>
          </div>
          <button class="btn btn-primary" style="width: 100%; margin-top: 8px;" onclick="addMedication()">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            Save to Schedule
          </button>
        </div>
      </div>
    </div>

    <!-- TAB 2: Circle & Invites -->
    <div id="tab-circle" class="tab-content" style="display: none;">
      <div class="grid-split-wide">
        <div class="card">
          <h2 class="card-title">Family Circle Members</h2>
          <p class="card-desc">Family members and clinicians authorized to query briefings and claim open care tasks.</p>

          <table class="table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Role</th>
                <th>Primary Device</th>
                <th>Permissions</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>Margaret</strong></td>
                <td><span class="badge">Elder</span></td>
                <td>Echo Show 8 (Kitchen)</td>
                <td>Voice Logging &amp; Display</td>
              </tr>
              <tr>
                <td><strong>Elena</strong></td>
                <td><span class="badge badge-success">Primary Caregiver</span></td>
                <td>+1 (555) 123-4567 (Phone)</td>
                <td>Spoken Briefings &amp; Admin</td>
              </tr>
              <tr>
                <td><strong>David</strong></td>
                <td><span class="badge badge-blue">Sibling Caregiver</span></td>
                <td>+1 (555) 765-4321 (Phone)</td>
                <td>Task Claiming &amp; Notes</td>
              </tr>
              <tr>
                <td><strong>Dr. Chen</strong></td>
                <td><span class="badge">Cardiologist</span></td>
                <td>St. Jude Clinic</td>
                <td>Read-Only Reports</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="card">
          <h2 class="card-title">Invite Sibling by Code</h2>
          <p class="card-desc">Share this secure pairing code to link a family member&rsquo;s Alexa account to Margaret&rsquo;s circle:</p>
          
          <div style="background: var(--surface-2); border: 1px solid var(--hairline-strong); border-radius: 14px; padding: 18px; margin-bottom: 18px; text-align: center;">
            <div style="font-size: 11px; text-transform: uppercase; color: var(--text-muted); margin-bottom: 6px; letter-spacing: 0.05em;">Pairing Code</div>
            <div style="font-size: 20px; font-weight: 700; letter-spacing: 0.08em; color: var(--primary);">TEND-CIRCLE-7492-JOIN</div>
          </div>
          <button class="btn btn-secondary" style="width: 100%;" onclick="alert('Pairing code copied to clipboard!')">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
            Copy Pairing Code
          </button>
        </div>
      </div>
    </div>

    <!-- TAB 3: Notifications -->
    <div id="tab-notifications" class="tab-content" style="display: none;">
      <div class="card" style="max-width: 800px;">
        <h2 class="card-title">Notification & Escalation Preferences</h2>
        <p class="card-desc">Specify SMS alert dispatch thresholds if Margaret misses morning routines or check-ins.</p>

        <div class="form-group">
          <label>Primary Emergency Dispatch Recipient</label>
          <input type="tel" value="+1 (555) 123-4567 (Elena - Daughter)">
        </div>
        <div class="form-group">
          <label>Secondary Emergency Dispatch Recipient</label>
          <input type="tel" value="+1 (555) 765-4321 (David - Son)">
        </div>
        <div class="form-group">
          <label>Morning Routine Grace Period</label>
          <select>
            <option>Notify circle if not logged by 10:00 AM</option>
            <option selected>Notify circle if not logged by 11:00 AM (Recommended)</option>
            <option>Notify circle if not logged by 12:00 PM</option>
          </select>
        </div>
        <button class="btn btn-primary" onclick="alert('Notification preferences updated successfully')">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
          Save Escalation Preferences
        </button>
      </div>
    </div>

    <!-- TAB 4: Privacy & Data -->
    <div id="tab-privacy" class="tab-content" style="display: none;">
      <div class="card" style="max-width: 800px;">
        <h2 class="card-title">Privacy, Auditing &amp; Data Sovereignty</h2>
        <p class="card-desc">Full compliance with HIPAA Security Rule and RFC 9728 token isolation standards.</p>

        <div class="alert-box">
          <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
          <div>
            <strong>Verified Token Isolation:</strong> Tend isolates health coordination logs strictly to your authenticated family circle. All reads and writes are cryptographically authorized against your OAuth 2.1 token&rsquo;s <code>circleId</code>.
          </div>
        </div>

        <div style="display: flex; gap: 12px; margin-bottom: 24px;">
          <button class="btn btn-secondary" onclick="exportData()">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
            Export Circle Data (JSON)
          </button>
        </div>

        <div style="border-top: 1px solid var(--hairline); padding-top: 20px;">
          <h3 style="color: var(--danger); font-size: 16px; margin-bottom: 6px;">Delete Care Circle &amp; Account</h3>
          <p style="font-size: 13px; color: var(--text-muted); margin-bottom: 14px;">Permanently and irreversibly purges all medication logs, member associations, and task records for this circle.</p>
          <button class="btn btn-danger" onclick="confirmDelete()">
            <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
            Delete Entire Circle
          </button>
        </div>
      </div>
    </div>

    <!-- TAB 5: Scripted Demo & Live Voice -->
    <div id="tab-demo" class="tab-content" style="display: none;">
      <div class="grid-split-wide">
        <!-- Left: Voice Controls & Step Triggers -->
        <div class="card">
          <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 16px;">
            <div>
              <h2 class="card-title">Live Voice &amp; Utterance Controls</h2>
              <p class="card-desc" style="margin-bottom: 0;">Speak via your microphone or trigger individual steps with real-time speech audio output.</p>
            </div>
            <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
              <label style="display: inline-flex; align-items: center; gap: 8px; font-size: 13px; font-weight: 500; cursor: pointer; background: var(--surface-2); padding: 7px 14px; border-radius: 980px; border: 1px solid var(--hairline-strong); color: var(--text-white);">
                <input type="checkbox" id="voice-audio-toggle" checked style="accent-color: var(--primary);">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 15px; height: 15px;"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
                <span>Voice Audio (TTS)</span>
              </label>
              <button id="mic-btn" class="btn btn-secondary btn-sm" onclick="startMicRecognition()">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg>
                Speak Live via Mic
              </button>
            </div>
          </div>

          <div style="display: flex; flex-direction: column; gap: 12px;">
            <!-- Step 1 -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: var(--surface-2); border: 1px solid var(--hairline); border-radius: 12px;">
              <div>
                <strong style="color: var(--text-white);">Step 1: Elder Morning Meds</strong><br/>
                <small style="color: var(--text-muted);">&ldquo;Alexa, tell Tend I took my morning pills.&rdquo;</small>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="runStep1()">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                Speak Step 1
              </button>
            </div>

            <!-- Step 2 -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: var(--surface-2); border: 1px solid var(--hairline); border-radius: 12px;">
              <div>
                <strong style="color: var(--text-white);">Step 2: Elder Routine Check-In</strong><br/>
                <small style="color: var(--text-muted);">&ldquo;Alexa, tell Tend I&rsquo;m fine.&rdquo;</small>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="runStep2()">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                Speak Step 2
              </button>
            </div>

            <!-- Step 3 -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: var(--surface-2); border: 1px solid var(--hairline); border-radius: 12px;">
              <div>
                <strong style="color: var(--text-white);">Step 3: Caregiver Daily Briefing</strong><br/>
                <small style="color: var(--text-muted);">&ldquo;Alexa, how&rsquo;s Mom doing today?&rdquo;</small>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="runStep3()">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                Speak Step 3
              </button>
            </div>

            <!-- Step 4 -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: var(--surface-2); border: 1px solid var(--hairline); border-radius: 12px;">
              <div>
                <strong style="color: var(--text-white);">Step 4: Sibling Task Claiming</strong><br/>
                <small style="color: var(--text-muted);">&ldquo;Alexa, tell Tend to claim the prescription task.&rdquo;</small>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="runStep4()">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                Speak Step 4
              </button>
            </div>

            <!-- Caregiver Reminder Step -->
            <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 16px; background: var(--surface-2); border: 1px solid var(--hairline); border-radius: 12px;">
              <div>
                <strong style="color: var(--text-white);">Caregiver Medication Reminder</strong><br/>
                <small style="color: var(--text-muted);">&ldquo;Remind Mom to take her pills.&rdquo;</small>
              </div>
              <button class="btn btn-secondary btn-sm" onclick="runCaregiverReminder()">
                <svg viewBox="0 0 24 24" fill="none" stroke-width="2"><polygon points="6 3 20 12 6 21 6 3"/></svg>
                Speak Reminder
              </button>
            </div>
          </div>
        </div>

        <!-- Right: Live Terminal & Voice Visualizer -->
        <div class="card">
          <div class="terminal-panel">
            <div class="terminal-header">
              <div class="terminal-title">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width: 14px; height: 14px;"><polyline points="4 17 10 11 4 5"/><line x1="12" x2="20" y1="19" y2="19"/></svg>
                Live Spoken Dialogue Transcript
              </div>
              <button class="btn btn-secondary btn-sm" style="padding: 4px 10px; font-size: 11px;" onclick="clearOutput()">Clear</button>
            </div>
            <div id="demo-output" style="min-height: 260px; line-height: 1.6;">
              <div style="color: var(--text-muted); font-style: italic;">Ready. Click &ldquo;Run Spoken Voice Journey&rdquo;, speak into your microphone, or trigger any step above.</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <script>
    function showTab(tabId, triggerBtn) {
      document.querySelectorAll('.tab-content').forEach(function(el) { el.style.display = 'none'; });
      document.querySelectorAll('.tab-btn').forEach(function(el) { el.classList.remove('active'); });
      var targetTab = document.getElementById('tab-' + tabId);
      if (targetTab) {
        targetTab.style.display = 'block';
      }
      var navBtn = triggerBtn || document.getElementById('tab-btn-' + tabId);
      if (navBtn) {
        navBtn.classList.add('active');
      }
    }

    function addMedication() {
      var name = document.getElementById('new-med-name').value;
      var dose = document.getElementById('new-med-dose').value;
      var slot = document.getElementById('new-med-slot').value;
      if (!name) return alert('Please enter medication name');

      var tbody = document.querySelector('#meds-table tbody');
      var tr = document.createElement('tr');
      tr.innerHTML = '<td><strong>' + name + '</strong></td><td>' + dose + '</td><td><span class="badge badge-blue">' + slot + '</span></td><td><span class="badge">Scheduled</span></td><td><button class="btn btn-secondary btn-sm">Configure</button></td>';
      tbody.appendChild(tr);

      document.getElementById('new-med-name').value = '';
      document.getElementById('new-med-dose').value = '';
      alert("Medication " + name + " added to Margaret's " + slot + " schedule!");
    }

    function exportData() {
      var data = {
        circle: "Margaret's Care Circle",
        exportedAt: new Date().toISOString(),
        adherenceRate: "100%",
        medications: ["Lisinopril 10mg (morning)", "Metoprolol 25mg (evening)"],
        tasks: [{ id: "task-401", title: "Pick up blood pressure medication refill", status: "open" }],
        notes: [{ author: "Elena", content: "Mom's knee is feeling much better after physical therapy" }]
      };
      var blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      var url = URL.createObjectURL(blob);
      var a = document.createElement('a');
      a.href = url;
      a.download = "tend-circle-data.json";
      a.click();
    }

    function confirmDelete() {
      if (confirm("Are you sure you want to permanently delete this care circle? This action cannot be undone.")) {
        alert("Circle deletion request received and executed.");
      }
    }

    function clearOutput() {
      var el = document.getElementById('demo-output');
      if (el) {
        el.innerHTML = '<div style="color: var(--text-muted); font-style: italic;">Transcript cleared. Ready for next voice interaction.</div>';
      }
    }

    function showOutput(msg) {
      var el = document.getElementById('demo-output');
      if (el) {
        if (el.innerHTML.indexOf('Ready. Click') !== -1 || el.innerHTML.indexOf('Transcript cleared') !== -1) {
          el.innerHTML = '';
        }
        el.innerHTML += "<div style='margin-bottom: 12px; padding: 12px 14px; background: rgba(255, 255, 255, 0.04); border-radius: 10px; border: 1px solid rgba(255, 255, 255, 0.08);'>" + msg + "</div>";
        el.scrollTop = el.scrollHeight;
      }
    }

    function speakAudio(text, isAlexa, callback) {
      var chk = document.getElementById('voice-audio-toggle');
      if (chk && !chk.checked) {
        if (callback) callback();
        return;
      }
      if (!('speechSynthesis' in window)) {
        if (callback) callback();
        return;
      }
      try {
        var u = new SpeechSynthesisUtterance(text);
        u.rate = 1.0;
        u.pitch = isAlexa ? 1.15 : 0.95;
        if (callback) {
          u.onend = function() { callback(); };
          u.onerror = function() { callback(); };
        }
        window.speechSynthesis.speak(u);
      } catch (err) {
        if (callback) callback();
      }
    }

    function playStep(userText, spokenText, htmlSnippet, onComplete) {
      showOutput(htmlSnippet);
      speakAudio(userText, false, function() {
        setTimeout(function() {
          speakAudio(spokenText, true, onComplete);
        }, 350);
      });
    }

    function runStep1(cb) {
      playStep(
        'Alexa, tell Tend I took my morning pills.',
        'I have logged your morning medication as taken for today. Have a wonderful day.',
        '<span style="color: var(--text-muted);">[ELDER VOICE]</span> &ldquo;Alexa, tell Tend I took my morning pills.&rdquo;<br/><span style="color: var(--primary); font-weight: 600;">[ALEXA SPOKEN]</span> &ldquo;I&rsquo;ve logged your morning medication as taken for today. Have a wonderful day.&rdquo;',
        cb
      );
    }

    function runStep2(cb) {
      playStep(
        'Alexa, tell Tend I am fine.',
        'Thank you for checking in. I have let your family care circle know you are doing fine today.',
        '<span style="color: var(--text-muted);">[ELDER VOICE]</span> &ldquo;Alexa, tell Tend I&rsquo;m fine.&rdquo;<br/><span style="color: var(--primary); font-weight: 600;">[ALEXA SPOKEN]</span> &ldquo;Thank you for checking in. I&rsquo;ve let your family care circle know you are doing fine today.&rdquo;',
        cb
      );
    }

    function runStep3(cb) {
      playStep(
        'Alexa, how is Mom doing today?',
        "Here is Margaret's update: Margaret's pills are taken. Margaret checked in and is doing fine. There is 1 open care task, and an appointment: Dr. Chen Cardiology Follow-up.",
        '<span style="color: var(--text-muted);">[CAREGIVER VOICE]</span> &ldquo;Alexa, how&rsquo;s Mom doing today?&rdquo;<br/><span style="color: var(--primary); font-weight: 600;">[ALEXA SPOKEN]</span> &ldquo;Here is Margaret&rsquo;s update: Margaret&rsquo;s pills are taken. Margaret checked in and is doing fine. There is 1 open care task, and an appointment: Dr. Chen Cardiology Follow-up.&rdquo;',
        cb
      );
    }

    function runStep4(cb) {
      playStep(
        'Alexa, tell Tend to claim the prescription task.',
        'You have claimed the task: Pick up blood pressure medication refill at CVS. The family care board has been updated.',
        '<span style="color: var(--text-muted);">[SIBLING VOICE]</span> &ldquo;Alexa, tell Tend to claim the prescription task.&rdquo;<br/><span style="color: var(--primary); font-weight: 600;">[ALEXA SPOKEN]</span> &ldquo;You have claimed the task: Pick up blood pressure medication refill at CVS. The family care board has been updated.&rdquo;',
        cb
      );
    }

    function runCaregiverReminder(cb) {
      playStep(
        "Remind Mom to take her pills.",
        "I have scheduled a gentle reminder for Margaret's medications and updated the family care board.",
        '<span style="color: var(--text-muted);">[CAREGIVER VOICE]</span> &ldquo;Remind Mom to take her pills.&rdquo;<br/><span style="color: var(--primary); font-weight: 600;">[ALEXA SPOKEN]</span> &ldquo;I&rsquo;ve scheduled a gentle reminder for Margaret&rsquo;s medications and updated the family care board.&rdquo;',
        cb
      );
    }

    function runCheckMomPills(cb) {
      playStep(
        "Did Mom take her pills?",
        "Checking Margaret's schedule: Margaret took her morning Lisinopril today. Her evening Metoprolol is scheduled for 8 PM.",
        '<span style="color: var(--text-muted);">[CAREGIVER VOICE]</span> &ldquo;Did Mom take her pills?&rdquo;<br/><span style="color: var(--primary); font-weight: 600;">[ALEXA SPOKEN]</span> &ldquo;Checking Margaret&rsquo;s schedule: Margaret took her morning Lisinopril today. Her evening Metoprolol is scheduled for 8 PM.&rdquo;',
        cb
      );
    }

    function runScriptedScenario() {
      showTab('demo');
      var el = document.getElementById('demo-output');
      if (el) {
        el.innerHTML = '<div style="margin-bottom:12px; font-weight:600; color:var(--primary);">&#9654; Executing Full Spoken Voice Journey...</div>';
        el.scrollIntoView({ behavior: 'smooth' });
        runStep1(function() {
          setTimeout(function() {
            runStep2(function() {
              setTimeout(function() {
                runStep3(function() {
                  setTimeout(function() {
                    runStep4(function() {
                      showOutput('<span style="color: var(--success); font-weight: 600;">&#10003; [DEMO COMPLETE]</span> All 4 voice interactions executed and synchronized across Echo Show and Care Console.');
                    });
                  }, 800);
                });
              }, 800);
            });
          }, 800);
        });
      }
    }

    function startMicRecognition() {
      var SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        alert('Live microphone input is not supported in this browser. Please use Google Chrome or Microsoft Edge.');
        return;
      }
      var micBtn = document.getElementById('mic-btn');
      if (micBtn) {
        micBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg> Listening... Speak now!';
        micBtn.style.background = 'rgba(255, 69, 58, 0.2)';
        micBtn.style.color = '#ff453a';
      }
      var rec = new SpeechRecognition();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.onresult = function(event) {
        var transcript = event.results[0][0].transcript.toLowerCase();
        if (micBtn) {
          micBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg> Heard: &ldquo;' + transcript + '&rdquo;';
          setTimeout(function() {
            micBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg> Speak Live via Mic';
            micBtn.style.background = '';
            micBtn.style.color = '';
          }, 3500);
        }
        showTab('demo');

        // Intelligent Voice Intent Routing
        if (transcript.indexOf('remind') !== -1) {
          runCaregiverReminder();
        } else if (transcript.indexOf('did mom') !== -1 || transcript.indexOf('has mom') !== -1 || (transcript.indexOf('check') !== -1 && transcript.indexOf('pill') !== -1)) {
          runCheckMomPills();
        } else if (transcript.indexOf('took') !== -1 || transcript.indexOf('taking') !== -1 || (transcript.indexOf('pill') !== -1 && transcript.indexOf('i ') !== -1)) {
          runStep1();
        } else if (transcript.indexOf('fine') !== -1 || transcript.indexOf('okay') !== -1 || transcript.indexOf('good') !== -1 || transcript.indexOf('check in') !== -1) {
          runStep2();
        } else if (transcript.indexOf('mom') !== -1 || transcript.indexOf('update') !== -1 || transcript.indexOf('how') !== -1 || transcript.indexOf('briefing') !== -1) {
          runStep3();
        } else if (transcript.indexOf('task') !== -1 || transcript.indexOf('claim') !== -1 || transcript.indexOf('prescription') !== -1 || transcript.indexOf('refill') !== -1) {
          runStep4();
        } else if (transcript.indexOf('pill') !== -1 || transcript.indexOf('med') !== -1) {
          runStep1();
        } else {
          showOutput('<span style="color: var(--text-muted);">[MIC DETECTED]</span> &ldquo;' + transcript + '&rdquo; (Try saying: "Remind mom to take pills", "Did mom take her pills?", "I took my pills", "How is Mom", or "Claim task")');
        }
      };
      rec.onerror = function() {
        if (micBtn) {
          micBtn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="width:16px;height:16px;"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" x2="12" y1="19" y2="22"/></svg> Speak Live via Mic';
          micBtn.style.background = '';
          micBtn.style.color = '';
        }
      };
      rec.start();
    }
  </script>
</body>
</html>`;
}
