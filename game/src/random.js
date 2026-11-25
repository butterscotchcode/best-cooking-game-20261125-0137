// Seeded random numbers (mulberry32) so a screenshot scene staged from a
// seed always stages the same way, and a playthrough can be replayed.
export function makeRng(seed) {
  let state = seed >>> 0;
  return function nextRandom() {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

/** Pick one entry of `list` with the seeded rng. */
export function pickFrom(rng, list) {
  return list[Math.floor(rng() * list.length)];
}
