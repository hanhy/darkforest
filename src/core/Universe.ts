import { GameConfig } from '../config';
import { Galaxy } from './Galaxy';
import { chance } from '../utils/random';
import { DarkForestSystem, TechExplosionEvent } from './DarkForestSystem';

export class Universe {
  galaxies: Galaxy[] = [];
  radius: number = 0;
  age: number = 0;        // in years
  round: number = 0;
  sliceYears: number = 0;
  totalSlices: number = 0;
  finished: boolean = false;
  
  /** Dark Forest system for civilization interactions */
  darkForest: DarkForestSystem = new DarkForestSystem();
  
  /** Enable dark forest mechanics */
  enableDarkForest: boolean = true;
  
  /** Statistics */
  stats = {
    techExplosions: 0,
    stealthCivs: 0,
    highSuspicionPairs: 0,
  };

  init(config: GameConfig): void {
    this.radius = config.universe.radius;
    this.sliceYears = config.time.sliceYears;
    this.totalSlices = config.time.totalSlices;
    this.age = 0;
    this.round = 0;
    this.finished = false;
    this.galaxies = [];
    this.darkForest = new DarkForestSystem();
    this.stats = { techExplosions: 0, stealthCivs: 0, highSuspicionPairs: 0 };

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

    // Normal evolution
    for (const galaxy of this.galaxies) {
      galaxy.evolve();
    }

    // Dark Forest mechanics
    if (this.enableDarkForest) {
      // Update suspicion between civilizations
      this.darkForest.updateSuspicion(this.galaxies, this.round);
      
      // Check for technology explosions
      for (const galaxy of this.galaxies) {
        const explosion = this.darkForest.checkTechExplosion(galaxy, this.round);
        if (explosion) {
          this.stats.techExplosions++;
        }
      }
      
      // Auto-enable stealth for low-level civs with high suspicion
      this.autoManageStealth();
      
      // Update stats
      this.stats.stealthCivs = this.galaxies.filter(g => 
        this.darkForest.isStealth(g)
      ).length;
      this.stats.highSuspicionPairs = this.darkForest.getHighSuspicionPairs().length;
    }

    this.round++;
    this.age += this.sliceYears;

    if (this.round >= this.totalSlices) {
      this.finished = true;
    }
  }

  /** Auto-manage stealth mode for civilizations */
  private autoManageStealth(): void {
    for (const galaxy of this.galaxies) {
      if (!galaxy.hasCivilization || galaxy.civilizationLevel >= 5) continue;
      
      // Check if any nearby civ has high suspicion
      const relations = this.darkForest.getHighSuspicionPairs(30);
      const galaxyId = `${galaxy.x.toFixed(0)},${galaxy.y.toFixed(0)},${galaxy.z.toFixed(0)}`;
      
      const isThreatened = relations.some(r => 
        r.civ1Id === galaxyId || r.civ2Id === galaxyId
      );
      
      if (isThreatened && !this.darkForest.isStealth(galaxy)) {
        // Enable stealth when threatened
        this.darkForest.enableStealth(galaxy);
      } else if (!isThreatened && this.darkForest.isStealth(galaxy)) {
        // Disable stealth when safe
        this.darkForest.disableStealth(galaxy);
      }
    }
  }

  /** Export universe state for saving */
  export(): object {
    return {
      config: {
        radius: this.radius,
        sliceYears: this.sliceYears,
        totalSlices: this.totalSlices,
      },
      state: {
        age: this.age,
        round: this.round,
        finished: this.finished,
        enableDarkForest: this.enableDarkForest,
      },
      galaxies: this.galaxies.map(g => ({
        x: g.x,
        y: g.y,
        z: g.z,
        hasCivilization: g.hasCivilization,
        civilizationLevel: g.civilizationLevel,
        evolveSpeed: g.evolveSpeed,
        evolveProbability: g.evolveProbability,
        isStealth: (g as any).isStealth || false,
      })),
      darkForest: this.darkForest.export(),
      stats: this.stats,
    };
  }

  /** Import universe state from save */
  import(data: any): void {
    this.radius = data.config.radius;
    this.sliceYears = data.config.sliceYears;
    this.totalSlices = data.config.totalSlices;
    this.age = data.state.age;
    this.round = data.state.round;
    this.finished = data.state.finished;
    this.enableDarkForest = data.state.enableDarkForest;
    this.stats = data.stats || { techExplosions: 0, stealthCivs: 0, highSuspicionPairs: 0 };
    
    // Rebuild galaxies
    this.galaxies = data.galaxies.map((g: any) => {
      const galaxy = new Galaxy(g.x, g.y, g.z, g.hasCivilization, g.evolveSpeed, g.evolveProbability);
      galaxy.civilizationLevel = g.civilizationLevel;
      if (g.isStealth) {
        (galaxy as any).isStealth = true;
      }
      return galaxy;
    });
    
    // Restore dark forest state
    this.darkForest.import(data.darkForest, this.galaxies);
  }
}
