import { chance } from '../utils/random';

export class Galaxy {
  x: number;
  y: number;
  hasCivilization: boolean;
  civilizationLevel: number;
  evolveSpeed: number;
  evolveProbability: number;

  constructor(
    x: number,
    y: number,
    hasCivilization: boolean,
    evolveSpeed: number,
    evolveProbability: number,
  ) {
    this.x = x;
    this.y = y;
    this.hasCivilization = hasCivilization;
    this.civilizationLevel = hasCivilization ? 0 : -1;
    this.evolveSpeed = evolveSpeed;
    this.evolveProbability = evolveProbability;
  }

  /** Attempt evolution for one time slice */
  evolve(): void {
    if (!this.hasCivilization) return;
    if (this.civilizationLevel >= 10) return;

    if (chance(this.evolveProbability)) {
      this.civilizationLevel = Math.min(10, this.civilizationLevel + this.evolveSpeed);
    }
  }
}
