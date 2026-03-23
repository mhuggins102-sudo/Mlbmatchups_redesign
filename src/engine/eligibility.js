// =======================================
// Player Eligibility Filters
// =======================================

/**
 * Check if a player passes the global eligibility filter.
 * @param {object} p - Player object
 * @param {string} eligibility - 'standard' | 'allStar' | 'hof' | 'custom'
 * @param {Array} customFilters - Array of {stat, value, dir} filter objects
 * @param {string} gameMode - Current game mode (e.g. 'sideBySide')
 * @param {Array} CUSTOM_STAT_OPTIONS - Array of stat option definitions for type lookup
 * @returns {boolean}
 */
export function passesGlobal(p, eligibility, customFilters, gameMode, CUSTOM_STAT_OPTIONS) {
    if (!p.stats) return false;

    // Eligibility-based thresholds
    if (eligibility === 'allStar') {
        if (p.type === 'hitter')  return p.stats.careerWARBat >= 25;
        if (p.type === 'pitcher') return p.stats.careerWARPit >= 20;
    }
    if (eligibility === 'hof') {
        if (p.type === 'hitter')  return p.stats.careerWARBat >= 50;
        if (p.type === 'pitcher') return p.stats.careerWARPit >= 40;
    }
    if (eligibility === 'custom') {
        for (var i = 0; i < customFilters.length; i++) {
            var f = customFilters[i];
            var opt = CUSTOM_STAT_OPTIONS.find(function(o) { return o.key === f.stat; });
            // Skip filters that don't apply to this player's type
            var filterType = opt ? opt.type : 'both';
            if (filterType === 'hitter' && p.type !== 'hitter') continue;
            if (filterType === 'pitcher' && p.type !== 'pitcher') continue;
            var filterDir = f.dir;
            if (!filterDir) {
                filterDir = opt ? opt.dir : 'min';
            }
            var val;
            if (f.stat === 'teams') val = p.teams ? p.teams.size : 0;
            else if (f.stat === 'seasons') val = p.years ? p.years.size : 0;
            else if (f.stat === 'G') val = p.G;
            else if (f.stat === 'GS') val = p.GS;
            else val = p.stats[f.stat];
            if (val == null) return false;
            if (filterDir === 'min' && val < f.value) return false;
            if (filterDir === 'max' && val > f.value) return false;
        }
        return true;
    }

    // Veteran eligibility (standard)
    if (p.type === 'hitter') return p.stats.PA >= 5000;
    if (gameMode === 'sideBySide' && p.type === 'pitcher') return p.GS >= 150;
    return p.GS >= 150 || p.G >= 500;
}

/**
 * Check if a player matches the player pool filter.
 * @param {object} p - Player object
 * @param {string} playerPool - 'all' | 'batters' | 'pitchers'
 * @returns {boolean}
 */
export function rolePass(p, playerPool) {
    return playerPool === 'all' ||
           (playerPool === 'batters' && p.type === 'hitter') ||
           (playerPool === 'pitchers' && p.type === 'pitcher');
}

/**
 * Check if a player matches the era filter.
 * @param {object} p - Player object (must have a `decades` Set)
 * @param {string} eraMode - 'allEras' | 'modern' | 'select'
 * @param {number|null} selectedDecade - The decade to filter on when eraMode is 'select'
 * @returns {boolean}
 */
export function eraPass(p, eraMode, selectedDecade) {
    if (eraMode === 'allEras') return true;
    if (eraMode === 'modern') return [1970,1980,1990,2000,2010,2020].some(function(d){ return p.decades.has(d); });
    return p.decades.has(selectedDecade);
}
