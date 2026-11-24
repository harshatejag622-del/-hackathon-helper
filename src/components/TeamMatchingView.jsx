import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useInvites } from '../context/InviteContext';
import { fetchAllParticipants, getTopMatches } from '../services/matchingService';
import { cloudSync } from '../services/cloudSyncService';
import TeamMatch3DGraph from './TeamMatch3DGraph';
import { 
  Users, 
  Sparkles, 
  Send, 
  Check, 
  Clock, 
  GraduationCap, 
  Code, 
  ShieldCheck, 
  Zap, 
  ChevronRight, 
  Flame,
  Award,
  Layers,
  ArrowRight,
  ExternalLink
} from 'lucide-react';

export default function TeamMatchingView({ onNavigate }) {
  const { currentUser, userProfile } = useAuth();
  const { sendInvite, hasInvited, acceptedTeammates } = useInvites();

  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [viewMode, setViewMode] = useState('both'); // 'both' | '3d' | 'list'
  const [invitingId, setInvitingId] = useState(null);

  // Active user profile fallback if guest
  const activeProfile = userProfile || {
    uid: currentUser?.uid || 'guest-hacker',
    displayName: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'You (Lead)',
    college: 'Your College / University',
    year: '3rd Year',
    preferredRole: 'FullStack',
    skills: ['Python', 'React', 'Machine Learning', 'Tailwind CSS', 'FastAPI'],
    interests: ['Artificial Intelligence', 'Sustainability & CleanTech', 'Web3 & Crypto']
  };

  const loadData = async () => {
    setLoading(true);
    try {
      const pool = await fetchAllParticipants(currentUser?.uid);
      setParticipants(pool);
    } catch (err) {
      console.error("Failed to load participants:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // 1. Cross-laptop real-time listener (when a friend on another laptop registers or saves profile)
    const unsubRegister = cloudSync.on('USER_REGISTERED', () => loadData());
    const unsubUpdate = cloudSync.on('USER_UPDATED', () => loadData());

    // 2. Listen to real-time cross-tab community updates on same machine
    let bc;
    try {
      bc = new BroadcastChannel('hh_team_sync_channel');
      bc.onmessage = (event) => {
        if (event.data?.type === 'profile_updated' || event.data?.type === 'new_registered_user') {
          loadData();
        }
      };
    } catch (e) {}

    return () => {
      unsubRegister();
      unsubUpdate();
      if (bc) bc.close();
    };
  }, [currentUser]);

  // Compute Top 5 Matches via weighted Cosine Similarity
  const topMatches = getTopMatches(activeProfile, participants, 5);

  const handleSendInvite = async (candidate) => {
    setInvitingId(candidate.uid);
    try {
      await sendInvite(candidate, candidate.match?.percentage);
    } catch (err) {
      console.error("Invite error:", err);
    } finally {
      setInvitingId(null);
    }
  };

  return (
    <div className="relative z-10 pt-4 sm:pt-6 pb-20 px-4 sm:px-8 max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 mb-3 backdrop-blur-md">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>AI Team Matching Engine • Cosine Similarity</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-white">
            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">Winning Squad</span>
          </h1>
          <p className="text-slate-300 text-xs sm:text-sm mt-1 max-w-2xl">
            Our multi-vector algorithm evaluates <strong className="text-indigo-300">Technical Skills (40%)</strong>,{' '}
            <strong className="text-pink-300">Hackathon Interests (30%)</strong>, and{' '}
            <strong className="text-amber-300">Role Complementarity (30%)</strong> to find your perfect teammates.
          </p>
        </div>

        {/* Algorithm Weights Legend */}
        <div className="flex items-center gap-2 p-2 rounded-2xl glass-panel border border-white/10 text-xs">
          <div className="px-2.5 py-1 rounded-xl bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
            Skills: 40%
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-pink-500/20 text-pink-300 font-bold border border-pink-500/30">
            Interests: 30%
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30">
            Role: 30%
          </div>
        </div>
      </div>

      {/* Accepted Squad Members Banner */}
      {acceptedTeammates.length > 0 && (
        <div className="mb-8 glass-panel-glow rounded-2xl p-4 border border-emerald-500/30 bg-emerald-950/20 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">Your Confirmed 48h Squad ({acceptedTeammates.length + 1}/4)</h4>
              <p className="text-xs text-slate-300">
                You + {acceptedTeammates.map(t => t.toName || t.fromName).join(', ')}
              </p>
            </div>
          </div>
          <button 
            onClick={() => onNavigate?.('timeline')}
            className="btn btn-sm bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold border-0"
          >
            Start 48h Timeline →
          </button>
        </div>
      )}

      {/* Main Grid: 3D Match Constellation + Top 5 Match Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: 3D Constellation Visualization */}
        <div className="lg:col-span-6 space-y-4">
          <TeamMatch3DGraph
            matches={topMatches}
            userProfile={activeProfile}
            selectedCandidate={selectedCandidate}
            onSelectCandidate={(c) => setSelectedCandidate(c)}
          />

          {/* Quick instructions / focus preview */}
          <div className="glass-panel p-4 rounded-2xl border border-white/10 text-xs text-slate-400 flex items-center justify-between">
            <span>
              {selectedCandidate ? (
                <span>
                  Focused on: <strong className="text-white">{selectedCandidate.displayName}</strong> ({selectedCandidate.match?.percentage}% Match)
                </span>
              ) : (
                <span>Click any 3D node above to inspect skill vectors and send an invite.</span>
              )}
            </span>
            {selectedCandidate && (
              <button 
                onClick={() => setSelectedCandidate(null)}
                className="text-indigo-400 hover:text-white"
              >
                Clear selection
              </button>
            )}
          </div>
        </div>

        {/* Right Column: Top 5 Match Cards */}
        <div className="lg:col-span-6 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400" />
              Top 5 AI Matches for You
            </h3>
            <span className="text-xs text-slate-400">Ranked by Cosine Score</span>
          </div>

          {loading ? (
            <div className="glass-panel p-12 rounded-3xl text-center">
              <span className="loading loading-spinner loading-lg text-indigo-500"></span>
              <p className="text-xs text-slate-400 mt-3">Computing multi-vector cosine similarities...</p>
            </div>
          ) : topMatches.length === 0 ? (
            <div className="glass-panel p-8 sm:p-10 rounded-3xl text-center border border-indigo-500/20 bg-indigo-950/20">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-base font-bold text-white">No Other Teammates Registered Yet</h4>
              <p className="text-xs text-slate-400 mt-1.5 max-w-sm mx-auto leading-relaxed">
                You are registered and ready! When your friends open the app in another tab or phone and sign up with their email and skills, they will immediately appear here with live Cosine Match scores!
              </p>
            </div>
          ) : (
            topMatches.map((candidate, idx) => {
              const isSelected = selectedCandidate?.uid === candidate.uid;
              const invited = hasInvited(candidate.uid);
              const score = candidate.match.percentage;

              return (
                <div
                  key={candidate.uid}
                  onClick={() => setSelectedCandidate(candidate)}
                  className={`glass-panel rounded-3xl p-5 sm:p-6 transition-all duration-300 border cursor-pointer ${
                    isSelected 
                      ? 'border-indigo-400 bg-slate-900/90 shadow-2xl shadow-indigo-500/20 scale-[1.01]' 
                      : 'border-white/10 hover:border-indigo-500/30 bg-slate-950/70'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    {/* Candidate Identity */}
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        {candidate.photoURL ? (
                          <img
                            src={candidate.photoURL}
                            alt={candidate.displayName}
                            className="w-12 h-12 rounded-2xl object-cover border border-white/10"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-pink-500 flex items-center justify-center text-white font-black text-lg">
                            {candidate.displayName.charAt(0)}
                          </div>
                        )}
                        <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] font-bold text-slate-300">
                          #{idx + 1}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">{candidate.displayName}</h4>
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                            {candidate.preferredRole}
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                          <GraduationCap className="w-3.5 h-3.5 text-indigo-400" />
                          <span>{candidate.college}</span>
                          <span>•</span>
                          <span>{candidate.year}</span>
                        </p>
                      </div>
                    </div>

                    {/* Match Score Badge */}
                    <div className="text-right shrink-0">
                      <div className="inline-flex items-center gap-1 px-3 py-1 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 font-mono font-black text-sm sm:text-base">
                        <Flame className="w-4 h-4 text-emerald-400" />
                        <span>{score}%</span>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">Cosine Match</span>
                    </div>
                  </div>

                  {/* Bio */}
                  {candidate.bio && (
                    <p className="text-xs text-slate-300 mt-3 line-clamp-2 leading-relaxed italic">
                      "{candidate.bio}"
                    </p>
                  )}

                  {/* Common Skills Highlighted */}
                  <div className="mt-4 pt-3 border-t border-white/5 space-y-2">
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1 mr-1">
                        <Check className="w-3.5 h-3.5" /> Common Skills:
                      </span>
                      {candidate.match.commonSkills.length > 0 ? (
                        candidate.match.commonSkills.map((skill, sIdx) => (
                          <span
                            key={sIdx}
                            className="text-[10px] font-bold px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                          >
                            {skill}
                          </span>
                        ))
                      ) : (
                        <span className="text-[10px] text-slate-500 italic">None yet</span>
                      )}
                    </div>

                    {/* Complementary Skills (Superpowers they bring) */}
                    <div className="flex flex-wrap items-center gap-1.5">
                      <span className="text-[11px] font-bold text-cyan-400 flex items-center gap-1 mr-1">
                        <Sparkles className="w-3.5 h-3.5" /> Adds to Squad:
                      </span>
                      {candidate.match.complementarySkills.slice(0, 4).map((skill, sIdx) => (
                        <span
                          key={sIdx}
                          className="text-[10px] font-medium px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-white/5"
                        >
                          +{skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Bottom Actions: Score Breakdown & Send Invite */}
                  <div className="mt-4 pt-3 border-t border-white/5 flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-[11px] text-slate-400">
                      <span>Skills: <strong className="text-indigo-300">{candidate.match.breakdown.skillsScore}%</strong></span>
                      <span>•</span>
                      <span>Interests: <strong className="text-pink-300">{candidate.match.breakdown.interestsScore}%</strong></span>
                      <span>•</span>
                      <span>Synergy: <strong className="text-amber-300">{candidate.match.breakdown.roleSynergyScore}%</strong></span>
                    </div>

                    <button
                      type="button"
                      disabled={invited || invitingId === candidate.uid}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSendInvite(candidate);
                      }}
                      className={`btn btn-sm rounded-xl font-bold text-xs transition-all ${
                        invited
                          ? 'bg-slate-800 text-slate-400 border border-white/5 cursor-default'
                          : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-lg shadow-indigo-500/25 border-0'
                      }`}
                    >
                      {invitingId === candidate.uid ? (
                        <span className="loading loading-spinner loading-xs"></span>
                      ) : invited ? (
                        <>
                          <Check className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                          Invite Sent
                        </>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5 mr-1" />
                          Send Squad Invite
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
