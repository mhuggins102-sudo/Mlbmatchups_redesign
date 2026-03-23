import { motion } from 'framer-motion';
import useGameStore from '../../stores/gameStore';

export default function ChallengePopup({ isOpen, onClose }) {
  const score = useGameStore((s) => s.score);
  const roundScores = useGameStore((s) => s.roundScores);
  const challengerScore = useGameStore((s) => s.challengerScore);
  const challengerRoundScores = useGameStore((s) => s.challengerRoundScores);
  const challengerName = useGameStore((s) => s.challengerName);
  const round = useGameStore((s) => s.round);

  if (!isOpen) return null;

  const yourRunning = roundScores.reduce((a, b) => a + b, 0);
  const theirScores = challengerRoundScores || [];
  const theirRunning = theirScores.slice(0, roundScores.length).reduce((a, b) => a + b, 0);

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
          <h2 className="text-lg font-bold text-white">Challenge Comparison</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white transition-colors text-xl leading-none"
          >
            &times;
          </button>
        </div>

        {/* Score comparison header */}
        <div className="p-4 border-b border-slate-700/50">
          <div className="flex items-center justify-around">
            <div className="text-center">
              <div className="text-slate-400 text-xs mb-1">You</div>
              <div className={`text-2xl font-bold ${yourRunning > theirRunning ? 'text-emerald-400' : 'text-white'}`}>
                {yourRunning.toLocaleString()}
              </div>
            </div>
            <div className="text-slate-600 font-bold text-lg">vs</div>
            <div className="text-center">
              <div className="text-slate-400 text-xs mb-1">{challengerName || 'Challenger'}</div>
              <div className={`text-2xl font-bold ${theirRunning > yourRunning ? 'text-emerald-400' : 'text-white'}`}>
                {theirRunning.toLocaleString()}
              </div>
            </div>
          </div>
        </div>

        {/* Round-by-round comparison */}
        <div className="p-4 overflow-y-auto" style={{ maxHeight: '50vh' }}>
          <div className="space-y-1">
            {/* Header row */}
            <div className="grid grid-cols-[2rem_1fr_1fr] gap-2 px-2 py-1 text-xs text-slate-500 font-semibold">
              <span>Rd</span>
              <span className="text-right">You</span>
              <span className="text-right">{challengerName || 'Them'}</span>
            </div>
            {roundScores.map((pts, i) => {
              const theirPts = theirScores[i] ?? '-';
              const youWin = typeof theirPts === 'number' && pts > theirPts;
              const theyWin = typeof theirPts === 'number' && theirPts > pts;

              return (
                <div
                  key={i}
                  className="grid grid-cols-[2rem_1fr_1fr] gap-2 px-2 py-2 rounded-lg items-center"
                  style={{ background: 'rgba(30, 41, 59, 0.4)' }}
                >
                  <span className="text-xs text-slate-500 font-bold">{i + 1}</span>
                  <span className={`text-sm font-bold tabular-nums text-right ${youWin ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {pts.toLocaleString()}
                  </span>
                  <span className={`text-sm font-bold tabular-nums text-right ${theyWin ? 'text-emerald-400' : 'text-slate-300'}`}>
                    {typeof theirPts === 'number' ? theirPts.toLocaleString() : theirPts}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
