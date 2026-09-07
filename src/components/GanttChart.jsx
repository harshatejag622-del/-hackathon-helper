import React, { useState } from 'react';
import { DOMAIN_COLORS } from '../utils/timelineEngine';
import { Clock, CheckCircle2, AlertCircle, PlayCircle, Filter } from 'lucide-react';

export default function GanttChart({ tasks = [], onToggleTaskStatus, currentHour = 8 }) {
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [hoveredTaskId, setHoveredTaskId] = useState(null);

  const domains = ['All', 'Frontend', 'Backend', 'ML', 'UI/UX', 'DevOps'];

  const filteredTasks = selectedDomain === 'All' 
    ? tasks 
    : tasks.filter(t => t.domain === selectedDomain);

  // Time grid increments every 4 hours from 0 to 48
  const timeMarkers = [0, 4, 8, 12, 16, 20, 24, 28, 32, 36, 40, 44, 48];

  return (
    <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-6">
      {/* Header & Filter Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            48-Hour Visual Gantt Schedule
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time critical path and workload allocation across 48 marathon hours
          </p>
        </div>

        {/* Domain Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/80 p-1 rounded-2xl border border-white/5">
          <span className="text-[11px] font-semibold text-slate-400 px-2 flex items-center gap-1">
            <Filter className="w-3 h-3" /> Filter:
          </span>
          {domains.map((dom) => (
            <button
              key={dom}
              onClick={() => setSelectedDomain(dom)}
              className={`text-xs px-3 py-1 rounded-xl font-medium transition-all ${
                selectedDomain === dom
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {dom}
            </button>
          ))}
        </div>
      </div>

      {/* Gantt Viewport Container */}
      <div className="relative overflow-x-auto pb-4">
        <div className="min-w-[760px]">
          {/* Day Markers */}
          <div className="grid grid-cols-2 text-center text-xs font-bold uppercase tracking-wider text-slate-400 border-b border-white/10 pb-2 mb-2">
            <div className="border-r border-white/10">Day 1: Architecture & Core Sprints (0h – 24h)</div>
            <div>Day 2: Integration, Cloud Deploy & Pitch (24h – 48h)</div>
          </div>

          {/* Time axis header */}
          <div className="relative h-7 border-b border-white/10 mb-4 flex justify-between text-[11px] font-mono font-bold text-slate-400 px-1">
            {timeMarkers.map((hour) => (
              <span key={hour} className="relative">
                T+{String(hour).padStart(2, '0')}h
              </span>
            ))}
          </div>

          {/* Task Rows */}
          <div className="space-y-3 relative">
            {/* Live Current Hour Vertical Needle */}
            <div
              className="absolute top-0 bottom-0 z-20 pointer-events-none flex flex-col items-center"
              style={{ left: `${(currentHour / 48) * 100}%` }}
            >
              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white uppercase shadow-md -translate-y-2">
                NOW (T+{currentHour}h)
              </span>
              <div className="w-0.5 h-full bg-rose-500 shadow-lg shadow-rose-500/50"></div>
            </div>

            {filteredTasks.map((task) => {
              const theme = DOMAIN_COLORS[task.domain] || DOMAIN_COLORS.Frontend;
              const leftPercent = (task.startHour / 48) * 100;
              const widthPercent = (task.duration / 48) * 100;
              const isCompleted = task.status === 'completed';
              const isInProgress = task.status === 'in-progress';

              return (
                <div key={task.id} className="relative group">
                  {/* Task Meta Labels row */}
                  <div className="flex items-center justify-between text-xs mb-1 px-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${theme.bg} ${theme.text} ${theme.border} border`}>
                        {task.domain}
                      </span>
                      <span className="font-bold text-slate-200">{task.title}</span>
                      <span className="text-[11px] text-slate-400">
                        assigned to <strong className="text-white">{task.assignee}</strong>
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono text-slate-400">
                        {task.startHour}h – {task.endHour}h ({task.duration}h)
                      </span>
                      <button
                        onClick={() => onToggleTaskStatus(task.id)}
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-lg border transition-all ${
                          isCompleted
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : isInProgress
                            ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
                            : 'bg-slate-800 text-slate-400 border-slate-700'
                        }`}
                      >
                        {isCompleted ? '✓ Completed' : isInProgress ? '● In Progress' : '○ Pending'}
                      </button>
                    </div>
                  </div>

                  {/* Gantt Bar Track */}
                  <div className="w-full h-7 bg-slate-900/60 rounded-xl overflow-hidden relative border border-white/5">
                    {/* The Task Bar */}
                    <div
                      onMouseEnter={() => setHoveredTaskId(task.id)}
                      onMouseLeave={() => setHoveredTaskId(null)}
                      onClick={() => onToggleTaskStatus(task.id)}
                      style={{
                        left: `${leftPercent}%`,
                        width: `${Math.max(4, widthPercent)}%`,
                        backgroundColor: theme.bar
                      }}
                      className={`absolute top-1 bottom-1 rounded-lg cursor-pointer transition-all duration-200 flex items-center px-2 text-white text-[11px] font-bold shadow-md truncate hover:brightness-125 ${
                        isCompleted ? 'opacity-50 line-through' : 'opacity-95'
                      }`}
                    >
                      <span className="truncate">{task.title}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
