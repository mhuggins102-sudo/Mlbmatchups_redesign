import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../stores/gameStore';

const styleMap = {
  success: {
    bg: 'linear-gradient(135deg, rgba(16,185,129,0.15), rgba(52,211,153,0.08))',
    border: 'rgba(16,185,129,0.4)',
    color: '#6ee7b7',
    glow: '0 0 20px rgba(16,185,129,0.2)',
    icon: '✦',
  },
  warning: {
    bg: 'linear-gradient(135deg, rgba(245,158,11,0.15), rgba(251,191,36,0.08))',
    border: 'rgba(245,158,11,0.4)',
    color: '#fcd34d',
    glow: '0 0 20px rgba(245,158,11,0.15)',
    icon: '◆',
  },
  error: {
    bg: 'linear-gradient(135deg, rgba(239,68,68,0.15), rgba(248,113,113,0.08))',
    border: 'rgba(239,68,68,0.4)',
    color: '#fca5a5',
    glow: '0 0 20px rgba(239,68,68,0.15)',
    icon: '—',
  },
};

export default function RoundFeedback({ text, type, detail }) {
  const useAnimations = useGameStore((s) => s.useAnimations);
  const style = styleMap[type] || styleMap.success;

  const motionProps = useAnimations
    ? {
        initial: { opacity: 0, y: 16, scale: 0.95 },
        animate: { opacity: 1, y: 0, scale: 1 },
        exit: { opacity: 0, y: -10, scale: 0.95 },
        transition: { type: 'spring', stiffness: 400, damping: 25 },
      }
    : {
        initial: false,
        animate: { opacity: 1 },
        exit: { opacity: 0 },
        transition: { duration: 0 },
      };

  return (
    <AnimatePresence>
      {text && (
        <motion.div
          {...motionProps}
          style={{
            background: style.bg,
            border: `1px solid ${style.border}`,
            borderRadius: '0.75rem',
            padding: '0.6rem 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.5rem',
            boxShadow: style.glow,
          }}
        >
          <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>{style.icon}</span>
          <div style={{ textAlign: 'center' }}>
            <span style={{
              fontWeight: 700,
              fontSize: '0.9rem',
              color: style.color,
              letterSpacing: '0.02em',
            }}>
              {text}
            </span>
            {detail && (
              <div style={{ fontSize: '0.75rem', color: style.color, opacity: 0.6, marginTop: '0.15rem' }}>
                {detail}
              </div>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
