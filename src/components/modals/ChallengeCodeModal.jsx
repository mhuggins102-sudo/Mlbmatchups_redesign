import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../stores/gameStore';
import { supabase } from '../../utils/supabase';

export default function ChallengeCodeModal({ isOpen, onClose }) {
  const [code, setCode] = useState('');
  const showToast = useGameStore((s) => s.showToast);
  const loadChallenge = useGameStore((s) => s.loadChallenge);
  const startNewGame = useGameStore((s) => s.startNewGame);

  const handlePlay = async () => {
    const c = code.trim().toUpperCase();
    if (!c || c.length < 3) { showToast('Please enter a valid code.', 'bg-red-500'); return; }
    if (!supabase) { showToast('Online features unavailable.', 'bg-red-500'); return; }
    try {
      const result = await supabase.from('challenges').select('*').eq('id', c).single();
      if (result.error || !result.data) throw new Error('Not found');
      loadChallenge({ ...result.data, id: c });
      onClose();
      showToast(`Challenge ${c} loaded!`, 'bg-purple-600');
      startNewGame();
    } catch (e) {
      showToast('Challenge not found. Check the code.', 'bg-red-500');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className="modal-card p-0" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()}>
          <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
            <h2 className="text-lg font-extrabold text-slate-100">Enter Challenge Code</h2>
            <button onClick={onClose} className="text-slate-400 hover:text-white text-xl font-bold w-8 h-8">&times;</button>
          </div>
          <div className="p-6 space-y-4">
            <input
              type="text"
              maxLength={5}
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="XXXXX"
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-center text-2xl font-extrabold tracking-[0.3em] text-slate-100 focus:outline-none focus:border-blue-500 uppercase"
            />
            <button onClick={handlePlay} className="btn-primary text-base py-3">Play Challenge</button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
