# 🚀 HackathonHelper

> **AI-Powered 24–48 Hour Innovation Marathon Platform**  
> Bridging team formation, idea generation bottlenecks, and real-time sprint execution with Three.js 3D visualizations and Firebase.

---

## 🌟 Key Features

1. **3D Interactive Hackathon Hall:** Immersive Three.js environment with floating particles, glowing stages, and dynamic lighting.
2. **AI Team Synergy Matching:** Vector cosine-similarity algorithm computing 40% skills + 30% interests + 30% role synergy, visualized in an interactive 3D constellation graph.
3. **Intelligent Idea Generator:** Google Gemini Pro integration transforming problem keywords into hackathon-ready problem statements and architectural blueprints.
4. **48-Hour Smart Timeline Planner:** Milestone burndown with custom interactive Gantt chart and real-time "NOW" progress needle.
5. **Team War Room Chat:** Real-time messaging with presence detection, typing indicators, file attachments, and 3D reactive shockwaves.
6. **Multi-Theme Switcher:** Cyberpunk, Dark Void, and Night themes powered by Tailwind CSS & DaisyUI.

---

## 🛠️ Tech Stack

- **Frontend:** React 18, Vite, Tailwind CSS, DaisyUI, Framer Motion, Lucide Icons
- **3D Graphics:** Three.js, `@react-three/fiber`, `@react-three/drei`
- **Database & Auth:** Firebase Authentication & Cloud Firestore
- **AI Engine:** Google Gemini API
- **Deployment:** Vercel SPA configuration

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env` and fill in your Firebase & Gemini keys:
```bash
cp .env.example .env
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### 4. Build for Production
```bash
npm run build
```
