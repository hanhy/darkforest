import { chance } from '../utils/random';

export class Galaxy {
  x: number;
  y: number;
  z: number;
  hasCivilization: boolean;
  civilizationLevel: number;
  evolveSpeed: number;
  evolveProbability: number;
  /** Stealth mode (for dark forest mechanics) */
  isStealth: boolean = false;

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

  /** Get display color considering stealth mode */
  getColor(): [number, number, number, number] {
    if (!this.hasCivilization) {
      return [100, 100, 100, 0.6];
    }

    const level = this.civilizationLevel;
    const t = Math.min(level / 10, 1);
    
    // Spectrum color calculation
    let r: number, g: number, b: number;
    
    if (t < 0.167) {
      const s = t / 0.167;
      r = 255; g = Math.floor(165 * s); b = 0;
    } else if (t < 0.333) {
      const s = (t - 0.167) / 0.166;
      r = 255; g = 165 + Math.floor(90 * s); b = 0;
    } else if (t < 0.5) {
      const s = (t - 0.333) / 0.167;
      r = Math.floor(255 * (1 - s)); g = 255; b = 0;
    } else if (t < 0.667) {
      const s = (t - 0.5) / 0.167;
      r = 0; g = 255; b = Math.floor(255 * s);
    } else if (t < 0.833) {
      const s = (t - 0.667) / 0.166;
      r = 0; g = Math.floor(255 * (1 - s)); b = 255;
    } else {
      const s = (t - 0.833) / 0.167;
      r = Math.floor(148 * s); g = 0; b = 255;
    }

    // Stealth mode: dimmer, slightly blue-tinted
    if (this.isStealth) {
      r = Math.floor(r * 0.5);
      g = Math.floor(g * 0.5);
      b = Math.floor(b * 0.7 + 100);
      return [r, g, b, 0.4];
    }

    const alpha = 0.6 + t * 0.4;
    return [r, g, b, alpha];
  }

  /** Whether this galaxy should show glow effect */
  shouldShowGlow(): boolean {
    return this.hasCivilization && this.civilizationLevel >= 5 && !this.isStealth;
  }

  /** Get display radius */
  getRadius(): number {
    if (!this.hasCivilization) return 1.5;
    const t = Math.min(this.civilizationLevel / 10, 1);
    return 2 + t * 3;
  }
}
