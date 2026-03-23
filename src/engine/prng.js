// =======================================
// Seeded PRNG Utilities
// =======================================

/**
 * Mulberry32 seeded PRNG.
 * Returns a function that produces a new pseudo-random number [0, 1) on each call.
 * @param {number} seed
 * @returns {() => number}
 */
export function mulberry32(seed) {
    var a = seed;
    return function() {
        a |= 0; a = a + 0x6D2B79F5 | 0;
        var t = Math.imul(a ^ a >>> 15, 1 | a);
        t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
        return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
}

/**
 * Simple string hash (DJB2-style).
 * Returns a non-negative integer hash of the input string.
 * @param {string} str
 * @returns {number}
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
 * Fisher-Yates in-place shuffle using a provided RNG function.
 * @param {Array} arr - Array to shuffle in place
 * @param {() => number} rng - PRNG function returning [0, 1)
 */
export function seededShuffle(arr, rng) {
    for (var i = arr.length - 1; i > 0; i--) {
        var j = Math.floor(rng() * (i + 1));
        var tmp = arr[i]; arr[i] = arr[j]; arr[j] = tmp;
    }
}
