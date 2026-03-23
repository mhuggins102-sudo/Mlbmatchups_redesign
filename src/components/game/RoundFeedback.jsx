import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const colorMap = {
  success: '#22c55e',
  warning: '#f59e0b',
  error: '#ef4444',
};

export default function RoundFeedback({ text, type }) {
  return (
    <AnimatePresence>
      {text && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.3 }}
          style={{
            textAlign: 'center',
            fontWeight: 600,
            fontSize: '0.95rem',
            color: colorMap[type] || '#ffffff',
            padding: '0.5rem 0',
          }}
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
