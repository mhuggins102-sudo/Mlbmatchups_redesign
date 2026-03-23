import { useState, useEffect } from 'react';
import { motion, useSpring, useTransform, AnimatePresence } from 'framer-motion';
import useGameStore from '../../stores/gameStore';
import { supabase } from '../../utils/supabase';
import { copyToClipboard } from '../../utils/clipboard';
import { saveChallenge } from '../../engine/challengeManager';
import BreakdownModal from './BreakdownModal';

const MODE_LABELS = {
  howMuch: 'How Much?',
  sideBySide: 'Showdown',
  pickEm: "Pick 'Em",
  top10: 'Top 10',
};

const ELIG_LABELS = {
  standard: 'Veteran',
  allStar: 'All Star',
  hof: 'Hall of Fame',
  custom: 'Custom',
};

function getScoreTier(score) {
  if (score >= 5000) return { label: 'Platinum', className: 'score-platinum', trophySize: 'text-7xl' };
  if (score >= 4000) return { label: 'Gold', className: 'score-gold', trophySize: 'text-6xl' };
  if (score >= 3000) return { label: 'Silver', className: 'score-silver', trophySize: 'text-6xl' };
  if (score >= 2000) return { label: 'Bronze', className: 'score-bronze', trophySize: 'text-5xl' };
  return { label: null, className: '', trophySize: 'text-5xl' };
}

function getRibbonTier(score) {
  if (score >= 5000) return 'Platinum';
  if (score >= 4000) return 'Gold';
  if (score >= 2000) return 'Silver';
  return 'Bronze';
}

function AnimatedCounter({ value }) {
  const spring = useSpring(0, { stiffness: 50, damping: 20 });
  const display = useTransform(spring, (v) => Math.round(v).toLocaleString());

  useEffect(() => {
    spring.set(value);
  }, [value, spring]);

  return <motion.span>{display}</motion.span>;
}

export default function GameOverScreen() {
  const score = useGameStore((s) => s.score);
  const roundResults = useGameStore((s) => s.roundResults);
  const roundScores = useGameStore((s) => s.roundScores);
  const matchHistory = useGameStore((s) => s.matchHistory);
  const gameMode = useGameStore((s) => s.gameMode);
  const playerPool = useGameStore((s) => s.playerPool);
  const eligibility = useGameStore((s) => s.eligibility);
  const customFilters = useGameStore((s) => s.customFilters);
  const eraMode = useGameStore((s) => s.eraMode);
  const selectedDecade = useGameStore((s) => s.selectedDecade);
  const isPlayingChallenge = useGameStore((s) => s.isPlayingChallenge);
  const challengerScore = useGameStore((s) => s.challengerScore);
  const challengerName = useGameStore((s) => s.challengerName);
  const isDailyChallenge = useGameStore((s) => s.isDailyChallenge);
  const goHome = useGameStore((s) => s.goHome);
  const showToast = useGameStore((s) => s.showToast);

  const [breakdownOpen, setBreakdownOpen] = useState(false);
  const [playerName, setPlayerName] = useState(
    () => localStorage.getItem('mlb_player_name') || ''
  );
  const [rememberName, setRememberName] = useState(
    () => localStorage.getItem('mlb_remember_name') === 'true'
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const tier = getScoreTier(score);
  const ribbon = getRibbonTier(score);

  const handleSaveScore = async () => {
    if (!supabase || !playerName.trim()) return;
    setSaving(true);
    try {
      if (rememberName) {
        localStorage.setItem('mlb_player_name', playerName.trim());
        localStorage.setItem('mlb_remember_name', 'true');
      } else {
        localStorage.removeItem('mlb_player_name');
        localStorage.setItem('mlb_remember_name', 'false');
      }

      const res = await supabase.from('leaderboard').insert([{
        name: playerName.trim(),
        score,
        mode: gameMode,
        pool: playerPool,
        elig: eligibility,
        era: eraMode,
        decade: selectedDecade,
        is_daily: isDailyChallenge,
      }]);

      if (res.error) throw res.error;
      setSaved(true);
      showToast('Score saved!', 'bg-emerald-600');
    } catch (e) {
      console.error('Save score failed:', e);
      showToast('Save failed', 'bg-red-600');
    } finally {
      setSaving(false);
    }
  };

  const handleShare = async () => {
    const emojiRow = roundResults.join(' ');
    const modeLabel = MODE_LABELS[gameMode] || gameMode;
    const lines = [
      `MLB Matchups - ${modeLabel}`,
      `Score: ${score.toLocaleString()} (${ribbon})`,
      emojiRow,
      '',
      'Play at mlbmatchups.com',
    ];

    if (!isPlayingChallenge && supabase) {
      const code = await saveChallenge(
        supabase, gameMode, playerPool, eligibility, customFilters,
        eraMode, selectedDecade, score, roundScores, matchHistory,
        playerName.trim() || 'Anonymous'
      );
      if (code) {
        lines.splice(3, 0, `Challenge code: ${code}`);
      }
    }

    copyToClipboard(lines.join('\n'));
    showToast('Copied to clipboard!', 'bg-indigo-600');
  };

  return (
    <div className="max-w-md mx-auto px-4 py-8 text-center">
      {/* Trophy */}
      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 200, damping: 15 }}
        className={`${tier.trophySize} mb-2`}
      >
        🏆
      </motion.div>

      {/* Heading */}
      <h1 className="text-3xl font-extrabold text-white mb-2">Game Over!</h1>

      {/* Ribbon */}
      {tier.label && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`inline-block px-4 py-1 rounded-full text-sm font-bold mb-4 ${tier.className}`}
          style={{ background: 'rgba(255,255,255,0.08)' }}
        >
          {tier.label}
        </motion.div>
      )}

      {/* Animated score */}
      <div className={`text-5xl font-extrabold tabular-nums mb-4 ${tier.className || 'text-white'}`}>
        <AnimatedCounter value={score} />
      </div>

      {/* Round results emoji row */}
      <div className="flex items-center justify-center gap-1.5 text-lg mb-4 flex-wrap">
        {roundResults.map((emoji, i) => (
          <span key={i} title={`Round ${i + 1}: ${roundScores[i] ?? 0} pts`}>
            {emoji}
          </span>
        ))}
      </div>

      {/* View Breakdown link */}
      <button
        onClick={() => setBreakdownOpen(true)}
        className="text-blue-400 underline text-sm mb-6 hover:text-blue-300 transition-colors"
      >
        View Breakdown
      </button>

      {/* Challenger comparison */}
      {isPlayingChallenge && challengerScore != null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-4 mb-6"
        >
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Challenge Comparison
          </h3>
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="text-slate-400 text-xs mb-1">You</div>
              <div className={`text-2xl font-bold ${score > challengerScore ? 'text-emerald-400' : 'text-white'}`}>
                {score.toLocaleString()}
              </div>
            </div>
            <div className="text-slate-600 font-bold text-lg">vs</div>
            <div className="text-center">
              <div className="text-slate-400 text-xs mb-1">{challengerName || 'Challenger'}</div>
              <div className={`text-2xl font-bold ${challengerScore > score ? 'text-emerald-400' : 'text-white'}`}>
                {challengerScore.toLocaleString()}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* High score input */}
      {!saved && (
        <div className="glass-card p-4 mb-6 text-left">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
            Save Your Score
          </h3>
          <input
            type="text"
            maxLength={10}
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="Enter your name"
            className="w-full px-3 py-2 rounded-lg bg-surface-dark border border-slate-700/50 text-white text-sm mb-3 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <label className="flex items-center gap-2 text-xs text-slate-400 mb-4 cursor-pointer">
            <input
              type="checkbox"
              checked={rememberName}
              onChange={(e) => setRememberName(e.target.checked)}
              className="rounded"
            />
            Remember name
          </label>
          <button
            onClick={handleSaveScore}
            disabled={saving || !playerName.trim()}
            className="btn-primary text-sm !py-2.5"
          >
            {saving ? 'Saving...' : 'Save to Leaderboard'}
          </button>
        </div>
      )}

      {saved && (
        <div className="text-emerald-400 text-sm mb-6 font-semibold">
          Score saved to leaderboard!
        </div>
      )}

      {/* Share button */}
      <button
        onClick={handleShare}
        className="w-full py-3 rounded-xl font-bold text-white mb-3 transition-all hover:opacity-90"
        style={{ background: 'linear-gradient(135deg, #4f46e5, #6366f1)' }}
      >
        Share Results
      </button>

      {/* Play Again */}
      <button onClick={goHome} className="btn-primary">
        Play Again
      </button>

      {/* Breakdown Modal */}
      <AnimatePresence>
        {breakdownOpen && (
          <BreakdownModal isOpen={breakdownOpen} onClose={() => setBreakdownOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  );
}
