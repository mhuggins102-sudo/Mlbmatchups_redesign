import React, { useEffect, useCallback, useMemo } from 'react';
import { motion } from 'framer-motion';
import useGameStore from '../../stores/gameStore';
import usePlayerStore from '../../stores/playerStore';
import ScoreBar from './ScoreBar';
import RoundFeedback from './RoundFeedback';
import HowMuchMode from './howmuch/HowMuchMode';
import ShowdownMode from './showdown/ShowdownMode';
import PickEmMode from './pickem/PickEmMode';
import TopTenMode from './topten/TopTenMode';

import { pregenHowMuch, calculateHowMuchScore } from '../../engine/howMuchEngine';
import { pregenShowdown, evaluateShowdown } from '../../engine/showdownEngine';
import { pregenPickEm } from '../../engine/pickEmEngine';
import { pregenTop10 } from '../../engine/topTenEngine';
import {
  BASE_CATS, BASE_BULL, SBS_CATS_BAT, SBS_CATS_PIT, CUSTOM_STAT_OPTIONS,
  TOP10_CATS_BAT_DECADE, TOP10_CATS_PIT_DECADE, TOP10_CATS_BAT_CAREER, TOP10_CATS_PIT_CAREER,
  TOP10_POINTS,
} from '../../engine/categories';
import { formatStat } from '../../engine/formatters';
import {
  scoreHowMuch, scoreShowdown,
  getHowMuchEmoji, getShowdownEmoji, getPickEmEmoji, getTop10Emoji,
} from '../../engine/scoring';
import { passesGlobal, rolePass, eraPass } from '../../engine/eligibility';

export default function GameScreen() {
  // Game store selectors
  const gameMode = useGameStore((s) => s.gameMode);
  const round = useGameStore((s) => s.round);
  const score = useGameStore((s) => s.score);
  const currentRound = useGameStore((s) => s.currentRound);
  const roundSubmitted = useGameStore((s) => s.roundSubmitted);
  const versusPick = useGameStore((s) => s.versusPick);
  const sliderState = useGameStore((s) => s.sliderState);
  const sbsPicks = useGameStore((s) => s.sbsPicks);
  const pickEmState = useGameStore((s) => s.pickEmState);
  const top10State = useGameStore((s) => s.top10State);
  const lastRoundScore = useGameStore((s) => s.lastRoundScore);
  const lastRoundFeedback = useGameStore((s) => s.lastRoundFeedback);
  const deadZoneEnabled = useGameStore((s) => s.deadZoneEnabled);
  const useWholeNumbers = useGameStore((s) => s.useWholeNumbers);

  // Game settings
  const playerPool = useGameStore((s) => s.playerPool);
  const eligibility = useGameStore((s) => s.eligibility);
  const eraMode = useGameStore((s) => s.eraMode);
  const selectedDecade = useGameStore((s) => s.selectedDecade);
  const customFilters = useGameStore((s) => s.customFilters);
  const usedPlayerIDs = useGameStore((s) => s.usedPlayerIDs);
  const categoryHistory = useGameStore((s) => s.categoryHistory);

  // Challenge state
  const challengeQueue = useGameStore((s) => s.challengeQueue);

  // Actions
  const setCurrentRound = useGameStore((s) => s.setCurrentRound);
  const setRoundSubmitted = useGameStore((s) => s.setRoundSubmitted);
  const addScore = useGameStore((s) => s.addScore);
  const nextRound = useGameStore((s) => s.nextRound);
  const endGame = useGameStore((s) => s.endGame);
  const pushRoundResult = useGameStore((s) => s.pushRoundResult);
  const addUsedPlayerID = useGameStore((s) => s.addUsedPlayerID);
  const updateCategoryHistory = useGameStore((s) => s.updateCategoryHistory);
  const setSliderState = useGameStore((s) => s.setSliderState);
  const updatePickEmState = useGameStore((s) => s.updatePickEmState);
  const setPickEmState = useGameStore((s) => s.setPickEmState);
  const updateTop10State = useGameStore((s) => s.updateTop10State);
  const setTop10State = useGameStore((s) => s.setTop10State);
  const showToast = useGameStore((s) => s.showToast);

  // Player store
  const players = usePlayerStore((s) => s.players);
  const batSeasons = usePlayerStore((s) => s.batSeasons);
  const pitSeasons = usePlayerStore((s) => s.pitSeasons);
  const warLoaded = usePlayerStore((s) => s.warLoaded);
  const playerNameIndex = usePlayerStore((s) => s.playerNameIndex);
  const decadeStatsCache = usePlayerStore((s) => s.decadeStatsCache);

  // Eligibility helpers bound to current settings
  const passesGlobalFn = useCallback(
    (p) => passesGlobal(p, eligibility, customFilters, gameMode, CUSTOM_STAT_OPTIONS),
    [eligibility, customFilters, gameMode]
  );
  const rolePassFn = useCallback(
    (p) => rolePass(p, playerPool),
    [playerPool]
  );
  const eraPassFn = useCallback(
    (p) => eraPass(p, eraMode, selectedDecade),
    [eraMode, selectedDecade]
  );

  // Generate round data
  const generateRound = useCallback(() => {
    if (!players || players.size === 0) return;

    // For challenge mode, use pre-built matchup from queue
    if (challengeQueue.length > 0 && challengeQueue[round - 1]) {
      setCurrentRound(challengeQueue[round - 1]);
      return;
    }

    const rng = Math.random;

    if (gameMode === 'howMuch') {
      const result = pregenHowMuch(
        rng, usedPlayerIDs, categoryHistory, players, playerPool, eligibility,
        eraMode, selectedDecade, customFilters, gameMode, warLoaded,
        BASE_CATS, CUSTOM_STAT_OPTIONS, passesGlobalFn, rolePassFn, eraPassFn
      );
      if (result) {
        const catDef = BASE_CATS[result.cat];
        const pA = players.get(result.pA);
        const pB = players.get(result.pB);
        const trueDiff = Math.abs(pA.stats[result.cat] - pB.stats[result.cat]);
        const rangeMax = catDef.dMin * 5;
        const step = catDef.step || 1;

        setSliderState({
          min: catDef.dMin,
          max: catDef.dMin * 2,
          rangeMax,
          step,
          minLimit: catDef.dMin,
          visualMin: 0,
        });

        setCurrentRound({ ...result, trueDiff });
        updateCategoryHistory(result.cat);
      }
    } else if (gameMode === 'sideBySide') {
      const result = pregenShowdown(
        rng, usedPlayerIDs, players, playerPool, eligibility,
        eraMode, selectedDecade, customFilters, gameMode, warLoaded,
        SBS_CATS_BAT, SBS_CATS_PIT, passesGlobalFn, eraPassFn
      );
      if (result) {
        setCurrentRound(result);
      }
    } else if (gameMode === 'pickEm') {
      const result = pregenPickEm(
        rng, usedPlayerIDs, players, playerPool, eligibility,
        eraMode, selectedDecade, customFilters, categoryHistory, round, warLoaded,
        BASE_CATS, passesGlobalFn, eraPassFn
      );
      if (result) {
        const catDef = BASE_CATS[result.cat];
        const correctIDs = new Set();
        result.ids.forEach((id) => {
          const p = players.get(id);
          if (!p) return;
          let val;
          if (result.cat === 'teams') val = p.teams.size;
          else if (result.cat === 'seasons') val = p.years.size;
          else val = p.stats[result.cat];
          const meetsThreshold = catDef.lowerBetter
            ? val <= result.thresh
            : val >= result.thresh;
          if (meetsThreshold) correctIDs.add(id);
        });

        const gridPlayers = result.ids.map((id) => players.get(id)).filter(Boolean);

        setPickEmState({
          threshold: result.thresh,
          correctIDs,
          picksMade: 0,
          totalRoundPts: 0,
          lastVal: null,
          chainActive: true,
          chainCount: 0,
          roundOver: false,
          gridPlayers,
          catKey: result.cat,
          subRole: result.subRole,
          playerStates: {},
        });

        setCurrentRound(result);
        updateCategoryHistory(result.cat);
      }
    } else if (gameMode === 'top10') {
      const result = pregenTop10(
        rng, players, playerPool, eraMode, selectedDecade,
        batSeasons, pitSeasons, null, null, decadeStatsCache,
        eraPassFn,
        TOP10_CATS_BAT_DECADE, TOP10_CATS_PIT_DECADE,
        TOP10_CATS_BAT_CAREER, TOP10_CATS_PIT_CAREER
      );
      if (result) {
        setTop10State({
          answer: result.answer,
          guessesLeft: 10,
          revealedPositions: new Set(),
          hitCount: 0,
          question: result.question,
          roundOver: false,
          guessedPlayerIDs: new Set(),
          allRanked: result.allRanked,
        });
        setCurrentRound(result);
      }
    }
  }, [
    players, gameMode, round, playerPool, eligibility, eraMode, selectedDecade,
    customFilters, usedPlayerIDs, categoryHistory, warLoaded, challengeQueue,
    batSeasons, pitSeasons, decadeStatsCache, passesGlobalFn, rolePassFn, eraPassFn,
    setCurrentRound, setSliderState, updateCategoryHistory, setPickEmState, setTop10State,
  ]);

  // Generate round on mount and when round changes
  useEffect(() => {
    if (!currentRound) {
      generateRound();
    }
  }, [round, currentRound, generateRound]);

  // Get category label for score bar
  const categoryLabel = useMemo(() => {
    if (!currentRound) return '';
    if (gameMode === 'howMuch') {
      const catDef = BASE_CATS[currentRound.cat];
      return catDef ? catDef.label : '';
    }
    if (gameMode === 'sideBySide') {
      return currentRound.type === 'hitter' ? 'Batter Showdown' : 'Pitcher Showdown';
    }
    if (gameMode === 'pickEm') {
      const catDef = BASE_CATS[currentRound.cat];
      return catDef ? catDef.label : '';
    }
    if (gameMode === 'top10') {
      return 'Top 10';
    }
    return '';
  }, [currentRound, gameMode]);

  // Submit handler
  const handleSubmit = useCallback(() => {
    if (!currentRound) return;

    if (gameMode === 'howMuch') {
      const catDef = BASE_CATS[currentRound.cat];
      const pA = players.get(currentRound.pA);
      const pB = players.get(currentRound.pB);
      const statA = pA.stats[currentRound.cat];
      const statB = pB.stats[currentRound.cat];
      const trueDiff = Math.abs(statA - statB);
      const rangeMax = catDef.dMin * 5;
      const bullseyeSize = BASE_BULL[currentRound.cat] || 0;

      // Determine if user picked the correct (higher/lower) player
      const aWins = catDef.lowerBetter ? statA < statB : statA > statB;
      const userPickedCorrect = (versusPick === 'A' && aWins) || (versusPick === 'B' && !aWins);

      const result = calculateHowMuchScore(
        userPickedCorrect, sliderState.min, sliderState.max,
        trueDiff, rangeMax, bullseyeSize, deadZoneEnabled, catDef.dMin
      );

      const emoji = getHowMuchEmoji(result.points, result.playerCorrect, result.rangeCorrect, result.bullseye);
      let feedback = '';
      if (result.bullseye) feedback = `Bullseye! +${result.points} pts`;
      else if (result.playerCorrect && result.rangeCorrect) feedback = `In range! +${result.points} pts`;
      else if (result.playerCorrect) feedback = `Right player, wrong range. +${result.points} pts`;
      else feedback = `Wrong player. +0 pts`;

      addScore(result.points);
      pushRoundResult(emoji, result.points);
      useGameStore.setState({ lastRoundScore: result.points, lastRoundFeedback: feedback });
      setRoundSubmitted(true);

    } else if (gameMode === 'sideBySide') {
      const pA = players.get(currentRound.pA);
      const pB = players.get(currentRound.pB);
      const cats = currentRound.type === 'hitter' ? SBS_CATS_BAT : SBS_CATS_PIT;
      const evalResult = evaluateShowdown(pA, pB, sbsPicks, cats);

      const emoji = getShowdownEmoji(evalResult.correctCount);
      const feedback = `${evalResult.correctCount}/10 correct! +${evalResult.roundScore} pts`;

      addScore(evalResult.roundScore);
      pushRoundResult(emoji, evalResult.roundScore);
      useGameStore.setState({
        lastRoundScore: evalResult.roundScore,
        lastRoundFeedback: feedback,
        currentRound: { ...currentRound, results: evalResult.results, correctCount: evalResult.correctCount },
      });
      setRoundSubmitted(true);

    } else if (gameMode === 'pickEm') {
      // Score is tracked in pickEmState.totalRoundPts — add it here once at end of round
      const pts = pickEmState.totalRoundPts;
      const emoji = getPickEmEmoji(pts, pickEmState.picksMade);
      addScore(pts);
      pushRoundResult(emoji, pts);
      useGameStore.setState({ lastRoundScore: pts, lastRoundFeedback: `+${pts} pts` });
      setRoundSubmitted(true);

    } else if (gameMode === 'top10') {
      // Top 10 give up — reveal all remaining
      // Score was already added per-guess in TopTenMode, so don't add again
      const { answer, revealedPositions, hitCount } = top10State;

      // Calculate score from positions the user actually guessed (before give-up reveal)
      const userGuessedScore = calculateTop10Score(top10State);

      const newRevealed = new Set(revealedPositions);
      for (let i = 0; i < 10; i++) newRevealed.add(i);
      updateTop10State({ revealedPositions: newRevealed, roundOver: true, guessesLeft: 0 });

      const emoji = getTop10Emoji(hitCount);
      // Don't call addScore — it was already added per correct guess in TopTenMode
      pushRoundResult(emoji, userGuessedScore);
      useGameStore.setState({ lastRoundScore: userGuessedScore, lastRoundFeedback: `${hitCount}/10 found! +${userGuessedScore} pts` });
      setRoundSubmitted(true);
    }
  }, [
    currentRound, gameMode, versusPick, sliderState, sbsPicks, pickEmState, top10State,
    players, deadZoneEnabled, addScore, pushRoundResult, setRoundSubmitted, updateTop10State,
  ]);

  // Handle next round or end game
  const handleNext = useCallback(() => {
    if (round >= 10) {
      endGame();
    } else {
      nextRound();
    }
  }, [round, endGame, nextRound]);

  // Determine if submit is possible
  const canSubmit = useMemo(() => {
    if (roundSubmitted) return false;
    if (gameMode === 'howMuch') return versusPick !== null;
    if (gameMode === 'sideBySide') return sbsPicks.every((p) => p !== null);
    if (gameMode === 'pickEm') return pickEmState.roundOver;
    if (gameMode === 'top10') return !top10State.roundOver;
    return false;
  }, [roundSubmitted, gameMode, versusPick, sbsPicks, pickEmState.roundOver, top10State.roundOver]);

  // Button text
  const buttonText = useMemo(() => {
    if (roundSubmitted) {
      return round >= 10 ? 'See Results' : 'Next Round';
    }
    if (gameMode === 'pickEm' && pickEmState.roundOver) return 'Continue';
    if (gameMode === 'top10') return 'Give Up & Reveal';
    return 'Submit';
  }, [roundSubmitted, round, gameMode, pickEmState.roundOver]);

  // Render mode component
  const renderMode = () => {
    switch (gameMode) {
      case 'howMuch': return <HowMuchMode />;
      case 'sideBySide': return <ShowdownMode />;
      case 'pickEm': return <PickEmMode />;
      case 'top10': return <TopTenMode />;
      default: return <div>Unknown game mode</div>;
    }
  };

  // Show button for pickEm only when round is over, for top10 always (give up or next)
  const showButton = useMemo(() => {
    if (gameMode === 'pickEm') return pickEmState.roundOver || roundSubmitted;
    if (gameMode === 'top10') return true;
    return true;
  }, [gameMode, pickEmState.roundOver, roundSubmitted]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        maxWidth: '600px',
        margin: '0 auto',
        padding: '0.5rem',
        height: '100%',
        overflow: 'hidden',
      }}
    >
      <ScoreBar categoryLabel={categoryLabel} />

      <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        {renderMode()}
      </div>

      {/* Feedback for showdown */}
      {roundSubmitted && gameMode === 'sideBySide' && (
        <RoundFeedback
          text={lastRoundFeedback}
          type={lastRoundScore >= 450 ? 'success' : lastRoundScore >= 100 ? 'warning' : 'error'}
        />
      )}

      {/* Submit / Next button */}
      {showButton && (
        <motion.button
          className="btn-primary"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.97 }}
          onClick={roundSubmitted ? handleNext : handleSubmit}
          disabled={!roundSubmitted && !canSubmit}
          style={{
            padding: '0.85rem 2rem',
            borderRadius: '0.75rem',
            fontWeight: 700,
            fontSize: '1rem',
            border: 'none',
            cursor: (!roundSubmitted && !canSubmit) ? 'not-allowed' : 'pointer',
            opacity: (!roundSubmitted && !canSubmit) ? 0.5 : 1,
            marginTop: '0.5rem',
            width: '100%',
          }}
        >
          {buttonText}
        </motion.button>
      )}
    </motion.div>
  );
}

/** Calculate total score for a top10 round based on revealed positions */
function calculateTop10Score(state) {
  let total = 0;
  state.revealedPositions.forEach((idx) => {
    // Only count positions that were guessed (not cascade revealed)
    if (idx < TOP10_POINTS.length) {
      total += TOP10_POINTS[idx];
    }
  });
  return total;
}
