<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HackathonHelper - Sign In (Apache Tomcat & Servlets)</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { background: #090d16; color: #f1f5f9; min-height: 100vh; display: flex; align-items: center; justify-content: center; padding: 20px; }
        .card { background: rgba(15, 23, 42, 0.85); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 24px; padding: 36px; max-width: 480px; width: 100%; box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7); backdrop-filter: blur(12px); }
        .badge { display: inline-block; background: rgba(99, 102, 241, 0.2); color: #818cf8; padding: 4px 12px; border-radius: 999px; font-size: 11px; font-weight: bold; margin-bottom: 12px; text-transform: uppercase; letter-spacing: 1px; }
        h1 { font-size: 26px; font-weight: 900; margin-bottom: 6px; background: linear-gradient(135deg, #818cf8, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        p.subtitle { color: #94a3b8; font-size: 13px; margin-bottom: 24px; }
        .alert-error { background: rgba(244, 63, 94, 0.15); border: 1px solid rgba(244, 63, 94, 0.4); color: #f43f5e; padding: 12px; border-radius: 12px; font-size: 12px; margin-bottom: 20px; font-weight: 600; }
        .form-group { margin-bottom: 16px; }
        label { display: block; font-size: 12px; font-weight: 600; color: #cbd5e1; margin-bottom: 6px; }
        input[type="text"], input[type="email"], input[type="password"], select { width: 100%; padding: 12px 14px; background: #020617; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px; color: #fff; font-size: 14px; outline: none; transition: border 0.2s; }
        input:focus { border-color: #6366f1; box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.2); }
        .btn { width: 100%; padding: 13px; background: linear-gradient(135deg, #6366f1, #a855f7); color: #fff; border: none; border-radius: 12px; font-size: 14px; font-weight: 700; cursor: pointer; transition: transform 0.1s, opacity 0.2s; margin-top: 8px; }
        .btn:hover { opacity: 0.95; }
        .btn:active { transform: scale(0.98); }
        .demo-bar { background: rgba(30, 41, 59, 0.6); border: 1px solid rgba(255, 255, 255, 0.08); padding: 14px; border-radius: 16px; margin-bottom: 22px; }
        .demo-bar h4 { font-size: 11px; text-transform: uppercase; color: #94a3b8; margin-bottom: 8px; font-weight: 700; }
        .demo-btns { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .demo-btn { background: #0f172a; border: 1px solid rgba(99, 102, 241, 0.3); color: #cbd5e1; padding: 8px; border-radius: 8px; font-size: 11px; font-weight: 600; cursor: pointer; text-align: left; }
        .demo-btn:hover { background: rgba(99, 102, 241, 0.2); border-color: #818cf8; color: #fff; }
        .checkbox-label { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #e2e8f0; margin-top: 10px; cursor: pointer; }
        .toggle-link { text-align: center; margin-top: 18px; font-size: 12px; color: #818cf8; cursor: pointer; }
    </style>
</head>
<body>

<div class="card">
    <div class="badge">Apache Tomcat • Java Servlets & JSP</div>
    <h1>🚀 HackathonHelper</h1>
    <p class="subtitle">Multi-User Innovation Marathon Platform with Strict Authentication</p>

    <!-- Error Banner -->
    <% 
        String error = (String) request.getAttribute("error");
        if (error != null) { 
    %>
        <div class="alert-error">⚠️ <%= error %></div>
    <% } %>

    <!-- Multi-Tab Quick Demo Logins -->
    <div class="demo-bar">
        <h4>1-Click Multi-Tab Demo Logins (Try Tab 1 as Lead, Tab 2 as Member):</h4>
        <div class="demo-btns">
            <button class="demo-btn" onclick="fillDemo('alex.chen@hackathon.edu', 'pass123', true)">
                👑 <strong>Alex Chen</strong><br><span style="font-size:10px;color:#818cf8;">Tab 1 (Team Lead)</span>
            </button>
            <button class="demo-btn" onclick="fillDemo('priya.sharma@berkeley.edu', 'pass123', false)">
                💻 <strong>Priya Sharma</strong><br><span style="font-size:10px;color:#38bdf8;">Tab 2 (ML Teammate)</span>
            </button>
        </div>
    </div>

    <!-- Auth Form -->
    <form id="authForm" action="auth" method="POST">
        <input type="hidden" name="action" id="actionField" value="login">

        <div class="form-group" id="nameGroup" style="display:none;">
            <label>Full Name</label>
            <input type="text" name="fullName" id="fullName" placeholder="e.g. Harsha Teja">
        </div>

        <div class="form-group">
            <label>Email Address (Strict Validation)</label>
            <input type="email" name="email" id="email" required placeholder="name@university.edu" oninput="validateEmailLive(this.value)">
            <span id="emailTip" style="font-size:10px;color:#94a3b8;display:block;margin-top:4px;">Must be a valid format: user@domain.edu</span>
        </div>

        <div class="form-group">
            <label>Password (Min 6 Chars, Letters & Numbers)</label>
            <input type="password" name="password" id="password" required minlength="6" placeholder="••••••••">
        </div>

        <div class="form-group" id="roleGroup" style="display:none;">
            <label>Preferred Hackathon Domain</label>
            <select name="preferredRole">
                <option value="FullStack">Full Stack Developer</option>
                <option value="ML Engineer">Machine Learning / AI</option>
                <option value="Backend Architect">Backend & Databases</option>
                <option value="UI/UX Designer">UI/UX & Frontend</option>
                <option value="Cloud & DevOps">DevOps & Infrastructure</option>
            </select>

            <label class="checkbox-label" style="margin-top:14px;">
                <input type="checkbox" name="isTeamLead" value="true">
                <span>Designate me as 👑 <strong>Team Lead</strong></span>
            </label>
        </div>

        <button type="submit" class="btn" id="submitBtn">Sign In to Hackathon Squad</button>
    </form>

    <div class="toggle-link" onclick="toggleMode()">
        <span id="toggleText">Don't have an account? Sign Up with validation</span>
    </div>
</div>

<script>
    let isRegister = false;

    function toggleMode() {
        isRegister = !isRegister;
        document.getElementById('actionField').value = isRegister ? 'register' : 'login';
        document.getElementById('nameGroup').style.display = isRegister ? 'block' : 'none';
        document.getElementById('roleGroup').style.display = isRegister ? 'block' : 'none';
        document.getElementById('submitBtn').innerText = isRegister ? 'Create Validated Account' : 'Sign In to Hackathon Squad';
        document.getElementById('toggleText').innerText = isRegister ? 'Already have an account? Sign In' : "Don't have an account? Sign Up with validation";
    }

    function fillDemo(email, pass, isLead) {
        document.getElementById('email').value = email;
        document.getElementById('password').value = pass;
        validateEmailLive(email);
    }

    function validateEmailLive(val) {
        const regex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const tip = document.getElementById('emailTip');
        if (regex.test(val)) {
            tip.innerText = "✓ Valid email format accepted";
            tip.style.color = "#34d399";
        } else {
            tip.innerText = "⚠️ Enter a valid email (e.g. user@domain.edu)";
            tip.style.color = "#f43f5e";
        }
    }
</script>

</body>
</html>
