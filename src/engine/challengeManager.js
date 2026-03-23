/**
 * Challenge Manager — create, save, load, and score challenges.
 * Ported from original MLB Matchups vanilla JS (~lines 1937-2070, 6084-6166).
 */

/**
 * Generate a 5-character challenge code.
 * Uses characters that avoid ambiguity (no O, 0, 1, I).
 *
 * @returns {string} 5-char uppercase alphanumeric code
 */
export function generateId() {
  var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  var out = '';
  for (var i = 0; i < 5; i++) {
    out += chars[Math.floor(Math.random() * chars.length)];
  }
  return out;
}

/**
 * Save a challenge to Supabase.
 *
 * @param {Object} supabase - Supabase client instance
 * @param {string} gameMode
 * @param {string} playerPool
 * @param {string} eligibility
 * @param {Array} customFilters
 * @param {string} eraMode
 * @param {number|null} selectedDecade
 * @param {number} score
 * @param {Array} roundScores
 * @param {Array} matchHistory
 * @param {string} opName - challenger name
 * @returns {Promise<string|null>} the challenge ID, or null on failure
 */
export async function saveChallenge(
  supabase, gameMode, playerPool, eligibility, customFilters,
  eraMode, selectedDecade, score, roundScores, matchHistory, opName
) {
  if (!supabase) return null;
  var id = generateId();
  var res = await supabase.from('challenges').insert([{
    id: id,
    config: {
      mode: gameMode, pool: playerPool, elig: eligibility, customFilters: customFilters,
      era: eraMode, decade: selectedDecade,
      score: score, roundScores: roundScores,
      challengerName: opName || 'Anonymous'
    },
    matchups: matchHistory
  }]);
  if (res.error) { console.error('Save failed:', res.error); return null; }
  // Also save the OP's score to the challenge leaderboard
  try {
    await supabase.from('challenge_scores').insert([{
      challenge_id: id, name: opName || 'Anonymous', score: score
    }]);
  } catch (e) { console.error('Auto-save OP score failed:', e); }
  return id;
}

/**
 * Load a challenge by code from Supabase.
 *
 * @param {Object} supabase - Supabase client instance
 * @param {string} code - the 5-char challenge code
 * @returns {Promise<Object|null>} challenge data { id, config, matchups } or null
 */
export async function loadChallenge(supabase, code) {
  if (!supabase) return null;
  try {
    var timeout = new Promise(function(_, rej) {
      setTimeout(function() { rej(new Error('timeout')); }, 6000);
    });
    var query = supabase.from('challenges').select('*').eq('id', code).single();
    var result = await Promise.race([query, timeout]);
    if (result.error || !result.data) return null;
    return result.data;
  } catch (e) {
    console.error('Challenge load failed:', e);
    return null;
  }
}

/**
 * Save a score to the challenge leaderboard.
 *
 * @param {Object} supabase - Supabase client instance
 * @param {string} challengeId
 * @param {string} name - player name
 * @param {number} score
 * @returns {Promise<boolean>} true if saved successfully
 */
export async function saveChallengeScore(supabase, challengeId, name, score) {
  if (!supabase || !challengeId) return false;
  try {
    var res = await supabase.from('challenge_scores').insert([{
      challenge_id: challengeId, name: name, score: score
    }]);
    if (res.error) throw res.error;
    return true;
  } catch (e) {
    console.error('saveChallengeScore failed:', e);
    return false;
  }
}

/**
 * Load challenge leaderboard scores.
 *
 * @param {Object} supabase - Supabase client instance
 * @param {string} challengeId
 * @returns {Promise<Array>} array of { challenge_id, name, score } sorted desc
 */
export async function loadChallengeLeaderboard(supabase, challengeId) {
  if (!supabase) return [];
  try {
    var result = await supabase.from('challenge_scores').select('*')
      .eq('challenge_id', challengeId)
      .order('score', { ascending: false }).limit(10);
    if (result.error) throw result.error;
    return result.data || [];
  } catch (e) {
    console.error('Fetch challenge scores error:', e);
    return [];
  }
}
