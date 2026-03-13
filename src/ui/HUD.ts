import { Universe } from '../core/Universe';

export class HUD {
  private ageEl: HTMLElement;
  private roundEl: HTMLElement;

  constructor() {
    this.ageEl = document.getElementById('hud-age')!;
    this.roundEl = document.getElementById('hud-round')!;
  }

  update(universe: Universe): void {
    this.ageEl.textContent = `Universe Age: ${this.formatNumber(universe.age)} years`;
    this.roundEl.textContent = `Round: ${universe.round} / ${universe.totalSlices}`;
  }

  private formatNumber(n: number): string {
    if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + 'B';
    if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
    if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
    return n.toString();
  }
}
