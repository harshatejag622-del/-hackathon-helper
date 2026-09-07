import React, { useState, useEffect } from 'react';
import { Clock, Play, RotateCcw, Zap, AlertCircle } from 'lucide-react';

export default function CountdownTimer({ initialHours = 48 }) {
  // Default to 48 hours from now
  const [targetTime, setTargetTime] = useState(() => {
    return Date.now() + initialHours * 60 * 60 * 1000;
  });

  const [timeLeft, setTimeLeft] = useState({
    days: 1,
    hours: 23,
    minutes: 59,
    seconds: 59,
    totalSeconds: initialHours * 3600
  });

  const [duration, setDuration] = useState(initialHours);

  useEffect(() => {
    const updateCountdown = () => {
      const now = Date.now();
      const diff = Math.max(0, targetTime - now);

      const totalSeconds = Math.floor(diff / 1000);
      const days = Math.floor(totalSeconds / (3600 * 24));
      const hours = Math.floor((totalSeconds % (3600 * 24)) / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;

      setTimeLeft({ days, hours, minutes, seconds, totalSeconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetTime]);

  const resetTimer = (hours) => {
    setDuration(hours);
    setTargetTime(Date.now() + hours * 60 * 60 * 1000);
  };

  const totalPossibleSeconds = duration * 3600;
  const elapsedSeconds = Math.max(0, totalPossibleSeconds - timeLeft.totalSeconds);
  const progressPercent = Math.min(100, Math.round((elapsedSeconds / totalPossibleSeconds) * 100));

  // Determine current stage based on elapsed time
  const getStageName = () => {
    const hoursElapsed = elapsedSeconds / 3600;
    if (hoursElapsed < 4) return { label: 'Phase 1: Team Alignment & Idea Refinement', color: 'text-indigo-400' };
    if (hoursElapsed < 24) return { label: 'Phase 2: Core MVP Prototype Sprint', color: 'text-cyan-400' };
    if (hoursElapsed < 40) return { label: 'Phase 3: Integration & Testing', color: 'text-amber-400' };
    return { label: 'Phase 4: Pitch Deck & Video Submission Finalization', color: 'text-rose-400' };
  };

  const currentStage = getStageName();

  const timeBlocks = [
    { label: 'Days', value: timeLeft.days },
    { label: 'Hours', value: timeLeft.hours },
    { label: 'Minutes', value: timeLeft.minutes },
    { label: 'Seconds', value: timeLeft.seconds },
  ];

  return (
    <div className="glass-panel-glow rounded-3xl p-6 sm:p-8 max-w-2xl mx-auto shadow-2xl relative overflow-hidden">
      {/* Decorative top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Clock className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              Hackathon Live Countdown
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                In Progress
              </span>
            </h3>
            <p className="text-xs text-slate-400">Submission portal closes automatically at T-0</p>
          </div>
        </div>

        {/* Sprint duration toggles */}
        <div className="flex items-center gap-1.5 bg-slate-900/80 p-1 rounded-xl border border-white/5">
          {[24, 36, 48].map((hrs) => (
            <button
              key={hrs}
              onClick={() => resetTimer(hrs)}
              className={`text-xs px-2.5 py-1 rounded-lg font-semibold transition-all ${
                duration === hrs
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {hrs}h
            </button>
          ))}
          <button
            onClick={() => resetTimer(duration)}
            title="Reset timer"
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Numerical Countdown Blocks */}
      <div className="grid grid-cols-4 gap-3 sm:gap-4 my-6">
        {timeBlocks.map((block, idx) => (
          <div
            key={idx}
            className="flex flex-col items-center justify-center p-3 sm:p-4 rounded-2xl bg-slate-900/80 border border-indigo-500/20 shadow-inner group hover:border-indigo-500/40 transition-all"
          >
            <span className="text-3xl sm:text-5xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-white to-slate-300 font-mono">
              {String(block.value).padStart(2, '0')}
            </span>
            <span className="text-[10px] sm:text-xs font-semibold uppercase tracking-wider text-indigo-300 mt-1">
              {block.label}
            </span>
          </div>
        ))}
      </div>

      {/* Progress & Milestone Tracking */}
      <div className="space-y-2.5 pt-2 border-t border-white/5">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span className={`font-semibold ${currentStage.color}`}>{currentStage.label}</span>
          </span>
          <span className="font-mono text-slate-300 font-semibold">{progressPercent}% Elapsed</span>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-2.5 rounded-full bg-slate-800/80 overflow-hidden p-0.5 border border-white/5">
          <div
            className="h-full rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-500"
            style={{ width: `${Math.max(4, progressPercent)}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-slate-500 px-0.5">
          <span>Kickoff (Hour 0)</span>
          <span>Midpoint Evaluation (Hour 24)</span>
          <span>Final Pitch (Hour 48)</span>
        </div>
      </div>
    </div>
  );
}
