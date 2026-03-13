import { chance } from '../utils/random';

export class Galaxy {
  x: number;
  y: number;
  z: number;
  hasCivilization: boolean;
  civilizationLevel: number;
  evolveSpeed: number;
  evolveProbability: number;

  constructor(
    x: number,
    y: number,
    z: number,
    hasCivilization: boolean,
    evolveSpeed: number,
    evolveProbability: number,
  ) {
    this.x = x;
    this.y = y;
    this.z = z;
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

  /** 3D distance to another galaxy in light years */
  distanceTo(other: Galaxy): number {
    return Math.sqrt(
      (this.x - other.x) ** 2 +
      (this.y - other.y) ** 2 +
      (this.z - other.z) ** 2,
    );
  }
}
