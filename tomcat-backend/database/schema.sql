-- ==============================================================================
-- HackathonHelper — SQL Database Schema
-- Compatible with MySQL 8.0+, PostgreSQL, SQLite, and Apache Derby/H2
-- ==============================================================================

-- 1. USERS TABLE (Stores participant accounts & roles)
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    college VARCHAR(150),
    preferred_role VARCHAR(50) DEFAULT 'Developer',
    skills TEXT,
    is_team_lead BOOLEAN DEFAULT FALSE,
    avatar_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. TEAMS TABLE (Stores hackathon squads)
CREATE TABLE IF NOT EXISTS teams (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    team_lead_id INT NOT NULL,
    project_title VARCHAR(200),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_lead_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 3. TEAM_MEMBERS TABLE (Many-to-many relationship)
CREATE TABLE IF NOT EXISTS team_members (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    user_id INT NOT NULL,
    role_in_team VARCHAR(50) DEFAULT 'Member',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 4. MILESTONES TABLE (Sprint progress across the 48-hour marathon)
CREATE TABLE IF NOT EXISTS milestones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    phase_number INT NOT NULL,
    title VARCHAR(150) NOT NULL,
    time_range VARCHAR(50) NOT NULL,
    domain VARCHAR(50) NOT NULL,
    status VARCHAR(30) DEFAULT 'PENDING', -- PENDING, IN_PROGRESS, COMPLETED
    progress_percent INT DEFAULT 0,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE
);

-- 5. ALERTS TABLE (Real-time Team Lead announcements & Incomplete Work warnings)
CREATE TABLE IF NOT EXISTS alerts (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    sender_id INT NOT NULL,
    alert_type VARCHAR(30) NOT NULL, -- INCOMPLETE_WORK, MILESTONE_DONE, URGENT_BROADCAST
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    is_popup BOOLEAN DEFAULT TRUE,
    is_acknowledged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- 6. CHAT_MESSAGES TABLE (Team War Room live messages)
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    team_id INT NOT NULL,
    sender_id INT NOT NULL,
    sender_name VARCHAR(100) NOT NULL,
    sender_role VARCHAR(50) NOT NULL,
    message_text TEXT NOT NULL,
    attachment_name VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (team_id) REFERENCES teams(id) ON DELETE CASCADE,
    FOREIGN KEY (sender_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ==============================================================================
-- INITIAL SEED DATA (For Immediate Out-Of-The-Box Testing)
-- ==============================================================================

-- Seed Users
INSERT INTO users (email, password_hash, full_name, college, preferred_role, skills, is_team_lead) VALUES 
('alex.chen@hackathon.edu', 'pass123', 'Alex Chen', 'Stanford University', 'FullStack', 'React, Node.js, Python', TRUE),
('priya.sharma@berkeley.edu', 'pass123', 'Priya Sharma', 'UC Berkeley', 'ML Engineer', 'PyTorch, Python, FastAPI', FALSE),
('marcus.vance@mit.edu', 'pass123', 'Marcus Vance', 'MIT', 'Backend Architect', 'Go, Docker, PostgreSQL', FALSE),
('elena.rostova@cmu.edu', 'pass123', 'Elena Rostova', 'Carnegie Mellon', 'UI/UX Designer', 'Figma, Tailwind, CSS', FALSE);

-- Seed Team
INSERT INTO teams (team_name, team_lead_id, project_title) VALUES 
('Alpha Squad 48h', 1, 'AI-Powered Bio-Telemetry Assistant');

-- Seed Team Members
INSERT INTO team_members (team_id, user_id, role_in_team) VALUES 
(1, 1, 'Team Lead'),
(1, 2, 'ML Engineer'),
(1, 3, 'Backend Architect'),
(1, 4, 'UI/UX Designer');

-- Seed 5 Hackathon Sprint Milestones
INSERT INTO milestones (team_id, phase_number, title, time_range, domain, status, progress_percent) VALUES 
(1, 1, 'Phase 1: Problem Definition & Ideation', 'Hours 0-4', 'Design', 'COMPLETED', 100),
(1, 2, 'Phase 2: System Architecture & DB Schema', 'Hours 4-12', 'Backend', 'COMPLETED', 100),
(1, 3, 'Phase 3: Core MVP Build & ML Inference', 'Hours 12-32', 'ML', 'IN_PROGRESS', 45),
(1, 4, 'Phase 4: Integration, Testing & Bug Bashes', 'Hours 32-42', 'DevOps', 'PENDING', 0),
(1, 5, 'Phase 5: Slide Deck & Final Demo Pitch', 'Hours 42-48', 'FullStack', 'PENDING', 0);

-- Seed Initial Team Messages
INSERT INTO chat_messages (team_id, sender_id, sender_name, sender_role, message_text) VALUES 
(1, 1, 'Alex Chen', '👑 Team Lead', 'Welcome squad! Phase 1 & 2 are done. We need to push the Phase 3 ML endpoints today!'),
(1, 2, 'Priya Sharma', 'ML Engineer', 'FastAPI models are ready on port 8000. Testing accuracy now!'),
(1, 3, 'Marcus Vance', 'Backend Architect', 'PostgreSQL database connection pool is set up and working.');
