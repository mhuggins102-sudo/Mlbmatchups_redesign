// =======================================
// Scoring Logic
// =======================================

/**
 * Score thresholds for medal tiers: Bronze (2000), Silver (3000), Gold (4000), Platinum (5000).
 */
export const SCORE_THRESHOLDS = [2000, 3000, 4000, 5000];

/**
 * Showdown score lookup by correct count (index 0-10).
 */
const SHOWDOWN_SCORES = [0, 0, 0, 0, 0, 0, 100, 250, 450, 700, 1000];

/**
 * Score a How Much round.
 * @param {boolean} correctPlayer - Whether the player pick was correct
 * @param {boolean} rangeContains - Whether the true difference is within the guessed range
 * @param {boolean} bullseyeHit - Whether the bullseye was hit
 * @param {number} rangeWidth - Width of the guessed range (high - low)
 * @param {number} rangeMax - Maximum possible range width (dMin * 5 - dMin = dMin * 4, i.e. scoringSpan)
 * @returns {number} Points for this round (0-1000)
 */
export function scoreHowMuch(correctPlayer, rangeContains, bullseyeHit, rangeWidth, rangeMax) {
    var pts = 0;
    if (correctPlayer) {
        pts += 200;
        if (rangeContains) {
            var safeSpan = rangeMax > 0 ? rangeMax : 1;
            var norm = Math.max(0, Math.min(1, (safeSpan - rangeWidth) / safeSpan));
            pts += Math.round(800 * Math.pow(norm, 2));
            if (bullseyeHit) {
                pts += 100;
            }
        }
    }
    return Math.min(1000, Math.max(0, pts));
}

/**
 * Score a Showdown round based on number of correct picks.
 * @param {number} correctCount - Number of correct picks (0-10)
 * @returns {number} Points for this round
 */
export function scoreShowdown(correctCount) {
    return SHOWDOWN_SCORES[correctCount] || 0;
}

/**
 * Get the result emoji for a Showdown round.
 * @param {number} correctCount - Number of correct picks (0-10)
 * @returns {string} Emoji character
 */
export function getShowdownEmoji(correctCount) {
    if (correctCount === 10) return '\uD83D\uDC8E'; // diamond
    if (correctCount === 9)  return '\uD83D\uDFE9'; // green square
    if (correctCount === 8)  return '\uD83D\uDFE7'; // orange square
    if (correctCount >= 6)   return '\uD83D\uDFE8'; // yellow square
    return '\uD83D\uDFE5'; // red square
}

/**
 * Get the result emoji for a How Much round.
 * @param {number} points - Points scored this round
 * @param {boolean} playerCorrect - Whether the player pick was correct
 * @param {boolean} rangeCorrect - Whether the range was correct
 * @param {boolean} bullseyeHit - Whether the bullseye was hit
 * @returns {string} Emoji character
 */
export function getHowMuchEmoji(points, playerCorrect, rangeCorrect, bullseyeHit) {
    if (bullseyeHit) return '\uD83C\uDFAF'; // bullseye
    if (playerCorrect && rangeCorrect) return '\uD83D\uDFE9'; // green square
    if (playerCorrect) return '\uD83D\uDFE7'; // orange square
    return '\uD83D\uDFE5'; // red square
}

/**
 * Get the result emoji for a Pick 'Em round.
 * @param {number} totalRoundPts - Total points scored in the round
 * @param {number} picksMade - Number of picks made
 * @returns {string} Emoji or pick count string
 */
export function getPickEmEmoji(totalRoundPts, picksMade) {
    if (totalRoundPts >= 1000) return '\uD83D\uDC8E'; // diamond
    return picksMade;
}

/**
 * Get the result string for a Top 10 round.
 * @param {number} hitCount - Number of correct guesses
 * @returns {string} Result string like "7/10"
 */
export function getTop10Emoji(hitCount) {
    return hitCount + '/10';
}
