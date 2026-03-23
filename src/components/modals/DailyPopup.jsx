import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../stores/gameStore';
import { supabase } from '../../utils/supabase';
import {
  getDailyId,
  getDailyDateStr,
  hashStr,
  mulberry32,
  generateDailySettings,
  getDailySettingsLabel,
} from '../../engine/dailyChallenge';

export default function DailyPopup({ isOpen, onClose }) {
  const [dayOffset, setDayOffset] = useState(0);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loadingLB, setLoadingLB] = useState(false);

  const startNewGame = useGameStore((s) => s.startNewGame);
  const setGameMode = useGameStore((s) => s.setGameMode);
  const setPlayerPool = useGameStore((s) => s.setPlayerPool);
  const setEligibility = useGameStore((s) => s.setEligibility);
  const setEraMode = useGameStore((s) => s.setEraMode);
  const setSelectedDecade = useGameStore((s) => s.setSelectedDecade);
  const showToast = useGameStore((s) => s.showToast);

  const dailyId = getDailyId(dayOffset);
  const dateStr = getDailyDateStr(dayOffset);
  const rng = mulberry32(hashStr(dailyId));
  const settings = generateDailySettings(rng);
  const settingsLabel = getDailySettingsLabel(settings);

  const displayDate = new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

  useEffect(() => {
    if (!isOpen || !supabase) return;
    fetchDailyLeaderboard();
  }, [isOpen, dayOffset]);

  const fetchDailyLeaderboard = async () => {
    if (!supabase) return;
    setLoadingLB(true);
    try {
      const { data, error } = await supabase
        .from('leaderboard')
        .select('*')
        .eq('is_daily', true)
        .gte('created_at', dateStr + 'T00:00:00.000Z')
        .lt('created_at', dateStr + 'T23:59:59.999Z')
        .order('score', { ascending: false })
        .limit(10);

      if (error) throw error;
      setLeaderboard(data || []);
    } catch (e) {
      console.error('Daily leaderboard fetch failed:', e);
      setLeaderboard([]);
    } finally {
      setLoadingLB(false);
    }
  };

  const handlePlay = () => {
    setGameMode(settings.mode);
    setPlayerPool(settings.pool);
    setEligibility(settings.elig);
    setEraMode(settings.era);
    setSelectedDecade(settings.decade);
    startNewGame();
    onClose();
  };

  const canGoBack = dayOffset > -6;
  const canGoForward = dayOffset < 0;

  if (!isOpen) return null;

  return (
    <motion.div
      className="modal-overlay"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="modal-card"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with amber gradient */}
        <div
          className="p-4 text-center rounded-t-[1.5rem]"
          style={{ background: 'linear-gradient(135deg, #f59e0b, #d97706)' }}
        >
          <h2 className="text-lg font-bold text-white">Daily Challenge</h2>
        </div>

        {/* Date navigation */}
        <div className="flex items-center justify-center gap-4 py-3 border-b border-slate-700/50">
          <button
            onClick={() => canGoBack && setDayOffset(dayOffset - 1)}
            disabled={!canGoBack}
            className={`text-lg px-2 ${canGoBack ? 'text-slate-300 hover:text-white' : 'text-slate-600'} transition-colors`}
          >
            &larr;
          </button>
          <span className="text-sm font-semibold text-slate-200 min-w-[10rem] text-center">
            {displayDate}
          </span>
          <button
            onClick={() => canGoForward && setDayOffset(dayOffset + 1)}
            disabled={!canGoForward}
            className={`text-lg px-2 ${canGoForward ? 'text-slate-300 hover:text-white' : 'text-slate-600'} transition-colors`}
          >
            &rarr;
          </button>
        </div>

        {/* Settings label */}
        <div className="px-4 pt-3 pb-2 text-center">
          <span className="text-xs text-slate-400 font-medium">{settingsLabel}</span>
        </div>

        {/* Play button */}
        <div className="px-4 pb-3">
          <button onClick={handlePlay} className="btn-primary text-sm !py-2.5">
            Play
          </button>
        </div>

        {/* Mini leaderboard */}
        <div className="px-4 pb-4">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Today's Leaderboard
          </h3>
          {loadingLB ? (
            <div className="text-center py-4 text-slate-400 text-xs">Loading...</div>
          ) : leaderboard.length === 0 ? (
            <div className="text-center py-4 text-slate-500 text-xs">No scores yet</div>
          ) : (
            <div className="space-y-1">
              {leaderboard.map((entry, i) => {
                const rank = i + 1;
                const medal = rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : null;
                return (
                  <div
                    key={i}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs"
                    style={{ background: rank <= 3 ? 'rgba(16,185,129,0.1)' : 'transparent' }}
                  >
                    <span className="w-6 text-center font-bold text-slate-400">
                      {medal || rank}
                    </span>
                    <span className="flex-1 text-slate-300 truncate">
                      {entry.name || 'Anonymous'}
                    </span>
                    <span className="font-bold tabular-nums text-white">
                      {entry.score?.toLocaleString()}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
}
