import { GameConfig } from '../config';
import { Galaxy } from './Galaxy';
import { chance } from '../utils/random';

export class Universe {
  galaxies: Galaxy[] = [];
  radius: number = 0;
  age: number = 0;        // in years
  round: number = 0;
  sliceYears: number = 0;
  totalSlices: number = 0;
  finished: boolean = false;

  init(config: GameConfig): void {
    this.radius = config.universe.radius;
    this.sliceYears = config.time.sliceYears;
    this.totalSlices = config.time.totalSlices;
    this.age = 0;
    this.round = 0;
    this.finished = false;
    this.galaxies = [];

    const { galaxyCount, civProbability } = config.universe;
    const { evolveSpeed } = config.galaxy;

    for (let i = 0; i < galaxyCount; i++) {
      // Uniform distribution inside a sphere
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = Math.cbrt(Math.random()) * this.radius; // cbrt for uniform 3D distribution

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.sin(phi) * Math.sin(theta);
      const z = r * Math.cos(phi);

      const hasCiv = chance(civProbability);
      // Each civilization gets a random evolve probability between 0.01 and 0.5
      const civEvolveProb = hasCiv ? 0.01 + Math.random() * 0.49 : 0;
      this.galaxies.push(new Galaxy(x, y, z, hasCiv, evolveSpeed, civEvolveProb));
    }
  }

  /** Advance one time slice */
  tick(): void {
    if (this.finished) return;

    for (const galaxy of this.galaxies) {
      galaxy.evolve();
    }

    this.round++;
    this.age += this.sliceYears;

    if (this.round >= this.totalSlices) {
      this.finished = true;
    }
  }
}
