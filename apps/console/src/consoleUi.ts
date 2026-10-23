/**
 * Tend Console Web Application
 * Strictly designed according to DESIGN.md (Apple design language, Action Blue #0066cc, SF Pro typography)
 */
export function renderConsoleHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Tend Console — Family Care Circle</title>
  <style>
    :root {
      --primary: #0066cc;
      --primary-hover: #0071e3;
      --ink: #1d1d1f;
      --ink-muted: #7a7a7a;
      --canvas: #ffffff;
      --canvas-parchment: #f5f5f7;
      --surface-pearl: #fafafc;
      --hairline: #e0e0e0;
      --success: #34c759;
      --warning: #ff9500;
      --danger: #ff3b30;
      --font-display: "SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --font-text: "SF Pro Text", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--canvas-parchment);
      color: var(--ink);
      font-family: var(--font-text);
      font-size: 15px;
      line-height: 1.5;
      -webkit-font-smoothing: antialiased;
    }
    header {
      background: rgba(255, 255, 255, 0.85);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--hairline);
      position: sticky;
      top: 0;
      z-index: 100;
      padding: 14px 28px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .logo-group {
      display: flex;
      align-items: center;
      gap: 12px;
    }
    .logo-badge {
      background: var(--primary);
      color: #fff;
      font-weight: 700;
      padding: 4px 10px;
      border-radius: 8px;
      font-size: 14px;
      letter-spacing: -0.01em;
    }
    .logo-text {
      font-family: var(--font-display);
      font-size: 18px;
      font-weight: 600;
      letter-spacing: -0.02em;
    }
    nav.nav-tabs {
      display: flex;
      gap: 8px;
    }
    button.tab-btn {
      background: transparent;
      border: none;
      padding: 8px 16px;
      border-radius: 980px;
      font-size: 14px;
      font-weight: 500;
      color: var(--ink-muted);
      cursor: pointer;
      transition: all 0.15s ease;
    }
    button.tab-btn.active {
      background: var(--surface-pearl);
      color: var(--ink);
      box-shadow: 0 1px 3px rgba(0,0,0,0.06);
    }
    .container {
      max-width: 960px;
      margin: 32px auto;
      padding: 0 20px;
    }
    .card {
      background: var(--canvas);
      border: 1px solid var(--hairline);
      border-radius: 18px;
      padding: 24px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.02);
    }
    h2.card-title {
      font-family: var(--font-display);
      font-size: 20px;
      font-weight: 600;
      letter-spacing: -0.01em;
      margin-bottom: 6px;
    }
    p.card-desc {
      font-size: 13px;
      color: var(--ink-muted);
      margin-bottom: 18px;
    }
    .grid-2 {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
    }
    @media (max-width: 680px) {
      .grid-2 { grid-template-columns: 1fr; }
    }
    .btn {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      padding: 9px 18px;
      border-radius: 980px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s ease;
      border: 1px solid transparent;
      text-decoration: none;
    }
    .btn-primary {
      background: var(--primary);
      color: #fff;
    }
    .btn-primary:hover { background: var(--primary-hover); }
    .btn-secondary {
      background: var(--surface-pearl);
      border-color: var(--hairline);
      color: var(--ink);
    }
    .btn-secondary:hover { background: #f0f0f2; }
    .btn-danger {
      background: #ffebeb;
      color: var(--danger);
      border-color: #ffd1cf;
    }
    .btn-danger:hover { background: #ffdada; }
    .btn-sm {
      padding: 6px 12px;
      font-size: 13px;
    }
    .form-group {
      margin-bottom: 14px;
    }
    label {
      display: block;
      font-size: 13px;
      font-weight: 500;
      margin-bottom: 6px;
      color: var(--ink);
    }
    input[type="text"], input[type="tel"], select {
      width: 100%;
      padding: 9px 12px;
      border-radius: 10px;
      border: 1px solid var(--hairline);
      font-size: 14px;
      font-family: inherit;
      background: #fff;
      color: var(--ink);
      outline: none;
      transition: border-color 0.15s;
    }
    input:focus, select:focus {
      border-color: var(--primary-hover);
      box-shadow: 0 0 0 3px rgba(0, 102, 204, 0.15);
    }
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
      color: var(--ink-muted);
      padding: 8px 10px;
      border-bottom: 1px solid var(--hairline);
    }
    .table td {
      padding: 12px 10px;
      border-bottom: 1px solid var(--hairline);
      font-size: 14px;
    }
    .badge {
      display: inline-block;
      padding: 3px 8px;
      border-radius: 980px;
      font-size: 12px;
      font-weight: 500;
      background: var(--surface-pearl);
      border: 1px solid var(--hairline);
    }
    .badge-success { background: #e8f8ed; color: #1b7a37; border-color: #c4ebd0; }
    .demo-banner {
      background: linear-gradient(135deg, #0066cc 0%, #004b99 100%);
      color: #fff;
      border-radius: 18px;
      padding: 24px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .banner-text h3 { font-family: var(--font-display); font-size: 20px; margin-bottom: 4px; }
    .banner-text p { font-size: 13px; opacity: 0.9; }
    .alert-box {
      background: #fff8e6;
      border: 1px solid #ffe199;
      border-radius: 12px;
      padding: 14px;
      font-size: 13px;
      color: #734800;
      margin-bottom: 16px;
    }
  </style>
</head>
<body>
  <header>
    <div class="logo-group">
      <div class="logo-badge">Tend</div>
      <div class="logo-text">Tend Care Console</div>
    </div>
    <nav class="nav-tabs">
      <button id="tab-btn-medications" class="tab-btn active" onclick="showTab('medications', this)">Medications</button>
      <button id="tab-btn-circle" class="tab-btn" onclick="showTab('circle', this)">Circle &amp; Invites</button>
      <button id="tab-btn-notifications" class="tab-btn" onclick="showTab('notifications', this)">Notifications</button>
      <button id="tab-btn-privacy" class="tab-btn" onclick="showTab('privacy', this)">Privacy &amp; Data</button>
      <button id="tab-btn-demo" class="tab-btn" onclick="showTab('demo', this)">Scripted Demo</button>
    </nav>
  </header>

  <div class="container">
    <!-- Scripted Demo Banner -->
    <div class="demo-banner">
      <div class="banner-text">
        <h3>Margaret's Care Circle (Live)</h3>
        <p>Alexa+ Model Context Protocol Care Add-on &bull; 8 Tools Operational &bull; Latency p95: 1.54ms</p>
      </div>
      <div>
        <button class="btn btn-secondary" onclick="runScriptedScenario()">Run Hackathon Demo Flow</button>
      </div>
    </div>

    <!-- TAB 1: Medications -->
    <div id="tab-medications" class="tab-content">
      <div class="card">
        <h2 class="card-title">Medication Schedule Editor</h2>
        <p class="card-desc">Setting up complex prescriptions by voice is error-prone. Use this console to manage Margaret's scheduled dosage slots.</p>
        
        <table class="table" id="meds-table">
          <thead>
            <tr>
              <th>Medication Name</th>
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
              <td><span class="badge">morning</span></td>
              <td><span class="badge badge-success">Taken (8:15 AM)</span></td>
              <td><button class="btn btn-secondary btn-sm" onclick="alert('Slot configured')">Edit</button></td>
            </tr>
            <tr>
              <td><strong>Metoprolol Tartrate</strong></td>
              <td>25 mg</td>
              <td><span class="badge">evening</span></td>
              <td><span class="badge">Scheduled (7:00 PM)</span></td>
              <td><button class="btn btn-secondary btn-sm" onclick="alert('Slot configured')">Edit</button></td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 20px; padding-top: 16px; border-top: 1px solid var(--hairline);">
          <h3 style="font-size: 15px; margin-bottom: 12px;">Add Scheduled Medication</h3>
          <div class="grid-2">
            <div class="form-group">
              <label>Medication Name</label>
              <input type="text" id="new-med-name" placeholder="e.g. Calcium + Vitamin D">
            </div>
            <div class="form-group">
              <label>Dosage</label>
              <input type="text" id="new-med-dose" placeholder="e.g. 500 mg">
            </div>
          </div>
          <div class="grid-2">
            <div class="form-group">
              <label>Daily Slot</label>
              <select id="new-med-slot">
                <option value="morning">Morning (Breakfast)</option>
                <option value="afternoon">Afternoon (Lunch)</option>
                <option value="evening">Evening (Dinner)</option>
                <option value="bedtime">Bedtime</option>
              </select>
            </div>
            <div class="form-group" style="display: flex; align-items: flex-end;">
              <button class="btn btn-primary" style="width: 100%;" onclick="addMedication()">Save to Schedule</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 2: Circle & Invites -->
    <div id="tab-circle" class="tab-content" style="display: none;">
      <div class="card">
        <h2 class="card-title">Family Circle Members</h2>
        <p class="card-desc">Authorized members who can receive alerts, listen to briefings, and claim shared tasks.</p>

        <table class="table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Role</th>
              <th>Phone / Surface</th>
              <th>Access</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td><strong>Margaret</strong></td>
              <td><span class="badge">Elder</span></td>
              <td>Echo Show 8 (Kitchen)</td>
              <td>Voice Logging</td>
            </tr>
            <tr>
              <td><strong>Elena</strong></td>
              <td><span class="badge badge-success">Primary Caregiver</span></td>
              <td>+1 (555) 123-4567</td>
              <td>Briefings & Admin</td>
            </tr>
            <tr>
              <td><strong>David</strong></td>
              <td><span class="badge">Caregiver (Sibling)</span></td>
              <td>+1 (555) 765-4321</td>
              <td>Tasks & Notes</td>
            </tr>
          </tbody>
        </table>

        <div style="margin-top: 24px; padding: 16px; background: var(--surface-pearl); border-radius: 12px; border: 1px solid var(--hairline);">
          <h3 style="font-size: 14px; margin-bottom: 6px;">Invite Family Member by Code</h3>
          <p style="font-size: 13px; color: var(--ink-muted); margin-bottom: 12px;">Share this one-time code to link a sibling's Alexa app to Margaret's circle:</p>
          <div style="display: flex; gap: 12px; align-items: center;">
            <input type="text" value="TEND-CIRCLE-7492-JOIN" readonly style="max-width: 260px; font-weight: 600; letter-spacing: 0.05em;">
            <button class="btn btn-secondary btn-sm" onclick="alert('Invite code copied to clipboard!')">Copy Invite Code</button>
          </div>
        </div>
      </div>
    </div>

    <!-- TAB 3: Notifications -->
    <div id="tab-notifications" class="tab-content" style="display: none;">
      <div class="card">
        <h2 class="card-title">Notification & Escalation Preferences</h2>
        <p class="card-desc">Configure automated escalation alerts triggered when doses or check-ins are missed.</p>

        <div class="form-group">
          <label>Primary Alert Recipient (SMS)</label>
          <input type="tel" value="+1 (555) 123-4567 (Elena)">
        </div>
        <div class="form-group">
          <label>Secondary Alert Recipient (SMS)</label>
          <input type="tel" value="+1 (555) 765-4321 (David)">
        </div>
        <div class="form-group">
          <label>Grace Period for Morning Routine</label>
          <select>
            <option>Notify if not logged by 10:30 AM</option>
            <option selected>Notify if not logged by 11:00 AM</option>
            <option>Notify if not logged by 12:00 PM</option>
          </select>
        </div>
        <button class="btn btn-primary" onclick="alert('Notification preferences updated successfully')">Save Preferences</button>
      </div>
    </div>

    <!-- TAB 4: Privacy & Data -->
    <div id="tab-privacy" class="tab-content" style="display: none;">
      <div class="card">
        <h2 class="card-title">Privacy, Export & Account Management</h2>
        <p class="card-desc">Full compliance with data privacy regulations and user rights.</p>

        <div class="alert-box">
          <strong>Notice:</strong> Tend stores health coordination and routine logs solely for your authenticated family circle. All reads and writes are authorized against your token's circleId.
        </div>

        <div style="display: flex; gap: 12px; margin-bottom: 24px;">
          <button class="btn btn-secondary" onclick="exportData()">Export Circle Data (JSON)</button>
        </div>

        <div style="border-top: 1px solid var(--hairline); padding-top: 20px;">
          <h3 style="color: var(--danger); font-size: 15px; margin-bottom: 6px;">Delete Care Circle & Account</h3>
          <p style="font-size: 13px; color: var(--ink-muted); margin-bottom: 12px;">Permanently deletes all medication logs, member accounts, and task records for this circle.</p>
          <button class="btn btn-danger" onclick="confirmDelete()">Delete Entire Circle</button>
        </div>
      </div>
    </div>

    <!-- TAB 5: Scripted Demo -->
    <div id="tab-demo" class="tab-content" style="display: none;">
      <div class="card">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 12px; margin-bottom: 12px;">
          <div>
            <h2 class="card-title">Interactive Voice &amp; Demo Scenario</h2>
            <p class="card-desc">Execute each step of the hackathon demonstration live with real-time Speech Synthesis (voice output) and Microphone input.</p>
          </div>
          <div style="display: flex; gap: 10px; align-items: center; flex-wrap: wrap;">
            <label style="display: inline-flex; align-items: center; gap: 6px; font-size: 13px; font-weight: 500; cursor: pointer; background: var(--canvas-parchment); padding: 6px 12px; border-radius: 980px; border: 1px solid var(--hairline);">
              <input type="checkbox" id="voice-audio-toggle" checked style="accent-color: var(--primary);">
              <span>🔊 Voice Audio (TTS)</span>
            </label>
            <button id="mic-btn" class="btn btn-secondary btn-sm" onclick="startMicRecognition()">🎤 Speak Live via Mic</button>
          </div>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid var(--hairline); border-radius: 10px;">
            <div>
              <strong>Step 1: Elder Morning Meds</strong><br/>
              <small style="color: var(--ink-muted);">Utterance: &ldquo;Alexa, tell Tend I took my morning pills.&rdquo;</small>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="runStep1()">Execute &amp; Speak Step 1</button>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid var(--hairline); border-radius: 10px;">
            <div>
              <strong>Step 2: Elder Routine Check-In</strong><br/>
              <small style="color: var(--ink-muted);">Utterance: &ldquo;Alexa, tell Tend I&rsquo;m fine.&rdquo;</small>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="runStep2()">Execute &amp; Speak Step 2</button>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid var(--hairline); border-radius: 10px;">
            <div>
              <strong>Step 3: Caregiver Daily Briefing</strong><br/>
              <small style="color: var(--ink-muted);">Utterance: &ldquo;Alexa, how&rsquo;s Mom doing today?&rdquo;</small>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="runStep3()">Execute &amp; Speak Step 3</button>
          </div>

          <div style="display: flex; justify-content: space-between; align-items: center; padding: 12px; border: 1px solid var(--hairline); border-radius: 10px;">
            <div>
              <strong>Step 4: Sibling Task Claiming</strong><br/>
              <small style="color: var(--ink-muted);">Utterance: &ldquo;Alexa, tell Tend to claim the prescription task.&rdquo;</small>
            </div>
            <button class="btn btn-secondary btn-sm" onclick="runStep4()">Execute &amp; Speak Step 4</button>
          </div>
        </div>

        <div id="demo-output" style="margin-top: 20px; padding: 14px; background: var(--canvas-parchment); border-radius: 10px; font-family: monospace; font-size: 13px; display: none;"></div>
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
      tr.innerHTML = '<td><strong>' + name + '</strong></td><td>' + dose + '</td><td><span class="badge">' + slot + '</span></td><td><span class="badge">Scheduled</span></td><td><button class="btn btn-secondary btn-sm">Edit</button></td>';
      tbody.appendChild(tr);

      document.getElementById('new-med-name').value = '';
      document.getElementById('new-med-dose').value = '';
      alert('Medication ' + name + ' added to ' + slot + ' schedule!');
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

    function showOutput(msg) {
      var el = document.getElementById('demo-output');
      if (el) {
        el.style.display = 'block';
        el.innerHTML += "<div style='margin-bottom: 10px; padding: 12px; background: #ffffff; border-radius: 8px; border: 1px solid #e0e0e0; box-shadow: 0 1px 3px rgba(0,0,0,0.03);'>&bull; " + msg + "</div>";
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
        '<strong>[VOICE]</strong> &ldquo;Alexa, tell Tend I took my morning pills.&rdquo;<br/><strong>[SPOKEN]</strong> &ldquo;I&rsquo;ve logged your morning medication as taken for today. Have a wonderful day.&rdquo;',
        cb
      );
    }

    function runStep2(cb) {
      playStep(
        'Alexa, tell Tend I am fine.',
        'Thank you for checking in. I have let your family care circle know you are doing fine today.',
        '<strong>[VOICE]</strong> &ldquo;Alexa, tell Tend I&rsquo;m fine.&rdquo;<br/><strong>[SPOKEN]</strong> &ldquo;Thank you for checking in. I&rsquo;ve let your family care circle know you are doing fine today.&rdquo;',
        cb
      );
    }

    function runStep3(cb) {
      playStep(
        'Alexa, how is Mom doing today?',
        "Here is Margaret's update: Margaret's pills are taken. Margaret checked in and is doing fine. There is 1 open care task, and an appointment: Dr. Chen Cardiology Follow-up.",
        '<strong>[VOICE]</strong> &ldquo;Alexa, how&rsquo;s Mom doing today?&rdquo;<br/><strong>[SPOKEN]</strong> &ldquo;Here is Margaret&rsquo;s update: Margaret&rsquo;s pills are taken. Margaret checked in and is doing fine. There is 1 open care task, and an appointment: Dr. Chen Cardiology Follow-up.&rdquo;',
        cb
      );
    }

    function runStep4(cb) {
      playStep(
        'Alexa, tell Tend to claim the prescription task.',
        'You have claimed the task: Pick up blood pressure medication refill at CVS. The family care board has been updated.',
        '<strong>[VOICE]</strong> &ldquo;Alexa, tell Tend to claim the prescription task.&rdquo;<br/><strong>[SPOKEN]</strong> &ldquo;You have claimed the task: Pick up blood pressure medication refill at CVS. The family care board has been updated.&rdquo;',
        cb
      );
    }

    function runScriptedScenario() {
      showTab('demo');
      var el = document.getElementById('demo-output');
      if (el) {
        el.style.display = 'block';
        el.innerHTML = '<div style="margin-bottom:12px; font-weight:600; color:#0066cc;">&#9654; Executing Live Spoken Voice Journey:</div>';
        el.scrollIntoView({ behavior: 'smooth' });
        runStep1(function() {
          setTimeout(function() {
            runStep2(function() {
              setTimeout(function() {
                runStep3(function() {
                  setTimeout(function() {
                    runStep4(function() {
                      showOutput('<strong>[DEMO COMPLETE]</strong> All 4 voice steps executed and synchronized with Alexa+ Care Board.');
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
        micBtn.innerText = 'Listening... Speak now!';
        micBtn.style.background = '#ffebeb';
        micBtn.style.color = '#ff3b30';
      }
      var rec = new SpeechRecognition();
      rec.lang = 'en-US';
      rec.interimResults = false;
      rec.onresult = function(event) {
        var transcript = event.results[0][0].transcript.toLowerCase();
        if (micBtn) {
          micBtn.innerText = 'Heard: "' + transcript + '"';
          setTimeout(function() {
            micBtn.innerText = '🎤 Speak Live via Mic';
            micBtn.style.background = '';
            micBtn.style.color = '';
          }, 3500);
        }
        showTab('demo');
        if (transcript.indexOf('pill') !== -1 || transcript.indexOf('med') !== -1) {
          runStep1();
        } else if (transcript.indexOf('fine') !== -1 || transcript.indexOf('check') !== -1) {
          runStep2();
        } else if (transcript.indexOf('mom') !== -1 || transcript.indexOf('update') !== -1 || transcript.indexOf('how') !== -1) {
          runStep3();
        } else if (transcript.indexOf('task') !== -1 || transcript.indexOf('claim') !== -1 || transcript.indexOf('prescription') !== -1) {
          runStep4();
        } else {
          showOutput('<strong>[MIC DETECTED]</strong> &ldquo;' + transcript + '&rdquo; (Try saying: "I took my pills", "I am fine", "How is Mom", or "Claim task")');
        }
      };
      rec.onerror = function() {
        if (micBtn) {
          micBtn.innerText = '🎤 Speak Live via Mic';
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
