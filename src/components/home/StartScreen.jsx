import { useState } from 'react';
import useGameStore from '../../stores/gameStore';
import GameModeCard from './GameModeCard';
import EraSelector from './EraSelector';
import CustomEligModal from './CustomEligModal';

// Inline SVG icons for game modes
const TargetIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" />
    <circle cx="12" cy="12" r="6" />
    <circle cx="12" cy="12" r="2" />
  </svg>
);

const SwordsIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 20L20 4" />
    <path d="M16 4h4v4" />
    <path d="M20 20L4 4" />
    <path d="M4 4h4v4" />
  </svg>
);

const CheckIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const TrophyIcon = (
  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H3a1 1 0 01-1-1V5a1 1 0 011-1h3" />
    <path d="M18 9h3a1 1 0 001-1V5a1 1 0 00-1-1h-3" />
    <path d="M6 4h12v6a6 6 0 01-12 0V4z" />
    <path d="M9 20h6" />
    <path d="M12 16v4" />
  </svg>
);

const gameModes = [
  { mode: 'howMuch', icon: TargetIcon, title: 'How Much?', subtitle: 'Estimate the difference' },
  { mode: 'sideBySide', icon: SwordsIcon, title: 'Showdown', subtitle: 'Head-to-head battle' },
  { mode: 'pickEm', icon: CheckIcon, title: "Pick 'Em", subtitle: 'Beat the threshold' },
  { mode: 'top10', icon: TrophyIcon, title: 'Top 10', subtitle: 'Guess the rankings' },
];

const poolOptions = [
  { value: 'all', label: 'All' },
  { value: 'batters', label: 'Batters' },
  { value: 'pitchers', label: 'Pitchers' },
];

const eligOptions = [
  { value: 'standard', label: 'Veteran' },
  { value: 'allStar', label: 'All Star' },
  { value: 'hof', label: 'Hall of Fame' },
  { value: 'custom', label: 'Custom' },
];

export default function StartScreen() {
  const gameMode = useGameStore((s) => s.gameMode);
  const playerPool = useGameStore((s) => s.playerPool);
  const eligibility = useGameStore((s) => s.eligibility);
  const eraMode = useGameStore((s) => s.eraMode);
  const selectedDecade = useGameStore((s) => s.selectedDecade);
  const setGameMode = useGameStore((s) => s.setGameMode);
  const setPlayerPool = useGameStore((s) => s.setPlayerPool);
  const setEligibility = useGameStore((s) => s.setEligibility);
  const startNewGame = useGameStore((s) => s.startNewGame);

  const [eraOpen, setEraOpen] = useState(false);
  const [customEligOpen, setCustomEligOpen] = useState(false);

  const eraLabel = () => {
    if (eraMode === 'allEras') return 'All Eras';
    if (eraMode === 'modern') return 'Modern Era (1970s+)';
    if (eraMode === 'select' && selectedDecade) return selectedDecade;
    return 'Modern Era (1970s+)';
  };

  return (
    <div className="max-w-md mx-auto px-4 py-3">
      {/* Title */}
      <div className="text-center mb-4">
        <h1 className="text-3xl font-extrabold gradient-text mb-1">MLB Matchups</h1>
        <p className="text-slate-400 text-xs">The greatest baseball stats game on the web.</p>
      </div>

      {/* Game Mode */}
      <section className="mb-3">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Game Mode</h2>
        <div className="grid grid-cols-2 gap-3">
          {gameModes.map((m) => (
            <GameModeCard
              key={m.mode}
              mode={m.mode}
              icon={m.icon}
              title={m.title}
              subtitle={m.subtitle}
              selected={gameMode === m.mode}
              onSelect={setGameMode}
            />
          ))}
        </div>
      </section>

      {/* Player Pool */}
      <section className="mb-3">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Player Pool</h2>
        <div className="flex bg-surface-raised/50 rounded-xl p-1">
          {poolOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPlayerPool(opt.value)}
              className={`segment-btn flex-1 ${playerPool === opt.value ? 'active' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Eligibility */}
      <section className="mb-3">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Eligibility</h2>
        <div className="flex bg-surface-raised/50 rounded-xl p-1">
          {eligOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                setEligibility(opt.value);
                if (opt.value === 'custom') setCustomEligOpen(true);
              }}
              className={`segment-btn flex-1 ${eligibility === opt.value ? 'active' : ''}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </section>

      {/* Era */}
      <section className="mb-4 relative">
        <h2 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Era</h2>
        <button
          onClick={() => setEraOpen((o) => !o)}
          className="w-full flex items-center justify-between px-4 py-3 rounded-xl bg-surface-raised/50 border border-slate-700/50 text-sm text-slate-200 hover:border-slate-600 transition-colors"
        >
          <span>{eraLabel()}</span>
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`transition-transform ${eraOpen ? 'rotate-180' : ''}`}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <EraSelector isOpen={eraOpen} onClose={() => setEraOpen(false)} />
      </section>

      {/* Start button */}
      <button onClick={startNewGame} className="btn-primary">
        Start Game
      </button>

      <CustomEligModal isOpen={customEligOpen} onClose={() => setCustomEligOpen(false)} />
    </div>
  );
}
