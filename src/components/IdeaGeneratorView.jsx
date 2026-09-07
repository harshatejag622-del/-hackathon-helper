import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  generateProjectIdeas, 
  saveSelectedProject, 
  getActiveProject 
} from '../services/geminiService';
import IdeaStars3DScene from './IdeaStars3DScene';
import { 
  Sparkles, 
  Lightbulb, 
  Check, 
  Star, 
  Layers, 
  Cpu, 
  Users, 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  Zap, 
  Bot,
  AlertTriangle,
  Compass,
  Bookmark
} from 'lucide-react';
import confetti from 'canvas-confetti';

const INSPIRATION_PRESETS = [
  { label: 'Healthcare AI', kws: ['Healthcare', 'AI Agents', 'Wearables'] },
  { label: 'FinTech & DeFi', kws: ['FinTech', 'Zero-Knowledge', 'Fraud Prevention'] },
  { label: 'Climate & CleanTech', kws: ['Climate', 'IoT Sensors', 'Clean Energy'] },
  { label: 'EdTech & Learning', kws: ['Education', 'LLM Tutoring', 'Accessibility'] },
  { label: 'Smart Mobility', kws: ['Urban Mobility', 'Computer Vision', 'Safety'] },
];

export default function IdeaGeneratorView({ onNavigate }) {
  const { currentUser } = useAuth();

  const [kw1, setKw1] = useState('Healthcare');
  const [kw2, setKw2] = useState('AI Agents');
  const [kw3, setKw3] = useState('Wearables');

  const [ideas, setIdeas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdea, setSelectedIdea] = useState(null);
  const [savingIdeaId, setSavingIdeaId] = useState(null);
  const [savedProject, setSavedProject] = useState(null);

  // Load existing project if saved previously
  useEffect(() => {
    async function loadSaved() {
      const existing = await getActiveProject(currentUser?.uid);
      if (existing) {
        setSavedProject(existing);
      }
    }
    loadSaved();
    // Auto generate initial ideas on mount for rich first impression
    handleGenerate('Healthcare', 'AI Agents', 'Wearables');
  }, [currentUser]);

  const handleGenerate = async (k1 = kw1, k2 = kw2, k3 = kw3) => {
    setLoading(true);
    try {
      const results = await generateProjectIdeas(k1, k2, k3);
      setIdeas(results);
      if (results.length > 0 && !selectedIdea) {
        setSelectedIdea(results[0]);
      }
    } catch (err) {
      console.error("Failed to generate ideas:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreset = (presetKws) => {
    setKw1(presetKws[0]);
    setKw2(presetKws[1]);
    setKw3(presetKws[2]);
    handleGenerate(presetKws[0], presetKws[1], presetKws[2]);
  };

  const handleSelectIdea = async (idea) => {
    setSelectedIdea(idea);
    setSavingIdeaId(idea.id || idea.name);

    try {
      const saved = await saveSelectedProject(
        currentUser?.uid || 'guest-hacker',
        idea,
        [kw1, kw2, kw3]
      );
      setSavedProject(saved);

      // Confetti burst
      confetti({
        particleCount: 65,
        spread: 75,
        origin: { y: 0.6 }
      });
    } catch (err) {
      console.error("Error saving selected idea:", err);
    } finally {
      setSavingIdeaId(null);
    }
  };

  return (
    <div className="relative z-10 pt-28 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-8">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-purple-500/20 text-purple-300 text-xs font-semibold border border-purple-500/30 mb-3 backdrop-blur-md">
          <Bot className="w-3.5 h-3.5 text-pink-400" />
          <span>Google Gemini Pro • Hackathon Ideation Matrix</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-white tracking-tight">
          Intelligent <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-300 to-amber-300">Idea Generator</span>
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-2 leading-relaxed">
          Break through the idea bottleneck. Enter 3 core keywords and let Gemini generate 5 original, 
          high-feasibility project blueprints with complete tech stacks and innovation scores.
        </p>
      </div>

      {/* 3-Keyword Input Form */}
      <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 max-w-4xl mx-auto border border-purple-500/30 shadow-2xl mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
          <div>
            <label className="text-xs font-bold text-purple-300 block mb-1 uppercase tracking-wider">
              Keyword 1 (Domain / Industry)
            </label>
            <input
              type="text"
              value={kw1}
              onChange={(e) => setKw1(e.target.value)}
              placeholder="e.g. Healthcare"
              className="w-full px-4 py-3 bg-slate-900/80 rounded-2xl border border-white/10 focus:border-purple-500 focus:outline-none text-sm text-white font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-pink-300 block mb-1 uppercase tracking-wider">
              Keyword 2 (Core Tech / AI)
            </label>
            <input
              type="text"
              value={kw2}
              onChange={(e) => setKw2(e.target.value)}
              placeholder="e.g. AI Agents"
              className="w-full px-4 py-3 bg-slate-900/80 rounded-2xl border border-white/10 focus:border-pink-500 focus:outline-none text-sm text-white font-medium"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-amber-300 block mb-1 uppercase tracking-wider">
              Keyword 3 (Hardware / Modality)
            </label>
            <input
              type="text"
              value={kw3}
              onChange={(e) => setKw3(e.target.value)}
              placeholder="e.g. Wearables"
              className="w-full px-4 py-3 bg-slate-900/80 rounded-2xl border border-white/10 focus:border-amber-500 focus:outline-none text-sm text-white font-medium"
            />
          </div>
        </div>

        {/* Preset quick picks */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <span className="text-xs text-slate-400 font-semibold flex items-center gap-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" /> Inspiration Tracks:
          </span>
          {INSPIRATION_PRESETS.map((preset, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleApplyPreset(preset.kws)}
              className="text-xs px-3 py-1 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/5 transition-all"
            >
              {preset.label}
            </button>
          ))}
        </div>

        {/* Generate Button */}
        <button
          type="button"
          disabled={loading || !kw1 || !kw2 || !kw3}
          onClick={() => handleGenerate()}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 hover:from-purple-700 hover:to-amber-600 text-white font-black text-sm sm:text-base shadow-xl shadow-purple-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? (
            <>
              <span className="loading loading-spinner loading-md"></span>
              <span>Gemini is synthesizing 5 winner hackathon blueprints...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5 text-amber-200 animate-pulse" />
              <span>Generate 5 Unique Hackathon Ideas with Gemini Pro</span>
            </>
          )}
        </button>
      </div>

      {/* Confirmed Selected Team Project Notice */}
      {savedProject && (
        <div className="max-w-4xl mx-auto mb-8 p-4 rounded-2xl glass-panel-glow border border-amber-500/40 bg-amber-950/20 flex flex-wrap items-center justify-between gap-4 animate-fade-in">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30">
              <Bookmark className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-amber-400">Team's Selected Project:</span>
                <span className="text-sm font-black text-white">{savedProject.name}</span>
                <span className="text-xs font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300">
                  ★ {savedProject.innovationScore}/10
                </span>
              </div>
              <p className="text-xs text-slate-300">{savedProject.tagline}</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate?.('timeline')}
            className="btn btn-sm bg-gradient-to-r from-amber-500 to-pink-500 hover:from-amber-600 hover:to-pink-600 text-slate-950 font-bold border-0"
          >
            Plan 48h Sprint in Timeline →
          </button>
        </div>
      )}

      {/* 3D Floating Glowing Stars Visualization */}
      {ideas.length > 0 && (
        <div className="max-w-4xl mx-auto mb-10">
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-sm font-bold uppercase tracking-wider text-purple-300 flex items-center gap-2">
              <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              Interactive 3D Ideation Stars
            </h3>
            <span className="text-xs text-slate-400">Hover or click a star to highlight</span>
          </div>
          <IdeaStars3DScene
            ideas={ideas}
            selectedIdea={selectedIdea}
            onSelectIdea={(idea) => setSelectedIdea(idea)}
          />
        </div>
      )}

      {/* Display 5 Ideas */}
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-xl font-black text-white flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-amber-400" />
            5 Generated Project Concepts
          </h3>
          <span className="text-xs text-slate-400">Powered by Google Gemini</span>
        </div>

        {ideas.map((idea, idx) => {
          const isSelected = selectedIdea?.name === idea.name;
          const isSaved = savedProject?.name === idea.name;
          const isSaving = savingIdeaId === (idea.id || idea.name);

          return (
            <div
              key={idea.id || idx}
              onClick={() => setSelectedIdea(idea)}
              className={`glass-panel rounded-3xl p-6 sm:p-8 transition-all duration-300 border cursor-pointer ${
                isSelected
                  ? 'border-purple-400 bg-slate-900/95 shadow-2xl shadow-purple-500/20 ring-1 ring-purple-500/30'
                  : 'border-white/10 hover:border-purple-500/30 bg-slate-950/70'
              }`}
            >
              {/* Header: Name, Tagline & Innovation Score */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-4 border-b border-white/5">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="w-7 h-7 rounded-xl bg-purple-500/20 text-purple-300 border border-purple-500/30 flex items-center justify-center font-mono font-bold text-xs">
                      0{idx + 1}
                    </span>
                    <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                      {idea.name}
                    </h3>
                  </div>
                  <p className="text-sm font-medium text-purple-300 mt-1 pl-10">
                    {idea.tagline}
                  </p>
                </div>

                {/* Innovation Score Badge */}
                <div className="flex items-center gap-2 self-start pl-10 sm:pl-0">
                  <div className="px-3.5 py-1.5 rounded-2xl bg-gradient-to-r from-amber-500/20 to-pink-500/20 border border-amber-500/30 text-amber-300 flex items-center gap-1.5 shadow-md">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400 animate-pulse" />
                    <span className="text-sm font-black font-mono">{idea.innovationScore}</span>
                    <span className="text-[10px] text-slate-400">/ 10</span>
                  </div>
                  <span className="text-[11px] font-bold text-slate-400 hidden sm:inline">Innovation</span>
                </div>
              </div>

              {/* Problem & Solution Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
                <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-500/20">
                  <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5 mb-2">
                    <AlertTriangle className="w-4 h-4 text-rose-400" />
                    The Critical Problem
                  </span>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {idea.problemStatement}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-emerald-950/20 border border-emerald-500/20">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    The Proposed Solution
                  </span>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {idea.solution}
                  </p>
                </div>
              </div>

              {/* Why Innovative & Target Users */}
              <div className="mt-4 p-4 rounded-2xl bg-slate-900/60 border border-white/5 space-y-3">
                <div>
                  <span className="text-xs font-bold text-amber-400 flex items-center gap-1.5 mb-1">
                    <Zap className="w-3.5 h-3.5" /> Why It Wins Hackathons:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {idea.whyInnovative}
                  </p>
                </div>

                {/* Target Users */}
                {idea.targetUsers && idea.targetUsers.length > 0 && (
                  <div className="flex flex-wrap items-center gap-1.5 pt-2 border-t border-white/5">
                    <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 mr-1">
                      <Users className="w-3.5 h-3.5 text-cyan-400" /> Target Users:
                    </span>
                    {idea.targetUsers.map((user, uIdx) => (
                      <span
                        key={uIdx}
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-cyan-500/10 text-cyan-300 border border-cyan-500/20"
                      >
                        {user}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Tech Stack Badges & Select Idea Button */}
              <div className="mt-5 pt-4 border-t border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Tech Stack Chips */}
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold text-slate-400 mr-1 flex items-center gap-1">
                    <Cpu className="w-3.5 h-3.5 text-indigo-400" /> Stack:
                  </span>
                  {idea.techStack.map((tech, tIdx) => (
                    <span
                      key={tIdx}
                      className="text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-slate-800 text-slate-200 border border-slate-700"
                    >
                      {tech}
                    </span>
                  ))}
                </div>

                {/* Select Idea Button */}
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleSelectIdea(idea);
                  }}
                  className={`btn btn-sm rounded-xl font-bold text-xs transition-all ${
                    isSaved
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 border-0'
                      : 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white shadow-lg shadow-purple-500/25 border-0'
                  }`}
                >
                  {isSaving ? (
                    <span className="loading loading-spinner loading-xs"></span>
                  ) : isSaved ? (
                    <>
                      <Check className="w-4 h-4 mr-1 text-white" />
                      Selected Team Project
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 mr-1" />
                      Select Idea for Team
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
