/**
 * Pick 'Em engine — pre-generation and evaluation logic.
 * Ported from original MLB Matchups vanilla JS (~lines 2252-2328, 4569-4700).
 */

/**
 * Seeded shuffle (Fisher-Yates).
 * @param {Array} arr - array to shuffle in place
 * @param {function(): number} rng - PRNG
 */
function seededShuffle(arr, rng) {
  for (var i = arr.length - 1; i > 0; i--) {
    var j = Math.floor(rng() * (i + 1));
    var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
  }
}

/**
 * Pre-generate a Pick 'Em round.
 *
 * @param {function(): number} rng - PRNG function
 * @param {Set} usedPlayerIDs - IDs already used (not mutated here — caller tracks)
 * @param {Map} players - Map of playerId → player object
 * @param {string} playerPool - 'all' | 'batters' | 'pitchers'
 * @param {string} eligibility - 'standard' | 'allStar' | 'hof' | 'custom'
 * @param {string} eraMode
 * @param {number|null} selectedDecade
 * @param {Array} customFilters
 * @param {Object} categoryHistory - catKey → usage count (mutated)
 * @param {number} round - 1-based round number
 * @param {{ bat: boolean, pit: boolean }} warLoaded
 * @param {Object} BASE_CATS - category definitions
 * @param {function(Object): boolean} passesGlobal
 * @param {function(Object): boolean} eraPass
 * @returns {{ cat: string, thresh: number, subRole: string, ids: string[] }|null}
 */
export function pregenPickEm(
  rng, usedPlayerIDs, players, playerPool, eligibility,
  eraMode, selectedDecade, customFilters, categoryHistory, round, warLoaded,
  BASE_CATS, passesGlobal, eraPass
) {
  var validCats = Object.keys(BASE_CATS).filter(function(k) { return BASE_CATS[k].thresholds; });
  if (playerPool === 'batters') validCats = validCats.filter(function(k) { return BASE_CATS[k].type === 'hitter' || BASE_CATS[k].type === 'both'; });
  else if (playerPool === 'pitchers') validCats = validCats.filter(function(k) { return BASE_CATS[k].type === 'pitcher' || BASE_CATS[k].type === 'both'; });

  var unusedCats = validCats.filter(function(k) { return !categoryHistory[k]; });
  if (unusedCats.length > 0) validCats = unusedCats;

  for (var retry = 0; retry < 20; retry++) {
    var ck = validCats[Math.floor(rng() * validCats.length)];
    var cc = BASE_CATS[ck];
    var availThresh = cc.thresholds.slice();
    if (eligibility === 'allStar' || eligibility === 'hof') {
      if (availThresh.length >= 2) availThresh = availThresh.slice(-2);
    } else {
      if (availThresh.length > 1) availThresh = availThresh.slice(0, -1);
    }
    var threshVal = availThresh[Math.floor(rng() * availThresh.length)];

    var subRole = 'all';
    if (cc.type === 'pitcher') subRole = rng() < 0.75 ? 'starter' : 'reliever';

    var numCorrect = round <= 3 ? 7 : (round <= 6 ? 6 : 5);
    var numIncorrect = 10 - numCorrect;
    var buffer = threshVal * cc.tolerance;
    if (cc.minBuffer) buffer = Math.max(buffer, cc.minBuffer);

    var goodMin, goodMax, badMin, badMax;
    if (cc.lowerBetter) {
      goodMax = threshVal; goodMin = Math.max(0, threshVal - buffer);
      badMin = threshVal + 0.0001; badMax = threshVal + buffer;
    } else {
      goodMin = threshVal; goodMax = threshVal + buffer;
      badMax = threshVal - (cc.step || 0.01); badMin = threshVal - buffer;
    }

    var correctPool = [], distractorPool = [];
    players.forEach(function(p) {
      if (!eraPass(p) || !p.stats) return;
      if (eligibility !== 'custom') {
        if (p.type === 'hitter' && p.stats.PA < 3000) return;
        if (p.type === 'pitcher' && p.GS < 150 && p.G < 500) return;
      }
      if (!passesGlobal(p)) return;
      if (playerPool === 'batters' && p.type !== 'hitter') return;
      if (playerPool === 'pitchers' && p.type !== 'pitcher') return;
      if (cc.type === 'hitter' && p.type !== 'hitter') return;
      if (cc.type === 'pitcher') {
        if (p.type !== 'pitcher') return;
        if (subRole === 'starter' && p.GS < 150) return;
        if (subRole === 'reliever' && (p.G < 500 || p.GS >= 150)) return;
      }
      if (['peakSeasonOPS','bestSeasonERA'].includes(ck) && (!p.stats[ck] || p.stats[ck] <= 0)) return;

      var val;
      if (ck === 'careerSO') val = p.stats.careerSO;
      else if (ck === 'careerRBI') val = p.stats.careerRBI;
      else if (ck === 'teams') val = p.teams.size;
      else if (ck === 'seasons') val = p.years.size;
      else val = p.stats[ck];
      if (val === undefined || isNaN(val)) return;

      if (val >= goodMin && val <= goodMax) correctPool.push(p);
      else if (val >= badMin && val <= badMax) distractorPool.push(p);
    });

    if (correctPool.length < numCorrect || distractorPool.length < numIncorrect) continue;

    seededShuffle(correctPool, rng);
    seededShuffle(distractorPool, rng);
    var selected = correctPool.slice(0, numCorrect).concat(distractorPool.slice(0, numIncorrect));
    seededShuffle(selected, rng);
    categoryHistory[ck] = (categoryHistory[ck] || 0) + 1;
    return {
      cat: ck,
      thresh: threshVal,
      subRole: subRole,
      ids: selected.map(function(p) { return p.id; })
    };
  }
  return null;
}

/**
 * Check if a player's pick is correct (i.e. player is in the correct set).
 *
 * @param {string} playerId - the player ID that was picked
 * @param {Set} correctIDs - set of correct player IDs
 * @returns {boolean}
 */
export function evaluatePick(playerId, correctIDs) {
  return correctIDs.has(playerId);
}
