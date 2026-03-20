import { Galaxy } from './Galaxy';
import { CivilizationRelation } from './DarkForestSystem';

/**
 * Dark Forest Strike Event
 * Represents a coordinate broadcast and cleanup action
 */
export interface StrikeEvent {
  attacker: Galaxy;      // The civilization that initiated the strike
  victim: Galaxy;        // The civilization being attacked
  broadcaster?: Galaxy;  // The civilization that broadcast coordinates (may be same as attacker)
  round: number;
  success: boolean;
  method: 'photoid' | 'dual-vector-foil' | 'cleaning';
}

/**
 * Coordinate Broadcast
 * When a civilization broadcasts another's coordinates
 */
export interface CoordinateBroadcast {
  target: Galaxy;
  broadcaster: Galaxy;
  round: number;
  receivedBy: string[]; // Galaxy IDs that received the broadcast
}

/**
 * Dark Forest Strike System
 * Manages coordinate broadcasts and cleanup strikes
 */
export class DarkForestStrike {
  /** History of all strike events */
  public strikeHistory: StrikeEvent[] = [];
  
  /** Active broadcasts (coordinates in circulation) */
  private broadcasts: CoordinateBroadcast[] = [];
  
  /** Extinct civilizations */
  private extinctCivilizations: Set<Galaxy> = new Set();
  
  /** Strike probability by attacker level */
  private readonly strikeProbability = [
    0,      // Level 0: cannot strike
    0,      // Level 1
    0,      // Level 2
    0.01,   // Level 3: very rare
    0.02,   // Level 4
    0.05,   // Level 5: becomes possible
    0.10,   // Level 6
    0.20,   // Level 7
    0.35,   // Level 8
    0.50,   // Level 9
    0.70,   // Level 10: high probability
  ];

  /** Minimum level to initiate a strike */
  private readonly minStrikeLevel = 3;
  
  /** Minimum level to broadcast coordinates */
  private readonly minBroadcastLevel = 4;

  /**
   * Check if a civilization should broadcast another's coordinates
   * Based on suspicion level and threat assessment
   */
  checkBroadcast(
    broadcaster: Galaxy,
    target: Galaxy,
    relation: CivilizationRelation | null,
    round: number
  ): CoordinateBroadcast | null {
    // Must have civilization and sufficient level
    if (!broadcaster.hasCivilization || !target.hasCivilization) return null;
    if (broadcaster.civilizationLevel < this.minBroadcastLevel) return null;
    
    // Don't broadcast yourself
    if (broadcaster === target) return null;
    
    // Already extinct
    if (this.extinctCivilizations.has(target)) return null;
    
    // Check if already broadcast
    const alreadyBroadcast = this.broadcasts.some(
      b => b.target === target && !this.extinctCivilizations.has(target)
    );
    if (alreadyBroadcast) return null;
    
    // Broadcast probability based on suspicion
    let broadcastProb = 0.05; // Base probability
    if (relation && relation.suspicion > 50) {
      broadcastProb += (relation.suspicion - 50) / 100; // Up to +0.5
    }
    
    // Higher level = more likely to broadcast
    broadcastProb += broadcaster.civilizationLevel / 20;
    
    if (Math.random() < broadcastProb) {
      const broadcast: CoordinateBroadcast = {
        target,
        broadcaster,
        round,
        receivedBy: [],
      };
      
      this.broadcasts.push(broadcast);
      return broadcast;
    }
    
    return null;
  }

  /**
   * Check if a civilization should initiate a strike
   * Triggered by broadcasts or direct threat assessment
   */
  checkStrike(
    attacker: Galaxy,
    victim: Galaxy,
    round: number,
    isFromBroadcast: boolean = false
  ): StrikeEvent | null {
    // Must have civilization and sufficient level
    if (!attacker.hasCivilization || !victim.hasCivilization) return null;
    if (attacker.civilizationLevel < this.minStrikeLevel) return null;
    
    // Don't strike yourself
    if (attacker === victim) return null;
    
    // Already extinct
    if (this.extinctCivilizations.has(victim)) return null;
    
    // Strike probability
    let strikeProb = this.strikeProbability[Math.floor(attacker.civilizationLevel)];
    
    // Higher probability if coordinates were broadcast
    if (isFromBroadcast) {
      strikeProb *= 2;
    }
    
    // Victim's stealth reduces strike probability
    const isStealth = (victim as any).isStealth === true;
    if (isStealth) {
      strikeProb *= 0.1; // 90% reduction
    }
    
    if (Math.random() < strikeProb) {
      // Determine strike method based on attacker level
      let method: StrikeEvent['method'] = 'cleaning';
      if (attacker.civilizationLevel >= 8) {
        method = Math.random() < 0.5 ? 'photoid' : 'dual-vector-foil';
      } else if (attacker.civilizationLevel >= 6) {
        method = 'cleaning';
      }
      
      // Strike success depends on victim level and stealth
      let successProb = 0.8; // Base success rate
      if (victim.civilizationLevel >= attacker.civilizationLevel) {
        successProb -= 0.3; // Harder to strike equal/higher level
      }
      if (isStealth) {
        successProb -= 0.5; // Stealth makes it much harder
      }
      
      const success = Math.random() < successProb;
      
      if (success) {
        // Victim is extinct
        this.extinctCivilizations.add(victim);
        victim.hasCivilization = false; // Remove civilization
        (victim as any).isStealth = false;
        (victim as any).isExtinct = true; // Mark as extinct for rendering
      }
      
      const event: StrikeEvent = {
        attacker,
        victim,
        round,
        success,
        method,
      };
      
      this.strikeHistory.push(event);
      return event;
    }
    
    return null;
  }

  /**
   * Process broadcasts - other civilizations may receive and act on them
   * Optimized: only process recent broadcasts, clean up old ones
   */
  processBroadcasts(
    galaxies: Galaxy[],
    round: number,
    maxDistance: number = 500000
  ): StrikeEvent[] {
    const newStrikes: StrikeEvent[] = [];
    
    // Only process broadcasts from last 10 rounds (performance optimization)
    const recentBroadcasts = this.broadcasts.filter(b => round - b.round <= 10);
    
    for (const broadcast of recentBroadcasts) {
      // Skip if target is already extinct
      if (this.extinctCivilizations.has(broadcast.target)) continue;
      
      // Use Set for O(1) lookup instead of array includes
      const receivedSet = new Set(broadcast.receivedBy);
      
      // Find civilizations that receive the broadcast
      for (const galaxy of galaxies) {
        if (!galaxy.hasCivilization) continue;
        if (galaxy === broadcast.broadcaster) continue;
        if (galaxy === broadcast.target) continue;
        if (galaxy.civilizationLevel < this.minStrikeLevel) continue;
        
        // Check if already received this broadcast
        const broadcastKey = `${galaxy.x},${galaxy.y},${galaxy.z}`;
        if (receivedSet.has(broadcastKey)) continue;
        
        // Check distance - can only receive if within range
        const dist = galaxy.distanceTo(broadcast.broadcaster);
        if (dist > maxDistance) continue;
        
        // Mark as received
        broadcast.receivedBy.push(broadcastKey);
        receivedSet.add(broadcastKey);
        
        // This civilization may now strike
        const strike = this.checkStrike(galaxy, broadcast.target, round, true);
        if (strike) {
          strike.broadcaster = broadcast.broadcaster;
          newStrikes.push(strike);
        }
      }
    }
    
    // Clean up old broadcasts (older than 20 rounds) to prevent memory leak
    if (this.broadcasts.length > 100) {
      this.broadcasts = this.broadcasts.filter(b => round - b.round <= 20);
    }
    
    return newStrikes;
  }

  /**
   * Get statistics
   */
  getStats() {
    return {
      totalStrikes: this.strikeHistory.length,
      successfulStrikes: this.strikeHistory.filter(s => s.success).length,
      extinctCivilizations: this.extinctCivilizations.size,
      activeBroadcasts: this.broadcasts.filter(
        b => !this.extinctCivilizations.has(b.target)
      ).length,
      byMethod: {
        photoid: this.strikeHistory.filter(s => s.method === 'photoid').length,
        dualVectorFoil: this.strikeHistory.filter(s => s.method === 'dual-vector-foil').length,
        cleaning: this.strikeHistory.filter(s => s.method === 'cleaning').length,
      },
    };
  }

  /**
   * Check if a galaxy is extinct
   */
  isExtinct(galaxy: Galaxy): boolean {
    return this.extinctCivilizations.has(galaxy);
  }

  /**
   * Get all extinct galaxies
   */
  getExtinctGalaxies(): Galaxy[] {
    return Array.from(this.extinctCivilizations);
  }

  /**
   * Get recent strikes
   */
  getRecentStrikes(count: number = 10): StrikeEvent[] {
    return this.strikeHistory.slice(-count);
  }

  /**
   * Export state for saving
   */
  export(): object {
    return {
      strikeHistory: this.strikeHistory.map(s => ({
        attackerPos: [s.attacker.x, s.attacker.y, s.attacker.z],
        victimPos: [s.victim.x, s.victim.y, s.victim.z],
        broadcasterPos: s.broadcaster ? [s.broadcaster.x, s.broadcaster.y, s.broadcaster.z] : null,
        round: s.round,
        success: s.success,
        method: s.method,
      })),
      extinctPositions: Array.from(this.extinctCivilizations).map(g => [g.x, g.y, g.z]),
      broadcasts: this.broadcasts.map(b => ({
        targetPos: [b.target.x, b.target.y, b.target.z],
        broadcasterPos: [b.broadcaster.x, b.broadcaster.y, b.broadcaster.z],
        round: b.round,
        receivedBy: b.receivedBy,
      })),
    };
  }

  /**
   * Import state from save
   */
  import(data: any, galaxies: Galaxy[]): void {
    this.strikeHistory = [];
    this.extinctCivilizations.clear();
    this.broadcasts = [];
    
    // Rebuild extinct civilizations from positions
    const extinctPositions = new Set(data.extinctPositions?.map((p: number[]) => 
      `${p[0]},${p[1]},${p[2]}`
    ) || []);
    
    for (const galaxy of galaxies) {
      const key = `${galaxy.x},${galaxy.y},${galaxy.z}`;
      if (extinctPositions.has(key)) {
        this.extinctCivilizations.add(galaxy);
        galaxy.hasCivilization = false;
      }
    }
    
    // Note: strike history is not rebuilt as it's just for display
  }

  /**
   * Reset all state
   */
  reset(): void {
    this.strikeHistory = [];
    this.broadcasts = [];
    this.extinctCivilizations.clear();
  }
}
