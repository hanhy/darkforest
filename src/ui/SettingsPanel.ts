import { GameConfig, DEFAULT_CONFIG } from '../config';

export class SettingsPanel {
  private panel: HTMLElement;
  private toggle: HTMLElement;

  onNewGame: ((config: GameConfig) => void) | null = null;
  onPause: (() => void) | null = null;
  onResume: (() => void) | null = null;

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
        evolveProbability: DEFAULT_CONFIG.galaxy.evolveProbability,
      },
      time: {
        sliceYears: parseInt((document.getElementById('s-time-slice') as HTMLInputElement).value),
        realTimePerSlice: parseFloat((document.getElementById('s-real-time') as HTMLInputElement).value),
        totalSlices: parseInt((document.getElementById('s-total-slices') as HTMLInputElement).value),
      },
    };
  }

  private formatInt(n: number): string {
    return n.toLocaleString('en-US');
  }
}
