<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%
    String userName = (String) session.getAttribute("userName");
    Boolean isTeamLead = (Boolean) session.getAttribute("isTeamLead");
    if (userName == null) userName = "Alex Chen";
    if (isTeamLead == null) isTeamLead = false;
%>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>HackathonHelper - Team War Room Chat</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
        body { background: #070b14; color: #f1f5f9; min-height: 100vh; display: flex; flex-direction: column; }
        header { background: #0f172a; border-bottom: 1px solid rgba(255,255,255,0.08); padding: 16px 24px; display: flex; justify-content: space-between; align-items: center; }
        .logo { font-size: 18px; font-weight: 900; color: #fff; }
        .back-link { color: #818cf8; text-decoration: none; font-size: 13px; font-weight: 600; }
        .chat-container { max-width: 800px; width: 100%; margin: 24px auto; flex: 1; display: flex; flex-direction: column; background: #0b1120; border: 1px solid rgba(255,255,255,0.08); border-radius: 20px; overflow: hidden; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
        .chat-header { background: #0f172a; padding: 14px 20px; border-bottom: 1px solid rgba(255,255,255,0.08); display: flex; justify-content: space-between; align-items: center; }
        .online-dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; display: inline-block; margin-right: 6px; }
        .messages-list { flex: 1; padding: 20px; overflow-y: auto; height: 420px; display: flex; flex-direction: column; gap: 14px; }
        .msg-bubble { max-width: 75%; padding: 12px 16px; border-radius: 16px; font-size: 13px; line-height: 1.5; }
        .msg-me { align-self: flex-end; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: #fff; border-bottom-right-radius: 4px; }
        .msg-other { align-self: flex-start; background: #1e293b; color: #e2e8f0; border: 1px solid rgba(255,255,255,0.06); border-bottom-left-radius: 4px; }
        .msg-meta { font-size: 10px; opacity: 0.7; margin-bottom: 4px; display: flex; gap: 6px; align-items: center; }
        .role-badge { background: rgba(0,0,0,0.3); padding: 1px 6px; border-radius: 4px; font-weight: 700; color: #fde047; }
        .input-bar { background: #0f172a; padding: 16px 20px; border-top: 1px solid rgba(255,255,255,0.08); display: flex; gap: 10px; }
        .input-bar input { flex: 1; padding: 12px 16px; background: #020617; border: 1px solid rgba(255,255,255,0.1); border-radius: 12px; color: #fff; font-size: 13px; outline: none; }
        .btn-send { background: #6366f1; color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 700; font-size: 13px; cursor: pointer; }
    </style>
</head>
<body>

<header>
    <div class="logo">🚀 Hackathon Squad War Room</div>
    <div style="display:flex;align-items:center;gap:16px;">
        <span style="font-size:12px;color:#94a3b8;">Logged in as: <strong><%= userName %></strong> <%= isTeamLead ? "(👑 Lead)" : "" %></span>
        <a href="dashboard.jsp" class="back-link">← Back to Dashboard</a>
    </div>
</header>

<div class="chat-container">
    <div class="chat-header">
        <div>
            <span class="online-dot"></span>
            <strong style="font-size:13px;color:#f8fafc;">Live Squad Channel (Multi-Tab Real-Time Sync)</strong>
        </div>
        <span style="font-size:11px;color:#94a3b8;">Members Online: 4</span>
    </div>

    <div class="messages-list" id="messagesList">
        <!-- Messages loaded dynamically via AJAX -->
    </div>

    <form class="input-bar" id="chatForm" onsubmit="handleChatSubmit(event)">
        <input type="text" id="chatInput" placeholder="Type a message to the team or lead..." autocomplete="off" required>
        <button type="submit" class="btn-send">Send 🚀</button>
    </form>
</div>

<script>
    const currentUserName = "<%= userName %>";

    function loadMessages() {
        fetch('chat')
            .then(res => res.json())
            .then(messages => {
                const list = document.getElementById('messagesList');
                list.innerHTML = "";
                messages.forEach(m => {
                    const isMe = m.sender.includes(currentUserName);
                    const div = document.createElement('div');
                    div.className = "msg-bubble " + (isMe ? "msg-me" : "msg-other");
                    div.innerHTML = `
                        <div class="msg-meta">
                            <strong>\${m.sender}</strong>
                            <span class="role-badge">\${m.role}</span>
                            <span>\${m.time}</span>
                        </div>
                        <div>\${m.text}</div>
                    `;
                    list.appendChild(div);
                });
                list.scrollTop = list.scrollHeight;
            }).catch(() => {});
    }

    function handleChatSubmit(e) {
        e.preventDefault();
        const input = document.getElementById('chatInput');
        const text = input.value.trim();
        if (!text) return;

        input.value = "";
        const params = new URLSearchParams();
        params.append('text', text);

        fetch('chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: params.toString()
        }).then(() => {
            loadMessages();
        });
    }

    // Initial load
    loadMessages();

    // Auto-refresh chat every 1.5 seconds for instant multi-tab communication!
    setInterval(loadMessages, 1500);
</script>

</body>
</html>
