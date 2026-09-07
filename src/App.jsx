import React, { useState, Suspense, lazy } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { InviteProvider } from './context/InviteContext';
import { ChatProvider } from './context/ChatContext';
import Navbar from './components/Navbar';
import Hackathon3DScene from './components/Hackathon3DScene';
import HeroSection from './components/HeroSection';
import TeamChatPanel from './components/TeamChatPanel';
import AuthModal from './components/AuthModal';
import ErrorBoundary from './components/ErrorBoundary';
import { ViewLoadingSkeleton } from './components/SkeletonLoader';
import { Sparkles, Code2 } from 'lucide-react';

// Lazy load views for optimized bundle splitting & faster first contentful paint
const ProfilePage = lazy(() => import('./components/ProfilePage'));
const TeamMatchingView = lazy(() => import('./components/TeamMatchingView'));
const IdeaGeneratorView = lazy(() => import('./components/IdeaGeneratorView'));
const TimelinePlannerView = lazy(() => import('./components/TimelinePlannerView'));
const DashboardView = lazy(() => import('./components/DashboardView'));

function MainLayout() {
  const [activeTab, setActiveTab] = useState('home');
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const { currentUser, userProfile } = useAuth();

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
