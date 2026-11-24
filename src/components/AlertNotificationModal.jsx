import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  Bell, 
  X, 
  Clock, 
  Crown, 
  ArrowRight, 
  Sparkles,
  Send,
  MessageSquareWarning,
  Volume2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { cloudSync } from '../services/cloudSyncService';

// Play pleasant web-audio chime for cross-tab alerts
function playAlertChime() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);
  } catch (e) {
    // AudioContext might require user gesture on some browsers
  }
}

export default function AlertNotificationModal({ onNavigate }) {
  const [activeAlert, setActiveAlert] = useState(null);
  const [toastQueue, setToastQueue] = useState([]);

  // Listen across all laptops & tabs
  useEffect(() => {
    const handleIncomingAlert = (alertData) => {
      if (!alertData) return;
      playAlertChime();
      if (alertData.isPopup) {
        setActiveAlert(alertData);
      } else {
        setToastQueue(prev => [...prev, { ...alertData, id: Date.now() }]);
      }
      if (alertData.type === 'completed') {
        confetti({ particleCount: 75, spread: 60, origin: { y: 0.6 } });
      }
    };

    // 1. Cross-laptop CloudSync listener
    const unsubCloud = cloudSync.on('LEAD_ALERT', handleIncomingAlert);

    // 2. Same-machine BroadcastChannel
    let bc;
    try {
      bc = new BroadcastChannel('hh_team_alerts_channel');
      bc.onmessage = (event) => {
        handleIncomingAlert(event.data);
      };
    } catch (e) {
      console.warn("Alert BroadcastChannel notice:", e);
    }

    return () => {
      unsubCloud();
      if (bc) bc.close();
    };
  }, []);

  // Auto-dismiss toasts after 6 seconds
  useEffect(() => {
    if (toastQueue.length > 0) {
      const timer = setTimeout(() => {
        setToastQueue(prev => prev.slice(1));
      }, 6000);
      return () => clearTimeout(timer);
    }
  }, [toastQueue]);

  return (
    <>
      {/* 1. Main High-Priority Alert Popup Box */}
      {activeAlert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fade-in">
          <div 
            className={`max-w-md w-full rounded-3xl p-6 sm:p-7 relative shadow-2xl border ${
              activeAlert.type === 'incomplete' 
                ? 'bg-gradient-to-b from-rose-950/90 to-slate-950/95 border-rose-500/50 shadow-rose-500/20' 
                : activeAlert.type === 'completed'
                ? 'bg-gradient-to-b from-emerald-950/90 to-slate-950/95 border-emerald-500/50 shadow-emerald-500/20'
                : 'bg-gradient-to-b from-amber-950/90 to-slate-950/95 border-amber-500/50 shadow-amber-500/20'
            }`}
          >
            {/* Close Button */}
            <button
              onClick={() => setActiveAlert(null)}
              className="absolute top-4 right-4 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Icon Header */}
            <div className="flex items-center gap-3 mb-4">
              <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg ${
                activeAlert.type === 'incomplete' 
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' 
                  : activeAlert.type === 'completed'
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
              }`}>
                {activeAlert.type === 'incomplete' ? (
                  <AlertTriangle className="w-6 h-6 animate-pulse" />
                ) : activeAlert.type === 'completed' ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  <Crown className="w-6 h-6" />
                )}
              </div>
              <div>
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-70 flex items-center gap-1">
                  <Volume2 className="w-3 h-3" />
                  {activeAlert.senderRole || 'Team Lead Announcement'}
                </span>
                <h3 className="text-lg font-black text-white leading-tight">
                  {activeAlert.title}
                </h3>
              </div>
            </div>

            {/* Message Body */}
            <div className="p-3.5 rounded-2xl bg-black/40 border border-white/10 mb-4">
              <p className="text-sm text-slate-200 leading-relaxed font-medium">
                {activeAlert.message}
              </p>

              {activeAlert.milestone && (
                <div className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-xs">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    {activeAlert.milestone.title}
                  </span>
                  <span className={`font-bold ${
                    activeAlert.milestone.completed ? 'text-emerald-400' : 'text-rose-400'
                  }`}>
                    {activeAlert.milestone.completed ? '100% Completed' : `${activeAlert.milestone.progress || 35}% Done (Urgent)`}
                  </span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveAlert(null);
                  if (onNavigate) onNavigate('timeline');
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-bold text-xs shadow-lg transition-all flex items-center justify-center gap-1.5 active:scale-95"
              >
                <span>View Sprint Timeline</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setActiveAlert(null)}
                className="py-2.5 px-4 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs transition-all active:scale-95"
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Top-Right Corner Toast Notifications */}
      <div className="fixed top-20 right-5 z-40 space-y-2 max-w-sm w-full pointer-events-none">
        {toastQueue.map((toast) => (
          <div 
            key={toast.id}
            className="pointer-events-auto p-3.5 rounded-2xl bg-slate-900/90 backdrop-blur-md border border-indigo-500/30 shadow-2xl text-white animate-slide-left flex items-start gap-3"
          >
            <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400 shrink-0">
              <Bell className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-indigo-300 truncate">{toast.title}</div>
              <div className="text-xs text-slate-300 mt-0.5">{toast.message}</div>
            </div>
            <button 
              onClick={() => setToastQueue(prev => prev.filter(t => t.id !== toast.id))}
              className="text-slate-400 hover:text-white"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </>
  );
}

// Helper to broadcast alert to all open tabs and laptops
export function broadcastTeamAlert(alertData) {
  // 1. Cross-laptop CloudSync
  try {
    cloudSync.publish('LEAD_ALERT', alertData);
  } catch (e) {}

  // 2. Same-machine BroadcastChannel
  try {
    if (typeof window !== 'undefined' && 'BroadcastChannel' in window) {
      const bc = new BroadcastChannel('hh_team_alerts_channel');
      bc.postMessage(alertData);
      bc.close();
    }
  } catch (e) {
    console.warn("Failed to broadcast alert:", e);
  }
}
