import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../stores/gameStore';

export default function PlayerCard({ player, selected, onClick, showStat, statValue, revealed }) {
  const useAnimations = useGameStore((s) => s.useAnimations);
  const [showReveal, setShowReveal] = useState(false);

  useEffect(() => {
    if (revealed && showStat) {
      if (useAnimations) {
        const t = setTimeout(() => setShowReveal(true), 150);
        return () => clearTimeout(t);
      } else {
        setShowReveal(true);
      }
    } else {
      setShowReveal(false);
    }
  }, [revealed, showStat, useAnimations]);

  if (!player) return null;

  const bbrefUrl = player.bbrefID
    ? `https://www.baseball-reference.com/players/${player.bbrefID[0]}/${player.bbrefID}.shtml`
    : null;

  const cardMotion = useAnimations
    ? { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 } }
    : {};

  return (
    <motion.div
      className="glass-card"
      {...cardMotion}
      onClick={onClick}
      style={{
        padding: '1rem 1.25rem',
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: '0.75rem',
        textAlign: 'center',
        border: selected ? '2px solid #3b82f6' : '2px solid transparent',
        boxShadow: selected ? '0 0 12px rgba(59,130,246,0.4)' : 'none',
        transition: 'border 0.2s, box-shadow 0.2s',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Reveal flash effect */}
      <AnimatePresence>
        {showReveal && useAnimations && (
          <motion.div
            initial={{ opacity: 0.7, scaleX: 0 }}
            animate={{ opacity: 0, scaleX: 1 }}
            transition={{ duration: 0.5, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              inset: 0,
              background: 'linear-gradient(135deg, rgba(59,130,246,0.3), rgba(6,182,212,0.2))',
              borderRadius: 'inherit',
              transformOrigin: 'left center',
              pointerEvents: 'none',
            }}
          />
        )}
      </AnimatePresence>

      <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}>
        {bbrefUrl && revealed ? (
          <a
            href={bbrefUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            style={{ color: 'inherit', textDecoration: 'none' }}
          >
            {player.name}
          </a>
        ) : (
          player.name
        )}
      </div>

      <AnimatePresence>
        {showReveal && (
          <motion.div
            initial={useAnimations ? { opacity: 0, scale: 0.5, y: 10 } : false}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={useAnimations ? { type: 'spring', stiffness: 300, damping: 20, delay: 0.1 } : { duration: 0 }}
            style={{
              fontSize: '1.4rem',
              fontWeight: 800,
              marginTop: '0.35rem',
              background: 'linear-gradient(135deg, #60a5fa, #34d399)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              backgroundClip: 'text',
            }}
          >
            {statValue}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
