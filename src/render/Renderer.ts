import { Universe } from '../core/Universe';
import { Galaxy } from '../core/Galaxy';
import { Camera } from './Camera';

/** Map civilization level (0-10) to visible light spectrum color.
 *  Level 0 = red (~700nm, long wavelength)
 *  Level 10 = violet (~380nm, short wavelength)
 */
function spectrumColor(level: number): [number, number, number] {
  const t = Math.min(Math.max(level / 10, 0), 1); // 0 (red) to 1 (violet)

  // Approximate visible spectrum: red → orange → yellow → green → cyan → blue → violet
  let r: number, g: number, b: number;

  if (t < 0.167) {
    // Red → Orange
    const s = t / 0.167;
    r = 255; g = Math.floor(165 * s); b = 0;
  } else if (t < 0.333) {
    // Orange → Yellow
    const s = (t - 0.167) / 0.166;
    r = 255; g = 165 + Math.floor(90 * s); b = 0;
  } else if (t < 0.5) {
    // Yellow → Green
    const s = (t - 0.333) / 0.167;
    r = Math.floor(255 * (1 - s)); g = 255; b = 0;
  } else if (t < 0.667) {
    // Green → Cyan
    const s = (t - 0.5) / 0.167;
    r = 0; g = 255; b = Math.floor(255 * s);
  } else if (t < 0.833) {
    // Cyan → Blue
    const s = (t - 0.667) / 0.166;
    r = 0; g = Math.floor(255 * (1 - s)); b = 255;
  } else {
    // Blue → Violet
    const s = (t - 0.833) / 0.167;
    r = Math.floor(148 * s); g = 0; b = 255;
  }

  return [r, g, b];
}

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;

  // Connection line state
  selectedGalaxies: Galaxy[] = [];
  private connectionLine: { g1: Galaxy; g2: Galaxy } | null = null;

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

  /** Select a galaxy for connection. Returns true if a line was completed. */
  selectGalaxy(galaxy: Galaxy): boolean {
    if (this.selectedGalaxies.length === 0) {
      this.selectedGalaxies = [galaxy];
      return false;
    }
    if (this.selectedGalaxies.length === 1 && this.selectedGalaxies[0] !== galaxy) {
      this.connectionLine = { g1: this.selectedGalaxies[0], g2: galaxy };
      this.selectedGalaxies = [this.selectedGalaxies[0], galaxy];
      return true;
    }
    return false;
  }

  /** Clear the connection line */
  clearConnection(): void {
    this.selectedGalaxies = [];
    this.connectionLine = null;
  }

  draw(universe: Universe): void {
    const { ctx, canvas } = this;
    const w = canvas.width;
    const h = canvas.height;

    // Clear
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);

    // Sort galaxies by z-depth for painter's algorithm (far first)
    const projected: { galaxy: Galaxy; sx: number; sy: number; depth: number }[] = [];
    for (const galaxy of universe.galaxies) {
      const [sx, sy, depth] = this.camera.project(galaxy.x, galaxy.y, galaxy.z);
      // Viewport culling
      if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) continue;
      projected.push({ galaxy, sx, sy, depth });
    }
    projected.sort((a, b) => a.depth - b.depth); // far objects first

    for (const { galaxy, sx, sy, depth } of projected) {
      this.drawGalaxy(galaxy, sx, sy, depth, universe.radius);
    }

    // Draw connection line
    if (this.connectionLine) {
      this.drawConnectionLine(this.connectionLine.g1, this.connectionLine.g2);
    }

    // Draw selection highlight
    for (const g of this.selectedGalaxies) {
      const [sx, sy] = this.camera.project(g.x, g.y, g.z);
      ctx.beginPath();
      ctx.arc(sx, sy, 8, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }
  }

  private drawGalaxy(galaxy: Galaxy, sx: number, sy: number, depth: number, universeRadius: number): void {
    const ctx = this.ctx;

    // Depth-based opacity: closer objects are brighter
    const maxDepth = universeRadius;
    const depthFactor = 1 - Math.max(0, Math.min(1, (depth + maxDepth) / (2 * maxDepth))) * 0.5;

    if (!galaxy.hasCivilization) {
      ctx.beginPath();
      ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(100, 100, 100, ${0.3 + depthFactor * 0.3})`;
      ctx.fill();
    } else {
      const level = galaxy.civilizationLevel;
      const t = Math.min(level / 10, 1);
      const radius = galaxy.getRadius();
      const [r, g, b, baseAlpha] = galaxy.getColor();
      const alpha = baseAlpha * depthFactor;

      // Stealth mode: subtle pulsing effect
      if (galaxy.isStealth) {
        const pulse = 0.5 + 0.3 * Math.sin(Date.now() * 0.002);
        ctx.beginPath();
        ctx.arc(sx, sy, radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * pulse * 0.3})`;
        ctx.fill();
      }

      // Glow effect for high-level civilizations (not in stealth)
      if (galaxy.shouldShowGlow()) {
        ctx.beginPath();
        ctx.arc(sx, sy, radius * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * 0.15})`;
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
      ctx.fill();
      
      // Stealth indicator: small ring around stealth civs
      if (galaxy.isStealth) {
        ctx.beginPath();
        ctx.arc(sx, sy, radius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 150, 255, ${alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  private drawConnectionLine(g1: Galaxy, g2: Galaxy): void {
    const ctx = this.ctx;
    const [sx1, sy1] = this.camera.project(g1.x, g1.y, g1.z);
    const [sx2, sy2] = this.camera.project(g2.x, g2.y, g2.z);

    // Dashed line
    ctx.beginPath();
    ctx.setLineDash([6, 4]);
    ctx.moveTo(sx1, sy1);
    ctx.lineTo(sx2, sy2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

    // Distance label at midpoint
    const dist = g1.distanceTo(g2);
    const mx = (sx1 + sx2) / 2;
    const my = (sy1 + sy2) / 2;

    let label: string;
    if (dist >= 1_000_000) {
      label = `${(dist / 1_000_000).toFixed(1)}M ly`;
    } else if (dist >= 1_000) {
      label = `${(dist / 1_000).toFixed(1)}K ly`;
    } else {
      label = `${dist.toFixed(0)} ly`;
    }

    ctx.font = '12px Courier New';
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    ctx.textAlign = 'center';

    // Background for readability
    const tw = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(mx - tw / 2 - 4, my - 8, tw + 8, 16);
    ctx.fillStyle = '#fff';
    ctx.fillText(label, mx, my + 4);
  }

  /** Find galaxy near screen position, for tooltip / selection */
  findGalaxyAt(universe: Universe, screenX: number, screenY: number, threshold: number = 12): Galaxy | null {
    let closest: Galaxy | null = null;
    let closestDist = threshold;

    for (const galaxy of universe.galaxies) {
      const [sx, sy] = this.camera.project(galaxy.x, galaxy.y, galaxy.z);
      const dist = Math.hypot(sx - screenX, sy - screenY);
      if (dist < closestDist) {
        closestDist = dist;
        closest = galaxy;
      }
    }

    return closest;
  }
}
