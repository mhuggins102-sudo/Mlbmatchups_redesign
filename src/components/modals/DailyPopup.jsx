import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../stores/gameStore';
import usePlayerStore from '../../stores/playerStore';
import { getDailyId, getDailyDateStr, generateDailySettings, getDailySettingsLabel } from '../../engine/dailyChallenge';
import { mulberry32, hashStr } from '../../engine/prng';

function getDailyDisplayDate(offset) {
  const d = new Date();
  d.setDate(d.getDate() + (offset || 0));
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  if (offset === 0) return `Today – ${months[d.getMonth()]} ${d.getDate()}`;
  if (offset === -1) return `Yesterday – ${months[d.getMonth()]} ${d.getDate()}`;
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  return `${days[d.getDay()]} – ${months[d.getMonth()]} ${d.getDate()}`;
}

export default function DailyPopup({ isOpen, onClose }) {
  const [offset, setOffset] = useState(0);
  const showToast = useGameStore((s) => s.showToast);
  const players = usePlayerStore((s) => s.players);

  if (!isOpen) return null;

  const seed = hashStr(getDailyDateStr(offset));
  const rng = mulberry32(seed);
  const settings = generateDailySettings(rng);
  const label = getDailySettingsLabel(settings);
  const dailyId = getDailyId(offset);
  const played = localStorage.getItem('dailyPlayed_' + dailyId);

  const handlePlay = () => {
    if (players.size === 0) { showToast('Data still loading...', 'bg-red-500'); return; }
    // Daily challenge play would be handled by parent
    onClose();
    showToast('Daily challenge starting...', 'bg-amber-500');
  };

  return (
    <AnimatePresence>
      <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className="modal-card p-0 overflow-hidden" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()}>
          <div className="bg-gradient-to-r from-amber-500 to-orange-500 p-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold text-white">Daily Challenge</h2>
              <button onClick={onClose} className="text-white/80 hover:text-white text-xl font-bold w-8 h-8">&times;</button>
            </div>
          </div>
          <div className="p-4 space-y-4">
            <div className="flex items-center justify-between">
              <button onClick={() => setOffset(Math.max(offset - 1, -6))} className={`text-slate-400 hover:text-white p-1 ${offset <= -6 ? 'opacity-30 pointer-events-none' : ''}`}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 4l-8 8 8 8"/></svg>
              </button>
              <span className="font-bold text-slate-200 text-sm">{getDailyDisplayDate(offset)}</span>
              <button onClick={() => setOffset(Math.min(offset + 1, 0))} className={`text-slate-400 hover:text-white p-1 ${offset >= 0 ? 'opacity-30 pointer-events-none' : ''}`}>
                <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 4l8 8-8 8"/></svg>
              </button>
            </div>
            <div className="text-center text-xs font-semibold text-slate-400">{label}</div>
            {!played ? (
              <button onClick={handlePlay} className="btn-primary text-base py-3">Play</button>
            ) : (
              <div className="text-center text-sm text-emerald-400 font-bold py-2">✓ Completed</div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
