import { GameConfig } from '../config';
import { Galaxy } from './Galaxy';
import { randomRange, chance } from '../utils/random';

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
    const { evolveSpeed, evolveProbability } = config.galaxy;

    for (let i = 0; i < galaxyCount; i++) {
      // Distribute galaxies in a circular universe
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.sqrt(Math.random()) * this.radius; // sqrt for uniform distribution
      const x = Math.cos(angle) * dist;
      const y = Math.sin(angle) * dist;
      const hasCiv = chance(civProbability);

      this.galaxies.push(new Galaxy(x, y, hasCiv, evolveSpeed, evolveProbability));
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
