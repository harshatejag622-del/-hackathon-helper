import React, { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InviteProvider } from './context/InviteContext';
import { ChatProvider } from './context/ChatContext';
import Navbar from './components/Navbar';
import Hackathon3DScene from './components/Hackathon3DScene';
import HeroSection from './components/HeroSection';
import TeamChatPanel from './components/TeamChatPanel';
import AuthModal from './components/AuthModal';
import AlertNotificationModal, { broadcastTeamAlert } from './components/AlertNotificationModal';
import ErrorBoundary from './components/ErrorBoundary';
import { ViewLoadingSkeleton } from './components/SkeletonLoader';
import { Sparkles, Code2, Crown, BellRing, AlertTriangle, CheckCircle2 } from 'lucide-react';

// Lazy load views for optimized bundle splitting & faster first contentful paint
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const TeamMatchingView = lazy(() => import('./components/TeamMatchingView'));
const IdeaGeneratorView = lazy(() => import('./components/IdeaGeneratorView'));
const TimelinePlannerView = lazy(() => import('./components/TimelinePlannerView'));
const DashboardView = lazy(() => import('./components/DashboardView'));

function MainLayout() {
  const [activeTab, setActiveTab] = useState('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { currentUser, userProfile, isTeamLead, toggleTeamLead } = useAuth();

  // Team Lead Broadcast action handler
  const handleLeadAlert = (type) => {
    const leaderName = userProfile?.displayName || currentUser?.displayName || 'Alex Chen (Team Lead)';
    if (type === 'incomplete') {
      broadcastTeamAlert({
        isPopup: true,
        type: 'incomplete',
        senderRole: '👑 Team Lead Urgent Notice',
        title: '⚠️ Work Not Completed Alert!',
        message: `${leaderName} noticed Phase 3 (Core MVP Build) is behind schedule! Please push your recent commits, resolve blockers, and report status in War Room Chat.`,
        milestone: {
          title: 'Phase 3: Core MVP Build (12-32h)',
          completed: false,
          progress: 35
        }
      });
    } else if (type === 'completed') {
      broadcastTeamAlert({
        isPopup: true,
        type: 'completed',
        senderRole: '👑 Milestone Progress Update',
        title: '🎉 Milestone Phase 2 Completed!',
        message: `${leaderName} marked Phase 2 (Architecture & DB) as 100% finished! Great job team, moving to Phase 3 MVP build.`,
        milestone: {
          title: 'Phase 2: Architecture & DB',
          completed: true,
          progress: 100
        }
      });
    } else {
      const customMsg = window.prompt("Enter urgent message to alert all team members across all tabs:", "Hurry up! Hackathon midpoint review is in 30 minutes!");
      if (customMsg && customMsg.trim()) {
        broadcastTeamAlert({
          isPopup: true,
          type: 'urgent',
          senderRole: '👑 Team Lead Broadcast',
          title: '📢 Urgent Team Notice',
          message: `${leaderName}: ${customMsg.trim()}`
        });
      }
    }
  };

  // Keep 3D scene visible behind views with adaptive opacity
  const sceneOpacity = 
    activeTab === 'home' ? 'opacity-100' :
    activeTab === 'profile' ? 'opacity-85' : 
    activeTab === 'find-team' ? 'opacity-25' : 
    activeTab === 'generate-ideas' ? 'opacity-25' : 
    activeTab === 'timeline' ? 'opacity-20' : 'opacity-25';

  return (
    <div className="relative min-h-screen w-full bg-base-100 text-slate-100 overflow-x-hidden transition-colors duration-300">
      {/* 3D Hackathon Hall Scene in Background */}
      <div 
        className={`fixed inset-0 transition-opacity duration-700 pointer-events-auto ${sceneOpacity}`}
      >
        <ErrorBoundary>
          <Hackathon3DScene />
        </ErrorBoundary>
      </div>

      {/* Subtle radial ambient gradients */}
      <div className="fixed inset-0 bg-gradient-to-b from-slate-950/60 via-slate-900/40 to-slate-950/80 pointer-events-none"></div>
      <div className="fixed -top-40 -left-40 w-96 h-96 bg-indigo-600/15 rounded-full blur-3xl pointer-events-none"></div>
      <div className="fixed top-1/2 -right-40 w-96 h-96 bg-pink-600/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Floating Top Navigation */}
      <Navbar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        onOpenAuthModal={() => setAuthModalOpen(true)} 
      />

      {/* Interactive Team Lead Control & Alert Broadcast Bar (Explicit 110px top clearance) */}
      <div 
        className="relative z-20 px-4 sm:px-8 max-w-7xl mx-auto pb-4"
        style={{ paddingTop: '115px' }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-2xl bg-indigo-950/90 border border-indigo-500/50 backdrop-blur-xl shadow-2xl">
          <div className="flex items-center gap-3">
            <span className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md ${
              isTeamLead 
                ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black ring-1 ring-amber-400' 
                : 'bg-indigo-600/50 text-indigo-200 ring-1 ring-indigo-400/40'
            }`}>
              <Crown className="w-4 h-4 text-amber-300" />
              {isTeamLead ? 'You are Team Lead 👑' : 'Team Member View 💻'}
            </span>
            <button
              onClick={() => toggleTeamLead()}
              className="text-xs font-medium underline text-indigo-300 hover:text-white transition-colors cursor-pointer"
            >
              (Switch to {isTeamLead ? 'Member' : 'Lead'})
            </button>
          </div>

          {/* Interactive Alert Triggers (Works across all open tabs!) */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="text-[11px] text-slate-400 font-semibold hidden sm:inline">Squad Command:</span>
            <button
              onClick={() => handleLeadAlert('incomplete')}
              className="btn btn-error btn-xs gap-1 text-white shadow-md active:scale-95 font-bold"
              title="Pop up warning on all teammate tabs about delayed work"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              ⚠️ Alert Work Incomplete
            </button>

            <button
              onClick={() => handleLeadAlert('completed')}
              className="btn btn-success btn-xs gap-1 text-slate-950 font-bold shadow-md active:scale-95"
              title="Broadcast milestone progress celebration"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              🎉 Milestone Done
            </button>

            <button
              onClick={() => handleLeadAlert('custom')}
              className="btn btn-primary btn-xs gap-1 shadow-md active:scale-95 font-bold"
              title="Send custom broadcast message to all open tabs"
            >
              <BellRing className="w-3.5 h-3.5" />
              📢 Broadcast Alert
            </button>
          </div>
        </div>
      </div>

      {/* Global Interactive Alert Popup Box & Toasts (cross-tab real-time sync) */}
      <AlertNotificationModal onNavigate={setActiveTab} />

      {/* Main Content Views wrapped in Suspense and ErrorBoundary */}
      <main className="relative z-10 min-h-screen">
        <ErrorBoundary>
          <Suspense fallback={<ViewLoadingSkeleton />}>
            {activeTab === 'home' && (
              <HeroSection setActiveTab={setActiveTab} />
            )}

            {activeTab === 'profile' && (
              <ProfilePage onNavigate={setActiveTab} />
            )}

            {activeTab === 'find-team' && (
              <TeamMatchingView onNavigate={setActiveTab} />
            )}

            {activeTab === 'generate-ideas' && (
              <IdeaGeneratorView onNavigate={setActiveTab} />
            )}

            {activeTab === 'timeline' && (
              <TimelinePlannerView onNavigate={setActiveTab} />
            )}

            {activeTab === 'dashboard' && (
              <DashboardView onNavigate={setActiveTab} />
            )}
          </Suspense>
        </ErrorBoundary>
      </main>

      {/* Real-Time Team War Room Chat */}
      <ErrorBoundary>
        <TeamChatPanel />
      </ErrorBoundary>

      {/* Authentication Modal */}
      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          if (!userProfile?.isProfileComplete) {
            setActiveTab('profile');
          }
        }}
      />

      {/* Footer */}
      <footer className="relative z-10 py-6 border-t border-white/5 bg-slate-950/70 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-200">HackathonHelper</span>
            <span>•</span>
            <span>AI Team Matching • Idea Matrix • 48-Hour Sprint</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <Code2 className="w-3.5 h-3.5 text-indigo-400" /> React + Three.js + Socket.io + PWA
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-pink-400" /> Powered by Gemini Pro
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <InviteProvider>
          <ChatProvider>
            <MainLayout />
          </ChatProvider>
        </InviteProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}
