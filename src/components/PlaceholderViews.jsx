import React from 'react';
import { Users, Lightbulb, Clock, LayoutDashboard, Sparkles, ArrowRight, Bot, Cpu, ShieldCheck } from 'lucide-react';

export function FindTeamPlaceholder({ onGoHome }) {
  return (
    <div className="pt-32 pb-20 px-4 max-w-5xl mx-auto text-center">
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-indigo-500/20 shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-3xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 flex items-center justify-center mx-auto mb-6">
          <Users className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Module 1: AI Team Matching Engine
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-white mt-4">
          Complementary Skill Pairing with Cosine Similarity
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto mt-3 text-sm sm:text-base leading-relaxed">
          Evaluates multi-dimensional skill vectors (Frontend, Backend, AI/ML, Cloud, UI/UX, Domain Knowledge) 
          and utilizes cosine similarity to assemble optimal 3–4 member squads in seconds.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8 text-left max-w-3xl mx-auto">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
            <Cpu className="w-5 h-5 text-cyan-400 mb-2" />
            <h4 className="text-sm font-bold text-white">Cosine Vector Engine</h4>
            <p className="text-xs text-slate-400 mt-1">Computes dot product and magnitude of normalized candidate skill ratings.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
            <ShieldCheck className="w-5 h-5 text-emerald-400 mb-2" />
            <h4 className="text-sm font-bold text-white">Role Balance</h4>
            <p className="text-xs text-slate-400 mt-1">Prevents 4-frontend or all-ML collisions; guarantees full-stack coverage.</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-white/5">
            <Sparkles className="w-5 h-5 text-purple-400 mb-2" />
            <h4 className="text-sm font-bold text-white">Instant Squad Invites</h4>
            <p className="text-xs text-slate-400 mt-1">Generates one-click team locks and discord/slack integration links.</p>
          </div>
        </div>

        <div className="mt-8 flex justify-center gap-4">
          <button onClick={onGoHome} className="btn btn-outline border-slate-700 text-slate-300">
            Back to 3D Hall
          </button>
        </div>
      </div>
    </div>
  );
}

export function GenerateIdeasPlaceholder({ onGoHome }) {
  return (
    <div className="pt-32 pb-20 px-4 max-w-5xl mx-auto text-center">
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-purple-500/20 shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-3xl bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center mx-auto mb-6">
          <Lightbulb className="w-8 h-8 text-amber-300" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
          Module 2: Intelligent Idea Generator
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-white mt-4">
          Gemini LLM Hackathon Ideation & Feasibility Matrix
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto mt-3 text-sm sm:text-base leading-relaxed">
          Synthesizes theme constraints, tech tracks (Fintech, Health, EdTech, Climate), and API sponsors 
          to generate novel, high-feasibility hackathon MVPs that stand out to judges.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <button onClick={onGoHome} className="btn btn-outline border-slate-700 text-slate-300">
            Back to 3D Hall
          </button>
        </div>
      </div>
    </div>
  );
}

export function TimelinePlaceholder({ onGoHome }) {
  return (
    <div className="pt-32 pb-20 px-4 max-w-5xl mx-auto text-center">
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-cyan-500/20 shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-3xl bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center mx-auto mb-6">
          <Clock className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
          Module 3: Smart Task & Timeline Planner
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-white mt-4">
          Dynamic 24h/48h Milestone & Sprint Optimizer
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto mt-3 text-sm sm:text-base leading-relaxed">
          Breaks project architecture into critical path Kanban deliverables, schedules integration freezes at Hour 36, 
          and guides pitch deck rehearsal so no team misses submission.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <button onClick={onGoHome} className="btn btn-outline border-slate-700 text-slate-300">
            Back to 3D Hall
          </button>
        </div>
      </div>
    </div>
  );
}

export function DashboardPlaceholder({ onGoHome }) {
  return (
    <div className="pt-32 pb-20 px-4 max-w-5xl mx-auto text-center">
      <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-slate-700 shadow-2xl relative overflow-hidden">
        <div className="w-16 h-16 rounded-3xl bg-slate-800 text-indigo-400 border border-slate-700 flex items-center justify-center mx-auto mb-6">
          <LayoutDashboard className="w-8 h-8" />
        </div>
        <span className="text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
          Hackathon Command Center
        </span>
        <h2 className="text-3xl sm:text-4xl font-black text-white mt-4">
          Active Team & Project Dashboard
        </h2>
        <p className="text-slate-300 max-w-2xl mx-auto mt-3 text-sm sm:text-base leading-relaxed">
          Monitor your matched squad, chosen problem statement, Gemini-generated architecture specs, 
          and real-time Kanban burndown.
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <button onClick={onGoHome} className="btn btn-outline border-slate-700 text-slate-300">
            Back to 3D Hall
          </button>
        </div>
      </div>
    </div>
  );
}
