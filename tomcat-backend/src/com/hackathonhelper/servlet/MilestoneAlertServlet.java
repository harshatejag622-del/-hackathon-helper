package com.hackathonhelper.servlet;

import java.io.IOException;
import java.io.PrintWriter;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;

/**
 * MilestoneAlertServlet - Endpoint to check hackathon progress and pending tasks.
 * Returns JSON or triggers alert popup box data for incomplete work.
 */
public class MilestoneAlertServlet extends HttpServlet {
    private static final long serialVersionUID = 1L;

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) 
            throws ServletException, IOException {
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");

        TeamLeadServlet.AlertDTO latest = (TeamLeadServlet.AlertDTO) getServletContext().getAttribute("latestAlert");

        PrintWriter out = response.getWriter();
        if (latest != null) {
            out.print("{\"hasAlert\": true, \"type\": \"" + escapeJson(latest.type) + "\", \"title\": \"" + 
                      escapeJson(latest.title) + "\", \"message\": \"" + escapeJson(latest.message) + "\", \"sender\": \"" + 
                      escapeJson(latest.sender) + "\"}");
        } else {
            out.print("{\"hasAlert\": false}");
        }
        out.flush();
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\"", "\\\"").replace("\n", " ");
    }
}
