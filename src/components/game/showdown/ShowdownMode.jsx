import React, { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../../stores/gameStore';
import usePlayerStore from '../../../stores/playerStore';
import { SBS_CATS_BAT, SBS_CATS_PIT } from '../../../engine/categories';
import { formatStat } from '../../../engine/formatters';

export default function ShowdownMode() {
  const currentRound = useGameStore((s) => s.currentRound);
  const sbsPicks = useGameStore((s) => s.sbsPicks);
  const setSbsPick = useGameStore((s) => s.setSbsPick);
  const roundSubmitted = useGameStore((s) => s.roundSubmitted);
  const useWholeNumbers = useGameStore((s) => s.useWholeNumbers);
  const players = usePlayerStore((s) => s.players);

  const [revealedRows, setRevealedRows] = useState(new Set());
  const [results, setResults] = useState(null);

  const playerA = useMemo(() => currentRound ? players.get(currentRound.pA) : null, [currentRound, players]);
  const playerB = useMemo(() => currentRound ? players.get(currentRound.pB) : null, [currentRound, players]);

  const cats = useMemo(() => {
    if (!currentRound) return [];
    return currentRound.type === 'hitter' ? SBS_CATS_BAT : SBS_CATS_PIT;
  }, [currentRound]);

  // When roundSubmitted changes and results are stored on currentRound, read them
  const showdownResults = useMemo(() => {
    if (!roundSubmitted || !currentRound?.results) return null;
    return currentRound.results;
  }, [roundSubmitted, currentRound]);

  // Cascade reveal effect
  React.useEffect(() => {
    if (!showdownResults) {
      setRevealedRows(new Set());
      return;
    }
    let i = 0;
    const interval = setInterval(() => {
      if (i >= 10) { clearInterval(interval); return; }
      setRevealedRows((prev) => new Set([...prev, i]));
      i++;
    }, 200);
    return () => clearInterval(interval);
  }, [showdownResults]);

  if (!currentRound || !playerA || !playerB) {
    return <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Generating round...</div>;
  }

  const getValue = (player, cat) => {
    if (cat.key === 'seasons') return player.years.size;
    if (cat.key === 'teams') return player.teams.size;
    return player.stats[cat.key];
  };

  return (
    <div style={{ overflowX: 'auto' }}>
      {/* Header */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr 1fr',
        gap: '0.25rem',
        marginBottom: '0.5rem',
        textAlign: 'center',
        fontWeight: 700,
        fontSize: '0.85rem',
      }}>
        <div style={{ opacity: 0.5 }}>Stat</div>
        <div>{playerA.name}</div>
        <div>{playerB.name}</div>
      </div>

      {/* Rows */}
      {cats.slice(0, 10).map((cat, i) => {
        const pick = sbsPicks[i];
        const isRevealed = revealedRows.has(i);
        const result = showdownResults ? showdownResults[i] : null;

        return (
          <motion.div
            key={cat.key}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.04 }}
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr',
              gap: '0.25rem',
              marginBottom: '0.25rem',
              fontSize: '0.82rem',
            }}
          >
            {/* Stat label */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.5rem 0.25rem',
              fontWeight: 600,
              opacity: 0.7,
              fontSize: '0.75rem',
            }}>
              {cat.label}
            </div>

            {/* Cell A */}
            <div
              className="sbs-cell"
              onClick={roundSubmitted ? undefined : () => setSbsPick(i, 'A')}
              style={{
                padding: '0.5rem',
                textAlign: 'center',
                cursor: roundSubmitted ? 'default' : 'pointer',
                borderRadius: '0.5rem',
                border: pick === 'A' ? '2px solid #3b82f6' : '2px solid transparent',
                background: result && isRevealed
                  ? (result.correct && pick === 'A' ? 'rgba(34,197,94,0.2)' :
                     !result.correct && pick === 'A' ? 'rgba(239,68,68,0.2)' :
                     result.winner === 'A' || result.winner === 'tie' ? 'rgba(34,197,94,0.1)' : 'transparent')
                  : pick === 'A' ? 'rgba(59,130,246,0.15)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              {result && isRevealed
                ? formatStat(result.valA, cat.key, useWholeNumbers)
                : pick === 'A' ? '✓' : '—'}
            </div>

            {/* Cell B */}
            <div
              className="sbs-cell"
              onClick={roundSubmitted ? undefined : () => setSbsPick(i, 'B')}
              style={{
                padding: '0.5rem',
                textAlign: 'center',
                cursor: roundSubmitted ? 'default' : 'pointer',
                borderRadius: '0.5rem',
                border: pick === 'B' ? '2px solid #3b82f6' : '2px solid transparent',
                background: result && isRevealed
                  ? (result.correct && pick === 'B' ? 'rgba(34,197,94,0.2)' :
                     !result.correct && pick === 'B' ? 'rgba(239,68,68,0.2)' :
                     result.winner === 'B' || result.winner === 'tie' ? 'rgba(34,197,94,0.1)' : 'transparent')
                  : pick === 'B' ? 'rgba(59,130,246,0.15)' : 'transparent',
                transition: 'all 0.2s',
              }}
            >
              {result && isRevealed
                ? formatStat(result.valB, cat.key, useWholeNumbers)
                : pick === 'B' ? '✓' : '—'}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
