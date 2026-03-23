/**
 * Daily Challenge helpers.
 * Ported from original MLB Matchups vanilla JS (~lines 2073-2159).
 */

/**
 * Seeded PRNG (mulberry32).
 * @param {number} a - The seed value.
 * @returns {function(): number} A function that returns pseudo-random numbers in [0, 1).
 */
export function mulberry32(a) {
  return function () {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    var t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Simple string hash function.
 * @param {string} str - The string to hash.
 * @returns {number} A non-negative integer hash.
 */
export function hashStr(str) {
  var hash = 0;
  for (var i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Get daily challenge ID string (e.g. "D260323").
 * @param {number} [offset=0] - Day offset from today.
 * @returns {string} The daily challenge ID.
 */
export function getDailyId(offset) {
  var d = new Date();
  if (offset) d.setDate(d.getDate() + offset);
  return (
    'D' +
    String(d.getFullYear()).slice(-2) +
    String(d.getMonth() + 1).padStart(2, '0') +
    String(d.getDate()).padStart(2, '0')
  );
}

/**
 * Get daily date string (e.g. "2026-03-23").
 * @param {number} [offset=0] - Day offset from today.
 * @returns {string} The date string in YYYY-MM-DD format.
 */
export function getDailyDateStr(offset) {
  var d = new Date();
  if (offset) d.setDate(d.getDate() + offset);
  return (
    d.getFullYear() +
    '-' +
    String(d.getMonth() + 1).padStart(2, '0') +
    '-' +
    String(d.getDate()).padStart(2, '0')
  );
}

/**
 * Generate deterministic daily settings from a seeded PRNG.
 * @param {function(): number} rng - A seeded PRNG function.
 * @returns {{ mode: string, pool: string, elig: string, era: string, decade: number|null }}
 */
export function generateDailySettings(rng) {
  var modes = ['howMuch', 'sideBySide', 'pickEm', 'top10'];
  var mode = modes[Math.floor(rng() * modes.length)];

  // Pool: All 50%, Batters 25%, Pitchers 25%
  var poolR = rng();
  var pool = poolR < 0.5 ? 'all' : poolR < 0.75 ? 'batters' : 'pitchers';

  // Era: explicit percentages (total = 100)
  var eraOptions = [
    { era: 'modern', decade: null, weight: 30 },
    { era: 'allEras', decade: null, weight: 10 },
    { era: 'select', decade: 2020, weight: 5 },
    { era: 'select', decade: 2010, weight: 10 },
    { era: 'select', decade: 2000, weight: 10 },
    { era: 'select', decade: 1990, weight: 10 },
    { era: 'select', decade: 1980, weight: 10 },
    { era: 'select', decade: 1970, weight: 5 },
    { era: 'select', decade: 1960, weight: 3 },
    { era: 'select', decade: 1950, weight: 3 },
    { era: 'select', decade: 1940, weight: 2 },
    { era: 'select', decade: 1930, weight: 2 },
  ];
  var totalW = eraOptions.reduce(function (s, o) {
    return s + o.weight;
  }, 0);
  var eraR = rng() * totalW,
    cum = 0,
    selEra = eraOptions[0];
  for (var i = 0; i < eraOptions.length; i++) {
    cum += eraOptions[i].weight;
    if (eraR < cum) {
      selEra = eraOptions[i];
      break;
    }
  }

  // Eligibility based on era
  var eligR = rng(),
    elig;
  if (
    selEra.era === 'modern' ||
    (selEra.era === 'select' && selEra.decade >= 1990)
  ) {
    // Modern or 1990s-2020s: equal 1/3 each
    elig =
      eligR < 1 / 3 ? 'standard' : eligR < 2 / 3 ? 'allStar' : 'hof';
  } else if (selEra.era === 'select' && selEra.decade >= 1970) {
    // 1970s-1980s: All Star or HoF 50/50
    elig = eligR < 0.5 ? 'allStar' : 'hof';
  } else {
    // 1960s or before, or All Eras: always HoF
    elig = 'hof';
  }

  return {
    mode: mode,
    pool: pool,
    elig: elig,
    era: selEra.era,
    decade: selEra.decade,
  };
}

/**
 * Format daily settings for display.
 * @param {{ mode: string, pool: string, elig: string, era: string, decade: number|null }} settings
 * @returns {string} Human-readable label.
 */
export function getDailySettingsLabel(settings) {
  var modeText = {
    howMuch: 'How Much?',
    sideBySide: 'Showdown',
    pickEm: "Pick 'Em",
    top10: 'Top 10',
  };
  var eligText = {
    standard: 'Veteran',
    allStar: 'All Star',
    hof: 'Hall of Fame',
  };
  var poolText = {
    all: 'All Players',
    batters: 'Batters',
    pitchers: 'Pitchers',
  };
  var eraText =
    settings.era === 'allEras'
      ? 'All Eras'
      : settings.era === 'modern'
        ? 'Modern Era'
        : settings.decade + 's';
  if (settings.mode === 'top10') {
    return (
      modeText[settings.mode] +
      ' \u2022 ' +
      poolText[settings.pool] +
      ' \u2022 ' +
      eraText
    );
  }
  return (
    modeText[settings.mode] +
    ' \u2022 ' +
    eligText[settings.elig] +
    ' \u2022 ' +
    poolText[settings.pool] +
    ' \u2022 ' +
    eraText
  );
}
