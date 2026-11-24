<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
    String userName = (String) session.getAttribute("userName");
    String userRole = (String) session.getAttribute("userRole");
    String userEmail = (String) session.getAttribute("userEmail");
    Boolean isTeamLead = (Boolean) session.getAttribute("isTeamLead");
    if (userName == null) {
        userName = "Alex Chen";
        userRole = "FullStack Developer";
        isTeamLead = true;
    }
    if (isTeamLead == null) isTeamLead = false;
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HackathonHelper - Dashboard & Sprint Hub</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { background: #070b14; color: #f1f5f9; min-height: 100vh; padding: 24px; }
        .container { max-width: 1100px; margin: 0 auto; }
        header { display: flex; justify-content: space-between; align-items: center; padding-bottom: 20px; border-bottom: 1px solid rgba(255,255,255,0.08); margin-bottom: 24px; flex-wrap: wrap; gap: 16px; }
        .logo { font-size: 22px; font-weight: 900; background: linear-gradient(135deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        .user-tag { background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(99, 102, 241, 0.3); padding: 8px 16px; border-radius: 999px; font-size: 13px; display: flex; align-items: center; gap: 10px; }
        .lead-badge { background: #f59e0b; color: #020617; font-weight: 800; padding: 2px 8px; border-radius: 999px; font-size: 11px; }
        .member-badge { background: #38bdf8; color: #020617; font-weight: 800; padding: 2px 8px; border-radius: 999px; font-size: 11px; }
        
        /* Team Lead Quick Bar */
        .lead-bar { background: rgba(30, 27, 75, 0.6); border: 1px solid rgba(129, 140, 248, 0.3); border-radius: 18px; padding: 16px 20px; margin-bottom: 28px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
        .btn-lead { background: #ef4444; color: #fff; border: none; padding: 8px 14px; border-radius: 10px; font-size: 12px; font-weight: 700; cursor: pointer; transition: transform 0.1s; }
        .btn-lead:hover { opacity: 0.9; }
        .btn-done { background: #10b981; color: #020617; }
        .btn-custom { background: #6366f1; color: #fff; }

        /* Grid */
        .grid { display: grid; grid-template-columns: 2fr 1fr; gap: 24px; }
        @media(max-width: 800px) { .grid { grid-template-columns: 1fr; } }

        .card { background: rgba(15, 23, 42, 0.7); border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; padding: 24px; backdrop-filter: blur(10px); }
        h2 { font-size: 18px; font-weight: 800; margin-bottom: 16px; display: flex; align-items: center; gap: 8px; }

        /* Milestone items */
        .milestone-item { background: rgba(2, 6, 23, 0.6); border: 1px solid rgba(255, 255, 255, 0.06); padding: 14px 16px; border-radius: 14px; margin-bottom: 12px; }
        .m-header { display: flex; justify-content: space-between; margin-bottom: 6px; font-size: 13px; font-weight: 700; }
        .progress-bar-bg { background: #1e293b; height: 8px; border-radius: 999px; overflow: hidden; margin-top: 6px; }
        .progress-bar-fill { height: 100%; border-radius: 999px; background: linear-gradient(90deg, #38bdf8, #10b981); }

        /* POPUP ALERT MODAL */
        .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(8px); display: none; align-items: center; justify-content: center; z-index: 1000; padding: 20px; }
        .modal-box { background: linear-gradient(135deg, #1e112a, #0b0f19); border: 2px solid #ef4444; border-radius: 24px; padding: 32px; max-width: 480px; width: 100%; box-shadow: 0 0 50px rgba(239, 68, 68, 0.3); text-align: center; }
        .modal-box h3 { font-size: 20px; font-weight: 900; color: #fff; margin: 12px 0 8px; }
        .modal-box p { font-size: 14px; color: #cbd5e1; line-height: 1.5; margin-bottom: 20px; }
        .modal-btn { background: #ef4444; color: #fff; border: none; padding: 10px 24px; border-radius: 12px; font-weight: 700; cursor: pointer; font-size: 14px; }
    </style>
</head>
<body>

<div class="container">
    <header>
        <div>
            <div class="logo">🚀 HackathonHelper</div>
            <span style="font-size:11px;color:#94a3b8;">Apache Tomcat 9.0/10.0 • Java Servlets & JSP Architecture</span>
        </div>

        <div style="display:flex;align-items:center;gap:12px;">
            <div class="user-tag">
                <span><%= userName %></span>
                <span class="<%= isTeamLead ? "lead-badge" : "member-badge" %>">
                    <%= isTeamLead ? "👑 Team Lead" : "💻 Member" %>
                </span>
            </div>
            <a href="warroom.jsp" style="text-decoration:none;background:#6366f1;color:#fff;padding:8px 16px;border-radius:12px;font-size:12px;font-weight:700;">💬 Open War Room</a>
            <form action="auth" method="POST" style="margin:0;">
                <input type="hidden" name="action" value="logout">
                <button type="submit" style="background:transparent;border:1px solid #475569;color:#94a3b8;padding:8px 12px;border-radius:12px;font-size:12px;cursor:pointer;">Sign Out</button>
            </form>
        </div>
    </header>

    <!-- Team Lead Interactive Controls Bar -->
    <div class="lead-bar">
        <div>
            <strong style="font-size:13px;color:#cbd5e1;">Team Leader Command Bar:</strong>
            <form action="teamlead" method="POST" style="display:inline;margin-left:8px;">
                <input type="hidden" name="action" value="toggle_role">
                <button type="submit" style="background:none;border:none;color:#818cf8;text-decoration:underline;cursor:pointer;font-size:11px;">
                    (Switch to <%= isTeamLead ? "Member Role" : "Team Lead Role" %>)
                </button>
            </form>
        </div>

        <div style="display:flex;gap:8px;flex-wrap:wrap;">
            <!-- Alert Incomplete Work Button -->
            <form action="teamlead" method="POST" style="margin:0;">
                <input type="hidden" name="action" value="alert_incomplete">
                <input type="hidden" name="milestoneTitle" value="Phase 3: Core MVP Build">
                <button type="submit" class="btn-lead">⚠️ Alert Incomplete Work</button>
            </form>

            <!-- Milestone Done Button -->
            <form action="teamlead" method="POST" style="margin:0;">
                <input type="hidden" name="action" value="milestone_completed">
                <input type="hidden" name="milestoneTitle" value="Phase 2: Architecture & DB Schema">
                <button type="submit" class="btn-lead btn-done">🎉 Milestone Done</button>
            </form>

            <!-- Custom Broadcast Button -->
            <button onclick="triggerBroadcastPrompt()" class="btn-lead btn-custom">📢 Broadcast Alert</button>
        </div>
    </div>

    <!-- Main Content Grid -->
    <div class="grid">
        <!-- 48-Hour Sprint Milestones -->
        <div class="card">
            <h2>⏱️ 48-Hour Sprint Progress & Task Burndown</h2>
            
            <div class="milestone-item">
                <div class="m-header">
                    <span>Phase 1: Problem Definition & Ideation (0-4h)</span>
                    <span style="color:#10b981;">100% Completed ✓</span>
                </div>
                <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:100%;"></div></div>
            </div>

            <div class="milestone-item">
                <div class="m-header">
                    <span>Phase 2: System Architecture & DB Schema (4-12h)</span>
                    <span style="color:#10b981;">100% Completed ✓</span>
                </div>
                <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:100%;"></div></div>
            </div>

            <div class="milestone-item" style="border-color:rgba(239, 68, 68, 0.4);background:rgba(239, 68, 68, 0.05);">
                <div class="m-header">
                    <span>Phase 3: Core MVP Build & ML Pipeline (12-32h)</span>
                    <span style="color:#ef4444;font-weight:800;">45% Incomplete (Urgent Alert) ⚠️</span>
                </div>
                <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:45%;background:#ef4444;"></div></div>
            </div>

            <div class="milestone-item">
                <div class="m-header">
                    <span>Phase 4: Integration, Testing & Bug Bashes (32-42h)</span>
                    <span style="color:#94a3b8;">Pending (0%)</span>
                </div>
                <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:0%;"></div></div>
            </div>

            <div class="milestone-item">
                <div class="m-header">
                    <span>Phase 5: Slide Deck & Final Demo Pitch (42-48h)</span>
                    <span style="color:#94a3b8;">Pending (0%)</span>
                </div>
                <div class="progress-bar-bg"><div class="progress-bar-fill" style="width:0%;"></div></div>
            </div>
        </div>

        <!-- Squad Status -->
        <div class="card">
            <h2>👥 Squad Status</h2>
            <div style="font-size:13px;line-height:2.2;">
                <div>🟢 <strong>Alex Chen</strong> <span style="font-size:10px;color:#f59e0b;">(Team Lead)</span></div>
                <div>🟢 <strong>Priya Sharma</strong> <span style="font-size:10px;color:#38bdf8;">(ML Engineer)</span></div>
                <div>🟢 <strong>Marcus Vance</strong> <span style="font-size:10px;color:#a855f7;">(Backend Architect)</span></div>
                <div>🟢 <strong>Elena Rostova</strong> <span style="font-size:10px;color:#ec4899;">(UI/UX Designer)</span></div>
            </div>
            <div style="margin-top:20px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.08);">
                <a href="warroom.jsp" style="display:block;text-align:center;background:rgba(99,102,241,0.2);border:1px solid #6366f1;color:#fff;padding:10px;border-radius:12px;text-decoration:none;font-size:12px;font-weight:700;">Open Team War Room Chat 💬</a>
            </div>
        </div>
    </div>
</div>

<!-- REAL-TIME INTERACTIVE ALERT POPUP BOX -->
<div id="alertPopupModal" class="modal-overlay">
    <div class="modal-box">
        <div style="font-size:42px;">⚠️</div>
        <h3 id="alertTitle">Alert: Work Not Completed!</h3>
        <p id="alertMessage">Team Lead Alex Chen flagged Phase 3 (Core MVP Build). The milestone is currently at 45% completion! Please push your code updates immediately.</p>
        <button class="modal-btn" onclick="dismissAlert()">Acknowledge & Continue</button>
    </div>
</div>

<script>
    function triggerBroadcastPrompt() {
        const msg = prompt("Enter urgent alert for all team members across all tabs:");
        if (msg && msg.trim()) {
            const form = document.createElement("form");
            form.method = "POST";
            form.action = "teamlead";
            const a1 = document.createElement("input");
            a1.type = "hidden"; a1.name = "action"; a1.value = "custom_broadcast";
            const a2 = document.createElement("input");
            a2.type = "hidden"; a2.name = "message"; a2.value = msg;
            form.appendChild(a1); form.appendChild(a2);
            document.body.appendChild(form);
            form.submit();
        }
    }

    // Play Alert Sound
    function playChime() {
        try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.frequency.setValueAtTime(600, ctx.currentTime);
            osc.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.2);
            gain.gain.setValueAtTime(0.2, ctx.currentTime);
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.start();
            osc.stop(ctx.currentTime + 0.3);
        } catch(e) {}
    }

    function showAlert(title, msg) {
        document.getElementById('alertTitle').innerText = title;
        document.getElementById('alertMessage').innerText = msg;
        document.getElementById('alertPopupModal').style.display = 'flex';
        playChime();
    }

    function dismissAlert() {
        document.getElementById('alertPopupModal').style.display = 'none';
    }

    // Auto-poll Servlet every 2.5 seconds for instant multi-tab alerts
    let lastAlertTime = 0;
    setInterval(function() {
        fetch('milestones')
            .then(res => res.json())
            .then(data => {
                if (data.hasAlert) {
                    showAlert(data.title, data.message);
                }
            }).catch(() => {});
    }, 2500);

    // If query param alert_sent is present
    const params = new URLSearchParams(window.location.search);
    if (params.get('alert_sent') === 'true') {
        showAlert("⚠️ Alert Broadcasted Successfully!", "All team members in open tabs have been notified with the urgent alert popup.");
    }
</script>

</body>
</html>
