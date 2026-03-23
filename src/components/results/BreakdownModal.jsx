import { motion } from 'framer-motion';
import useGameStore from '../../stores/gameStore';
import { BASE_CATS } from '../../engine/categories';

const MODE_LABELS = {
  howMuch: 'How Much?',
  sideBySide: 'Showdown',
  pickEm: "Pick 'Em",
  top10: 'Top 10',
};

export default function BreakdownModal({ isOpen, onClose }) {
  const matchHistory = useGameStore((s) => s.matchHistory);
  const roundScores = useGameStore((s) => s.roundScores);
  const roundResults = useGameStore((s) => s.roundResults);
  const gameMode = useGameStore((s) => s.gameMode);

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
          <h2 className="text-lg font-bold text-white">Round Breakdown</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Body */}
        <div className="p-4 space-y-2 overflow-y-auto" style={{ maxHeight: '65vh' }}>
          {Array.from({ length: 10 }, (_, i) => {
            const entry = matchHistory[i];
            const pts = roundScores[i] ?? 0;
            const emoji = roundResults[i] ?? '';
            const catKey = entry?.catKey || entry?.cat;
            const catLabel = catKey
              ? (BASE_CATS[catKey]?.label || catKey)
              : (MODE_LABELS[gameMode] || '');

            const playerNames = [];
            if (entry?.playerA) {
              playerNames.push(typeof entry.playerA === 'string' ? entry.playerA : entry.playerA.name || 'Unknown');
            }
            if (entry?.playerB) {
              playerNames.push(typeof entry.playerB === 'string' ? entry.playerB : entry.playerB.name || 'Unknown');
            }
            if (entry?.pA) playerNames.push(entry.pA.name || entry.pA);
            if (entry?.pB && !entry?.playerB) playerNames.push(entry.pB.name || entry.pB);
            if (entry?.players) {
              entry.players.forEach((p) => playerNames.push(typeof p === 'string' ? p : p.name || 'Unknown'));
            }

            return (
              <div
                key={i}
                className="flex items-center gap-3 p-3 rounded-lg"
                style={{ background: 'rgba(30, 41, 59, 0.4)' }}
              >
                <span className="text-lg w-8 text-center flex-shrink-0">{emoji}</span>
                <div className="flex-1 min-w-0">
                  <div className="text-xs text-slate-400 mb-0.5">
                    Round {i + 1} &middot; {catLabel}
                  </div>
                  {playerNames.length > 0 && (
                    <div className="text-sm text-slate-300 truncate">
                      {playerNames.join(' vs ')}
                    </div>
                  )}
                </div>
                <div className="text-sm font-bold tabular-nums text-right flex-shrink-0 min-w-[3rem]">
                  <span className={pts > 0 ? 'text-emerald-400' : 'text-slate-500'}>
                    {pts > 0 ? `+${pts}` : pts}
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer total */}
        <div className="p-4 border-t border-slate-700/50 flex items-center justify-between">
          <span className="text-sm text-slate-400 font-semibold">Total</span>
          <span className="text-lg font-extrabold text-white tabular-nums">
            {(roundScores.reduce((a, b) => a + b, 0) || 0).toLocaleString()}
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
