/**
 * Audio Manager for Dark Forest
 * Deep, spacious ambient sounds evoking vast cosmic emptiness
 */

export class AudioManager {
  private audioCtx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private ambientNodes: { osc?: OscillatorNode; gain?: GainNode; lfo?: OscillatorNode; lfoGain?: GainNode; noise?: AudioBufferSourceNode }[] = [];
  private enabled: boolean = false;
  private volume: number = 0.3;

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
   * Start deep space ambient drone
   * Very low frequencies with slow breathing modulation — vast, lonely emptiness
   */
  startAmbient(): void {
    if (!this.audioCtx || !this.enabled) return;
    if (this.ambientNodes.length > 0) return; // Already playing

    // Layer 1: Deep sub-bass drone at 25Hz with slight detune for width
    this.createDeepDrone(25, -3, 0.10, 0.03);
    this.createDeepDrone(25, +3, 0.10, 0.035);

    // Layer 2: Low drone at 35Hz with detune
    this.createDeepDrone(35, -5, 0.07, 0.04);
    this.createDeepDrone(35, +5, 0.07, 0.045);

    // Layer 3: Very subtle higher harmonic for sense of space (75Hz, barely audible)
    this.createDeepDrone(75, 0, 0.03, 0.05);

    // Layer 4: Subtle filtered noise for spacious texture
    this.createSpaceNoise();

    // Layer 5: Ethereal female vocal — soft, sorrowful humming
    this.createEtherealVocal();
  }

  /** Stop ambient sound */
  stopAmbient(): void {
    if (this.ambientNodes.length === 0) return;
    const now = this.audioCtx!.currentTime;
    for (const node of this.ambientNodes) {
      if (node.gain) {
        node.gain.gain.linearRampToValueAtTime(0, now + 2);
      }
      setTimeout(() => {
        try { node.osc?.stop(); } catch (_) {}
        try { node.osc?.disconnect(); } catch (_) {}
        try { node.lfo?.stop(); } catch (_) {}
        try { node.lfo?.disconnect(); } catch (_) {}
        try { node.lfoGain?.disconnect(); } catch (_) {}
        try { node.gain?.disconnect(); } catch (_) {}
        try { node.noise?.stop(); } catch (_) {}
        try { node.noise?.disconnect(); } catch (_) {}
      }, 2500);
    }
    this.ambientNodes = [];
  }

  /** Play civilization evolution sound */
  playEvolution(level: number): void {
    if (!this.audioCtx || !this.enabled) return;
    const now = this.audioCtx.currentTime;
    const volume = this.settings.evolutionVolume;
    const baseFreq = 200 + level * 50;
    const frequencies = [baseFreq, baseFreq * 1.25, baseFreq * 1.5, baseFreq * 2];
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

  /** Play technology explosion sound */
  playTechExplosion(): void {
    if (!this.audioCtx || !this.enabled) return;
    const now = this.audioCtx.currentTime;
    const volume = this.settings.sfxVolume;
    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();
    osc.type = 'triangle';
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

  /** Broadcast alert sound */
  playBroadcast(): void {
    if (!this.audioCtx || !this.enabled) return;
    const now = this.audioCtx.currentTime;
    const volume = this.settings.sfxVolume * 0.5;
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

  /** Extinction notification */
  playExtinction(): void {
    if (!this.audioCtx || !this.enabled) return;
    const now = this.audioCtx.currentTime;
    const volume = this.settings.sfxVolume * 0.7;
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

  /** Create a deep drone layer with LFO breathing modulation */
  private createDeepDrone(freq: number, detuneCents: number, volume: number, lfoRate: number): void {
    if (!this.audioCtx) return;

    const osc = this.audioCtx.createOscillator();
    const gain = this.audioCtx.createGain();
    const filter = this.audioCtx.createBiquadFilter();

    // Use triangle for warmth at very low frequencies, sine for higher
    osc.type = freq <= 35 ? 'triangle' : 'sine';
    osc.frequency.value = freq;
    osc.detune.value = detuneCents;

    // Gentle lowpass to remove any harshness
    filter.type = 'lowpass';
    filter.frequency.value = freq * 4;
    filter.Q.value = 0.3;

    gain.gain.value = volume;

    // Slow LFO for breathing modulation
    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = lfoRate; // Very slow: 0.03-0.05 Hz
    lfoGain.gain.value = volume * 0.5; // Modulation depth

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain!);

    osc.start();
    lfo.start();

    this.ambientNodes.push({ osc, gain, lfo, lfoGain });
  }

  /** Create subtle filtered noise for spacious texture */
  private createSpaceNoise(): void {
    if (!this.audioCtx) return;

    // Create noise buffer
    const bufferSize = this.audioCtx.sampleRate * 4;
    const buffer = this.audioCtx.createBuffer(1, bufferSize, this.audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1);
    }

    const noise = this.audioCtx.createBufferSource();
    noise.buffer = buffer;
    noise.loop = true;

    // Very aggressive lowpass to keep only deep rumble
    const filter = this.audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 80;
    filter.Q.value = 0.5;

    // Second filter for extra smoothness
    const filter2 = this.audioCtx.createBiquadFilter();
    filter2.type = 'lowpass';
    filter2.frequency.value = 120;
    filter2.Q.value = 0.3;

    const gain = this.audioCtx.createGain();
    gain.gain.value = 0.04; // Very quiet

    // Slow LFO on noise volume
    const lfo = this.audioCtx.createOscillator();
    const lfoGain = this.audioCtx.createGain();
    lfo.type = 'sine';
    lfo.frequency.value = 0.02; // Even slower than drones
    lfoGain.gain.value = 0.02;

    lfo.connect(lfoGain);
    lfoGain.connect(gain.gain);

    noise.connect(filter);
    filter.connect(filter2);
    filter2.connect(gain);
    gain.connect(this.masterGain!);

    noise.start();
    lfo.start();

    this.ambientNodes.push({ noise, gain, lfo, lfoGain });
  }

  /**
   * Create ethereal female vocal simulation
   * Uses formant synthesis to approximate a soft, sorrowful female humming
   * Conveys the indifference and melancholy of the universe
   */
  private createEtherealVocal(): void {
    if (!this.audioCtx) return;

    const ctx = this.audioCtx;

    // Female vocal formants — "ah" / "oo" vowel blending
    // Fundamental frequency: ~220-330Hz range (alto female voice)
    const fundamental = ctx.createOscillator();
    fundamental.type = 'sine';
    fundamental.frequency.value = 260; // ~middle C area

    // Very slow pitch drift for natural, haunting quality
    const pitchLfo = ctx.createOscillator();
    const pitchLfoGain = ctx.createGain();
    pitchLfo.type = 'sine';
    pitchLfo.frequency.value = 0.08; // Very slow wandering
    pitchLfoGain.gain.value = 15; // ±15 Hz drift
    pitchLfo.connect(pitchLfoGain);
    pitchLfoGain.connect(fundamental.frequency);

    // Second voice — slightly detuned for chorus/ethereal effect
    const voice2 = ctx.createOscillator();
    voice2.type = 'sine';
    voice2.frequency.value = 263; // Slight detune (+3Hz)

    const voice2Lfo = ctx.createOscillator();
    const voice2LfoGain = ctx.createGain();
    voice2Lfo.type = 'sine';
    voice2Lfo.frequency.value = 0.06;
    voice2LfoGain.gain.value = 12;
    voice2Lfo.connect(voice2LfoGain);
    voice2LfoGain.connect(voice2.frequency);

    // Third voice — octave higher, very faint, for "breath" quality
    const voice3 = ctx.createOscillator();
    voice3.type = 'sine';
    voice3.frequency.value = 523; // One octave up
    const voice3Lfo = ctx.createOscillator();
    const voice3LfoGain = ctx.createGain();
    voice3Lfo.type = 'sine';
    voice3Lfo.frequency.value = 0.1;
    voice3LfoGain.gain.value = 20;
    voice3Lfo.connect(voice3LfoGain);
    voice3LfoGain.connect(voice3.frequency);

    // Formant filters — shape the sound into a vowel-like quality
    // Formant 1 (~800Hz) — "ah" vowel
    const formant1 = ctx.createBiquadFilter();
    formant1.type = 'bandpass';
    formant1.frequency.value = 800;
    formant1.Q.value = 12;

    // Formant 2 (~1200Hz) — adds "oo" quality
    const formant2 = ctx.createBiquadFilter();
    formant2.type = 'bandpass';
    formant2.frequency.value = 1200;
    formant2.Q.value = 10;

    // Slow formant sweep — voice drifts between "ah" and "oo"
    const formantLfo = ctx.createOscillator();
    const formantLfoGain = ctx.createGain();
    formantLfo.type = 'sine';
    formantLfo.frequency.value = 0.03; // Very slow vowel shift
    formantLfoGain.gain.value = 300; // Sweep range
    formantLfo.connect(formantLfoGain);
    formantLfoGain.connect(formant1.frequency);

    // Volume envelope — slow breathing, phrases of ~8-12 seconds
    const vocalGain = ctx.createGain();
    vocalGain.gain.value = 0.035; // Very quiet — ghostly presence

    // Breathing LFO — simulates phrases
    const breathLfo = ctx.createOscillator();
    const breathLfoGain = ctx.createGain();
    breathLfo.type = 'sine';
    breathLfo.frequency.value = 0.07; // ~14 second cycle
    breathLfoGain.gain.value = 0.03; // Modulation depth
    breathLfo.connect(breathLfoGain);
    breathLfoGain.connect(vocalGain.gain);

    // Mix voices through formants
    const voiceMix = ctx.createGain();
    voiceMix.gain.value = 1.0;

    fundamental.connect(voiceMix);
    voice2.connect(voiceMix);

    const voice3Gain = ctx.createGain();
    voice3Gain.gain.value = 0.3; // Octave voice much quieter
    voice3.connect(voice3Gain);
    voice3Gain.connect(voiceMix);

    // Split through two formant filters and recombine
    const formantMix = ctx.createGain();
    formantMix.gain.value = 1.0;

    const f1Gain = ctx.createGain();
    f1Gain.gain.value = 0.7;
    const f2Gain = ctx.createGain();
    f2Gain.gain.value = 0.4;

    voiceMix.connect(formant1);
    voiceMix.connect(formant2);
    formant1.connect(f1Gain);
    formant2.connect(f2Gain);
    f1Gain.connect(formantMix);
    f2Gain.connect(formantMix);

    // Final gentle lowpass to smooth everything
    const smoothing = ctx.createBiquadFilter();
    smoothing.type = 'lowpass';
    smoothing.frequency.value = 2000;
    smoothing.Q.value = 0.3;

    formantMix.connect(smoothing);
    smoothing.connect(vocalGain);
    vocalGain.connect(this.masterGain!);

    // Start all oscillators
    fundamental.start();
    voice2.start();
    voice3.start();
    pitchLfo.start();
    voice2Lfo.start();
    voice3Lfo.start();
    formantLfo.start();
    breathLfo.start();

    // Store references for cleanup
    this.ambientNodes.push({
      osc: fundamental,
      gain: vocalGain,
      lfo: pitchLfo,
      lfoGain: pitchLfoGain,
    });
    // Store extra oscillators in separate entries for cleanup
    this.ambientNodes.push({ osc: voice2, gain: voice3Gain, lfo: voice2Lfo, lfoGain: voice2LfoGain });
    this.ambientNodes.push({ osc: voice3, gain: f1Gain, lfo: voice3Lfo, lfoGain: voice3LfoGain });
    this.ambientNodes.push({ osc: formantLfo, gain: f2Gain, lfo: breathLfo, lfoGain: breathLfoGain });
  }

  /**
   * Photoid (光粒) strike: Sharp, piercing high-to-low laser sweep, very brief
   */
  private playPhotoidStrike(now: number, volume: number): void {
    const ctx = this.audioCtx!;

    // Main piercing sweep: very high to low
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(6000, now);
    osc1.frequency.exponentialRampToValueAtTime(200, now + 0.25);

    gain1.gain.setValueAtTime(0, now);
    gain1.gain.linearRampToValueAtTime(volume * 0.8, now + 0.01); // Near-instant attack
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc1.connect(gain1);
    gain1.connect(this.masterGain!);
    osc1.start(now);
    osc1.stop(now + 0.35);

    // Secondary harmonic for "laser" brightness
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(8000, now);
    osc2.frequency.exponentialRampToValueAtTime(400, now + 0.2);

    gain2.gain.setValueAtTime(0, now);
    gain2.gain.linearRampToValueAtTime(volume * 0.3, now + 0.01);
    gain2.gain.exponentialRampToValueAtTime(0.01, now + 0.2);

    osc2.connect(gain2);
    gain2.connect(this.masterGain!);
    osc2.start(now);
    osc2.stop(now + 0.25);

    // Short noise burst for impact texture
    const bufferSize = ctx.sampleRate;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noise = ctx.createBufferSource();
    noise.buffer = buffer;
    const noiseFilter = ctx.createBiquadFilter();
    noiseFilter.type = 'bandpass';
    noiseFilter.frequency.value = 4000;
    noiseFilter.Q.value = 2;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0, now);
    noiseGain.gain.linearRampToValueAtTime(volume * 0.15, now + 0.005);
    noiseGain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

    noise.connect(noiseFilter);
    noiseFilter.connect(noiseGain);
    noiseGain.connect(this.masterGain!);
    noise.start(now);
    noise.stop(now + 0.2);
  }

  /**
   * Dual-vector-foil (二向箔) strike: Long, ominous descending tone with dimensional collapse
   * Multiple detuned oscillators creating a "folding" effect, 2-3 seconds
   */
  private playDualVectorFoilStrike(now: number, volume: number): void {
    const ctx = this.audioCtx!;
    const duration = 2.8;

    // Multiple detuned oscillators for "folding/collapsing" effect
    const detuneValues = [-15, -7, 0, +7, +15];
    detuneValues.forEach((detune, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(300 + i * 20, now);
      osc.frequency.exponentialRampToValueAtTime(15, now + duration);
      osc.detune.value = detune;

      const oscVol = volume * 0.25;
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(oscVol, now + 0.4);
      gain.gain.setValueAtTime(oscVol, now + duration * 0.5);
      gain.gain.exponentialRampToValueAtTime(0.01, now + duration);

      osc.connect(gain);
      gain.connect(this.masterGain!);
      osc.start(now);
      osc.stop(now + duration + 0.1);
    });

    // Low rumble underneath
    const subOsc = ctx.createOscillator();
    const subGain = ctx.createGain();
    subOsc.type = 'sine';
    subOsc.frequency.setValueAtTime(60, now);
    subOsc.frequency.exponentialRampToValueAtTime(10, now + duration);

    subGain.gain.setValueAtTime(0, now);
    subGain.gain.linearRampToValueAtTime(volume * 0.4, now + 0.6);
    subGain.gain.setValueAtTime(volume * 0.4, now + duration * 0.4);
    subGain.gain.exponentialRampToValueAtTime(0.01, now + duration);

    subOsc.connect(subGain);
    subGain.connect(this.masterGain!);
    subOsc.start(now);
    subOsc.stop(now + duration + 0.1);

    // Eerie high shimmer that fades — sense of dimension collapsing
    const shimmer = ctx.createOscillator();
    const shimmerGain = ctx.createGain();
    shimmer.type = 'sine';
    shimmer.frequency.setValueAtTime(2000, now);
    shimmer.frequency.exponentialRampToValueAtTime(100, now + duration);

    shimmerGain.gain.setValueAtTime(0, now);
    shimmerGain.gain.linearRampToValueAtTime(volume * 0.1, now + 0.3);
    shimmerGain.gain.exponentialRampToValueAtTime(0.01, now + duration * 0.7);

    shimmer.connect(shimmerGain);
    shimmerGain.connect(this.masterGain!);
    shimmer.start(now);
    shimmer.stop(now + duration + 0.1);
  }

  /** Cleaning strike: brutal low-frequency impact */
  private playCleaningStrike(now: number, volume: number): void {
    const ctx = this.audioCtx!;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(150, now);
    osc.frequency.exponentialRampToValueAtTime(30, now + 0.5);

    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(volume * 0.7, now + 0.03);
    gain.gain.exponentialRampToValueAtTime(0.01, now + 0.5);

    osc.connect(gain);
    gain.connect(this.masterGain!);
    osc.start(now);
    osc.stop(now + 0.6);
  }
}

// Export singleton instance
export const audioManager = new AudioManager();
