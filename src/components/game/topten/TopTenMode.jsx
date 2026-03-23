import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../../stores/gameStore';
import usePlayerStore from '../../../stores/playerStore';
import { TOP10_POINTS } from '../../../engine/categories';
import { formatStat } from '../../../engine/formatters';
import { evaluateTop10Guess, top10SearchFilter } from '../../../engine/topTenEngine';
import SearchInput from './SearchInput';
import RankCell from './RankCell';

export default function TopTenMode() {
  const currentRound = useGameStore((s) => s.currentRound);
  const top10State = useGameStore((s) => s.top10State);
  const updateTop10State = useGameStore((s) => s.updateTop10State);
  const addScore = useGameStore((s) => s.addScore);
  const showToast = useGameStore((s) => s.showToast);
  const useWholeNumbers = useGameStore((s) => s.useWholeNumbers);

  const players = usePlayerStore((s) => s.players);
  const playerNameIndex = usePlayerStore((s) => s.playerNameIndex);

  const [missToast, setMissToast] = useState(null);
  const [cascadeRevealedSet, setCascadeRevealedSet] = useState(new Set());

  const {
    answer, guessesLeft, revealedPositions, hitCount,
    question, roundOver, guessedPlayerIDs, allRanked,
  } = top10State;

  // Build question text
  const questionText = useMemo(() => {
    if (!question) return '';
    const { qType, pType, decade, cat, letter, letterType } = question;
    const typeWord = pType === 'hitter' ? 'batters' : 'pitchers';
    let text = 'Top 10 ';

    if (qType === 'decade') {
      text += `${typeWord} by ${cat.label} in the ${decade}s`;
    } else if (qType === 'letter') {
      text += `${typeWord} by ${cat.label} whose ${letterType} name starts with "${letter}"`;
    } else if (qType === 'combined') {
      text += `${typeWord} by ${cat.label} in the ${decade}s whose ${letterType} name starts with "${letter}"`;
    } else {
      text += `${typeWord} by ${cat.label} (all-time)`;
    }
    return text;
  }, [question]);

  // Format function for stat values
  const formatFn = useCallback((val) => {
    if (!question || !question.cat) return String(val);
    const key = question.cat.statKey || question.cat.baseCat || question.cat.key;
    return formatStat(val, key, useWholeNumbers);
  }, [question, useWholeNumbers]);

  // Search filter function for autocomplete
  const filterFn = useCallback((query) => {
    if (!question || !playerNameIndex) return [];
    const rankedIDs = allRanked ? new Set(allRanked.map((p) => p.id)) : null;
    return top10SearchFilter(query, playerNameIndex, question, 2, players, guessedPlayerIDs, rankedIDs);
  }, [question, playerNameIndex, players, guessedPlayerIDs, allRanked]);

  // Handle a guess
  const handleGuess = useCallback((player) => {
    if (roundOver || guessesLeft <= 0) return;
    if (guessedPlayerIDs.has(player.id)) {
      showToast('Already guessed!', 'bg-amber-600');
      return;
    }

    const idx = evaluateTop10Guess(player.id, answer);
    const newGuessedIDs = new Set(guessedPlayerIDs);
    newGuessedIDs.add(player.id);

    if (idx >= 0) {
      // Hit!
      const pts = TOP10_POINTS[idx] || 0;
      addScore(pts);
      const newRevealed = new Set(revealedPositions);
      newRevealed.add(idx);

      const newHitCount = hitCount + 1;
      const newGuessesLeft = guessesLeft - 1;
      const isOver = newHitCount >= 10 || newGuessesLeft <= 0;

      updateTop10State({
        revealedPositions: newRevealed,
        hitCount: newHitCount,
        guessesLeft: newGuessesLeft,
        guessedPlayerIDs: newGuessedIDs,
        roundOver: isOver,
      });
    } else {
      // Miss
      const newGuessesLeft = guessesLeft - 1;
      const isOver = newGuessesLeft <= 0;

      // Find the player's actual rank
      const actualRank = allRanked
        ? allRanked.findIndex((p) => p.id === player.id) + 1
        : 0;

      setMissToast({
        name: player.name,
        rank: actualRank > 0 ? `#${actualRank}` : 'Not ranked',
      });
      setTimeout(() => setMissToast(null), 2500);

      updateTop10State({
        guessesLeft: newGuessesLeft,
        guessedPlayerIDs: newGuessedIDs,
        roundOver: isOver,
      });
    }
  }, [
    roundOver, guessesLeft, guessedPlayerIDs, answer, revealedPositions, hitCount,
    allRanked, addScore, updateTop10State, showToast,
  ]);

  // Cascade reveal when round is over
  useEffect(() => {
    if (!roundOver) {
      setCascadeRevealedSet(new Set());
      return;
    }
    let i = 0;
    const unrevealed = [];
    for (let r = 0; r < 10; r++) {
      if (!revealedPositions.has(r)) unrevealed.push(r);
    }
    if (unrevealed.length === 0) return;

    const interval = setInterval(() => {
      if (i >= unrevealed.length) { clearInterval(interval); return; }
      setCascadeRevealedSet((prev) => new Set([...prev, unrevealed[i]]));
      i++;
    }, 250);
    return () => clearInterval(interval);
  }, [roundOver, revealedPositions]);

  if (!currentRound || !question || !answer || answer.length === 0) {
    return <div style={{ textAlign: 'center', padding: '2rem', opacity: 0.5 }}>Generating round...</div>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      {/* Question */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{
          textAlign: 'center',
          fontWeight: 700,
          fontSize: '1rem',
          lineHeight: 1.4,
          padding: '0.25rem 0.5rem',
          background: 'linear-gradient(135deg, #60a5fa, #a78bfa)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
        }}
      >
        {questionText}
      </motion.div>

      {/* Search input */}
      {!roundOver && (
        <SearchInput
          onSelect={handleGuess}
          filterFn={filterFn}
          disabled={roundOver || guessesLeft <= 0}
        />
      )}

      {/* Guess / Hit counters */}
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '1.5rem',
        fontSize: '0.82rem',
        opacity: 0.7,
      }}>
        <span>Guesses left: {guessesLeft}</span>
        <span>Found: {hitCount}/10</span>
      </div>

      {/* Miss toast */}
      <AnimatePresence>
        {missToast && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            style={{
              textAlign: 'center',
              fontSize: '0.85rem',
              color: '#ef4444',
              fontWeight: 600,
            }}
          >
            {missToast.name} — {missToast.rank}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Rank cells */}
      <div>
        {answer.map((entry, i) => {
          const isRevealed = revealedPositions.has(i);
          const isCascade = cascadeRevealedSet.has(i);

          return (
            <RankCell
              key={i}
              rank={i + 1}
              player={isRevealed || isCascade ? entry.name : null}
              value={isRevealed || isCascade ? entry.value : null}
              points={isRevealed ? TOP10_POINTS[i] : null}
              revealed={isRevealed}
              cascadeRevealed={isCascade}
              formatFn={formatFn}
            />
          );
        })}
      </div>
    </div>
  );
}
