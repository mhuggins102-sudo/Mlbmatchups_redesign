/**
 * How Much engine — pre-generation and scoring logic.
 * Ported from original MLB Matchups vanilla JS (~lines 2169-2210, 4132-4174).
 */

/**
 * Pre-generate a How Much round: pick a category and two players.
 *
 * @param {function(): number} rng - PRNG function returning [0,1)
 * @param {Set} usedIDs - Set of player IDs already used (mutated)
 * @param {Object} catHist - Map of catKey → usage count (mutated)
 * @param {Map} players - Map of playerId → player object
 * @param {string} playerPool - 'all' | 'batters' | 'pitchers'
 * @param {string} eligibility - 'standard' | 'allStar' | 'hof' | 'custom'
 * @param {string} eraMode - 'allEras' | 'modern' | 'select'
 * @param {number|null} selectedDecade - e.g. 1990
 * @param {Array} customFilters - custom filter array
 * @param {string} gameMode - current game mode
 * @param {{ bat: boolean, pit: boolean }} warLoaded - whether WAR data loaded
 * @param {Object} BASE_CATS - category definitions
 * @param {Object} CUSTOM_STAT_OPTIONS - custom stat option defs
 * @param {function(Object): boolean} passesGlobal - eligibility check
 * @param {function(Object): boolean} rolePass - pool role check
 * @param {function(Object): boolean} eraPass - era filter check
 * @returns {{ pA: string, pB: string, cat: string }|null}
 */
export function pregenHowMuch(
  rng, usedIDs, catHist, players, playerPool, eligibility,
  eraMode, selectedDecade, customFilters, gameMode, warLoaded,
  BASE_CATS, CUSTOM_STAT_OPTIONS, passesGlobal, rolePass, eraPass
) {
  var allPool = [
    'careerHR','careerBA','careerOPS','careerERA','careerW','careerSB',
    'seasonHighHR','careerXBHRate','peakSeasonOPS','careerKBB','careerIP',
    'seasonHighK','bestSeasonERA','seasonHighKBat','seasonHighSB',
    'careerH','careerBB','careerWHIP'
  ];
  if (warLoaded.bat) allPool.push('careerWARBat');
  if (warLoaded.pit) allPool.push('careerWARPit');

  var poolCats;
  if (playerPool === 'all') poolCats = allPool;
  else if (playerPool === 'batters') poolCats = allPool.filter(function(k) { return BASE_CATS[k].type === 'hitter'; });
  else poolCats = allPool.filter(function(k) { return BASE_CATS[k].type === 'pitcher'; });

  if (eligibility === 'allStar') poolCats = poolCats.filter(function(k) { return !['seasonHighKBat'].includes(k); });

  var maxUsage = playerPool === 'all' ? 1 : 2;
  var validCats = poolCats.filter(function(k) { return (catHist[k] || 0) < maxUsage; });
  if (validCats.length === 0) validCats = poolCats;

  for (var attempts = 0; attempts < 500; attempts++) {
    var ck = validCats[Math.floor(rng() * validCats.length)];
    var catDef = BASE_CATS[ck];
    var pool = [];
    players.forEach(function(p) {
      if (usedIDs.has(p.id)) return;
      if (!passesGlobal(p) || !rolePass(p) || p.type !== catDef.type || !eraPass(p)) return;
      var s = p.stats;
      if (['careerBA','careerOPS','peakSeasonOPS','careerXBHRate'].includes(ck) && s.PA <= 0) return;
      if (['careerERA','careerIP'].includes(ck) && s.IP <= 0) return;
      if (['peakSeasonOPS','bestSeasonERA'].includes(ck) && (!s[ck] || s[ck] <= 0)) return;
      pool.push(p);
    });
    if (pool.length < 2) continue;
    for (var j = 0; j < 50; j++) {
      var a = pool[Math.floor(rng() * pool.length)];
      var b = pool[Math.floor(rng() * pool.length)];
      if (a === b) continue;
      var d = Math.abs(a.stats[ck] - b.stats[ck]);
      if (d >= catDef.dMin && d <= catDef.dMin * 5) {
        usedIDs.add(a.id); usedIDs.add(b.id);
        catHist[ck] = (catHist[ck] || 0) + 1;
        return { pA: a.id, pB: b.id, cat: ck };
      }
    }
  }
  return null;
}

/**
 * Calculate the score for a How Much submission.
 *
 * @param {boolean} userPickedCorrect - whether the user picked the correct player
 * @param {number} sliderMin - lower bound of the user's slider range
 * @param {number} sliderMax - upper bound of the user's slider range
 * @param {number} trueDiff - the actual difference between the two players
 * @param {number} rangeMax - the maximum value of the scoring range (dMin * 5)
 * @param {number} bullseyeSize - width of the bullseye zone (from BASE_BULL)
 * @param {boolean} deadZoneEnabled - whether dead-zone scoring is enabled
 * @param {number} minLimit - the minimum limit (dMin) of the category
 * @returns {{ points: number, playerCorrect: boolean, rangeCorrect: boolean, bullseye: boolean }}
 */
export function calculateHowMuchScore(
  userPickedCorrect, sliderMin, sliderMax, trueDiff,
  rangeMax, bullseyeSize, deadZoneEnabled, minLimit
) {
  var rangeCorrect = (trueDiff >= sliderMin && trueDiff <= sliderMax);
  var pts = 0;
  var bullseye = false;

  if (userPickedCorrect) {
    pts += 200;
    if (rangeCorrect) {
      var scoringSpan = rangeMax - minLimit;
      var rangeWidth = sliderMax - sliderMin;
      var safeSpan = scoringSpan > 0 ? scoringSpan : 1;
      var norm = Math.max(0, Math.min(1, (safeSpan - rangeWidth) / safeSpan));
      pts += Math.round(800 * Math.pow(norm, 2));

      var bw = bullseyeSize || 0;
      var mid = (sliderMin + sliderMax) / 2;
      var eps = 1e-5;
      if (trueDiff >= mid - bw / 2 - eps && trueDiff <= mid + bw / 2 + eps) {
        pts += 100;
        bullseye = true;
      }
    }
  }

  var total = Math.min(1000, Math.max(0, pts));

  return {
    points: total,
    playerCorrect: userPickedCorrect,
    rangeCorrect: rangeCorrect,
    bullseye: bullseye
  };
}
