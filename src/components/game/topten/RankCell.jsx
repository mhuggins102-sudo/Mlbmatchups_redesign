import React from 'react';
import { motion } from 'framer-motion';

export default function RankCell({ rank, player, value, points, revealed, cascadeRevealed, formatFn }) {
  const isGuessed = revealed && !cascadeRevealed;
  const isShown = revealed || cascadeRevealed;

  return (
    <motion.div
      className="rank-cell"
      initial={false}
      animate={{
        backgroundColor: isGuessed
          ? 'rgba(34,197,94,0.15)'
          : cascadeRevealed
            ? 'rgba(255,255,255,0.05)'
            : 'rgba(255,255,255,0.03)',
      }}
      style={{
        display: 'grid',
        gridTemplateColumns: '2rem 1fr auto',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.55rem 0.75rem',
        borderRadius: '0.5rem',
        marginBottom: '0.25rem',
        border: isGuessed
          ? '1px solid rgba(34,197,94,0.3)'
          : '1px solid rgba(255,255,255,0.06)',
        transition: 'all 0.3s',
      }}
    >
      {/* Rank number */}
      <div style={{
        fontWeight: 700,
        fontSize: '0.85rem',
        opacity: 0.6,
        textAlign: 'center',
      }}>
        {rank}
      </div>

      {/* Player name + stat */}
      <div>
        {isShown ? (
          <motion.div
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3 }}
          >
            <span style={{
              fontWeight: 600,
              fontSize: '0.88rem',
              opacity: cascadeRevealed && !revealed ? 0.6 : 1,
            }}>
              {player || '???'}
            </span>
            {value !== undefined && value !== null && (
              <span style={{
                marginLeft: '0.5rem',
                fontSize: '0.8rem',
                opacity: 0.65,
                fontWeight: 500,
              }}>
                {formatFn ? formatFn(value) : value}
              </span>
            )}
          </motion.div>
        ) : (
          <span style={{ opacity: 0.3, fontSize: '0.88rem' }}>???</span>
        )}
      </div>

      {/* Points badge */}
      <div>
        {isGuessed && points != null && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              background: 'rgba(34,197,94,0.25)',
              color: '#22c55e',
              padding: '0.1rem 0.4rem',
              borderRadius: '999px',
              fontSize: '0.72rem',
              fontWeight: 700,
            }}
          >
            +{points}
          </motion.span>
        )}
      </div>
    </motion.div>
  );
}
