package com.hackathonhelper.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import java.sql.Connection;
import java.sql.PreparedStatement;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;
import com.hackathonhelper.util.DBConnection;

/**
 * TeamLeadServlet - Manages Team Leader controls, milestone progress updates,
 * and broadcasts alerts to all team members across tabs and sessions.
 */
public class TeamLeadServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        HttpSession session = request.getSession();
        String action = request.getParameter("action");
        String leaderName = (String) session.getAttribute("userName");
        if (leaderName == null) leaderName = "Alex Chen (Team Lead)";

        // 1. Broadcast Incomplete Work Warning
        if ("alert_incomplete".equalsIgnoreCase(action)) {
            String milestoneTitle = request.getParameter("milestoneTitle");
            if (milestoneTitle == null) milestoneTitle = "Phase 3: Core MVP Build";
            
            String title = "⚠️ Work Not Completed Alert!";
            String message = leaderName + " noticed " + milestoneTitle + " is behind schedule! Please push commits and report status in War Room Chat.";
            
            saveAlertToDb(1, title, message, "INCOMPLETE_WORK");
            getServletContext().setAttribute("latestAlert", new AlertDTO(title, message, "INCOMPLETE_WORK", leaderName));
            
            response.sendRedirect("dashboard.jsp?alert_sent=true");
            return;
        }

        // 2. Broadcast Milestone Completed
        if ("milestone_completed".equalsIgnoreCase(action)) {
            String milestoneTitle = request.getParameter("milestoneTitle");
            if (milestoneTitle == null) milestoneTitle = "Phase 2: System Architecture & DB";

            String title = "🎉 Milestone Completed!";
            String message = leaderName + " marked " + milestoneTitle + " as 100% finished! Great job team, moving to the next sprint phase.";

            saveAlertToDb(1, title, message, "MILESTONE_DONE");
            getServletContext().setAttribute("latestAlert", new AlertDTO(title, message, "MILESTONE_DONE", leaderName));

            response.sendRedirect("dashboard.jsp?alert_sent=true");
            return;
        }

        // 3. Custom Broadcast Message
        if ("custom_broadcast".equalsIgnoreCase(action)) {
            String customMsg = request.getParameter("message");
            if (customMsg != null && !customMsg.trim().isEmpty()) {
                String title = "📢 Team Lead Urgent Announcement";
                saveAlertToDb(1, title, customMsg.trim(), "URGENT_BROADCAST");
                getServletContext().setAttribute("latestAlert", new AlertDTO(title, customMsg.trim(), "URGENT_BROADCAST", leaderName));
            }
            response.sendRedirect("dashboard.jsp?alert_sent=true");
            return;
        }

        // 4. Toggle Team Lead Role
        if ("toggle_role".equalsIgnoreCase(action)) {
            Boolean currentLead = (Boolean) session.getAttribute("isTeamLead");
            boolean nextRole = (currentLead == null) ? true : !currentLead;
            session.setAttribute("isTeamLead", nextRole);
            response.sendRedirect("dashboard.jsp");
            return;
        }

        response.sendRedirect("dashboard.jsp");
    }

    private void saveAlertToDb(int teamId, String title, String message, String type) {
        Connection conn = null;
        PreparedStatement ps = null;
        try {
            conn = DBConnection.getConnection();
            String sql = "INSERT INTO alerts (team_id, sender_id, alert_type, title, message, is_popup) VALUES (?, ?, ?, ?, ?, ?)";
            ps = conn.prepareStatement(sql);
            ps.setInt(1, teamId);
            ps.setInt(2, 1);
            ps.setString(3, type);
            ps.setString(4, title);
            ps.setString(5, message);
            ps.setBoolean(6, true);
            ps.executeUpdate();
        } catch (Exception e) {
            // Silently fall back to Application Context storage
        } finally {
            try {
                if (ps != null) ps.close();
                if (conn != null) conn.close();
            } catch (Exception ignored) {}
        }
    }

    // Lightweight DTO for Servlet Context broadcast
    public static class AlertDTO {
        public String title;
        public String message;
        public String type;
        public String sender;
        public long timestamp;

        public AlertDTO(String title, String message, String type, String sender) {
            this.title = title;
            this.message = message;
            this.type = type;
            this.sender = sender;
            this.timestamp = System.currentTimeMillis();
        }
    }
}
