import React from 'react';
import { motion } from 'framer-motion';

export default function PlayerCard({ player, selected, onClick, showStat, statValue, revealed }) {
  if (!player) return null;

  const bbrefUrl = player.bbrefID
    ? `https://www.baseball-reference.com/players/${player.bbrefID[0]}/${player.bbrefID}.shtml`
    : null;

  return (
    <motion.div
      className="glass-card"
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      style={{
        padding: '1rem 1.25rem',
        cursor: onClick ? 'pointer' : 'default',
        borderRadius: '0.75rem',
        textAlign: 'center',
        border: selected ? '2px solid #3b82f6' : '2px solid transparent',
        boxShadow: selected ? '0 0 12px rgba(59,130,246,0.4)' : 'none',
        transition: 'border 0.2s, box-shadow 0.2s',
      }}
    >
      <div style={{ fontWeight: 700, fontSize: '1.05rem', marginBottom: '0.25rem' }}>
        {bbrefUrl ? (
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

      {revealed && showStat && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '1.2rem', fontWeight: 600, marginTop: '0.35rem', opacity: 0.9 }}
        >
          {statValue}
        </motion.div>
      )}
    </motion.div>
  );
}
