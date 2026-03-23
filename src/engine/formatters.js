// =======================================
// Stat Formatting Utilities
// =======================================

/**
 * Format a stat value for display.
 * @param {number} value - The raw stat value
 * @param {string} key - The stat key (e.g. 'careerBA', 'careerERA')
 * @param {boolean} [useWholeNumbers=false] - Whether to display rate stats as whole numbers (e.g. BA .300 -> 300)
 * @returns {string} Formatted stat string
 */
export function formatStat(value, key, useWholeNumbers) {
    if (key === 'careerXBHRate') return (value * 100).toFixed(1) + '%';
    if (key === 'careerWHIP') return value.toFixed(3);
    if (['careerBA','careerOPS','peakSeasonOPS'].includes(key)) return useWholeNumbers ? Math.round(value * 1000) : value.toFixed(3);
    if (['careerERA','bestSeasonERA','careerKBB'].includes(key)) return value.toFixed(2);
    if (['careerWARBat','careerWARPit'].includes(key)) return value.toFixed(1);
    return Math.round(value).toLocaleString();
}

/**
 * Create a Baseball Reference link for a player.
 * Returns an HTML anchor string if the player has a bbrefID, otherwise just the name.
 * @param {object} player - Player object with `name` and `bbrefID` properties
 * @returns {string} HTML string
 */
export function makeLink(player) {
    if (!player.bbrefID) return player.name;
    return '<a href="https://www.baseball-reference.com/players/' + player.bbrefID[0] + '/' + player.bbrefID + '.shtml" target="_blank" class="text-inherit no-underline cursor-pointer relative z-20 hover:opacity-75 transition-opacity">' + player.name + '</a>';
}
