# ☕ HackathonHelper — Apache Tomcat, Java Servlets & JSP Backend

> **Enterprise Multi-User Hackathon Platform built with Java EE Servlets, JSP, JDBC, and SQL.**

---

## 📂 Architecture Overview

```
tomcat-backend/
├── database/
│   └── schema.sql                  # Complete SQL DDL & DML (Users, Teams, Milestones, Alerts, Messages)
├── src/
│   └── com/hackathonhelper/
│       ├── servlet/
│       │   ├── AuthServlet.java          # Validates email (regex) & passwords, manages HttpSession
│       │   ├── TeamLeadServlet.java      # Team Leader controls & broadcast alert engine
│       │   ├── MilestoneAlertServlet.java# Detects incomplete work and outputs alert popup data
│       │   └── ChatServlet.java          # Multi-tab real-time team chat endpoint
│       └── util/
│           └── DBConnection.java         # JDBC Connection Manager (MySQL/PostgreSQL/SQLite)
└── web/
    ├── WEB-INF/
    │   └── web.xml                 # Official Apache Tomcat Deployment Descriptor
    ├── index.jsp                   # Authentication Portal with strict validation & 1-click test logins
    ├── dashboard.jsp               # Sprint Dashboard with real-time Incomplete Work Popup Box
    └── warroom.jsp                 # Real-time multi-member chat room with auto-polling AJAX
```

---

## 🗄️ SQL Database Tables Included (`database/schema.sql`)

1. **`users`** — User credentials, strict email validation, role, and `is_team_lead` flag.
2. **`teams`** — Hackathon squads with foreign key reference to the Team Lead.
3. **`team_members`** — Squad membership relationships across domains.
4. **`milestones`** — 5-phase sprint burndown with percentage progress tracking.
5. **`alerts`** — Real-time high-priority alerts (`INCOMPLETE_WORK`, `MILESTONE_DONE`, `URGENT_BROADCAST`).
6. **`chat_messages`** — Synchronized message history with timestamps and sender roles.

---

## 🚀 How to Run on Apache Tomcat

### Option A: Using Eclipse IDE (Recommended for College Labs)
1. Open **Eclipse IDE for Enterprise Java and Web Developers**.
2. Click **File** → **Import** → **General** → **Projects from Folder or Archive**.
3. Select the `C:\Users\Teja\OneDrive\Desktop\html\tomcat-backend` folder.
4. Right-click the project → **Run As** → **Run on Server** → Select **Apache Tomcat v9.0 / v10.0**.
5. The application will start at `http://localhost:8080/HackathonHelper/index.jsp`.

### Option B: Using Standalone Apache Tomcat
1. Copy the contents of the `web/` folder to your Tomcat `webapps/ROOT/` (or `webapps/hackathon/`) directory.
2. Compile the Java files in `src/` to `.class` files into `WEB-INF/classes/`.
3. Start Tomcat by running `bin/startup.bat`.
4. Open your browser at `http://localhost:8080/`.

---

## 🧪 How to Demonstrate Multi-Tab Real-Time Alerts to Your Teacher:

1. **Open Tab 1 (Team Lead):**
   - Go to `index.jsp` and click **"Alex Chen (Team Lead)"**.
   - You are now logged in as the **Team Lead** with the golden `👑 Team Lead` badge.

2. **Open Tab 2 (Incognito or Second Tab as Teammate):**
   - Go to `index.jsp` and click **"Priya Sharma (ML Teammate)"**.
   - You are now logged in as a **Team Member**.

3. **Demonstrate Real-Time Alert Popup Box:**
   - In Tab 1, click **"⚠️ Alert Incomplete Work"**.
   - **Immediately in Tab 2**, an animated **Red Alert Popup Box** appears:
     > *"⚠️ Work Not Completed Alert! Team Lead Alex Chen noticed Phase 3 is behind schedule!"*
   - Click **"Acknowledge & Continue"** to dismiss.

4. **Demonstrate Real-Time Chat:**
   - In Tab 2, open **"Open War Room"** and type: *"FastAPI endpoints are deployed!"*
   - In Tab 1, open **"Open War Room"** — the message appears instantly with the member's role badge!
