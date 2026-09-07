import React, { useState, useEffect, useRef } from 'react';
import { Palette, Moon, Sparkles, Sun, Check, ChevronDown } from 'lucide-react';

const THEMES = [
  { id: 'dark', label: 'Dark Void', icon: Moon, color: 'text-indigo-400', badge: 'bg-indigo-500' },
  { id: 'cyberpunk', label: 'Cyberpunk Neon', icon: Sparkles, color: 'text-amber-400', badge: 'bg-amber-400' },
  { id: 'night', label: 'Deep Night', icon: Sun, color: 'text-cyan-400', badge: 'bg-cyan-400' },
];

export default function ThemeToggle({ isMobile = false }) {
  const [currentTheme, setCurrentTheme] = useState(() => {
    return localStorage.getItem('hh_theme') || 'dark';
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', currentTheme);
    localStorage.setItem('hh_theme', currentTheme);
  }, [currentTheme]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const selectTheme = (themeId) => {
    setCurrentTheme(themeId);
    setMenuOpen(false);
  };

  const activeThemeObj = THEMES.find(t => t.id === currentTheme) || THEMES[0];
  const Icon = activeThemeObj.icon;

  if (isMobile) {
    return (
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900/90 border border-indigo-500/30">
        <span className="text-xs font-bold text-white flex items-center gap-2">
          <Palette className="w-4 h-4 text-amber-400" />
          Theme Mode:
        </span>
        <div className="flex items-center gap-1.5">
          {THEMES.map((theme) => (
            <button
              key={theme.id}
              onClick={() => selectTheme(theme.id)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                currentTheme === theme.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-white bg-slate-800'
              }`}
            >
              {theme.label.split(' ')[0]}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setMenuOpen(!menuOpen)}
        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-indigo-500/40 hover:border-indigo-400 text-slate-100 hover:text-white transition-all flex items-center gap-2 shadow-md shadow-indigo-500/10 active:scale-95"
        title="Switch Hackathon Theme"
      >
        <span className="p-1 rounded-lg bg-indigo-500/20 text-indigo-300">
          <Palette className="w-4 h-4 text-amber-300 animate-pulse" />
        </span>
        <span className="text-xs font-bold hidden sm:inline-flex items-center gap-1.5">
          <span className={`w-2 h-2 rounded-full ${activeThemeObj.badge}`}></span>
          <span>{activeThemeObj.label}</span>
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 mt-2 w-56 glass-panel-glow rounded-2xl p-2 shadow-2xl border border-indigo-500/40 flex flex-col gap-1 animate-fade-in z-50 bg-slate-950/95">
          <div className="flex items-center justify-between px-3 py-2 border-b border-white/10">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Select Theme
            </span>
            <span className="text-[9px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-bold border border-indigo-500/30">
              DaisyUI
            </span>
          </div>
          {THEMES.map((theme) => {
            const TIcon = theme.icon;
            const isSelected = currentTheme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => selectTheme(theme.id)}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold text-left transition-all ${
                  isSelected
                    ? 'bg-indigo-600 text-white font-bold shadow-md'
                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <TIcon className={`w-4 h-4 ${isSelected ? 'text-white' : theme.color}`} />
                  <span>{theme.label}</span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-white" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
