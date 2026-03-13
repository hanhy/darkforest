import { Universe } from '../core/Universe';
import { Galaxy } from '../core/Galaxy';
import { Camera } from './Camera';

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;

  constructor(canvas: HTMLCanvasElement, camera: Camera) {
    this.canvas = canvas;
    this.camera = camera;
    this.ctx = canvas.getContext('2d')!;
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  private resize(): void {
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
  }

  draw(universe: Universe): void {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    // Draw galaxies
    for (const galaxy of universe.galaxies) {
      const [sx, sy] = this.camera.worldToScreen(galaxy.x, galaxy.y);

      // Viewport culling
      if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) continue;

      this.drawGalaxy(galaxy, sx, sy);
    }
  }

  private drawGalaxy(galaxy: Galaxy, sx: number, sy: number): void {
    const ctx = this.ctx;

    if (!galaxy.hasCivilization) {
      // No civilization: dim gray dot
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(100, 100, 100, 0.6)';
      ctx.fill();
    } else {
      // Has civilization: brighter, size scales with level
      const level = galaxy.civilizationLevel;
      const t = level / 10; // 0 to 1
      const radius = 2 + t * 3;

      // Color: from dim blue to bright cyan-white
      const r = Math.floor(100 + t * 155);
      const g = Math.floor(150 + t * 105);
      const b = Math.floor(200 + t * 55);
      const alpha = 0.5 + t * 0.5;

      // Glow effect for high-level civilizations
      if (level >= 5) {
        ctx.beginPath();
        ctx.arc(sx, sy, radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.15})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.fill();
    }
  }

  /** Find galaxy near screen position, for tooltip */
  findGalaxyAt(universe: Universe, screenX: number, screenY: number, threshold: number = 10): Galaxy | null {
    let closest: Galaxy | null = null;
    let closestDist = threshold;

    for (const galaxy of universe.galaxies) {
      const [sx, sy] = this.camera.worldToScreen(galaxy.x, galaxy.y);
      const dist = Math.hypot(sx - screenX, sy - screenY);
      if (dist < closestDist) {
        closestDist = dist;
        closest = galaxy;
      }
    }

    return closest;
  }
}
