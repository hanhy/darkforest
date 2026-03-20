/**
 * Audio Manager for Dark Forest
 * Generates procedural ambient sounds and effects matching Three-Body atmosphere
 */

export class AudioManager {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientNodes: { [key: string]: any } = {};
  private enabled: boolean = false;
  private volume: number = 0.3;

  // Sound settings
  private settings = {
    ambientVolume: 0.3,
    sfxVolume: 0.5,
    evolutionVolume: 0.4,
    strikeVolume: 0.6,
  };

  /** Initialize audio context (must be called after user interaction) */
  init(): void {
    if (this.audioCtx) return;
    
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    this.audioCtx = new AudioContextClass();
    this.masterGain = this.audioCtx.createGain();
    this.masterGain.connect(this.audioCtx.destination);
    this.masterGain.gain.value = this.volume;
    this.enabled = true;
  }

  /** Resume audio context (needed for some browsers) */
  async resume(): Promise<void> {
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
  }

  /** Toggle audio on/off */
  toggle(): boolean {
    if (!this.audioCtx) {
      this.init();
      return this.enabled;
    }
    
    this.enabled = !this.enabled;
    if (this.masterGain) {
      this.masterGain.gain.value = this.enabled ? this.volume : 0;
    }
    return this.enabled;
  }

  /** Set master volume (0-1) */
  setVolume(vol: number): void {
    this.volume = Math.max(0, Math.min(1, vol));
    if (this.masterGain) {
      this.masterGain.gain.value = this.enabled ? this.volume : 0;
    }
  }

  /**
   * Play deep space ambient drone
   * Creates an eerie, vast, empty space atmosphere
   */
  startAmbient(): void {
    if (!this.audioCtx || !this.enabled) return;
    if (this.ambientNodes.drone) return; // Already playing

    // Create multiple drone layers for depth
    this.createDroneLayer(50, 0.15);   // Very low fundamental
    this.createDroneLayer(100, 0.1);   // Low harmonic
    this.createDroneLayer(200, 0.05);  // Higher harmonic
    
    // Create random space sounds
    this.startSpaceSounds();
  }

  /** Stop ambient sound */
  stopAmbient(): void {
    if (!this.ambientNodes.drone) return;
    
    // Fade out
    const now = this.audioCtx!.currentTime;
    Object.values(this.ambientNodes).forEach((node: any) => {
      if (node.gain) {
        node.gain.gain.linearRampToValueAtTime(0, now + 2);
        setTimeout(() => {
          node.osc?.stop();
          node.osc?.disconnect();
          node.gain?.disconnect();
        }, 2000);
      }
    });
    
    this.ambientNodes = {};
  }

  /**
   * Play civilization evolution sound
   * Rising arpeggio to signify technological progress
   */
  playEvolution(level: number): void {
    if (!this.audioCtx || !this.enabled) return;

    const now = this.audioCtx.currentTime;
    const volume = this.settings.evolutionVolume;
    
    // Create rising arpeggio based on level
    const baseFreq = 200 + level * 50;
    const frequencies = [
      baseFreq,
      baseFreq * 1.25,  // Major third
      baseFreq * 1.5,   // Perfect fifth
      baseFreq * 2,     // Octave
    ];

    frequencies.forEach((freq, i) => {
      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();
      
      osc.type = 'sine';
      osc.frequency.value = freq;
      
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume / frequencies.length, now + 0.1 + i * 0.1);
      gain.gain.linearRampToValueAtTime(0, now + 0.5 + i * 0.1);
      
      osc.connect(gain);
      gain.connect(this.masterGain!);
      
      osc.start(now);
      osc.stop(now + 1);
    });
  }

  /**
   * Play technology explosion sound
   * More dramatic than normal evolution
   */
  playTechExplosion(): void {
    if (!this.audioCtx || !this.enabled) return;

    const now = this.audioCtx.currentTime;
    const volume = this.settings.sfxVolume;

    // Create rising sweep with harmonics
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(100, now);
    osc.frequency.exponentialRampToValueAtTime(800, now + 0.5);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, now);
    filter.frequency.linearRampToValueAtTime(2000, now + 0.3);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.6);
  }

  /**
   * Play Dark Forest strike sound
   * Terrifying, sudden, final - represents destruction
   */
  playStrike(method: 'photoid' | 'dual-vector-foil' | 'cleaning'): void {
    if (!this.audioCtx || !this.enabled) return;

    const now = this.audioCtx.currentTime;
    const volume = this.settings.strikeVolume;

    switch (method) {
      case 'photoid':
        this.playPhotoidStrike(now, volume);
        break;
      case 'dual-vector-foil':
        this.playDualVectorFoilStrike(now, volume);
        break;
      case 'cleaning':
        this.playCleaningStrike(now, volume);
        break;
    }
  }

  /**
   * Play broadcast alert sound
   * Subtle warning that coordinates are being broadcast
   */
  playBroadcast(): void {
    if (!this.audioCtx || !this.enabled) return;

    const now = this.audioCtx.currentTime;
    const volume = this.settings.sfxVolume * 0.5;

    // Create eerie ping sound
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(400, now + 0.3);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  /**
   * Play extinction notification
   * Deep, final sound
   */
  playExtinction(): void {
    if (!this.audioCtx || !this.enabled) return;

    const now = this.audioCtx.currentTime;
    const volume = this.settings.sfxVolume * 0.7;

    // Deep descending tone
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 1);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.1);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 1.2);
  }

  // ===== Private Methods =====

  private createDroneLayer(freq: number, volume: number): void {
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    osc.type = 'sine';
    osc.frequency.value = freq;

    // Lowpass filter for muffled, distant sound
    filter.type = 'lowpass';
    filter.frequency.value = freq * 3;
    filter.Q.value = 0.5;

    // Very slow volume modulation for "breathing" effect
    gain.gain.value = volume;

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    osc.start();

    this.ambientNodes[`drone_${freq}`] = { osc, gain, filter };
  }

  private startSpaceSounds(): void {
    if (!this.audioCtx) return;

    // Play random space sounds periodically
    const playRandomSound = () => {
      if (!this.enabled || !this.ambientNodes.drone) return;

      const now = this.audioCtx!.currentTime;
      const volume = this.settings.ambientVolume * 0.3;

      // Random frequency for variety
      const freq = 300 + Math.random() * 500;
      const duration = 1 + Math.random() * 2;

      const osc = this.audioCtx!.createOscillator();
      const gain = this.audioCtx!.createGain();

      osc.type = 'sine';
      osc.frequency.value = freq;

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(volume, now + 0.1);
      gain.gain.linearRampToValueAtTime(0, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain!);

      osc.start(now);
      osc.stop(now + duration);

      // Schedule next random sound
      setTimeout(playRandomSound, 3000 + Math.random() * 5000);
    };

    playRandomSound();
  }

  private playPhotoidStrike(now: number, volume: number): void {
    // High-pitched, fast, deadly - like a particle beam
    const osc = this.audioCtx!.createOscillator();
    const gain = this.audioCtx!.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(2000, now);
    osc.frequency.exponentialRampToValueAtTime(100, now + 0.3);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.4);
  }

  private playDualVectorFoilStrike(now: number, volume: number): void {
    // Descending, dimensional collapse effect
    const osc = this.audioCtx!.createOscillator();
    const gain = this.audioCtx!.createGain();
    const filter = this.audioCtx!.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(400, now);
    osc.frequency.exponentialRampToValueAtTime(20, now + 1.5);

    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1000, now);
    filter.frequency.linearRampToValueAtTime(100, now + 1.5);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume, now + 0.2);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 1.5);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 1.6);
  }

  private playCleaningStrike(now: number, volume: number): void {
    // Simple, brutal impact
    const osc = this.audioCtx!.createOscillator();
    const gain = this.audioCtx!.createGain();

    osc.type = 'square';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(50, now + 0.4);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume * 0.7, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.4);

    osc.connect(gain);
    gain.connect(this.masterGain!);

    osc.start(now);
    osc.stop(now + 0.5);
  }
}

// Export singleton instance
export const audioManager = new AudioManager();
