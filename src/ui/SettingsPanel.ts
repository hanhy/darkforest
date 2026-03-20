import { GameConfig, DEFAULT_CONFIG } from '../config';
import { Universe } from '../core/Universe';
import { SaveManager } from '../utils/SaveManager';
import { audioManager } from '../audio/AudioManager';

export class SettingsPanel {
  private panel: HTMLElement;
  private toggle: HTMLElement;
  private saveManager: SaveManager = new SaveManager();

  onNewGame: ((config: GameConfig) => void) | null = null;
  onPause: (() => void) | null = null;
  onResume: (() => void) | null = null;
  onToggleDarkForest: ((enabled: boolean) => void) | null = null;

  private currentUniverse: Universe | null = null;
  private currentConfig: GameConfig | null = null;

  constructor() {
    this.panel = document.getElementById('settings-panel')!;
    this.toggle = document.getElementById('settings-toggle')!;

    this.toggle.addEventListener('click', () => {
      this.panel.classList.toggle('hidden');
    });

    // Wire up sliders to display values
    this.bindSlider('s-radius', 'v-radius', (v) => this.formatInt(v));
    this.bindSlider('s-galaxies', 'v-galaxies', (v) => this.formatInt(v));
    this.bindSlider('s-civ-prob', 'v-civ-prob', (v) => (v / 100).toFixed(2));
    this.bindSlider('s-time-slice', 'v-time-slice', (v) => this.formatInt(v));
    this.bindSlider('s-real-time', 'v-real-time', (v) => v.toString());
    this.bindSlider('s-total-slices', 'v-total-slices', (v) => this.formatInt(v));
    this.bindSlider('s-audio-volume', 'v-audio-volume', (v) => v + '%');
    
    // Audio controls
    const audioToggle = document.getElementById('btn-toggle-audio');
    if (audioToggle) {
      audioToggle.addEventListener('click', () => {
        const enabled = audioManager.toggle();
        audioToggle.textContent = enabled ? '🔊 Audio: ON' : '🔇 Audio: OFF';
      });
    }
    
    // Audio volume slider
    const volumeSlider = document.getElementById('s-audio-volume') as HTMLInputElement;
    if (volumeSlider) {
      volumeSlider.addEventListener('input', () => {
        audioManager.setVolume(parseFloat(volumeSlider.value) / 100);
      });
    }

    // Buttons
    document.getElementById('btn-new-game')!.addEventListener('click', () => {
      this.onNewGame?.(this.readConfig());
    });
    document.getElementById('btn-pause')!.addEventListener('click', () => {
      this.onPause?.();
    });
    document.getElementById('btn-resume')!.addEventListener('click', () => {
      this.onResume?.();
    });
    
    // Dark Forest toggle
    const dfToggle = document.getElementById('btn-toggle-df');
    if (dfToggle) {
      dfToggle.addEventListener('click', () => {
        if (this.currentUniverse) {
          this.currentUniverse.enableDarkForest = !this.currentUniverse.enableDarkForest;
          this.updateDFButton();
          this.onToggleDarkForest?.(this.currentUniverse.enableDarkForest);
        }
      });
    }
    
    // Save/Load buttons
    document.getElementById('btn-save')!.addEventListener('click', () => {
      if (this.currentUniverse && this.currentConfig) {
        this.saveManager.save(this.currentUniverse, this.currentConfig);
        alert('Game saved!');
      }
    });
    
    document.getElementById('btn-load')!.addEventListener('click', () => {
      if (this.currentUniverse) {
        const result = this.saveManager.load(this.currentUniverse);
        if (result.success) {
          alert('Game loaded!');
          this.onPause?.();
        } else {
          alert('No save found!');
        }
      }
    });
    
    document.getElementById('btn-export')!.addEventListener('click', () => {
      if (this.currentUniverse && this.currentConfig) {
        this.saveManager.exportToFile(this.currentUniverse, this.currentConfig);
      }
    });
    
    document.getElementById('btn-import')!.addEventListener('click', async () => {
      if (this.currentUniverse) {
        const result = await this.saveManager.importFromFile(this.currentUniverse);
        if (result.success && result.data) {
          this.currentConfig = result.data.config;
          this.onPause?.();
          alert('Save imported!');
        } else {
          alert('Failed to import save!');
        }
      }
    });
    
    // Update save info display
    this.updateSaveInfo();
  }

  private updateSaveInfo(): void {
    const info = this.saveManager.getSaveInfo();
    const saveInfoEl = document.getElementById('save-info');
    if (saveInfoEl && info) {
      const date = new Date(info.timestamp);
      saveInfoEl.textContent = `Last save: ${date.toLocaleString()} (Round ${info.round})`;
      saveInfoEl.style.display = 'block';
    } else if (saveInfoEl) {
      saveInfoEl.style.display = 'none';
    }
  }

  private updateDFButton(): void {
    const btn = document.getElementById('btn-toggle-df');
    if (btn && this.currentUniverse) {
      btn.textContent = this.currentUniverse.enableDarkForest 
        ? '🌑 Dark Forest: ON' 
        : '🌑 Dark Forest: OFF';
    }
  }

  setUniverse(universe: Universe, config: GameConfig): void {
    this.currentUniverse = universe;
    this.currentConfig = config;
    this.updateDFButton();
    this.updateAudioButton();
    this.updateSaveInfo();
  }
  
  private updateAudioButton(): void {
    // Audio button state is managed by audioManager directly
  }

  private bindSlider(sliderId: string, displayId: string, format: (v: number) => string): void {
    const slider = document.getElementById(sliderId) as HTMLInputElement;
    const display = document.getElementById(displayId)!;
    slider.addEventListener('input', () => {
      display.textContent = format(parseFloat(slider.value));
    });
  }

  readConfig(): GameConfig {
    return {
      universe: {
        radius: parseInt((document.getElementById('s-radius') as HTMLInputElement).value),
        galaxyCount: parseInt((document.getElementById('s-galaxies') as HTMLInputElement).value),
        civProbability: parseInt((document.getElementById('s-civ-prob') as HTMLInputElement).value) / 100,
      },
      galaxy: {
        evolveSpeed: DEFAULT_CONFIG.galaxy.evolveSpeed,
      },
      time: {
        sliceYears: parseInt((document.getElementById('s-time-slice') as HTMLInputElement).value),
        realTimePerSlice: parseFloat((document.getElementById('s-real-time') as HTMLInputElement).value),
        totalSlices: parseInt((document.getElementById('s-total-slices') as HTMLInputElement).value),
      },
    };
  }

  show(): void {
    this.panel.classList.remove('hidden');
  }

  private formatInt(n: number): string {
    return n.toLocaleString('en-US');
  }
}
