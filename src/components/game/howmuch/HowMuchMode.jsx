import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../../stores/gameStore';
import usePlayerStore from '../../../stores/playerStore';
import PlayerCard from '../PlayerCard';
import RoundFeedback from '../RoundFeedback';
import DualSlider from './DualSlider';
import { formatStat } from '../../../engine/formatters';
import { BASE_CATS, BASE_BULL } from '../../../engine/categories';

export default function HowMuchMode() {
  const currentRound = useGameStore((s) => s.currentRound);
  const versusPick = useGameStore((s) => s.versusPick);
  const setVersusPick = useGameStore((s) => s.setVersusPick);
  const roundSubmitted = useGameStore((s) => s.roundSubmitted);
  const lastRoundFeedback = useGameStore((s) => s.lastRoundFeedback);
  const lastRoundScore = useGameStore((s) => s.lastRoundScore);
  const useWholeNumbers = useGameStore((s) => s.useWholeNumbers);
  const sliderState = useGameStore((s) => s.sliderState);
  const players = usePlayerStore((s) => s.players);

  const playerA = useMemo(() => currentRound ? players.get(currentRound.pA) : null, [currentRound, players]);
  const playerB = useMemo(() => currentRound ? players.get(currentRound.pB) : null, [currentRound, players]);

  if (!currentRound || !playerA || !playerB) {
    return <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Generating round...</div>;
  }

  const catKey = currentRound.cat;
  const catDef = BASE_CATS[catKey];
  const statA = playerA.stats[catKey];
  const statB = playerB.stats[catKey];
  const trueDiff = Math.abs(statA - statB);

  const feedbackType = lastRoundScore >= 800 ? 'success' : lastRoundScore >= 200 ? 'warning' : 'error';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Prompt */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ textAlign: 'center', fontWeight: 600, fontSize: '1.05rem', opacity: 0.85 }}
      >
        Whose <span style={{ color: '#60a5fa' }}>{catDef.label}</span> is {catDef.lowerBetter ? 'lower' : 'higher'}?
      </motion.div>

      {/* Player Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
        <PlayerCard
          player={playerA}
          selected={versusPick === 'A'}
          onClick={roundSubmitted ? undefined : () => setVersusPick('A')}
          showStat={roundSubmitted}
          statValue={formatStat(statA, catKey, useWholeNumbers)}
          revealed={roundSubmitted}
        />
        <PlayerCard
          player={playerB}
          selected={versusPick === 'B'}
          onClick={roundSubmitted ? undefined : () => setVersusPick('B')}
          showStat={roundSubmitted}
          statValue={formatStat(statB, catKey, useWholeNumbers)}
          revealed={roundSubmitted}
        />
      </div>

      {/* Slider section — show after pick */}
      {versusPick && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ padding: '0 0.25rem' }}
        >
          <div style={{ textAlign: 'center', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem', opacity: 0.85 }}>
            By how much?
          </div>
          <DualSlider disabled={roundSubmitted} />

          {/* Answer pin after submit */}
          {roundSubmitted && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              style={{
                textAlign: 'center',
                marginTop: '0.5rem',
                fontSize: '0.85rem',
                opacity: 0.7,
              }}
            >
              Actual difference: <strong>{formatStat(trueDiff, catKey, useWholeNumbers)}</strong>
            </motion.div>
          )}
        </motion.div>
      )}

      {/* Feedback */}
      {roundSubmitted && (
        <RoundFeedback text={lastRoundFeedback} type={feedbackType} />
      )}
    </div>
  );
}
