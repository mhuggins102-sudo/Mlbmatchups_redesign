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
  const useAnimations = useGameStore((s) => s.useAnimations);
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

  const anim = (props) => useAnimations ? props : {};

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      {/* Prompt */}
      <motion.div
        {...anim({ initial: { opacity: 0 }, animate: { opacity: 1 } })}
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
          {...anim({ initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 } })}
          style={{ padding: '0 0.25rem' }}
        >
          <div style={{ textAlign: 'center', fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.5rem', opacity: 0.85 }}>
            By how much?
          </div>
          <DualSlider
            disabled={roundSubmitted}
            bullseyeSize={BASE_BULL[catKey] || 0}
            answerValue={roundSubmitted ? trueDiff : null}
          />

          {/* Actual difference after submit */}
          {roundSubmitted && (
            <motion.div
              {...anim({
                initial: { opacity: 0, scale: 0.9 },
                animate: { opacity: 1, scale: 1 },
                transition: { delay: 0.3, type: 'spring', stiffness: 300, damping: 20 },
              })}
              style={{
                textAlign: 'center',
                marginTop: '0.5rem',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              }}
            >
              <span style={{ opacity: 0.5 }}>Actual:</span>
              <span style={{
                fontWeight: 700,
                color: '#10b981',
                fontSize: '0.95rem',
              }}>
                {formatStat(trueDiff, catKey, useWholeNumbers)}
              </span>
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
