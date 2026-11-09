// Small seeded PRNG so brush textures replay identically from a stored seed.
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export const newSeed = () => Math.floor(Math.random() * 2 ** 31);
/** Artwork, layer and op ids. Artwork ids must be crypto.randomUUID() (server validates the format). */
export const uid = () => crypto.randomUUID();
/** Short ids for ops inside a project (keeps JSON small). */
let opCounter = 0;
export const shortId = () => `${Date.now().toString(36)}${(opCounter++ % 1296).toString(36).padStart(2, '0')}${Math.floor(Math.random() * 1296).toString(36)}`;
