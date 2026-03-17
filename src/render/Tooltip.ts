import { Galaxy } from '../core/Galaxy';

export class Tooltip {
  private el: HTMLElement;

  constructor() {
    this.el = document.getElementById('tooltip')!;
  }

  show(galaxy: Galaxy, screenX: number, screenY: number): void {
    const lines: string[] = [];

    if (galaxy.hasCivilization) {
      const stealthIndicator = galaxy.isStealth ? ' 👻' : '';
      lines.push(`<b>Civilization${stealthIndicator}</b>`);
      lines.push(`Level: ${galaxy.civilizationLevel.toFixed(1)} / 10`);
      lines.push(`Evolve Speed: ${galaxy.evolveSpeed}`);
      lines.push(`Evolve Prob: ${(galaxy.evolveProbability * 100).toFixed(0)}%`);
      
      if (galaxy.isStealth) {
        lines.push(`<span style="color:#6af">👻 Stealth Mode Active</span>`);
      }
    } else {
      lines.push(`<b>Empty Galaxy</b>`);
      lines.push(`No civilization`);
    }

    lines.push(`<span style="color:#666">x: ${galaxy.x.toFixed(0)}, y: ${galaxy.y.toFixed(0)}, z: ${galaxy.z.toFixed(0)}</span>`);

    this.el.innerHTML = lines.join('<br>');
    this.el.style.left = `${screenX + 16}px`;
    this.el.style.top = `${screenY + 16}px`;
    this.el.classList.remove('hidden');
  }

  hide(): void {
    this.el.classList.add('hidden');
  }
}
