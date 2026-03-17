import { Galaxy } from './Galaxy';

/**
 * Dark Forest System - Manages civilization interactions
 * including chain of suspicion, technology explosion, and stealth
 */

export interface CivilizationRelation {
  civ1Id: string;
  civ2Id: string;
  suspicion: number;      // 0-100, higher = more hostile
  lastContact: number;    // universe round of last interaction
}

export interface TechExplosionEvent {
  galaxy: Galaxy;
  fromLevel: number;
  toLevel: number;
  round: number;
}

export class DarkForestSystem {
  /** Relations between civilizations */
  private relations: Map<string, CivilizationRelation> = new Map();
  
  /** History of technology explosions */
  public techExplosions: TechExplosionEvent[] = [];
  
  /** Galaxies in stealth mode */
  private stealthGalaxies: Set<Galaxy> = new Set();

  /** Technology explosion probability by level */
  private readonly techExplosionProb = [
    0.001,  // Level 0: very low
    0.005,  // Level 1
    0.01,   // Level 2
    0.02,   // Level 3
    0.03,   // Level 4
    0.01,   // Level 5
    0.005,  // Level 6
    0.002,  // Level 7
    0.001,  // Level 8
    0.0005, // Level 9
    0,      // Level 10: impossible
  ];

  /** Get relation between two civilizations */
  getRelation(g1: Galaxy, g2: Galaxy): CivilizationRelation | null {
    const key = this.relationKey(g1, g2);
    return this.relations.get(key) || null;
  }

  /** Update suspicion between civilizations based on distance and level */
  updateSuspicion(galaxies: Galaxy[], round: number, maxDistance: number = 100000): void {
    const civs = galaxies.filter(g => g.hasCivilization && g.civilizationLevel >= 0);
    
    for (let i = 0; i < civs.length; i++) {
      for (let j = i + 1; j < civs.length; j++) {
        const g1 = civs[i];
        const g2 = civs[j];
        const dist = g1.distanceTo(g2);
        
        // Only interact if within range
        if (dist > maxDistance) continue;
        
        const key = this.relationKey(g1, g2);
        let relation = this.relations.get(key);
        
        if (!relation) {
          relation = {
            civ1Id: this.galaxyId(g1),
            civ2Id: this.galaxyId(g2),
            suspicion: 0,
            lastContact: round,
          };
        }
        
        // Suspicion increases based on:
        // - Level difference (higher level is threat)
        // - Proximity (closer = more threat)
        // - Time since last contact (decay)
        const levelDiff = Math.abs(g1.civilizationLevel - g2.civilizationLevel);
        const proximityFactor = 1 - (dist / maxDistance);
        const timeDecay = (round - relation.lastContact) * 0.1;
        
        // Add suspicion
        const suspicionIncrease = (levelDiff * 0.5 + proximityFactor * 2) * 0.1;
        relation.suspicion = Math.min(100, Math.max(0, 
          relation.suspicion + suspicionIncrease - timeDecay
        ));
        relation.lastContact = round;
        
        this.relations.set(key, relation);
      }
    }
  }

  /** Check for technology explosion */
  checkTechExplosion(galaxy: Galaxy, round: number): TechExplosionEvent | null {
    if (!galaxy.hasCivilization || galaxy.civilizationLevel >= 10) {
      return null;
    }
    
    const prob = this.techExplosionProb[Math.floor(galaxy.civilizationLevel)];
    
    if (Math.random() < prob) {
      const fromLevel = galaxy.civilizationLevel;
      // Tech explosion: jump 1-3 levels
      const jump = 1 + Math.floor(Math.random() * 3);
      const toLevel = Math.min(10, fromLevel + jump);
      
      galaxy.civilizationLevel = toLevel;
      
      const event: TechExplosionEvent = {
        galaxy,
        fromLevel,
        toLevel,
        round,
      };
      
      this.techExplosions.push(event);
      return event;
    }
    
    return null;
  }

  /** Enable stealth mode for a galaxy */
  enableStealth(galaxy: Galaxy): void {
    if (galaxy.hasCivilization && galaxy.civilizationLevel < 5) {
      this.stealthGalaxies.add(galaxy);
      (galaxy as any).isStealth = true;
    }
  }

  /** Disable stealth mode */
  disableStealth(galaxy: Galaxy): void {
    this.stealthGalaxies.delete(galaxy);
    (galaxy as any).isStealth = false;
  }

  /** Check if galaxy is in stealth */
  isStealth(galaxy: Galaxy): boolean {
    return this.stealthGalaxies.has(galaxy);
  }

  /** Get detection probability for a galaxy */
  getDetectionProbability(galaxy: Galaxy, observerLevel: number): number {
    if (!galaxy.hasCivilization) return 0;
    
    // Stealth reduces detection
    if (this.isStealth(galaxy)) {
      return 0.1 * (observerLevel / 10);
    }
    
    // Higher level civs are easier to detect
    return 0.3 + (galaxy.civilizationLevel / 10) * 0.5 + (observerLevel / 10) * 0.2;
  }

  /** Get all high-suspicion pairs */
  getHighSuspicionPairs(threshold: number = 50): CivilizationRelation[] {
    const result: CivilizationRelation[] = [];
    for (const relation of this.relations.values()) {
      if (relation.suspicion >= threshold) {
        result.push(relation);
      }
    }
    return result;
  }

  /** Export state for saving */
  export(): object {
    return {
      relations: Array.from(this.relations.values()),
      techExplosions: this.techExplosions.map(e => ({
        fromLevel: e.fromLevel,
        toLevel: e.toLevel,
        round: e.round,
        galaxyPos: [e.galaxy.x, e.galaxy.y, e.galaxy.z],
      })),
      stealthGalaxies: Array.from(this.stealthGalaxies).map(g => [g.x, g.y, g.z]),
    };
  }

  /** Import state from save */
  import(data: any, galaxies: Galaxy[]): void {
    this.relations.clear();
    this.techExplosions = [];
    this.stealthGalaxies.clear();
    
    if (data.relations) {
      for (const r of data.relations) {
        const key = r.civ1Id < r.civ2Id ? r.civ1Id + '-' + r.civ2Id : r.civ2Id + '-' + r.civ1Id;
        this.relations.set(key, r);
      }
    }
    
    // Rebuild stealth galaxies from positions
    const stealthPositions = new Set(data.stealthGalaxies?.map((p: number[]) => 
      `${p[0]},${p[1]},${p[2]}`
    ) || []);
    
    for (const galaxy of galaxies) {
      const key = `${galaxy.x},${galaxy.y},${galaxy.z}`;
      if (stealthPositions.has(key)) {
        this.stealthGalaxies.add(galaxy);
        (galaxy as any).isStealth = true;
      }
    }
  }

  private relationKey(g1: Galaxy, g2: Galaxy): string {
    const id1 = this.galaxyId(g1);
    const id2 = this.galaxyId(g2);
    return id1 < id2 ? id1 + '-' + id2 : id2 + '-' + id1;
  }

  private galaxyId(g: Galaxy): string {
    return `${g.x.toFixed(0)},${g.y.toFixed(0)},${g.z.toFixed(0)}`;
  }
}
