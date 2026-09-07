import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInvites } from '../context/InviteContext';
import { getActiveProject } from '../services/geminiService';
import { generateSquadTimeline, MILESTONES, DOMAIN_COLORS } from '../utils/timelineEngine';
import AdminPanel from './AdminPanel';
import { 
  User, 
  Users, 
  Lightbulb, 
  Clock, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  Edit, 
  GraduationCap, 
  Code, 
  Star, 
  ShieldCheck, 
  TrendingUp, 
  Layers, 
  PlayCircle,
  ExternalLink,
  Zap,
  Bookmark,
  ChevronRight,
  Flame
} from 'lucide-react';

export default function DashboardView({ onNavigate }) {
  const { currentUser, userProfile } = useAuth();
  const { acceptedTeammates } = useInvites();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [isAdminMode, setIsAdminMode] = useState(false);

  // Active user profile fallback
  const profile = userProfile || {
    displayName: currentUser?.displayName || 'Alex Chen',
    college: 'UC Berkeley / Innovation Lab',
    year: '4th Year',
    preferredRole: 'FullStack',
    availability: 'Full-time',
    skills: ['Python', 'React', 'FastAPI', 'PyTorch', 'Docker'],
    interests: ['Artificial Intelligence', 'HealthTech & Bio', 'Sustainability']
  };

  // Compile active squad members
  const squadMembers = [
    {
      displayName: profile.displayName + ' (You)',
      preferredRole: profile.preferredRole,
      skills: profile.skills,
      isLeader: true,
      isOnline: true
    },
    ...acceptedTeammates.map(t => ({
      displayName: t.toName || t.fromName || 'Teammate',
      preferredRole: t.toRole || t.fromRole || 'ML Engineer',
      skills: ['Python', 'Docker'],
      isLeader: false,
      isOnline: true
    }))
  ];

  // Default teammates if solo
  if (squadMembers.length < 4) {
    const fallbackMates = [
      { displayName: 'Priya Sharma', preferredRole: 'ML', skills: ['PyTorch', 'FastAPI'], isOnline: true },
      { displayName: 'Marcus Vance', preferredRole: 'Backend', skills: ['Go', 'PostgreSQL'], isOnline: true },
      { displayName: 'Elena Rostova', preferredRole: 'Design', skills: ['Figma', 'UI/UX'], isOnline: true }
    ];
    fallbackMates.forEach(m => {
      if (squadMembers.length < 4) squadMembers.push(m);
    });
  }

  // Load project & tasks on mount
  useEffect(() => {
    async function load() {
      const activeProj = await getActiveProject(currentUser?.uid);
      if (activeProj) {
        setProject(activeProj);
      } else {
        // High quality default concept
        setProject({
          name: 'AIPulse Sentinel',
          tagline: 'Real-time proactive bio-telemetry powered by AI and Healthcare',
          problemStatement: 'Critical health anomalies go unnoticed until emergency hospital admission is unavoidable.',
          solution: 'An intelligent low-power background daemon detecting micro-trends with multimodal wearable sensor telemetry.',
          techStack: ['React', 'FastAPI', 'PyTorch', 'Gemini Pro', 'Docker'],
          innovationScore: 9.4
        });
      }

      const cachedTasks = localStorage.getItem(`hh_timeline_tasks_${currentUser?.uid}`);
      if (cachedTasks) {
        try {
          setTasks(JSON.parse(cachedTasks));
          return;
        } catch (e) {}
      }

      const generated = generateSquadTimeline(squadMembers, activeProj?.name);
      setTasks(generated);
    }
    load();
  }, [currentUser]);

  const handleToggleTask = (taskId) => {
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === taskId) {
          const next = t.status === 'pending' ? 'in-progress' : t.status === 'in-progress' ? 'completed' : 'pending';
          return { ...t, status: next };
        }
        return t;
      });
      localStorage.setItem(`hh_timeline_tasks_${currentUser?.uid}`, JSON.stringify(updated));
      return updated;
    });
  };

  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const inProgressCount = tasks.filter(t => t.status === 'in-progress').length;
  const totalTasks = tasks.length;
  const progressPercent = totalTasks > 0 
    ? Math.round(((completedCount + inProgressCount * 0.5) / totalTasks) * 100) 
    : 0;

  return (
    <div className="relative z-10 pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto space-y-8">
      {/* Top Bar: View Switcher (User vs Admin) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            {isAdminMode ? 'Organizer Command Center' : 'Hackathon Command Center'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAdminMode 
              ? 'Manage all marathon teams, verify submissions, and broadcast alerts.' 
              : 'Real-time overview of your profile, squad, Gemini idea, and 48h execution.'}
          </p>
        </div>

        {/* User / Admin Mode Toggle Pill */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => setIsAdminMode(false)}
            className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all ${
              !isAdminMode ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            User Dashboard
          </button>
          <button
            onClick={() => setIsAdminMode(true)}
            className={`text-xs px-3.5 py-1.5 rounded-xl font-bold transition-all flex items-center gap-1.5 ${
              isAdminMode ? 'bg-rose-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Admin Console
          </button>
        </div>
      </div>

      {/* RENDER ADMIN PANEL IF SELECTED */}
      {isAdminMode ? (
        <AdminPanel onBackToDashboard={() => setIsAdminMode(false)} />
      ) : (
        /* USER DASHBOARD 5 INTEGRATED MODULE WIDGETS */
        <div className="space-y-8 animate-fade-in">
          
          {/* Row 1: User Profile & Current Team Squad */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 1. User Profile Overview (5 cols) */}
            <div className="lg:col-span-5 glass-panel-glow rounded-3xl p-6 border border-indigo-500/30 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                    Your Profile
                  </span>
                  <button
                    onClick={() => onNavigate?.('profile')}
                    className="text-xs text-indigo-400 hover:text-white flex items-center gap-1 font-semibold"
                  >
                    <Edit className="w-3.5 h-3.5" /> Edit Profile
                  </button>
                </div>

                <div className="flex items-center gap-3.5 mb-4">
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-600 to-pink-500 flex items-center justify-center text-white font-black text-xl shadow-lg shadow-indigo-500/30">
                    {profile.displayName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white">{profile.displayName}</h3>
                    <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{profile.college}</span>
                      <span>•</span>
                      <span>{profile.year}</span>
                    </p>
                    <span className="inline-block mt-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      {profile.preferredRole} Developer
                    </span>
                  </div>
                </div>

                {/* Skills chips */}
                <div className="pt-3 border-t border-white/5 space-y-1.5">
                  <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1">
                    <Code className="w-3.5 h-3.5 text-cyan-400" /> Technical Skills Vector:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((s, idx) => (
                      <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-900 border border-white/10 text-slate-300">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span>Availability: <strong className="text-emerald-400">{profile.availability}</strong></span>
                <span className="text-[10px] text-indigo-300">Vector Ready ✓</span>
              </div>
            </div>

            {/* 2. Current Squad Roster (7 cols) */}
            <div className="lg:col-span-7 glass-panel rounded-3xl p-6 border border-white/10 flex flex-col justify-between shadow-2xl">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Users className="w-4 h-4 text-emerald-400" />
                    <h3 className="font-bold text-sm text-white">
                      Current Squad Roster ({squadMembers.length}/4 Members)
                    </h3>
                  </div>
                  <button
                    onClick={() => onNavigate?.('find-team')}
                    className="text-xs text-emerald-400 hover:text-white flex items-center gap-1 font-semibold"
                  >
                    Find More Teammates <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Squad Members Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {squadMembers.map((member, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-2xl bg-slate-900/80 border border-white/5 flex items-center justify-between"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="relative">
                          <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-xs text-white">
                            {member.displayName.charAt(0)}
                          </div>
                          <span
                            className={`absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border border-slate-900 ${
                              member.isOnline ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                            }`}
                          ></span>
                        </div>
                        <div>
                          <span className="text-xs font-bold text-white block truncate max-w-[130px]">
                            {member.displayName}
                          </span>
                          <span className="text-[10px] text-indigo-300 block">
                            {member.preferredRole}
                          </span>
                        </div>
                      </div>

                      {member.isLeader && (
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
                          Leader
                        </span>
                      )}
                    </div>
                  ))}
                </div>

                {/* Domain Coverage Matrix */}
                <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center gap-2 text-[10px] font-bold">
                  <span className="text-slate-400">Coverage:</span>
                  <span className="px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">Frontend ✓</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">Backend ✓</span>
                  <span className="px-2 py-0.5 rounded bg-pink-500/20 text-pink-300 border border-pink-500/30">ML Engine ✓</span>
                  <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">UI/UX ✓</span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">DevOps ✓</span>
                </div>
              </div>

              <div className="pt-3 mt-3 border-t border-white/5 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-emerald-400" />
                  <span>Team Cosine Synergy: <strong className="text-white">96.8%</strong></span>
                </span>
                <button
                  onClick={() => onNavigate?.('timeline')}
                  className="text-xs text-indigo-400 hover:text-white font-semibold"
                >
                  View Sprint Plan →
                </button>
              </div>
            </div>
          </div>

          {/* Row 2: Selected Project Idea & 48h Sprint Status */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* 3. Selected Project Blueprint (7 cols) */}
            <div className="lg:col-span-7 glass-panel-glow rounded-3xl p-6 border border-purple-500/30 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Bookmark className="w-4 h-4 text-amber-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
                      Team's Selected Project Blueprint
                    </span>
                  </div>
                  <button
                    onClick={() => onNavigate?.('generate-ideas')}
                    className="text-xs text-purple-300 hover:text-white flex items-center gap-1 font-semibold"
                  >
                    Change Idea <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-start justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-xl sm:text-2xl font-black text-white">{project?.name}</h3>
                    <p className="text-xs sm:text-sm font-medium text-purple-300 mt-0.5">
                      {project?.tagline}
                    </p>
                  </div>
                  <div className="px-3 py-1 rounded-xl bg-amber-500/20 border border-amber-500/30 text-amber-300 flex items-center gap-1 font-bold shrink-0">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{project?.innovationScore || 9.4}</span>
                    <span className="text-[10px] text-slate-400">/ 10</span>
                  </div>
                </div>

                {/* Problem & Solution */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                  <div className="p-3 rounded-2xl bg-rose-950/20 border border-rose-500/20 text-xs">
                    <span className="font-bold text-rose-400 block mb-1">Problem:</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-3">
                      {project?.problemStatement}
                    </p>
                  </div>
                  <div className="p-3 rounded-2xl bg-emerald-950/20 border border-emerald-500/20 text-xs">
                    <span className="font-bold text-emerald-400 block mb-1">Solution:</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed line-clamp-3">
                      {project?.solution}
                    </p>
                  </div>
                </div>

                {/* Tech Stack */}
                <div className="flex flex-wrap gap-1.5 items-center">
                  <span className="text-[11px] text-slate-400 font-semibold mr-1">Tech Stack:</span>
                  {project?.techStack?.map((t, idx) => (
                    <span key={idx} className="text-[10px] font-semibold px-2 py-0.5 rounded-lg bg-slate-800 text-slate-200 border border-slate-700">
                      {t}
                    </span>
                  ))}
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-slate-400">Generated by <strong className="text-purple-300">Gemini Pro</strong></span>
                <button
                  onClick={() => onNavigate?.('generate-ideas')}
                  className="btn btn-xs bg-purple-600 hover:bg-purple-500 text-white font-bold border-0"
                >
                  Generate Alternate Blueprint
                </button>
              </div>
            </div>

            {/* 4. 48-Hour Sprint Status Widget (5 cols) */}
            <div className="lg:col-span-5 glass-panel rounded-3xl p-6 border border-white/10 shadow-2xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    48h Sprint Status
                  </span>
                  <button
                    onClick={() => onNavigate?.('timeline')}
                    className="text-xs text-cyan-400 hover:text-white flex items-center gap-1 font-semibold"
                  >
                    Open Gantt <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div>
                    <span className="text-xs text-slate-400 block">Current Milestone Phase:</span>
                    <h4 className="text-base font-bold text-white mt-0.5 flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping"></span>
                      Milestone 2: Core Engine & Model Sprints
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Target deadline: <strong>T+20h</strong> (Hours elapsed: 8h / 48h)
                    </p>
                  </div>

                  {/* Milestone progression steps */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    {MILESTONES.slice(0, 3).map((m, idx) => (
                      <div key={m.id} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            idx === 0 ? 'bg-emerald-500 text-slate-950' : idx === 1 ? 'bg-cyan-500 text-slate-950' : 'bg-slate-800 text-slate-400'
                          }`}>
                            {idx === 0 ? '✓' : idx + 1}
                          </span>
                          <span className={idx <= 1 ? 'text-slate-200 font-semibold' : 'text-slate-500'}>
                            {m.title.split(':')[1]}
                          </span>
                        </div>
                        <span className="font-mono text-[10px] text-slate-400">T+{m.targetHour}h</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between text-xs">
                <span className="text-emerald-400 font-semibold">● On Track (Zero Delays)</span>
                <button
                  onClick={() => onNavigate?.('timeline')}
                  className="text-xs text-cyan-400 hover:text-white font-bold"
                >
                  View 3D Highway →
                </button>
              </div>
            </div>
          </div>

          {/* Row 3: Task List with Progress Burndown (Full Width) */}
          <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  Sprint Deliverables & Task Progress ({completedCount}/{totalTasks} Done)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Click any task status pill to advance work in real-time
                </p>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-semibold">Total Progress:</span>
                  <span className="text-lg font-black text-emerald-400 font-mono block leading-none mt-0.5">
                    {progressPercent}%
                  </span>
                </div>
                <button
                  onClick={() => onNavigate?.('timeline')}
                  className="btn btn-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold border-0 shadow-md"
                >
                  Detailed 48h Planner →
                </button>
              </div>
            </div>

            {/* Burndown Progress Bar */}
            <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden p-0.5 border border-white/5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 transition-all duration-500"
                style={{ width: `${Math.max(4, progressPercent)}%` }}
              ></div>
            </div>

            {/* Mini Tasks Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {tasks.slice(0, 6).map((task) => {
                const theme = DOMAIN_COLORS[task.domain] || DOMAIN_COLORS.Frontend;
                const isCompleted = task.status === 'completed';
                const isInProgress = task.status === 'in-progress';

                return (
                  <div
                    key={task.id}
                    onClick={() => handleToggleTask(task.id)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isCompleted 
                        ? 'bg-emerald-950/20 border-emerald-500/30' 
                        : isInProgress 
                        ? 'bg-cyan-950/20 border-cyan-500/30'
                        : 'bg-slate-900/80 border-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${theme.bg} ${theme.text} ${theme.border} border`}>
                        {task.domain}
                      </span>
                      <button
                        type="button"
                        className={`text-[9px] font-bold px-2 py-0.5 rounded-lg border ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : isInProgress
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isCompleted ? '✓ Done' : isInProgress ? '● Active' : '○ Todo'}
                      </button>
                    </div>

                    <h5 className={`text-xs font-bold text-white mb-1 ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </h5>

                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-white/5">
                      <span>{task.assignee}</span>
                      <span className="font-mono">{task.duration}h duration</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
