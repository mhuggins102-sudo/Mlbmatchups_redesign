import { useState } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../stores/gameStore';
import { supabase } from '../../utils/supabase';
import { loadChallenge } from '../../engine/challengeManager';

export default function ChallengeCodeModal({ isOpen, onClose }) {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadChallengeAction = useGameStore((s) => s.loadChallenge);
  const startNewGame = useGameStore((s) => s.startNewGame);
  const showToast = useGameStore((s) => s.showToast);

  const handlePlay = async () => {
    const trimmed = code.trim().toUpperCase();
    if (trimmed.length !== 5) {
      setError('Code must be 5 characters');
      return;
    }
    setError('');
    setLoading(true);
    try {
      const data = await loadChallenge(supabase, trimmed);
      if (!data) {
        setError('Challenge not found');
        return;
      }
      loadChallengeAction({ ...data, id: trimmed });
      startNewGame();
      onClose();
    } catch (e) {
      console.error('Challenge load error:', e);
      setError('Failed to load challenge');
      showToast('Failed to load challenge', 'bg-red-600');
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
          <h2 className="text-lg font-bold text-white">Enter Challenge Code</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-4">
          <input
            type="text"
            maxLength={5}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              setError('');
            }}
            placeholder="XXXXX"
            className="w-full px-4 py-3 rounded-lg bg-surface-dark border border-slate-700/50 text-white text-center text-2xl font-mono tracking-[0.3em] uppercase focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
          />

          {error && (
            <p className="text-red-400 text-xs text-center">{error}</p>
          )}

          <button
            onClick={handlePlay}
            disabled={loading || code.trim().length !== 5}
            className="btn-primary text-sm !py-2.5"
          >
            {loading ? 'Loading...' : 'Play Challenge'}
          </button>

          <button
            onClick={() => {
              // Placeholder for opening challenge leaderboard
            }}
            className="w-full text-center text-blue-400 underline text-xs hover:text-blue-300 transition-colors"
          >
            View Leaderboard
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}
