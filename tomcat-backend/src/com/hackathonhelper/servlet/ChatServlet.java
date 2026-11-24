package com.hackathonhelper.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

/**
 * ChatServlet - Real-Time Team War Room Chat.
 * Allows Team Lead and team members in different tabs or browsers to chat instantly.
 */
public class ChatServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    // In-memory synchronized message store for fast multi-tab chat
    private static final List<ChatMessage> MESSAGES = Collections.synchronizedList(new ArrayList<>());

    static {
        MESSAGES.add(new ChatMessage("Priya Sharma", "ML Engineer", "FastAPI endpoints and PyTorch model loaded! Ready for team testing.", "10:15 AM"));
        MESSAGES.add(new ChatMessage("Marcus Vance", "Backend Architect", "PostgreSQL tables seeded and live on port 5432.", "10:18 AM"));
        MESSAGES.add(new ChatMessage("Alex Chen", "👑 Team Lead", "Awesome! Let us complete Phase 3 by Hour 32.", "10:22 AM"));
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        PrintWriter out = response.getWriter();
        StringBuilder json = new StringBuilder("[");
        synchronized (MESSAGES) {
            for (int i = 0; i < MESSAGES.size(); i++) {
                ChatMessage m = MESSAGES.get(i);
                json.append("{\"sender\":\"").append(escapeJson(m.sender))
                    .append("\",\"role\":\"").append(escapeJson(m.role))
                    .append("\",\"text\":\"").append(escapeJson(m.text))
                    .append("\",\"time\":\"").append(escapeJson(m.time))
                    .append("\"}");
                if (i < MESSAGES.size() - 1) json.append(",");
            }
        }
        json.append("]");
        out.print(json.toString());
        out.flush();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        HttpSession session = request.getSession();
        String text = request.getParameter("text");
        String senderName = (String) session.getAttribute("userName");
        if (senderName == null) senderName = "Teammate";
        Boolean isLead = (Boolean) session.getAttribute("isTeamLead");
        String role = (isLead != null && isLead) ? "👑 Team Lead" : (String) session.getAttribute("userRole");
        if (role == null) role = "Developer";

        if (text != null && !text.trim().isEmpty()) {
            java.text.SimpleDateFormat sdf = new java.text.SimpleDateFormat("hh:mm a");
            String time = sdf.format(new java.util.Date());
            MESSAGES.add(new ChatMessage(senderName, role, text.trim(), time));
        }

        // If AJAX request, return success JSON; else redirect back to war room
        String isAjax = request.getHeader("X-Requested-With");
        if ("XMLHttpRequest".equalsIgnoreCase(isAjax)) {
            response.setContentType("application/json");
            response.getWriter().print("{\"status\":\"success\"}");
        } else {
            response.sendRedirect("warroom.jsp");
        }
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"").replace("\n", " ");
    }

    public static class ChatMessage {
        public String sender;
        public String role;
        public String text;
        public String time;

        public ChatMessage(String sender, String role, String text, String time) {
            this.sender = sender;
            this.role = role;
            this.text = text;
            this.time = time;
        }
    }
}
