import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../stores/gameStore';

export default function ChallengePopup({ isOpen, onClose }) {
  const score = useGameStore((s) => s.score);
  const challengerScore = useGameStore((s) => s.challengerScore);
  const challengerName = useGameStore((s) => s.challengerName);
  const challengerRoundScores = useGameStore((s) => s.challengerRoundScores);
  const roundScores = useGameStore((s) => s.roundScores);
  const round = useGameStore((s) => s.round);

  if (!isOpen || challengerScore == null) return null;

  const theirTotal = challengerRoundScores ? challengerRoundScores.slice(0, round - 1).reduce((s, v) => s + v, 0) : challengerScore;

  return (
    <AnimatePresence>
      <motion.div className="modal-overlay" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
        <motion.div className="modal-card p-6" initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} onClick={(e) => e.stopPropagation()}>
          <h2 className="text-lg font-extrabold text-slate-100 text-center mb-4">Challenge Comparison</h2>
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-xs font-bold text-slate-400 mb-1">You</div>
              <div className="text-3xl font-extrabold text-blue-400 tabular-nums">{score}</div>
            </div>
            <div>
              <div className="text-xs font-bold text-slate-400 mb-1">{challengerName || 'Challenger'}</div>
              <div className="text-3xl font-extrabold text-purple-400 tabular-nums">{theirTotal}</div>
            </div>
          </div>
          {challengerRoundScores && (
            <div className="mt-4 space-y-1">
              {roundScores.map((s, i) => (
                <div key={i} className="flex items-center text-xs">
                  <span className="w-16 text-slate-500">R{i + 1}</span>
                  <span className="flex-1 font-bold text-blue-400 tabular-nums">{s}</span>
                  <span className="flex-1 font-bold text-purple-400 tabular-nums text-right">{challengerRoundScores[i] || 0}</span>
                </div>
              ))}
            </div>
          )}
          <button onClick={onClose} className="mt-4 w-full py-2 bg-slate-700 hover:bg-slate-600 rounded-xl text-sm font-bold text-slate-300 transition">Close</button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
