import { Universe } from '../core/Universe';
import { Galaxy } from '../core/Galaxy';
import { Camera } from './Camera';

/** Map civilization level (0-10) to visible light spectrum color. */
function spectrumColor(level: number): [number, number, number] {
  const t = Math.min(Math.max(level / 10, 0), 1);
  let r: number, g: number, b: number;
  if (t < 0.167) {
    const s = t / 0.167;
    r = 255; g = Math.floor(165 * s); b = 0;
  } else if (t < 0.333) {
    const s = (t - 0.167) / 0.166;
    r = 255; g = 165 + Math.floor(90 * s); b = 0;
  } else if (t < 0.5) {
    const s = (t - 0.333) / 0.167;
    r = Math.floor(255 * (1 - s)); g = 255; b = 0;
  } else if (t < 0.667) {
    const s = (t - 0.5) / 0.167;
    r = 0; g = 255; b = Math.floor(255 * s);
  } else if (t < 0.833) {
    const s = (t - 0.667) / 0.166;
    r = 0; g = Math.floor(255 * (1 - s)); b = 255;
  } else {
    const s = (t - 0.833) / 0.167;
    r = Math.floor(148 * s); g = 0; b = 255;
  }
  return [r, g, b];
}

/** Strike visual effect descriptor */
interface StrikeEffect {
  type: 'photoid' | 'dual-vector-foil' | 'cleaning';
  galaxy: Galaxy;
  startTime: number;
  duration: number;
}

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;

  // Connection line state
  selectedGalaxies: Galaxy[] = [];
  private connectionLine: { g1: Galaxy; g2: Galaxy } | null = null;

  // Active strike visual effects
  private strikeEffects: StrikeEffect[] = [];

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

  /** Add a strike visual effect */
  addStrikeEffect(type: 'photoid' | 'dual-vector-foil' | 'cleaning', galaxy: Galaxy): void {
    const duration = type === 'dual-vector-foil' ? 3000 : type === 'photoid' ? 1500 : 1200;
    this.strikeEffects.push({
      type,
      galaxy,
      startTime: performance.now(),
      duration,
    });
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
      if (sx < -20 || sx > w + 20 || sy < -20 || sy > h + 20) continue;
      projected.push({ galaxy, sx, sy, depth });
    }
    projected.sort((a, b) => a.depth - b.depth);

    for (const { galaxy, sx, sy, depth } of projected) {
      this.drawGalaxy(galaxy, sx, sy, depth, universe.radius);
    }

    // Draw strike effects
    this.drawStrikeEffects();

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

      if (galaxy.isStealth) {
        const pulse = 0.5 + 0.3 * Math.sin(Date.now() * 0.002);
        ctx.beginPath();
        ctx.arc(sx, sy, radius * 1.5, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha * pulse * 0.3})`;
        ctx.fill();
      }

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

      if (galaxy.isStealth) {
        ctx.beginPath();
        ctx.arc(sx, sy, radius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 150, 255, ${alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }
    }
  }

  /** Draw all active strike visual effects */
  private drawStrikeEffects(): void {
    const now = performance.now();
    // Remove expired effects
    this.strikeEffects = this.strikeEffects.filter(e => now - e.startTime < e.duration);

    for (const effect of this.strikeEffects) {
      const elapsed = now - effect.startTime;
      const progress = elapsed / effect.duration; // 0 → 1
      const [sx, sy] = this.camera.project(effect.galaxy.x, effect.galaxy.y, effect.galaxy.z);

      switch (effect.type) {
        case 'photoid':
          this.drawPhotoidEffect(sx, sy, progress);
          break;
        case 'dual-vector-foil':
          this.drawDualVectorFoilEffect(sx, sy, progress);
          break;
        case 'cleaning':
          this.drawCleaningEffect(sx, sy, progress);
          break;
      }
    }
  }

  /** Photoid (光粒): bright white-yellow flash + expanding ring */
  private drawPhotoidEffect(sx: number, sy: number, progress: number): void {
    const ctx = this.ctx;
    const alpha = Math.max(0, 1 - progress);

    // Central flash (bright at start, fades)
    if (progress < 0.3) {
      const flashAlpha = (1 - progress / 0.3);
      const flashRadius = 3 + progress * 30;
      const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, flashRadius);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
      gradient.addColorStop(0.4, `rgba(255, 255, 180, ${flashAlpha * 0.6})`);
      gradient.addColorStop(1, `rgba(255, 200, 50, 0)`);
      ctx.beginPath();
      ctx.arc(sx, sy, flashRadius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }

    // Expanding ring
    const ringRadius = 5 + progress * 80;
    const ringAlpha = alpha * 0.8;
    // Interpolate color: white → yellow → fade
    const r = 255;
    const g = Math.floor(255 - progress * 55); // 255 → 200
    const b = Math.floor(255 * (1 - progress * 2)); // white → yellow

    ctx.beginPath();
    ctx.arc(sx, sy, ringRadius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(${r}, ${Math.max(g, 0)}, ${Math.max(b, 0)}, ${ringAlpha})`;
    ctx.lineWidth = Math.max(0.5, 2.5 * (1 - progress));
    ctx.stroke();

    // Inner glow ring
    if (progress < 0.6) {
      const innerAlpha = (1 - progress / 0.6) * 0.3;
      ctx.beginPath();
      ctx.arc(sx, sy, ringRadius * 0.7, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 255, 200, ${innerAlpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }

  /** Dual-vector-foil (二向箔): expanding 2D plane that flattens space */
  private drawDualVectorFoilEffect(sx: number, sy: number, progress: number): void {
    const ctx = this.ctx;
    const alpha = Math.max(0, 1 - progress * 0.8);

    // Expanding ellipse (flattening plane)
    const maxWidth = 120;
    const maxHeight = 8; // Very flat - it's a 2D plane
    const width = progress * maxWidth;
    const height = maxHeight * (1 - progress * 0.5); // Gets even flatter

    ctx.save();
    ctx.translate(sx, sy);

    // Outer glow - deep purple/blue
    const glowAlpha = alpha * 0.4;
    const glowGrad = ctx.createRadialGradient(0, 0, width * 0.3, 0, 0, width * 1.2);
    glowGrad.addColorStop(0, `rgba(100, 40, 200, ${glowAlpha})`);
    glowGrad.addColorStop(0.5, `rgba(60, 20, 160, ${glowAlpha * 0.5})`);
    glowGrad.addColorStop(1, `rgba(30, 10, 120, 0)`);
    ctx.beginPath();
    ctx.ellipse(0, 0, width * 1.2, height * 4, 0, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    // Main plane - translucent rectangle/ellipse
    const planeAlpha = alpha * 0.6;
    ctx.beginPath();
    ctx.ellipse(0, 0, width, height, 0, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(120, 60, 220, ${planeAlpha})`;
    ctx.fill();

    // Iridescent edge
    ctx.beginPath();
    ctx.ellipse(0, 0, width, height, 0, 0, Math.PI * 2);
    // Shimmer between purple and blue
    const shimmer = Math.sin(progress * Math.PI * 6);
    const edgeR = Math.floor(100 + shimmer * 40);
    const edgeB = Math.floor(220 + shimmer * 35);
    ctx.strokeStyle = `rgba(${edgeR}, 80, ${Math.min(edgeB, 255)}, ${alpha * 0.8})`;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Grid-like pattern collapsing inside the plane
    if (progress > 0.1 && progress < 0.85) {
      const gridAlpha = alpha * 0.3 * Math.min(1, (progress - 0.1) / 0.2);
      const gridLines = 6;
      ctx.strokeStyle = `rgba(160, 120, 255, ${gridAlpha})`;
      ctx.lineWidth = 0.5;

      // Vertical grid lines (being compressed)
      for (let i = 1; i < gridLines; i++) {
        const frac = i / gridLines;
        const gx = (frac - 0.5) * width * 2;
        // Lines converge toward center as effect progresses
        const compress = 1 - progress * 0.6;
        const lineX = gx * compress;
        ctx.beginPath();
        ctx.moveTo(lineX, -height);
        ctx.lineTo(lineX, height);
        ctx.stroke();
      }

      // Horizontal line (the plane itself)
      ctx.beginPath();
      ctx.moveTo(-width, 0);
      ctx.lineTo(width, 0);
      ctx.strokeStyle = `rgba(180, 140, 255, ${gridAlpha * 1.5})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    }

    ctx.restore();
  }

  /** Cleaning strike: red-orange burst */
  private drawCleaningEffect(sx: number, sy: number, progress: number): void {
    const ctx = this.ctx;
    const alpha = Math.max(0, 1 - progress);

    // Burst
    const radius = 4 + progress * 50;
    const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius);
    gradient.addColorStop(0, `rgba(255, 80, 30, ${alpha * 0.7})`);
    gradient.addColorStop(0.5, `rgba(200, 40, 10, ${alpha * 0.3})`);
    gradient.addColorStop(1, `rgba(150, 20, 0, 0)`);
    ctx.beginPath();
    ctx.arc(sx, sy, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();

    // Ring
    ctx.beginPath();
    ctx.arc(sx, sy, radius * 1.1, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255, 100, 50, ${alpha * 0.5})`;
    ctx.lineWidth = Math.max(0.5, 2 * (1 - progress));
    ctx.stroke();
  }

  private drawConnectionLine(g1: Galaxy, g2: Galaxy): void {
    const ctx = this.ctx;
    const [sx1, sy1] = this.camera.project(g1.x, g1.y, g1.z);
    const [sx2, sy2] = this.camera.project(g2.x, g2.y, g2.z);

    ctx.beginPath();
    ctx.setLineDash([6, 4]);
    ctx.moveTo(sx1, sy1);
    ctx.lineTo(sx2, sy2);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.setLineDash([]);

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

    const tw = ctx.measureText(label).width;
    ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    ctx.fillRect(mx - tw / 2 - 4, my - 8, tw + 8, 16);
    ctx.fillStyle = '#fff';
    ctx.fillText(label, mx, my + 4);
  }

  /** Find galaxy near screen position */
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
