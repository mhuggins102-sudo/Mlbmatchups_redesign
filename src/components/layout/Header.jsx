import { useState } from 'react';
import useGameStore from '../../stores/gameStore';
import SettingsPopover from './SettingsPopover';
import RulesModal from '../modals/RulesModal';
import LeaderboardModal from '../modals/LeaderboardModal';
import DailyPopup from '../modals/DailyPopup';
import ChallengeCodeModal from '../modals/ChallengeCodeModal';

export default function Header() {
  const screen = useGameStore((s) => s.screen);
  const goHome = useGameStore((s) => s.goHome);
  const hasUsedReroll = useGameStore((s) => s.hasUsedReroll);
  const hasUsedBomb = useGameStore((s) => s.hasUsedBomb);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [leaderboardOpen, setLeaderboardOpen] = useState(false);
  const [dailyOpen, setDailyOpen] = useState(false);
  const [challengeCodeOpen, setChallengeCodeOpen] = useState(false);

  const isGame = screen === 'game';

  return (
    <>
      <header className="sticky top-0 z-50 bg-surface/80 backdrop-blur-sm border-b border-slate-700/50">
        <div className="flex items-center justify-between px-3 py-2 max-w-4xl mx-auto">
          {/* Left group */}
          <div className="flex items-center gap-1.5">
            <IconButton onClick={goHome} label="Home">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z" />
                <path d="M9 21V12h6v9" />
              </svg>
            </IconButton>
            <IconButton label="Rules" onClick={() => setRulesOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="16" x2="12" y2="12" />
                <line x1="12" y1="8" x2="12.01" y2="8" />
              </svg>
            </IconButton>
            <IconButton label="Leaderboard" onClick={() => setLeaderboardOpen(true)}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="12" width="4" height="9" rx="0.5" />
                <rect x="10" y="5" width="4" height="16" rx="0.5" />
                <rect x="17" y="8" width="4" height="13" rx="0.5" />
              </svg>
            </IconButton>
          </div>

          {/* Center - empty */}
          <div className="flex-1" />

          {/* Right group */}
          <div className="flex items-center gap-1.5 relative">
            {isGame && !hasUsedReroll && (
              <IconButton label="Reroll" className="text-emerald-400 hover:text-emerald-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="3" />
                  <circle cx="8.5" cy="8.5" r="1" fill="currentColor" />
                  <circle cx="15.5" cy="8.5" r="1" fill="currentColor" />
                  <circle cx="12" cy="12" r="1" fill="currentColor" />
                  <circle cx="8.5" cy="15.5" r="1" fill="currentColor" />
                  <circle cx="15.5" cy="15.5" r="1" fill="currentColor" />
                </svg>
              </IconButton>
            )}
            {isGame && !hasUsedBomb && (
              <IconButton label="Bomb" className="text-emerald-400 hover:text-emerald-300">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="14" r="7" />
                  <path d="M11 7V4" />
                  <path d="M14 3l-3 1" />
                  <path d="M8 5.5l3-1.5" />
                </svg>
              </IconButton>
            )}
            <IconButton label="Daily" onClick={() => setDailyOpen(true)} className="text-amber-400 hover:text-amber-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
            </IconButton>
            <IconButton label="Challenge Code" onClick={() => setChallengeCodeOpen(true)} className="text-indigo-400 hover:text-indigo-300">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71" />
                <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71" />
              </svg>
            </IconButton>
            <IconButton
              label="Settings"
              onClick={() => setSettingsOpen((o) => !o)}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09a1.65 1.65 0 00-1.08-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09a1.65 1.65 0 001.51-1.08 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001.08 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9c.26.604.852.997 1.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1.08z" />
              </svg>
            </IconButton>
            {settingsOpen && (
              <SettingsPopover onClose={() => setSettingsOpen(false)} />
            )}
          </div>
        </div>
      </header>
      {/* Modals rendered outside header to avoid backdrop-filter stacking context */}
      <RulesModal isOpen={rulesOpen} onClose={() => setRulesOpen(false)} />
      <LeaderboardModal isOpen={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} />
      <DailyPopup isOpen={dailyOpen} onClose={() => setDailyOpen(false)} />
      <ChallengeCodeModal isOpen={challengeCodeOpen} onClose={() => setChallengeCodeOpen(false)} />
    </>
  );
}

function IconButton({ children, onClick, label, className = '' }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-8 h-8 flex items-center justify-center rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors ${className}`}
    >
      {children}
    </button>
  );
}
