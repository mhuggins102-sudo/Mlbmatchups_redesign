import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../../utils/supabase';

const MODE_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'howMuch', label: 'How Much?' },
  { value: 'sideBySide', label: 'Showdown' },
  { value: 'pickEm', label: "Pick 'Em" },
  { value: 'top10', label: 'Top 10' },
];

const ELIG_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'standard', label: 'Veteran' },
  { value: 'allStar', label: 'All Star' },
  { value: 'hof', label: 'HOF' },
];

const DATE_OPTIONS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'month', label: 'This Month' },
  { value: 'lastMonth', label: 'Last Month' },
];

function getMedal(rank) {
  if (rank === 1) return '🥇';
  if (rank === 2) return '🥈';
  if (rank === 3) return '🥉';
  return null;
}

function getDateRange(filter) {
  const now = new Date();
  if (filter === 'today') {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return { start: start.toISOString(), end: null };
  }
  if (filter === 'month') {
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: start.toISOString(), end: null };
  }
  if (filter === 'lastMonth') {
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: start.toISOString(), end: end.toISOString() };
  }
  return { start: null, end: null };
}

export default function LeaderboardModal({ isOpen, onClose }) {
  const [mode, setMode] = useState('all');
  const [elig, setElig] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !supabase) return;
    fetchScores();
  }, [isOpen, mode, elig, dateFilter]);

  const fetchScores = async () => {
    if (!supabase) return;
    setLoading(true);
    try {
      let query = supabase
        .from('leaderboard')
        .select('*')
        .order('score', { ascending: false })
        .limit(50);

      if (mode !== 'all') query = query.eq('mode', mode);
      if (elig !== 'all') query = query.eq('elig', elig);

      const { start, end } = getDateRange(dateFilter);
      if (start) query = query.gte('created_at', start);
      if (end) query = query.lt('created_at', end);

      const { data, error } = await query;
      if (error) throw error;
      setScores(data || []);
    } catch (e) {
      console.error('Leaderboard fetch failed:', e);
      setScores([]);
    } finally {
      setLoading(false);
    }
  };

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
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <h2 className="text-lg font-bold text-white">Leaderboard</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Filters */}
        <div className="p-4 pb-2 space-y-2">
          <div className="grid grid-cols-3 gap-2">
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="px-2 py-1.5 rounded-lg bg-surface-dark border border-slate-700/50 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {MODE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={elig}
              onChange={(e) => setElig(e.target.value)}
              className="px-2 py-1.5 rounded-lg bg-surface-dark border border-slate-700/50 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {ELIG_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-2 py-1.5 rounded-lg bg-surface-dark border border-slate-700/50 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
            >
              {DATE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="px-4 pb-4 overflow-y-auto" style={{ maxHeight: '55vh' }}>
          {loading ? (
            <div className="text-center py-8 text-slate-400 text-sm">Loading...</div>
          ) : scores.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">No scores yet</div>
          ) : (
            <div className="space-y-1">
              {/* Table header */}
              <div className="grid grid-cols-[2.5rem_1fr_auto] gap-2 px-2 py-1 text-xs text-slate-500 font-semibold uppercase tracking-wider">
                <span>Rank</span>
                <span>Player</span>
                <span className="text-right">Score</span>
              </div>
              {scores.map((entry, i) => {
                const rank = i + 1;
                const medal = getMedal(rank);
                return (
                  <div
                    key={i}
                    className={`lb-row grid grid-cols-[2.5rem_1fr_auto] gap-2 px-2 py-2 rounded-lg items-center ${rank <= 3 ? 'highlight' : ''}`}
                  >
                    <span className="text-sm font-bold text-slate-400 text-center">
                      {medal || rank}
                    </span>
                    <span className="text-sm text-slate-200 truncate">
                      {entry.name || 'Anonymous'}
                    </span>
                    <span className="text-sm font-bold tabular-nums text-white text-right">
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
