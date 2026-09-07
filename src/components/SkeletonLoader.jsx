import React from 'react';

export function CardSkeleton() {
  return (
    <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800"></div>
          <div className="space-y-2">
            <div className="w-32 h-4 bg-slate-800 rounded"></div>
            <div className="w-24 h-3 bg-slate-800/60 rounded"></div>
          </div>
        </div>
        <div className="w-16 h-8 bg-slate-800 rounded-xl"></div>
      </div>
      <div className="space-y-2 pt-2">
        <div className="w-full h-3 bg-slate-800/70 rounded"></div>
        <div className="w-4/5 h-3 bg-slate-800/50 rounded"></div>
      </div>
      <div className="flex gap-2 pt-2">
        <div className="w-14 h-5 bg-slate-800/80 rounded-lg"></div>
        <div className="w-14 h-5 bg-slate-800/80 rounded-lg"></div>
        <div className="w-14 h-5 bg-slate-800/80 rounded-lg"></div>
      </div>
    </div>
  );
}

export function ViewLoadingSkeleton() {
  return (
    <div className="pt-28 pb-20 px-4 max-w-7xl mx-auto space-y-6 animate-pulse">
      <div className="h-8 w-64 bg-slate-800 rounded-xl mx-auto mb-2"></div>
      <div className="h-4 w-96 bg-slate-800/60 rounded mx-auto mb-8"></div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  );
}
