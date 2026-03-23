import React, { useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../../stores/gameStore';
import usePlayerStore from '../../../stores/playerStore';
import { BASE_CATS } from '../../../engine/categories';
import { formatStat } from '../../../engine/formatters';

const CHAIN_BONUS = [0, 0, 25, 50, 100, 150, 200, 300, 400, 500];

export default function PickEmMode() {
  const currentRound = useGameStore((s) => s.currentRound);
  const pickEmState = useGameStore((s) => s.pickEmState);
  const updatePickEmState = useGameStore((s) => s.updatePickEmState);
  const addScore = useGameStore((s) => s.addScore);
  const useWholeNumbers = useGameStore((s) => s.useWholeNumbers);
  const showToast = useGameStore((s) => s.showToast);
  const players = usePlayerStore((s) => s.players);

  const {
    threshold, correctIDs, picksMade, totalRoundPts,
    chainActive, chainCount, roundOver, gridPlayers, catKey, subRole, playerStates,
  } = pickEmState;

  const catDef = useMemo(() => catKey ? BASE_CATS[catKey] : null, [catKey]);

  const thresholdText = useMemo(() => {
    if (!catDef || !catKey) return '';
    const formatted = formatStat(threshold, catKey, useWholeNumbers);
    const dir = catDef.lowerBetter ? 'or lower' : 'or higher';
    let roleText = '';
    if (subRole === 'starter') roleText = 'starting pitchers';
    else if (subRole === 'reliever') roleText = 'relief pitchers';
    else if (catDef.type === 'pitcher') roleText = 'pitchers';
    else roleText = 'batters';
    return `Which ${roleText} have ${formatted}${catDef.lowerBetter ? '' : '+'} ${catDef.label}?`;
  }, [catDef, catKey, threshold, subRole, useWholeNumbers]);

  const handlePick = useCallback((player) => {
    if (roundOver) return;
    if (playerStates[player.id]) return; // Already picked

    const isCorrect = correctIDs.has(player.id);
    const newStates = { ...playerStates, [player.id]: isCorrect ? 'correct' : 'incorrect' };

    if (isCorrect) {
      const basePts = 100;
      const bonus = CHAIN_BONUS[Math.min(chainCount + 1, CHAIN_BONUS.length - 1)] || 0;
      const pts = basePts + bonus;

      addScore(pts);
      updatePickEmState({
        picksMade: picksMade + 1,
        totalRoundPts: totalRoundPts + pts,
        chainCount: chainCount + 1,
        chainActive: true,
        playerStates: newStates,
        lastVal: player.stats ? player.stats[catKey] : null,
      });
    } else {
      // Wrong pick — round ends
      updatePickEmState({
        picksMade: picksMade + 1,
        chainActive: false,
        roundOver: true,
        playerStates: newStates,
        lastVal: player.stats ? player.stats[catKey] : null,
      });
    }
  }, [
    roundOver, playerStates, correctIDs, chainCount, picksMade, totalRoundPts,
    catKey, addScore, updatePickEmState,
  ]);

  // Check if all correct players have been found
  const allCorrectFound = useMemo(() => {
    if (!correctIDs || correctIDs.size === 0) return false;
    let found = 0;
    for (const id of correctIDs) {
      if (playerStates[id] === 'correct') found++;
    }
    return found >= correctIDs.size;
  }, [correctIDs, playerStates]);

  // Auto-end round when all correct found
  React.useEffect(() => {
    if (allCorrectFound && !roundOver) {
      updatePickEmState({ roundOver: true });
    }
  }, [allCorrectFound, roundOver, updatePickEmState]);

  if (!currentRound || !catDef) {
    return <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Generating round...</div>;
  }

  const getPlayerStat = (player) => {
    if (!player || !player.stats) return '?';
    if (catKey === 'teams') return player.teams ? player.teams.size : 0;
    if (catKey === 'seasons') return player.years ? player.years.size : 0;
    return player.stats[catKey];
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Prompt */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          textAlign: 'center',
          fontWeight: 600,
          fontSize: '1rem',
          lineHeight: 1.4,
          padding: '0.25rem 0.5rem',
        }}
      >
        {thresholdText}
      </motion.div>

      {/* Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem',
      }}>
        {gridPlayers.map((player, i) => {
          const state = playerStates[player.id];
          const statVal = getPlayerStat(player);
          const isRevealed = state || roundOver;

          let bgColor = 'transparent';
          let borderColor = 'rgba(255,255,255,0.1)';

          if (state === 'correct') {
            bgColor = 'rgba(34,197,94,0.2)';
            borderColor = '#22c55e';
          } else if (state === 'incorrect') {
            bgColor = 'rgba(239,68,68,0.2)';
            borderColor = '#ef4444';
          } else if (roundOver && correctIDs.has(player.id)) {
            bgColor = 'rgba(34,197,94,0.08)';
            borderColor = 'rgba(34,197,94,0.3)';
          }

          return (
            <motion.div
              key={player.id}
              className="pickem-card"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.04 }}
              whileHover={!state && !roundOver ? { scale: 1.03 } : {}}
              whileTap={!state && !roundOver ? { scale: 0.97 } : {}}
              onClick={() => handlePick(player)}
              style={{
                padding: '0.75rem 0.5rem',
                borderRadius: '0.75rem',
                textAlign: 'center',
                cursor: state || roundOver ? 'default' : 'pointer',
                border: `2px solid ${borderColor}`,
                background: bgColor,
                transition: 'all 0.25s',
              }}
            >
              <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                {player.name}
              </div>

              {isRevealed && (
                <motion.div
                  initial={{ opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  style={{
                    fontSize: '0.8rem',
                    opacity: 0.75,
                    fontWeight: 500,
                  }}
                >
                  {formatStat(statVal, catKey, useWholeNumbers)}
                </motion.div>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Chain bonus bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '0.5rem',
        fontSize: '0.85rem',
        opacity: 0.8,
      }}>
        <span>Streak: {chainCount}</span>
        {chainActive && chainCount > 0 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            style={{
              background: 'rgba(59,130,246,0.3)',
              padding: '0.15rem 0.5rem',
              borderRadius: '999px',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            +{CHAIN_BONUS[Math.min(chainCount, CHAIN_BONUS.length - 1)]} bonus
          </motion.span>
        )}
        <span style={{ marginLeft: '0.5rem' }}>Total: {totalRoundPts} pts</span>
      </div>

      {/* Round over feedback */}
      <AnimatePresence>
        {roundOver && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            style={{
              textAlign: 'center',
              fontWeight: 600,
              fontSize: '0.95rem',
              color: allCorrectFound ? '#22c55e' : '#f59e0b',
            }}
          >
            {allCorrectFound
              ? `Perfect! All correct picks found! +${totalRoundPts} pts`
              : `Round over! +${totalRoundPts} pts`}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
