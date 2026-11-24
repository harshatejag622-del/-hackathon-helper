import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Users, Lightbulb, ArrowRight, ShieldCheck, Compass, CheckCircle2 } from 'lucide-react';
import CountdownTimer from './CountdownTimer';

export default function HeroSection({ setActiveTab }) {
  const challengesSolved = [
    {
      icon: Users,
      title: 'AI Team Matching',
      metric: '65% Mismatch Solved',
      desc: 'Cosine similarity algorithm assesses complementary technical skills & roles.',
      targetTab: 'find-team',
      color: 'from-blue-500/20 to-cyan-500/20 border-cyan-500/30 text-cyan-400'
    },
    {
      icon: Lightbulb,
      title: 'Intelligent Ideation',
      metric: 'Zero Repetitive Clones',
      desc: 'Gemini LLM delivers novel, high-impact, feasible hackathon blueprints.',
      targetTab: 'generate-ideas',
      color: 'from-purple-500/20 to-pink-500/20 border-pink-500/30 text-pink-400'
    },
    {
      icon: Compass,
      title: 'Smart 48h Timeline',
      metric: '50% Missed Deadlines Averted',
      desc: 'Dynamic task allocator and milestone tracker preventing last-minute panic.',
      targetTab: 'timeline',
      color: 'from-indigo-500/20 to-violet-500/20 border-indigo-500/30 text-indigo-400'
    }
  ];

  return (
    <div className="relative z-10 pt-4 sm:pt-6 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Top Banner Tag */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="flex justify-center"
      >
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border border-indigo-500/30 text-indigo-300 text-xs sm:text-sm font-medium shadow-lg shadow-indigo-500/10 mb-6">
          <Sparkles className="w-4 h-4 text-amber-400 animate-spin" />
          <span>The All-in-One Copilot for 24–48 Hour Innovation Marathons</span>
        </div>
      </motion.div>

      {/* Main Title */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="text-center max-w-4xl mx-auto"
      >
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight sm:leading-none">
          Turn Hackathon Chaos into <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 drop-shadow-sm">
            Podium Finishes
          </span>
        </h1>
        <p className="mt-6 text-base sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Stop wasting the first 5 hours searching WhatsApp groups and brainstorming basic to-do apps. 
          Form balanced squads, generate award-grade ideas, and execute like clockwork.
        </p>

        {/* Action Buttons */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <button
            onClick={() => setActiveTab('find-team')}
            className="btn btn-lg bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold border-0 shadow-xl shadow-indigo-500/30 px-8 rounded-2xl group transition-all"
          >
            <Users className="w-5 h-5 mr-2" />
            Find Matching Team
            <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={() => setActiveTab('generate-ideas')}
            className="btn btn-lg btn-outline border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white px-8 rounded-2xl font-bold backdrop-blur"
          >
            <Lightbulb className="w-5 h-5 mr-2 text-amber-400" />
            Generate Ideas
          </button>
        </div>
      </motion.div>

      {/* Live Countdown Timer Section */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="mt-12"
      >
        <CountdownTimer initialHours={48} />
      </motion.div>

      {/* 3 Core Pillars / Problem Solvers */}
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16"
      >
        {challengesSolved.map((item, idx) => {
          const Icon = item.icon;
          return (
            <div
              key={idx}
              onClick={() => setActiveTab(item.targetTab)}
              className="glass-panel p-6 rounded-3xl border border-white/10 hover:border-indigo-500/40 cursor-pointer transition-all duration-300 hover:-translate-y-1.5 group shadow-xl relative overflow-hidden"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 border`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="flex items-center justify-between mb-1">
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  {item.title}
                </h3>
                <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
                  {item.metric}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-400 mt-2 leading-relaxed">
                {item.desc}
              </p>
              <div className="mt-4 flex items-center text-xs font-semibold text-indigo-400 group-hover:text-indigo-300">
                <span>Explore module</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
