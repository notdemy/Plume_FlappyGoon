/**
 * Seeded random number generator
 * Uses Mulberry32 algorithm for deterministic random numbers
 */

/**
 * Create a seeded random number generator function
 * @param {string} seed - Seed string
 * @returns {Function} Seeded random function
 */
export function createSeededRandom(seed) {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  
  let state = hash >>> 0; // Ensure unsigned 32-bit
  
  // Mulberry32 PRNG
  return function() {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ (state >>> 15), state | 1);
    t = t ^ (t + Math.imul(t ^ (t >>> 7), state | 61));
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Generate a random number between min and max (inclusive) using seed
 * @param {string} seed - Seed string
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {boolean} floating - Whether to return floating point number
 * @returns {number} Random number
 */
export function seededRandom(seed, min = 0, max = 1, floating = false) {
  const rng = createSeededRandom(seed);
  const random = rng();
  
  if (floating) {
    return min + random * (max - min);
  }
  return Math.floor(min + random * (max - min + 1));
}

/**
 * Create a seeded random generator instance that maintains state
 * Useful when you need to generate multiple random numbers in sequence
 * @param {string} seed - Seed string
 * @returns {Object} Seeded random generator with next() method
 */
export function createSeededRNG(seed) {
  const rng = createSeededRandom(seed);
  
  return {
    /**
     * Generate next random number between min and max
     * @param {number} min - Minimum value
     * @param {number} max - Maximum value
     * @param {boolean} floating - Whether to return floating point number
     * @returns {number} Random number
     */
    next(min = 0, max = 1, floating = false) {
      const random = rng();
      if (floating) {
        return min + random * (max - min);
      }
      return Math.floor(min + random * (max - min + 1));
    },
    
    /**
     * Generate next random number between 0 and 1
     * @returns {number} Random number between 0 and 1
     */
    random() {
      return rng();
    }
  };
}

