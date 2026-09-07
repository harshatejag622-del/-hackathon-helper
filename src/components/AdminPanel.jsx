import React, { useState } from 'react';
import { useChat } from '../context/ChatContext';
import { 
  ShieldCheck, 
  Users, 
  Award, 
  FileCheck, 
  Send, 
  Download, 
  Search, 
  Filter, 
  Check, 
  X, 
  AlertCircle,
  Megaphone,
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import confetti from 'canvas-confetti';

const INITIAL_TEAMS_DATA = [
  {
    id: 'team-1',
    name: 'Team Nova (AI/ML)',
    leader: 'Alex Chen',
    track: 'HealthTech & Bio',
    project: 'AIPulse Sentinel',
    members: ['Alex Chen (FullStack)', 'Priya Sharma (ML)', 'Marcus Vance (Backend)', 'Elena Rostova (Design)'],
    cosineScore: 98,
    status: 'Verified',
    submittedAt: '2 hours ago'
  },
  {
    id: 'team-2',
    name: 'CyberVanguard',
    leader: 'Devon Kim',
    track: 'FinTech & Web3',
    project: 'OmniHealth Grid',
    members: ['Devon Kim (Frontend)', 'Lucas Silva (FullStack)', 'Aisha Tariq (DevOps)'],
    cosineScore: 94,
    status: 'Verified',
    submittedAt: '3 hours ago'
  },
  {
    id: 'team-3',
    name: 'FullStack Forge',
    leader: 'Maya Lin',
    track: 'Sustainability',
    project: 'AuraAI Civic Environmental Sentinel',
    members: ['Maya Lin (FullStack)', 'Ravi Patel (Backend)', 'Sophie Martin (Design)'],
    cosineScore: 96,
    status: 'Pending Review',
    submittedAt: '45 mins ago'
  },
  {
    id: 'team-4',
    name: 'Vision XR Hub',
    leader: 'Leo Tanaka',
    track: 'Gaming & XR',
    project: 'SynapseWearable Agent',
    members: ['Leo Tanaka (Frontend)', 'Chloe Bennett (ML)', 'Samir Khan (DevOps)'],
    cosineScore: 89,
    status: 'Pending Review',
    submittedAt: 'Just now'
  }
];

export default function AdminPanel({ onBackToDashboard }) {
  const { sendMessage } = useChat();
  const [teams, setTeams] = useState(INITIAL_TEAMS_DATA);
  const [searchQuery, setSearchQuery] = useState('');
  const [trackFilter, setTrackFilter] = useState('All');
  const [announcementText, setAnnouncementText] = useState('');
  const [announcementSent, setAnnouncementSent] = useState(false);

  const filteredTeams = teams.filter(team => {
    const matchesSearch = team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          team.project.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          team.leader.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTrack = trackFilter === 'All' || team.track.includes(trackFilter);
    return matchesSearch && matchesTrack;
  });

  const toggleVerify = (teamId) => {
    setTeams(prev => prev.map(t => {
      if (t.id === teamId) {
        const nextStatus = t.status === 'Verified' ? 'Pending Review' : 'Verified';
        return { ...t, status: nextStatus };
      }
      return t;
    }));

    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.6 }
    });
  };

  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!announcementText.trim()) return;

    await sendMessage(`📢 [HACKATHON ORGANIZER ANNOUNCEMENT]: ${announcementText}`);
    setAnnouncementText('');
    setAnnouncementSent(true);

    setTimeout(() => {
      setAnnouncementSent(false);
    }, 4000);
  };

  const exportRosterJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(teams, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "hackathon_teams_roster.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-300 text-xs font-semibold border border-rose-500/30 mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-rose-400" />
            <span>Hackathon Organizer Command Console</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-white">
            Admin Team & Project Management
          </h2>
          <p className="text-xs text-slate-400">
            Oversee all registered teams, verify prototypes, review Gemini blueprints, and broadcast announcements.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            onClick={exportRosterJSON}
            className="btn btn-sm bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/10"
          >
            <Download className="w-4 h-4 mr-1.5 text-indigo-400" />
            Export Roster JSON
          </button>
          {onBackToDashboard && (
            <button
              onClick={onBackToDashboard}
              className="btn btn-sm bg-indigo-600 text-white border-0 font-bold"
            >
              Back to User View
            </button>
          )}
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400 font-semibold">Registered Hackers</span>
          <span className="text-2xl sm:text-3xl font-black text-white font-mono mt-1 block">142</span>
          <span className="text-[10px] text-emerald-400">+18 in last hour</span>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400 font-semibold">Active Squads</span>
          <span className="text-2xl sm:text-3xl font-black text-cyan-400 font-mono mt-1 block">36</span>
          <span className="text-[10px] text-slate-400">Avg 3.9 members / squad</span>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400 font-semibold">Projects Locked</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-400 font-mono mt-1 block">29</span>
          <span className="text-[10px] text-slate-400">Generated via Gemini</span>
        </div>
        <div className="glass-panel p-4 rounded-2xl border border-white/10">
          <span className="text-xs text-slate-400 font-semibold">Avg Cosine Match</span>
          <span className="text-2xl sm:text-3xl font-black text-pink-400 font-mono mt-1 block">94.2%</span>
          <span className="text-[10px] text-slate-400">Synergy rating</span>
        </div>
      </div>

      {/* Organizer Broadcast Widget */}
      <div className="glass-panel-glow rounded-3xl p-6 border border-rose-500/30 bg-rose-950/20">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Megaphone className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Broadcast Global Marathon Announcement</h4>
            <p className="text-xs text-slate-400">Sends high-priority organizer notice to all participant war room chats</p>
          </div>
        </div>

        {announcementSent && (
          <div className="mb-3 p-3 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400" />
            <span>Announcement successfully transmitted to all squad chats!</span>
          </div>
        )}

        <form onSubmit={handleBroadcast} className="flex gap-2">
          <input
            type="text"
            value={announcementText}
            onChange={(e) => setAnnouncementText(e.target.value)}
            placeholder="e.g. Mentor office hours are now open in Hall C! Food is served at 8:00 PM."
            className="flex-1 px-4 py-2.5 bg-slate-900/90 rounded-xl border border-white/10 text-sm text-white focus:outline-none focus:border-rose-500"
          />
          <button
            type="submit"
            disabled={!announcementText.trim()}
            className="btn btn-sm bg-rose-600 hover:bg-rose-500 text-white font-bold border-0 px-4 rounded-xl disabled:opacity-50"
          >
            <Send className="w-3.5 h-3.5 mr-1" /> Broadcast
          </button>
        </form>
      </div>

      {/* Search & Track Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search teams, projects, or leaders..."
            className="w-full pl-10 pr-4 py-2 bg-slate-900/80 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-indigo-500"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto text-xs">
          {['All', 'HealthTech', 'FinTech', 'Sustainability', 'Gaming'].map((track) => (
            <button
              key={track}
              onClick={() => setTrackFilter(track)}
              className={`px-3 py-1.5 rounded-xl font-semibold transition-all shrink-0 ${
                trackFilter === track
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-white border border-white/5'
              }`}
            >
              {track}
            </button>
          ))}
        </div>
      </div>

      {/* Teams Table */}
      <div className="glass-panel rounded-3xl border border-white/10 overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-900/90 text-slate-400 uppercase font-bold text-[10px] tracking-wider border-b border-white/10">
              <tr>
                <th className="py-3.5 px-4">Squad Name & Leader</th>
                <th className="py-3.5 px-4">Track</th>
                <th className="py-3.5 px-4">Selected Project</th>
                <th className="py-3.5 px-4">Members</th>
                <th className="py-3.5 px-4">Cosine Synergy</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredTeams.map((team) => {
                const isVerified = team.status === 'Verified';

                return (
                  <tr key={team.id} className="hover:bg-white/[0.02] transition-colors">
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-white block">{team.name}</span>
                      <span className="text-[10px] text-slate-400">Lead: {team.leader}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30 text-[10px] font-bold">
                        {team.track}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-medium text-slate-200 block truncate max-w-[160px]">
                        {team.project}
                      </span>
                      <span className="text-[10px] text-slate-500">{team.submittedAt}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-mono text-white font-bold">{team.members.length} members</span>
                      <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                        {team.members[0]}...
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                      {team.cosineScore}%
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                        isVerified
                          ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                      }`}>
                        {isVerified ? '✓ Verified' : '● Review'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => toggleVerify(team.id)}
                        className={`btn btn-xs rounded-lg font-bold ${
                          isVerified
                            ? 'bg-slate-800 text-slate-400 border border-white/10'
                            : 'bg-emerald-600 hover:bg-emerald-500 text-white border-0'
                        }`}
                      >
                        {isVerified ? 'Revoke' : 'Verify Squad'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
