import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInvites } from '../context/InviteContext';
import { getActiveProject } from '../services/geminiService';
import { 
  generateSquadTimeline, 
  MILESTONES, 
  DOMAIN_COLORS 
} from '../utils/timelineEngine';
import Timeline3DScene from './Timeline3DScene';
import GanttChart from './GanttChart';
import { 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  PlayCircle, 
  Users, 
  Sparkles, 
  Layers, 
  Award, 
  Check, 
  RotateCcw,
  Zap,
  Flame,
  ArrowRight,
  TrendingUp,
  Bookmark
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function TimelinePlannerView({ onNavigate }) {
  const { currentUser, userProfile } = useAuth();
  const { acceptedTeammates } = useInvites();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [selectedMilestone, setSelectedMilestone] = useState(MILESTONES[0]);
  const [currentHour, setCurrentHour] = useState(8); // Simulated current hour of hackathon

  // Compile active squad members
  const squadMembers = [
    {
      displayName: userProfile?.displayName || currentUser?.displayName || 'You (Leader)',
      preferredRole: userProfile?.preferredRole || 'FullStack',
      skills: userProfile?.skills || ['React', 'Python', 'FastAPI']
    },
    ...acceptedTeammates.map(t => ({
      displayName: t.toName || t.fromName || 'Teammate',
      preferredRole: t.toRole || t.fromRole || 'Developer',
      skills: ['Python', 'Docker', 'Go']
    }))
  ];

  // Initialize tasks
  useEffect(() => {
    async function loadData() {
      const activeProj = await getActiveProject(currentUser?.uid);
      if (activeProj) {
        setProject(activeProj);
      }

      // Check saved tasks or generate fresh
      const savedTasks = localStorage.getItem(`hh_timeline_tasks_${currentUser?.uid}`);
      if (savedTasks) {
        try {
          setTasks(JSON.parse(savedTasks));
          return;
        } catch (e) {
          console.error(e);
        }
      }

      const generated = generateSquadTimeline(squadMembers, activeProj?.name);
      setTasks(generated);
    }

    loadData();
  }, [currentUser]);

  // Toggle status: pending -> in-progress -> completed -> pending
  const handleToggleTaskStatus = (taskId) => {
    setTasks(prev => {
      const updated = prev.map(t => {
        if (t.id === taskId) {
          const nextStatus = 
            t.status === 'pending' ? 'in-progress' :
            t.status === 'in-progress' ? 'completed' : 'pending';
          return { ...t, status: nextStatus };
        }
        return t;
      });

      // Save to cache
      localStorage.setItem(`hh_timeline_tasks_${currentUser?.uid}`, JSON.stringify(updated));

      // If all completed, fire confetti
      const allDone = updated.every(t => t.status === 'completed');
      if (allDone) {
        confetti({
          particleCount: 100,
          spread: 80,
          origin: { y: 0.5 }
        });
      }

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
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-semibold border border-cyan-500/30 mb-3 backdrop-blur-md">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span>Smart Task & Timeline Planner • 48-Hour Sprint</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
            48-Hour <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-indigo-300 to-pink-400">Execution Plan</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Tasks dynamically mapped to squad members' skills across <strong className="text-indigo-300">Frontend</strong>,{' '}
            <strong className="text-emerald-300">Backend</strong>, <strong className="text-pink-300">ML</strong>,{' '}
            <strong className="text-amber-300">UI/UX</strong>, and <strong className="text-cyan-300">DevOps</strong>.
          </p>
        </div>

        {/* Project Target Badge */}
        {project && (
          <div className="p-3 rounded-2xl glass-panel-glow border border-amber-500/30 flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold">
              ★
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-amber-400 block">Active Sprint Target:</span>
              <span className="text-xs font-black text-white">{project.name}</span>
            </div>
          </div>
        )}
      </div>

      {/* High-Level Progress Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Total Tasks</span>
            <Layers className="w-4 h-4 text-indigo-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-white font-mono mt-1 block">
            {totalTasks}
          </span>
          <span className="text-[10px] text-slate-400">Mapped from squad skills</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Completed</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-emerald-400 font-mono mt-1 block">
            {completedCount}
          </span>
          <span className="text-[10px] text-slate-400">Ready for demo</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">In Progress</span>
            <PlayCircle className="w-4 h-4 text-cyan-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono mt-1 block">
            {inProgressCount}
          </span>
          <span className="text-[10px] text-slate-400">Active coding sprints</span>
        </div>

        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-semibold">Sprint Progress</span>
            <TrendingUp className="w-4 h-4 text-amber-400" />
          </div>
          <span className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-pink-400 font-mono mt-1 block">
            {progressPercent}%
          </span>
          <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-400 to-emerald-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* 3D Timeline Highway Visualization */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Zap className="w-5 h-5 text-indigo-400" />
            3D Milestone Highway & Critical Gates
          </h3>
          <span className="text-xs text-slate-400">Click a floating marker to view phase deliverables</span>
        </div>
        <Timeline3DScene
          selectedMilestone={selectedMilestone}
          onSelectMilestone={(m) => setSelectedMilestone(m)}
        />
      </div>

      {/* Visual Gantt Chart */}
      <GanttChart
        tasks={tasks}
        currentHour={currentHour}
        onToggleTaskStatus={handleToggleTaskStatus}
      />

      {/* Detailed Task Management List */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div>
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              Live Task Breakdown & Status Toggles
            </h3>
            <p className="text-xs text-slate-400">Click any task badge to update status in real-time</p>
          </div>
          <button
            onClick={() => {
              const fresh = generateSquadTimeline(squadMembers, project?.name);
              setTasks(fresh);
              localStorage.setItem(`hh_timeline_tasks_${currentUser?.uid}`, JSON.stringify(fresh));
            }}
            className="btn btn-xs bg-slate-800 hover:bg-slate-700 text-slate-300 border border-white/10"
          >
            <RotateCcw className="w-3 h-3 mr-1" /> Reset Plan
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {tasks.map((task) => {
            const theme = DOMAIN_COLORS[task.domain] || DOMAIN_COLORS.Frontend;
            const isCompleted = task.status === 'completed';
            const isInProgress = task.status === 'in-progress';

            return (
              <div
                key={task.id}
                onClick={() => handleToggleTaskStatus(task.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                  isCompleted 
                    ? 'bg-emerald-950/20 border-emerald-500/30' 
                    : isInProgress
                    ? 'bg-cyan-950/20 border-cyan-500/30'
                    : 'bg-slate-900/70 border-white/5 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${theme.bg} ${theme.text} ${theme.border} border`}>
                      {task.domain}
                    </span>
                    <h4 className={`text-sm font-bold text-white ${isCompleted ? 'line-through text-slate-400' : ''}`}>
                      {task.title}
                    </h4>
                  </div>

                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border ${
                    isCompleted 
                      ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                      : isInProgress 
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40' 
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}>
                    {isCompleted ? '✓ Done' : isInProgress ? '● In Progress' : '○ Pending'}
                  </span>
                </div>

                <p className="text-xs text-slate-300 mb-3">{task.desc}</p>

                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-2 border-t border-white/5">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    Assignee: <strong className="text-white">{task.assignee}</strong>
                  </span>
                  <span className="font-mono">
                    Hours {task.startHour}h – {task.endHour}h ({task.duration}h)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
