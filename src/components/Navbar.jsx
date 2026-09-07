import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInvites } from '../context/InviteContext';
import { useChat } from '../context/ChatContext';
import ThemeToggle from './ThemeToggle';
import { 
  Sparkles, 
  Users, 
  Lightbulb, 
  Clock, 
  LayoutDashboard, 
  Home, 
  Menu, 
  X, 
  Flame, 
  User, 
  LogOut, 
  LogIn, 
  Bell, 
  Check, 
  ShieldCheck,
  MessageSquare
} from 'lucide-react';

export default function Navbar({ activeTab, setActiveTab, onOpenAuthModal }) {
  const { currentUser, userProfile, logout } = useAuth();
  const { receivedInvites, pendingCount, acceptInvite, declineInvite } = useInvites();
  const { toggleChat, unreadCount } = useChat() || {};

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home', icon: Home },
    { id: 'find-team', label: 'Find Team', icon: Users, badge: 'Cosine AI' },
    { id: 'generate-ideas', label: 'Generate Ideas', icon: Lightbulb, badge: 'Gemini' },
    { id: 'timeline', label: 'Timeline', icon: Clock, badge: '48h Plan' },
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard }
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
    setNotificationsOpen(false);
  };

  const displayName = userProfile?.displayName || currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Hacker';

  const pendingInvites = receivedInvites.filter(inv => inv.status === 'pending');

  return (
    <header className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-8 py-3">
      <nav className="max-w-7xl mx-auto glass-panel rounded-2xl px-4 py-2.5 flex items-center justify-between shadow-2xl border border-white/10">
        {/* Brand */}
        <div 
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform duration-300">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black tracking-tight text-white group-hover:text-indigo-400 transition-colors">
                Hackathon<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">Helper</span>
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                AI Powered
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden sm:block">Team Match • Ideation • 48h Sprint</p>
          </div>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900/60 p-1 rounded-xl border border-white/5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 ${
                  isActive
                    ? 'text-white bg-indigo-600/80 shadow-md shadow-indigo-600/30 backdrop-blur'
                    : 'text-slate-300 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
                {item.badge && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded font-semibold ${
                    isActive 
                      ? 'bg-white/20 text-white' 
                      : 'bg-indigo-950 text-indigo-300 border border-indigo-800/40'
                  }`}>
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Right actions: Notifications, Chat, Profile & Quick Match */}
        <div className="flex items-center gap-2">
          {/* Theme Selector (Always Visible) */}
          <ThemeToggle />

          {/* Chat Button with Unread Badge */}
          <button
            onClick={toggleChat}
            className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-colors hidden sm:flex"
            title="Team War Room Chat"
          >
            <MessageSquare className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-indigo-500 text-white text-[9px] font-black items-center justify-center">
                  {unreadCount}
                </span>
              </span>
            )}
          </button>

          {/* Notification Bell with Pending Invites Badge */}
          <div className="relative">
            <button
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setUserDropdownOpen(false);
              }}
              className="relative p-2 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-white/10 text-slate-300 hover:text-white transition-colors"
              title="Team Invites"
            >
              <Bell className="w-4 h-4" />
              {pendingCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-white text-[9px] font-black items-center justify-center">
                    {pendingCount}
                  </span>
                </span>
              )}
            </button>

            {/* Notifications Dropdown */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-2 w-80 glass-panel-glow rounded-2xl p-4 shadow-2xl border border-indigo-500/30 flex flex-col gap-3 animate-fade-in z-50">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-indigo-400" />
                    Squad Invitations
                  </h4>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold">
                    {pendingInvites.length} Pending
                  </span>
                </div>

                {pendingInvites.length === 0 ? (
                  <div className="py-6 text-center text-xs text-slate-400">
                    <p>No pending invites right now.</p>
                    <p className="text-[11px] text-indigo-400 mt-1">Send invites from Find Team!</p>
                  </div>
                ) : (
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {pendingInvites.map((inv) => (
                      <div
                        key={inv.id}
                        className="p-2.5 rounded-xl bg-slate-900/90 border border-white/10 text-xs space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="font-bold text-white block">{inv.fromName}</span>
                            <span className="text-[10px] text-slate-400">{inv.fromRole}</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                            {inv.matchScore}% Match
                          </span>
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            onClick={() => acceptInvite(inv.id)}
                            className="flex-1 btn btn-xs bg-emerald-600 hover:bg-emerald-500 text-white font-bold border-0 rounded-lg flex items-center justify-center gap-1"
                          >
                            <Check className="w-3 h-3" />
                            Accept
                          </button>
                          <button
                            onClick={() => declineInvite(inv.id)}
                            className="btn btn-xs bg-slate-800 hover:bg-slate-700 text-rose-300 border border-rose-500/30 rounded-lg"
                          >
                            Decline
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* User Profile dropdown */}
          {currentUser ? (
            <div className="relative">
              <div 
                onClick={() => {
                  setUserDropdownOpen(!userDropdownOpen);
                  setNotificationsOpen(false);
                }}
                className="flex items-center gap-2.5 p-1.5 pr-3 rounded-full bg-slate-900/80 hover:bg-slate-800/90 border border-indigo-500/30 cursor-pointer transition-colors"
              >
                {currentUser.photoURL ? (
                  <img
                    src={currentUser.photoURL}
                    alt={displayName}
                    className="w-8 h-8 rounded-full object-cover border border-indigo-400/50"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white font-bold text-xs">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="text-left">
                  <span className="text-xs font-bold text-white block leading-tight max-w-[100px] truncate">
                    {displayName}
                  </span>
                  <span className="text-[10px] text-indigo-300 block leading-tight">
                    {userProfile?.preferredRole || 'Profile'}
                  </span>
                </div>
              </div>

              {/* User Dropdown */}
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 glass-panel-glow rounded-2xl p-2 shadow-2xl border border-white/10 flex flex-col gap-1 animate-fade-in z-50">
                  <button
                    onClick={() => handleNavClick('profile')}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left transition-colors ${
                      activeTab === 'profile' ? 'bg-indigo-600 text-white' : 'text-slate-200 hover:bg-white/10'
                    }`}
                  >
                    <User className="w-4 h-4 text-indigo-400" />
                    <span>Edit Profile & Skills</span>
                  </button>
                  <button
                    onClick={() => {
                      logout();
                      setUserDropdownOpen(false);
                    }}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-left text-rose-400 hover:bg-rose-500/10 transition-colors"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={onOpenAuthModal}
              className="btn btn-sm bg-indigo-600 hover:bg-indigo-700 text-white border-0 shadow-lg shadow-indigo-600/30 px-4 font-semibold normal-case"
            >
              <LogIn className="w-4 h-4 mr-1.5" />
              Sign In
            </button>
          )}

          <button 
            onClick={() => handleNavClick('find-team')}
            className="btn btn-sm bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white border-0 shadow-lg shadow-indigo-500/25 px-4 font-semibold normal-case hidden sm:flex"
          >
            <Flame className="w-4 h-4 mr-1 text-amber-300" />
            Quick Match
          </button>
        </div>

        {/* Mobile menu hamburger */}
        <div className="flex md:hidden items-center gap-2">
          {pendingCount > 0 && (
            <button
              onClick={() => handleNavClick('find-team')}
              className="p-1.5 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30 relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-rose-500 text-[8px] text-white flex items-center justify-center font-bold">
                {pendingCount}
              </span>
            </button>
          )}
          {currentUser && (
            <button
              onClick={() => handleNavClick('profile')}
              className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold"
            >
              {displayName.charAt(0).toUpperCase()}
            </button>
          )}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/10"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden mt-2 glass-panel rounded-2xl p-4 shadow-2xl border border-white/10 flex flex-col gap-2 animate-fadeIn">
          {/* Mobile Theme Selector */}
          <div className="mb-2">
            <ThemeToggle isMobile={true} />
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`flex items-center justify-between p-3 rounded-xl text-left font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] px-2 py-0.5 rounded bg-black/30 font-semibold text-slate-200">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-2 mt-1 border-t border-white/10">
            {currentUser ? (
              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleNavClick('profile')}
                  className="flex items-center gap-2 text-sm text-indigo-300 font-semibold"
                >
                  <User className="w-4 h-4" />
                  <span>Profile ({displayName})</span>
                </button>
                <button
                  onClick={logout}
                  className="text-xs text-rose-400 hover:text-rose-300"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuthModal();
                }}
                className="w-full btn btn-sm bg-indigo-600 text-white font-bold"
              >
                Sign In / Sign Up
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
