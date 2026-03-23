/**
 * Showdown (Side-by-Side) engine — pre-generation and evaluation logic.
 * Ported from original MLB Matchups vanilla JS (~lines 2212-2250, 4493-4553).
 */

/**
 * Pre-generate a Showdown round: pick two players of the same type.
 *
 * @param {function(): number} rng - PRNG function returning [0,1)
 * @param {Set} usedIDs - Set of player IDs already used (mutated)
 * @param {Map} players - Map of playerId → player object
 * @param {string} playerPool - 'all' | 'batters' | 'pitchers'
 * @param {string} eligibility - 'standard' | 'allStar' | 'hof' | 'custom'
 * @param {string} eraMode - 'allEras' | 'modern' | 'select'
 * @param {number|null} selectedDecade
 * @param {Array} customFilters
 * @param {string} gameMode
 * @param {{ bat: boolean, pit: boolean }} warLoaded
 * @param {Array} SBS_CATS_BAT - showdown categories for batters
 * @param {Array} SBS_CATS_PIT - showdown categories for pitchers
 * @param {function(Object): boolean} passesGlobal - eligibility check
 * @param {function(Object): boolean} eraPass - era filter check
 * @returns {{ pA: string, pB: string, type: string }|null}
 */
export function pregenShowdown(
  rng, usedIDs, players, playerPool, eligibility,
  eraMode, selectedDecade, customFilters, gameMode, warLoaded,
  SBS_CATS_BAT, SBS_CATS_PIT, passesGlobal, eraPass
) {
  var targetType;
  if (playerPool === 'pitchers') targetType = 'pitcher';
  else if (playerPool === 'batters') targetType = 'hitter';
  else targetType = rng() < 0.5 ? 'hitter' : 'pitcher';

  var pool = [];
  players.forEach(function(p) {
    if (usedIDs.has(p.id)) return;
    if (!passesGlobal(p) || !eraPass(p) || p.type !== targetType || !p.stats) return;
    pool.push(p);
  });
  if (pool.length < 2) return null;

  var cats = targetType === 'hitter' ? SBS_CATS_BAT : SBS_CATS_PIT;
  for (var attempts = 0; attempts < 100; attempts++) {
    var idxA = Math.floor(rng() * pool.length);
    var idxB = Math.floor(rng() * pool.length);
    while (idxA === idxB) idxB = Math.floor(rng() * pool.length);
    var pA = pool[idxA], pB = pool[idxB];
    var wA = 0, wB = 0;
    for (var i = 0; i < 10 && i < cats.length; i++) {
      var cat = cats[i];
      var vA = cat.key === 'seasons' ? pA.years.size : (cat.key === 'teams' ? pA.teams.size : pA.stats[cat.key]);
      var vB = cat.key === 'seasons' ? pB.years.size : (cat.key === 'teams' ? pB.teams.size : pB.stats[cat.key]);
      if (vA === vB) continue;
      if (cat.lowerBetter ? vA < vB : vA > vB) wA++; else wB++;
    }
    if (wA <= 8 && wB <= 8) {
      usedIDs.add(pA.id); usedIDs.add(pB.id);
      return { pA: pA.id, pB: pB.id, type: targetType };
    }
  }
  // Fallback
  var fA = Math.floor(rng() * pool.length), fB = Math.floor(rng() * pool.length);
  while (fA === fB) fB = Math.floor(rng() * pool.length);
  usedIDs.add(pool[fA].id); usedIDs.add(pool[fB].id);
  return { pA: pool[fA].id, pB: pool[fB].id, type: targetType };
}

/**
 * Evaluate all 10 Showdown picks.
 *
 * @param {Object} playerA - player A object (with .stats, .years, .teams)
 * @param {Object} playerB - player B object
 * @param {Array} sbsPicks - array of 10 picks: 'A' | 'B' | null
 * @param {Array} cats - the 10 showdown categories (SBS_CATS_BAT or SBS_CATS_PIT)
 * @returns {{ correctCount: number, roundScore: number, results: Array<{ catKey: string, valA: *, valB: *, winner: string, userPick: string, correct: boolean }> }}
 */
export function evaluateShowdown(playerA, playerB, sbsPicks, cats) {
  var correctCount = 0;
  var results = [];
  var scores = [0, 0, 0, 0, 0, 0, 100, 250, 450, 700, 1000];

  for (var i = 0; i < 10 && i < cats.length; i++) {
    var cat = cats[i];
    var valA, valB;
    if (cat.key === 'seasons') { valA = playerA.years.size; valB = playerB.years.size; }
    else if (cat.key === 'teams') { valA = playerA.teams.size; valB = playerB.teams.size; }
    else { valA = playerA.stats[cat.key]; valB = playerB.stats[cat.key]; }

    var winA = false, winB = false;
    if (valA === valB) { winA = true; winB = true; }
    else if (cat.lowerBetter) { if (valA < valB) winA = true; else winB = true; }
    else { if (valA > valB) winA = true; else winB = true; }

    var userPick = sbsPicks[i];
    var isCorrect = (userPick === 'A' && winA) || (userPick === 'B' && winB);
    if (isCorrect) correctCount++;

    results.push({
      catKey: cat.key,
      valA: valA,
      valB: valB,
      winner: winA && winB ? 'tie' : (winA ? 'A' : 'B'),
      userPick: userPick,
      correct: isCorrect
    });
  }

  var roundScore = scores[correctCount];
  return { correctCount: correctCount, roundScore: roundScore, results: results };
}
