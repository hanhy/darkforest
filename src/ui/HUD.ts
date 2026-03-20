import { Universe } from '../core/Universe';

export class HUD {
  private ageEl: HTMLElement;
  private roundEl: HTMLElement;
  private statsEl: HTMLElement | null;
  private darkForestToggle: HTMLElement | null;

  constructor() {
    this.ageEl = document.getElementById('hud-age')!;
    this.roundEl = document.getElementById('hud-round')!;
    this.statsEl = document.getElementById('hud-stats');
    this.darkForestToggle = document.getElementById('hud-df-toggle');
  }

  update(universe: Universe): void {
    this.ageEl.textContent = `Universe Age: ${this.formatNumber(universe.age)} years`;
    this.roundEl.textContent = `Round: ${universe.round} / ${universe.totalSlices}`;
    
    // Update dark forest stats if enabled
    if (this.statsEl && universe.enableDarkForest) {
      this.statsEl.innerHTML = `
        <div>🔥 Tech Explosions: ${universe.stats.techExplosions}</div>
        <div>👻 Stealth Civs: ${universe.stats.stealthCivs}</div>
        <div>⚠️ High Suspicion: ${universe.stats.highSuspicionPairs}</div>
        <div>💥 Strikes: ${universe.stats.strikes}</div>
        <div>☠️ Extinct Civs: ${universe.stats.extinctCivs}</div>
      `;
      this.statsEl.style.display = 'block';
    } else if (this.statsEl) {
      this.statsEl.style.display = 'none';
    }
    
    // Update toggle button
    if (this.darkForestToggle) {
      this.darkForestToggle.textContent = universe.enableDarkForest 
        ? '🌑 Dark Forest: ON' 
        : '🌑 Dark Forest: OFF';
    }
    
    // Update audio button state (initialized in main.ts)
  }

  private formatNumber(n: number): string {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
  }
}
