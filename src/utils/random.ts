/** Returns a random number in [min, max) */
export function randomRange(min: number, max: number): number {
  return min + Math.random() * (max - min);
}

/** Returns true with the given probability (0-1) */
export function chance(probability: number): boolean {
  return Math.random() < probability;
}
