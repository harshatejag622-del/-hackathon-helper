import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { 
  User, 
  GraduationCap, 
  Calendar, 
  Code, 
  Sparkles, 
  Clock, 
  Briefcase, 
  CheckCircle2, 
  Save, 
  Plus, 
  X, 
  Compass,
  ArrowRight,
  Zap,
  Layers
} from 'lucide-react';
import confetti from 'canvas-confetti';

const PRESET_SKILLS = [
  'Python', 'React', 'Node.js', 'Machine Learning', 'PyTorch', 
  'UI/UX Design', 'TypeScript', 'Tailwind CSS', 'FastAPI', 
  'Next.js', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes',
  'AWS', 'Solidity', 'Web3', 'Flutter', 'Go', 'Rust', 'Figma'
];

const PRESET_INTERESTS = [
  'Artificial Intelligence', 'GenAI & LLMs', 'Web3 & Crypto', 
  'Sustainability & CleanTech', 'Gaming & XR', 'FinTech & DeFi', 
  'HealthTech & Bio', 'EdTech', 'CyberSecurity', 'Smart Cities & IoT'
];

const PREFERRED_ROLES = [
  { id: 'Frontend', label: 'Frontend Developer', icon: '🎨' },
  { id: 'Backend', label: 'Backend Architect', icon: '⚙️' },
  { id: 'ML', label: 'ML / AI Engineer', icon: '🧠' },
  { id: 'Design', label: 'UI/UX Designer', icon: '✨' },
  { id: 'DevOps', label: 'DevOps & Cloud', icon: '☁️' },
  { id: 'FullStack', label: 'Full Stack Generalist', icon: '🚀' },
];

export default function ProfilePage({ onNavigate }) {
  const { currentUser, userProfile, saveProfile, isConfigured } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    college: '',
    year: '3rd Year',
    skills: ['Python', 'React', 'Machine Learning'],
    interests: ['Artificial Intelligence', 'Sustainability & CleanTech'],
    availability: 'Full-time',
    preferredRole: 'FullStack',
    bio: '',
    github: ''
  });

  const [customSkillInput, setCustomSkillInput] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sync existing profile into form
  useEffect(() => {
    if (userProfile) {
      setFormData({
        name: userProfile.displayName || currentUser?.displayName || '',
        college: userProfile.college || '',
        year: userProfile.year || '3rd Year',
        skills: userProfile.skills && userProfile.skills.length > 0 ? userProfile.skills : ['Python', 'React', 'Machine Learning'],
        interests: userProfile.interests && userProfile.interests.length > 0 ? userProfile.interests : ['Artificial Intelligence'],
        availability: userProfile.availability || 'Full-time',
        preferredRole: userProfile.preferredRole || 'FullStack',
        bio: userProfile.bio || '',
        github: userProfile.github || ''
      });
    } else if (currentUser) {
      setFormData(prev => ({
        ...prev,
        name: currentUser.displayName || ''
      }));
    }
  }, [userProfile, currentUser]);

  const toggleSkill = (skill) => {
    setFormData(prev => {
      const exists = prev.skills.includes(skill);
      return {
        ...prev,
        skills: exists 
          ? prev.skills.filter(s => s !== skill)
          : [...prev.skills, skill]
      };
    });
  };

  const addCustomSkill = (e) => {
    e.preventDefault();
    const trimmed = customSkillInput.trim();
    if (trimmed && !formData.skills.includes(trimmed)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, trimmed]
      }));
      setCustomSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const toggleInterest = (interest) => {
    setFormData(prev => {
      const exists = prev.interests.includes(interest);
      return {
        ...prev,
        interests: exists 
          ? prev.interests.filter(i => i !== interest)
          : [...prev.interests, interest]
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSaveSuccess(false);

    try {
      await saveProfile(formData);
      setSaveSuccess(true);
      
      // Fire confetti celebration
      confetti({
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 }
      });

      setTimeout(() => {
        setSaveSuccess(false);
      }, 4000);
    } catch (err) {
      console.error("Error saving profile:", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="relative z-10 pt-28 pb-20 px-4 sm:px-8 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/20 text-indigo-300 text-xs font-semibold border border-indigo-500/30 mb-3 backdrop-blur-md">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span>Hackathon Skill Profile & Cosine Matching Vector</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white">
          Innovator <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-400">Profile</span>
        </h1>
        <p className="text-slate-300 text-xs sm:text-sm mt-2 max-w-xl mx-auto">
          Complete your profile so the AI Team Matching Engine can assess your complementary skill vector and pair you with the ideal 48-hour squad.
        </p>
      </div>

      {/* Floating Translucent Form allowing 3D Scene to show through */}
      <form onSubmit={handleSubmit} className="glass-panel-glow rounded-3xl p-6 sm:p-10 border border-indigo-500/30 shadow-2xl relative space-y-8 backdrop-blur-xl bg-slate-950/70">
        
        {/* Top notification if saved */}
        {saveSuccess && (
          <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-between text-sm animate-fade-in shadow-lg">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                <strong>Profile saved to Firestore!</strong> Your skill vector is now ready for cosine team matching.
              </span>
            </div>
            {onNavigate && (
              <button
                type="button"
                onClick={() => onNavigate('find-team')}
                className="btn btn-xs bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold border-0"
              >
                Find Team Now →
              </button>
            )}
          </div>
        )}

        {/* 1. Basic Info Section */}
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-2 mb-4">
            <User className="w-4 h-4" />
            1. Personal & Academic Information
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Alex Rivera"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">College / University</label>
              <div className="relative">
                <GraduationCap className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  required
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  placeholder="e.g. Stanford / Berkeley / MIT"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none text-sm text-white"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">Year of Study</label>
              <div className="relative">
                <Calendar className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <select
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none text-sm text-white appearance-none"
                >
                  <option value="1st Year">1st Year (Freshman)</option>
                  <option value="2nd Year">2nd Year (Sophomore)</option>
                  <option value="3rd Year">3rd Year (Junior)</option>
                  <option value="4th Year">4th Year (Senior)</option>
                  <option value="Postgraduate / PhD">Postgraduate / PhD</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">GitHub / Portfolio URL</label>
              <input
                type="text"
                value={formData.github}
                onChange={(e) => setFormData({ ...formData, github: e.target.value })}
                placeholder="github.com/username"
                className="w-full px-4 py-2.5 bg-slate-900/80 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none text-sm text-white"
              />
            </div>
          </div>
        </div>

        {/* 2. Skills Multi-Select */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <Code className="w-4 h-4" />
              2. Technical Skills ({formData.skills.length} selected)
            </h3>
            <span className="text-[11px] text-slate-400">Click chips to toggle or add custom</span>
          </div>

          {/* Selected skills pills */}
          <div className="flex flex-wrap gap-2 mb-3 min-h-[38px] p-3 rounded-2xl bg-slate-900/90 border border-white/10">
            {formData.skills.length === 0 ? (
              <span className="text-xs text-slate-500 italic">No skills selected yet. Choose from below!</span>
            ) : (
              formData.skills.map((skill) => (
                <span
                  key={skill}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 text-xs font-semibold group hover:bg-indigo-600/50 transition-colors"
                >
                  <span>{skill}</span>
                  <button
                    type="button"
                    onClick={() => removeSkill(skill)}
                    className="text-indigo-400 hover:text-white"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))
            )}
          </div>

          {/* Preset skill options chips */}
          <div className="flex flex-wrap gap-1.5">
            {PRESET_SKILLS.map((skill) => {
              const isSelected = formData.skills.includes(skill);
              return (
                <button
                  key={skill}
                  type="button"
                  onClick={() => toggleSkill(skill)}
                  className={`text-xs px-3 py-1.5 rounded-xl font-medium transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30 border border-indigo-400'
                      : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/5'
                  }`}
                >
                  {skill}
                </button>
              );
            })}
          </div>

          {/* Add custom skill input */}
          <div className="mt-3 flex gap-2 max-w-sm">
            <input
              type="text"
              value={customSkillInput}
              onChange={(e) => setCustomSkillInput(e.target.value)}
              placeholder="Add other skill (e.g. LangChain)"
              className="flex-1 px-3.5 py-1.5 bg-slate-900/80 rounded-xl border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-500"
            />
            <button
              type="button"
              onClick={addCustomSkill}
              className="btn btn-xs bg-slate-800 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl px-3"
            >
              <Plus className="w-3.5 h-3.5 mr-1" /> Add
            </button>
          </div>
        </div>

        {/* 3. Interests Multi-Select */}
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-pink-400 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              3. Innovation Tracks & Interests ({formData.interests.length} selected)
            </h3>
            <span className="text-[11px] text-slate-400">Used for project idea alignment</span>
          </div>

          <div className="flex flex-wrap gap-2">
            {PRESET_INTERESTS.map((interest) => {
              const isSelected = formData.interests.includes(interest);
              return (
                <button
                  key={interest}
                  type="button"
                  onClick={() => toggleInterest(interest)}
                  className={`text-xs px-3.5 py-2 rounded-xl font-medium transition-all ${
                    isSelected
                      ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30 border border-pink-400'
                      : 'bg-slate-900/70 text-slate-300 hover:bg-slate-800 hover:text-white border border-white/5'
                  }`}
                >
                  {interest}
                </button>
              );
            })}
          </div>
        </div>

        {/* 4. Preferred Role & Availability */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-amber-400 flex items-center gap-2 mb-3">
              <Briefcase className="w-4 h-4" />
              4. Preferred Squad Role
            </h3>
            <div className="grid grid-cols-2 gap-2">
              {PREFERRED_ROLES.map((role) => {
                const isSelected = formData.preferredRole === role.id;
                return (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, preferredRole: role.id })}
                    className={`p-3 rounded-2xl text-left transition-all border ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-500/50 text-white shadow-lg shadow-amber-500/10'
                        : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <span className="text-lg block mb-1">{role.icon}</span>
                    <span className="text-xs font-bold block">{role.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2 mb-3">
              <Clock className="w-4 h-4" />
              5. Sprint Availability
            </h3>
            <div className="space-y-2">
              {[
                { id: 'Full-time', title: 'Full-Time Marathoner (All 48 Hours)', desc: 'Ready for intensive live hacking, daily standups, and demo rehearsals.' },
                { id: 'Part-time', title: 'Part-Time Contributor (12-24 Hours)', desc: 'Available for specific architectural sprints and designated pull requests.' },
                { id: 'Flexible', title: 'Flexible / Async Contributor', desc: 'Working in shifts or contributing modular components.' },
              ].map((avail) => {
                const isSelected = formData.availability === avail.id;
                return (
                  <div
                    key={avail.id}
                    onClick={() => setFormData({ ...formData, availability: avail.id })}
                    className={`p-3 rounded-2xl cursor-pointer transition-all border ${
                      isSelected
                        ? 'bg-emerald-500/20 border-emerald-500/50 text-white shadow-md'
                        : 'bg-slate-900/60 border-white/5 text-slate-300 hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white">{avail.title}</span>
                      <input
                        type="radio"
                        checked={isSelected}
                        onChange={() => {}}
                        className="radio radio-xs radio-success"
                      />
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">{avail.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 6. Short Bio */}
        <div>
          <label className="text-xs font-semibold text-slate-300 block mb-1">
            Short Hacker Bio & What You Want to Build
          </label>
          <textarea
            rows={2}
            value={formData.bio}
            onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
            placeholder="e.g. Passionate about LLM agents, fast frontend prototyping, and creating impactful civic tech tools..."
            className="w-full px-4 py-2.5 bg-slate-900/80 rounded-xl border border-white/10 focus:border-indigo-500 focus:outline-none text-sm text-white resize-none"
          />
        </div>

        {/* Action Button */}
        <div className="pt-4 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
            <span>Synchronized with Firestore Document <code className="text-indigo-300">users/{currentUser?.uid || 'guest'}</code></span>
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="btn bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 hover:from-indigo-600 hover:to-pink-600 text-white font-bold border-0 shadow-lg shadow-indigo-500/30 px-6 rounded-xl"
            >
              {saving ? (
                <span className="loading loading-spinner loading-sm"></span>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-1.5" />
                  Save Profile to Firestore
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
