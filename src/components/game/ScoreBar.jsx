import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence, useSpring, useMotionValue } from 'framer-motion';
import useGameStore from '../../stores/gameStore';

function getScoreColor(score) {
  if (score >= 5000) return '#E5E4E2'; // platinum
  if (score >= 4000) return '#FFD700'; // gold
  if (score >= 3000) return '#C0C0C0'; // silver
  if (score >= 2000) return '#CD7F32'; // bronze
  return '#ffffff';
}

export default function ScoreBar({ categoryLabel }) {
  const round = useGameStore((s) => s.round);
  const score = useGameStore((s) => s.score);

  const motionScore = useMotionValue(score);
  const springScore = useSpring(motionScore, { stiffness: 120, damping: 20 });
  const [displayScore, setDisplayScore] = useState(score);

  useEffect(() => {
    motionScore.set(score);
  }, [score, motionScore]);

  useEffect(() => {
    const unsubscribe = springScore.on('change', (v) => {
      setDisplayScore(Math.round(v));
    });
    return unsubscribe;
  }, [springScore]);

  return (
    <div className="score-bar" style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0.75rem 1rem',
      marginBottom: '0.5rem',
      borderRadius: '0.75rem',
      background: 'rgba(255,255,255,0.05)',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{ fontWeight: 600, fontSize: '0.9rem', opacity: 0.8 }}>
        Round {round}/10
      </div>

      <div style={{
        fontWeight: 600,
        fontSize: '0.85rem',
        opacity: 0.7,
        textAlign: 'center',
        flex: 1,
        padding: '0 0.5rem',
      }}>
        {categoryLabel || ''}
      </div>

      <AnimatePresence mode="popLayout">
        <motion.div
          key={score}
          initial={{ scale: 1.3, opacity: 0.6 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 300, damping: 20 }}
          style={{
            fontWeight: 700,
            fontSize: '1.1rem',
            color: getScoreColor(score),
            minWidth: '60px',
            textAlign: 'right',
          }}
        >
          {displayScore.toLocaleString()}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
