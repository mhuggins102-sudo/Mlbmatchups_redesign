/**
 * Top 10 engine — question generation, stat computation, search, and evaluation.
 * Ported from original MLB Matchups vanilla JS (~lines 4924-5220, 4958-5015, 5254-5309).
 */

/**
 * Parse a player name into first/last components.
 * Skips single-letter initials like "R." or "J." when finding the last name.
 *
 * @param {string} name
 * @returns {{ first: string, last: string }}
 */
export function parsePlayerName(name) {
  var parts = name.split(' ').filter(function(p) { return p.length > 0; });
  var first = parts[0] || '';
  var lastParts = [];
  for (var i = parts.length - 1; i >= 1; i--) {
    if (/^[A-Za-z]\.$/.test(parts[i])) break;
    lastParts.unshift(parts[i]);
  }
  var last = lastParts.join(' ') || (parts.length > 1 ? parts[parts.length - 1] : '');
  return { first: first, last: last };
}

/**
 * Generate a random Top 10 question.
 *
 * @param {function(): number} rng
 * @param {string} playerPool - 'all' | 'batters' | 'pitchers'
 * @param {string} eraMode
 * @param {number|null} selectedDecade
 * @param {Array} TOP10_CATS_BAT_DECADE
 * @param {Array} TOP10_CATS_PIT_DECADE
 * @param {Array} TOP10_CATS_BAT_CAREER
 * @param {Array} TOP10_CATS_PIT_CAREER
 * @returns {{ qType: string, pType: string, decade: number|null, cat: Object, letter: string|null, letterType: string|null }}
 */
export function generateTop10Question(
  rng, playerPool, eraMode, selectedDecade,
  TOP10_CATS_BAT_DECADE, TOP10_CATS_PIT_DECADE,
  TOP10_CATS_BAT_CAREER, TOP10_CATS_PIT_CAREER
) {
  rng = rng || Math.random;
  var qTypeRoll = rng();
  var qType;
  if (qTypeRoll < 0.50) qType = 'decade';
  else if (qTypeRoll < 0.75) qType = 'letter';
  else qType = 'combined';

  var pType;
  if (playerPool === 'batters') pType = 'hitter';
  else if (playerPool === 'pitchers') pType = 'pitcher';
  else pType = rng() < 0.55 ? 'hitter' : 'pitcher';

  var usesDecade = (qType === 'decade' || qType === 'combined');
  var usesLetter = (qType === 'letter' || qType === 'combined');

  var decade = null;
  if (usesDecade) {
    if (eraMode === 'select' && selectedDecade) {
      decade = selectedDecade;
    } else {
      var decades = [1930,1940,1950,1960,1970,1980,1990,2000,2010,2020];
      if (eraMode === 'modern') decades = [1970,1980,1990,2000,2010,2020];
      decade = decades[Math.floor(rng() * decades.length)];
    }
  }

  var catPool;
  if (usesDecade) {
    catPool = pType === 'hitter' ? TOP10_CATS_BAT_DECADE : TOP10_CATS_PIT_DECADE;
  } else {
    catPool = pType === 'hitter' ? TOP10_CATS_BAT_CAREER : TOP10_CATS_PIT_CAREER;
  }
  var cat = catPool[Math.floor(rng() * catPool.length)];

  var letter = null, letterType = null;
  if (usesLetter) {
    letterType = rng() < 0.5 ? 'first' : 'last';
    var alphabet = 'ABCDEFGHIJKLMNOPRSTW'.split('');
    letter = alphabet[Math.floor(rng() * alphabet.length)];
  }

  return {
    qType: qType, pType: pType, decade: decade,
    cat: cat, letter: letter, letterType: letterType
  };
}

/**
 * Compute decade-aggregated stats for all players in a given decade.
 *
 * @param {number} decade - e.g. 1990
 * @param {string} type - unused (kept for signature compat), aggregates both bat & pitch
 * @param {Map} batSeasons - Map of playerId → array of batting season rows
 * @param {Map} pitSeasons - Map of playerId → array of pitching season rows
 * @param {Map} players - Map of playerId → player object
 * @param {Map} decadeStatsCache - cache of decade → Map (mutated)
 * @returns {Map} playerID → aggregate stat object
 */
export function computeDecadeStats(decade, type, batSeasons, pitSeasons, players, decadeStatsCache) {
  if (decadeStatsCache && decadeStatsCache.has(decade)) return decadeStatsCache.get(decade);

  var startYear = decade, endYear = decade + 9;
  var result = new Map();

  // Batting
  if (batSeasons) {
    batSeasons.forEach(function(seasons, pid) {
      var agg = { AB:0, H:0, BB:0, HBP:0, SF:0, HR:0, _2B:0, _3B:0, SB:0, RBI:0 };
      var hasData = false;
      seasons.forEach(function(s) {
        if (s.yearID >= startYear && s.yearID <= endYear) {
          hasData = true;
          agg.AB  += s.AB  || 0; agg.H   += s.H   || 0; agg.BB  += s.BB  || 0;
          agg.HBP += s.HBP || 0; agg.SF  += s.SF  || 0; agg.HR  += s.HR  || 0;
          agg._2B += s['2B'] || 0; agg._3B += s['3B'] || 0; agg.SB += s.SB || 0;
          agg.RBI += s.RBI || 0;
        }
      });
      if (!hasData) return;
      var PA = agg.AB + agg.BB + agg.HBP + agg.SF;
      var BA = agg.AB > 0 ? agg.H / agg.AB : 0;
      var OBP = PA > 0 ? (agg.H + agg.BB + agg.HBP) / PA : 0;
      var SLG = agg.AB > 0 ? ((agg.H - agg._2B - agg._3B - agg.HR) + 2*agg._2B + 3*agg._3B + 4*agg.HR) / agg.AB : 0;
      var XBHRate = agg.H > 0 ? (agg._2B + agg._3B + agg.HR) / agg.H : 0;
      if (!result.has(pid)) result.set(pid, {});
      var r = result.get(pid);
      r.HR = agg.HR; r.H = agg.H; r.RBI = agg.RBI; r.SB = agg.SB; r.BB = agg.BB;
      r.BA = BA; r.OPS = OBP + SLG; r.XBHRate = XBHRate; r.PA = PA; r.AB = agg.AB;
    });
  }

  // Pitching
  if (pitSeasons) {
    pitSeasons.forEach(function(seasons, pid) {
      var agg = { W:0, SO:0, ER:0, IPouts:0, HR:0, BB:0, H:0 };
      var hasData = false;
      seasons.forEach(function(s) {
        if (s.yearID >= startYear && s.yearID <= endYear) {
          hasData = true;
          agg.W  += s.W  || 0; agg.SO += s.SO || 0; agg.ER += s.ER || 0;
          agg.IPouts += s.IPouts || 0; agg.HR += s.HR || 0;
          agg.BB += s.BB || 0; agg.H += s.H || 0;
        }
      });
      if (!hasData) return;
      var IP = agg.IPouts / 3;
      var ERA = IP > 0 ? (agg.ER * 9) / IP : 99;
      if (!result.has(pid)) result.set(pid, {});
      var r = result.get(pid);
      r.W = agg.W; r.SO = agg.SO; r.IP = IP; r.ERA = ERA;
      r.pitIPouts = agg.IPouts; r.pitER = agg.ER;
    });
  }

  if (decadeStatsCache) decadeStatsCache.set(decade, result);
  return result;
}

/**
 * Compute the top-10 answer for a given question.
 *
 * @param {Object} q - question object from generateTop10Question
 * @param {Map} players - player map
 * @param {function(Object): boolean} eraPass - era filter
 * @param {Map} batSeasons
 * @param {Map} pitSeasons
 * @param {Map} decadeStatsCache
 * @returns {{ top10: Array<{id,name,value,rank}>, allRanked: Array<{id,name,value}> }}
 */
export function computeTop10Answer(q, players, eraPass, batSeasons, pitSeasons, decadeStatsCache) {
  var isDecade = (q.qType === 'decade' || q.qType === 'combined');
  var decadeStats = isDecade ? computeDecadeStats(q.decade, null, batSeasons, pitSeasons, players, decadeStatsCache) : null;

  var candidates = [];
  players.forEach(function(p) {
    if (!p.stats) return;
    if (p.type !== q.pType) return;
    if (isDecade && !eraPass(p)) return;

    // Letter filter
    if (q.letter) {
      var parsed = parsePlayerName(p.name);
      var first = parsed.first.toUpperCase();
      var last = parsed.last.toUpperCase();
      if (q.letterType === 'first' && !first.startsWith(q.letter)) return;
      if (q.letterType === 'last' && !last.startsWith(q.letter)) return;
    }

    var value;
    if (isDecade) {
      var ds = decadeStats.get(p.id);
      if (!ds) return;
      var field = q.cat.field;
      value = ds[field];
      if (value === undefined || value === null) return;
      if (q.cat.isRate) {
        if (q.pType === 'hitter' && ds.PA < (q.cat.minPA || 0)) return;
        if (q.pType === 'pitcher' && q.cat.minIP && ds.IP < q.cat.minIP) return;
      }
      if (!q.cat.isRate && value === 0) return;
    } else {
      value = p.stats[q.cat.statKey];
      if (value === undefined || value === null) return;
      if (!q.cat.isRate && value === 0) return;
      if (q.cat.isRate && q.pType === 'hitter' && p.stats.PA < 3000) return;
      if (q.cat.isRate && q.pType === 'pitcher' && p.stats.IP < 1000) return;
    }

    candidates.push({ id: p.id, name: p.name, value: value });
  });

  candidates.sort(function(a, b) {
    return q.cat.lowerBetter ? (a.value - b.value) : (b.value - a.value);
  });

  var top10 = candidates.slice(0, 10).map(function(c, i) {
    return { id: c.id, name: c.name, value: c.value, rank: i + 1 };
  });

  return { top10: top10, allRanked: candidates };
}

/**
 * Pre-generate a Top 10 question with a valid answer (at least 10 results).
 *
 * @param {function(): number} rng
 * @param {Map} players
 * @param {string} playerPool
 * @param {string} eraMode
 * @param {number|null} selectedDecade
 * @param {Map} batSeasons
 * @param {Map} pitSeasons
 * @param {Map} warBatMap
 * @param {Map} warPitMap
 * @param {Map} decadeStatsCache
 * @param {function(Object): boolean} eraPass
 * @param {Array} TOP10_CATS_BAT_DECADE
 * @param {Array} TOP10_CATS_PIT_DECADE
 * @param {Array} TOP10_CATS_BAT_CAREER
 * @param {Array} TOP10_CATS_PIT_CAREER
 * @returns {{ question: Object, answer: Array<{id,name,value,rank}>, allRanked: Array }|null}
 */
export function pregenTop10(
  rng, players, playerPool, eraMode, selectedDecade,
  batSeasons, pitSeasons, warBatMap, warPitMap, decadeStatsCache,
  eraPass,
  TOP10_CATS_BAT_DECADE, TOP10_CATS_PIT_DECADE,
  TOP10_CATS_BAT_CAREER, TOP10_CATS_PIT_CAREER
) {
  for (var attempts = 0; attempts < 100; attempts++) {
    var q = generateTop10Question(
      rng, playerPool, eraMode, selectedDecade,
      TOP10_CATS_BAT_DECADE, TOP10_CATS_PIT_DECADE,
      TOP10_CATS_BAT_CAREER, TOP10_CATS_PIT_CAREER
    );
    var result = computeTop10Answer(q, players, eraPass, batSeasons, pitSeasons, decadeStatsCache);
    if (result.top10.length >= 10) {
      return {
        question: {
          qType: q.qType, pType: q.pType, decade: q.decade,
          cat: q.cat, letter: q.letter, letterType: q.letterType,
          lowerBetter: q.cat.lowerBetter || false
        },
        answer: result.top10,
        allRanked: result.allRanked
      };
    }
  }
  return null;
}

/**
 * Filter players for autocomplete in Top 10 mode.
 *
 * @param {string} query - search query
 * @param {Array} playerNameIndex - array of {id, name, nameFirst, nameLast, minYear, maxYear, type}
 * @param {Object} question - the current question (qType, decade, pType, letter, letterType)
 * @param {number} minChars - minimum query length (0 to show all)
 * @param {Map} players - player map (for decade checking)
 * @param {Set} guessedPlayerIDs - already guessed
 * @param {Set|null} rankedIDs - set of player IDs in the ranked list, or null
 * @returns {Array}
 */
export function top10SearchFilter(query, playerNameIndex, question, minChars, players, guessedPlayerIDs, rankedIDs) {
  var q = (query || '').toLowerCase().trim();
  var showAll = minChars === 0;
  if (!showAll && q.length < 2) return [];

  var isDecade = question && (question.qType === 'decade' || question.qType === 'combined');
  var decade = question ? question.decade : null;
  var pType = question ? question.pType : null;
  var letter = question ? question.letter : null;
  var letterType = question ? question.letterType : null;

  var results = [];
  for (var i = 0; i < playerNameIndex.length; i++) {
    var p = playerNameIndex[i];

    if (rankedIDs && !rankedIDs.has(p.id)) continue;
    if (pType && p.type !== pType) continue;

    if (isDecade && decade) {
      var pl = players.get(p.id);
      if (!pl || !pl.decades.has(decade)) continue;
    }

    if (letter && letterType) {
      if (letterType === 'first' && !p.nameFirst.toUpperCase().startsWith(letter)) continue;
      if (letterType === 'last' && !p.nameLast.toUpperCase().startsWith(letter)) continue;
    }

    if (guessedPlayerIDs && guessedPlayerIDs.has(p.id)) continue;

    if (q.length === 0) {
      results.push(p);
    } else {
      var firstLower = p.nameFirst.toLowerCase();
      var lastLower = p.nameLast.toLowerCase();
      if (firstLower.startsWith(q) || lastLower.startsWith(q) || p.name.toLowerCase().startsWith(q)) {
        results.push(p);
      }
    }
  }
  return results;
}

/**
 * Check if a guessed player is in the top 10 answer.
 *
 * @param {string} playerId
 * @param {Array<{id: string}>} answer - the top 10 answer array
 * @returns {number} index in the answer (0-9), or -1 if not found
 */
export function evaluateTop10Guess(playerId, answer) {
  for (var i = 0; i < answer.length; i++) {
    if (answer[i].id === playerId) return i;
  }
  return -1;
}
