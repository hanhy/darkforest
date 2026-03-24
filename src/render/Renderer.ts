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

/** Background star particle */
interface StarParticle {
  x: number;
  y: number;
  z: number;
  size: number;
  brightness: number;
  twinkleSpeed: number;
  twinkleOffset: number;
}

/** Nebula cloud for background */
interface NebulaCloud {
  x: number;
  y: number;
  z: number;
  radius: number;
  color: [number, number, number];
  alpha: number;
  driftSpeed: number;
  driftAngle: number;
}

export class Renderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private camera: Camera;

  // Background stars and nebula
  private stars: StarParticle[] = [];
  private nebulae: NebulaCloud[] = [];
  private backgroundInitialized = false;

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
    this.initBackground();
  }

  private initBackground(): void {
    // Initialize background stars
    this.stars = [];
    for (let i = 0; i < 300; i++) {
      this.stars.push({
        x: Math.random() * 2 - 1,
        y: Math.random() * 2 - 1,
        z: Math.random() * 2 - 1,
        size: 0.3 + Math.random() * 1.5,
        brightness: 0.3 + Math.random() * 0.7,
        twinkleSpeed: 0.02 + Math.random() * 0.05,
        twinkleOffset: Math.random() * Math.PI * 2,
      });
    }

    // Initialize nebula clouds
    this.nebulae = [];
    const nebulaColors: Array<[number, number, number]> = [
      [100, 50, 200],   // Purple
      [50, 100, 200],   // Blue
      [200, 50, 150],   // Pink
      [50, 200, 150],   // Teal
      [200, 100, 50],   // Orange
    ];
    for (let i = 0; i < 5; i++) {
      const color = nebulaColors[Math.floor(Math.random() * nebulaColors.length)];
      this.nebulae.push({
        x: (Math.random() - 0.5) * 1.5,
        y: (Math.random() - 0.5) * 1.5,
        z: (Math.random() - 0.5) * 1.5,
        radius: 0.3 + Math.random() * 0.5,
        color,
        alpha: 0.03 + Math.random() * 0.05,
        driftSpeed: 0.0001 + Math.random() * 0.0002,
        driftAngle: Math.random() * Math.PI * 2,
      });
    }

    this.backgroundInitialized = true;
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

    // Draw background with gradient and nebula
    this.drawBackground(w, h);

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

  private drawBackground(w: number, h: number): void {
    const { ctx } = this;

    // Deep space gradient background
    const gradient = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.8);
    gradient.addColorStop(0, '#0a0a1a');
    gradient.addColorStop(0.5, '#050510');
    gradient.addColorStop(1, '#020208');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, w, h);

    // Draw nebula clouds (behind stars)
    this.drawNebulae(w, h);

    // Draw twinkling stars
    this.drawStars(w, h);
  }

  private drawStars(w: number, h: number): void {
    const { ctx } = this;
    const time = Date.now() * 0.001;

    for (const star of this.stars) {
      const [sx, sy] = this.camera.project(
        star.x * this.camera.zoom * 500,
        star.y * this.camera.zoom * 500,
        star.z * this.camera.zoom * 500
      );

      if (sx < -10 || sx > w + 10 || sy < -10 || sy > h + 10) continue;

      // Twinkle effect
      const twinkle = Math.sin(time * star.twinkleSpeed + star.twinkleOffset);
      const brightness = star.brightness * (0.7 + 0.3 * twinkle);

      // Star glow
      const glowRadius = star.size * (1.5 + twinkle * 0.5);
      const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowRadius * 2);
      gradient.addColorStop(0, `rgba(255, 255, 255, ${brightness * 0.8})`);
      gradient.addColorStop(0.4, `rgba(200, 220, 255, ${brightness * 0.3})`);
      gradient.addColorStop(1, 'rgba(150, 180, 255, 0)');

      ctx.beginPath();
      ctx.arc(sx, sy, glowRadius * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();

      // Star core
      ctx.beginPath();
      ctx.arc(sx, sy, star.size * 0.8, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${brightness})`;
      ctx.fill();
    }
  }

  private drawNebulae(w: number, h: number): void {
    const { ctx } = this;

    for (const nebula of this.nebulae) {
      // Update nebula position (slow drift)
      nebula.x += Math.cos(nebula.driftAngle) * nebula.driftSpeed;
      nebula.y += Math.sin(nebula.driftAngle) * nebula.driftSpeed;

      const [sx, sy] = this.camera.project(
        nebula.x * this.camera.zoom * 800,
        nebula.y * this.camera.zoom * 800,
        nebula.z * this.camera.zoom * 800
      );

      const radius = nebula.radius * Math.min(w, h) * 0.8;

      // Soft nebula gradient
      const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, radius);
      const [r, g, b] = nebula.color;
      gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${nebula.alpha * 1.5})`);
      gradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${nebula.alpha})`);
      gradient.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${nebula.alpha * 0.3})`);
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    }
  }

  private drawGalaxy(galaxy: Galaxy, sx: number, sy: number, depth: number, universeRadius: number): void {
    const ctx = this.ctx;
    const maxDepth = universeRadius;
    const depthFactor = 1 - Math.max(0, Math.min(1, (depth + maxDepth) / (2 * maxDepth))) * 0.5;

    if (!galaxy.hasCivilization) {
      // Empty galaxy: subtle glow with depth-based size
      const baseSize = 1.2 + depthFactor * 0.8;
      const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, baseSize * 2);
      gradient.addColorStop(0, `rgba(120, 120, 140, ${0.4 * depthFactor})`);
      gradient.addColorStop(0.5, `rgba(80, 80, 100, ${0.2 * depthFactor})`);
      gradient.addColorStop(1, 'rgba(60, 60, 80, 0)');
      ctx.beginPath();
      ctx.arc(sx, sy, baseSize * 2, 0, Math.PI * 2);
      ctx.fillStyle = gradient;
      ctx.fill();
    } else {
      const level = galaxy.civilizationLevel;
      const t = Math.min(level / 10, 1);
      const radius = galaxy.getRadius();
      const [r, g, b, baseAlpha] = galaxy.getColor();
      const alpha = baseAlpha * depthFactor;

      // Animated pulse for civilizations
      const pulse = 0.95 + 0.1 * Math.sin(Date.now() * 0.003 + level * 0.5);

      if (galaxy.isStealth) {
        // Stealth: subtle pulsing ring with blue tint
        const stealthPulse = 0.4 + 0.3 * Math.sin(Date.now() * 0.002);
        
        // Outer stealth field
        const stealthGradient = ctx.createRadialGradient(sx, sy, radius * 0.5, sx, sy, radius * 3);
        stealthGradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, 0)`);
        stealthGradient.addColorStop(0.3, `rgba(${r}, ${g}, ${b}, ${alpha * stealthPulse * 0.15})`);
        stealthGradient.addColorStop(0.6, `rgba(100, 150, 255, ${alpha * stealthPulse * 0.08})`);
        stealthGradient.addColorStop(1, 'rgba(80, 120, 200, 0)');
        ctx.beginPath();
        ctx.arc(sx, sy, radius * 3, 0, Math.PI * 2);
        ctx.fillStyle = stealthGradient;
        ctx.fill();

        // Stealth ring
        ctx.beginPath();
        ctx.arc(sx, sy, radius * 1.8, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(100, 150, 255, ${alpha * stealthPulse * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      if (galaxy.shouldShowGlow()) {
        // Enhanced glow for high-level civilizations
        const glowTime = Date.now() * 0.002;
        const glowPulse = 1 + 0.2 * Math.sin(glowTime);
        
        // Multi-layer glow
        const outerGlowRadius = radius * 4 * glowPulse;
        const midGlowRadius = radius * 2.5;
        
        // Outer glow
        const outerGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, outerGlowRadius);
        outerGlow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.12})`);
        outerGlow.addColorStop(0.4, `rgba(${Math.floor(r * 0.7)}, ${Math.floor(g * 0.7)}, ${Math.floor(b * 0.9)}, ${alpha * 0.06})`);
        outerGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(sx, sy, outerGlowRadius, 0, Math.PI * 2);
        ctx.fillStyle = outerGlow;
        ctx.fill();

        // Mid glow
        const midGlow = ctx.createRadialGradient(sx, sy, 0, sx, sy, midGlowRadius);
        midGlow.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${alpha * 0.2})`);
        midGlow.addColorStop(0.7, `rgba(${r}, ${g}, ${b}, ${alpha * 0.08})`);
        midGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
        ctx.beginPath();
        ctx.arc(sx, sy, midGlowRadius, 0, Math.PI * 2);
        ctx.fillStyle = midGlow;
        ctx.fill();
      }

      // Core galaxy body with gradient
      const coreGradient = ctx.createRadialGradient(
        sx - radius * 0.3, sy - radius * 0.3, 0,
        sx, sy, radius
      );
      coreGradient.addColorStop(0, `rgba(${Math.min(r + 50, 255)}, ${Math.min(g + 50, 255)}, ${Math.min(b + 50, 255)}, ${alpha * pulse})`);
      coreGradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${alpha * pulse})`);
      coreGradient.addColorStop(1, `rgba(${Math.floor(r * 0.7)}, ${Math.floor(g * 0.7)}, ${Math.floor(b * 0.8)}, ${alpha * pulse * 0.8})`);
      
      ctx.beginPath();
      ctx.arc(sx, sy, radius, 0, Math.PI * 2);
      ctx.fillStyle = coreGradient;
      ctx.fill();

      // Spiral arms hint for high-level civs
      if (level >= 7) {
        this.drawSpiralArms(sx, sy, radius, [r, g, b], alpha, level);
      }
    }
  }

  private drawSpiralArms(sx: number, sy: number, radius: number, color: [number, number, number], alpha: number, level: number): void {
    const ctx = this.ctx;
    const armCount = 3 + Math.floor(level / 3);
    const time = Date.now() * 0.0005;

    for (let i = 0; i < armCount; i++) {
      const angle = (i / armCount) * Math.PI * 2 + time;
      const armLength = radius * (1.5 + level * 0.1);
      
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(angle);

      const armGradient = ctx.createLinearGradient(0, 0, armLength, 0);
      armGradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha * 0.4})`);
      armGradient.addColorStop(0.5, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha * 0.15})`);
      armGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.quadraticCurveTo(
        armLength * 0.5, Math.sin(time * 0.5) * 5,
        armLength, Math.sin(time) * 8
      );
      ctx.lineTo(armLength, Math.sin(time) * 8 + 2);
      ctx.quadraticCurveTo(
        armLength * 0.5, Math.sin(time * 0.5) * 5 + 2,
        0, 2
      );
      ctx.closePath();
      ctx.fillStyle = armGradient;
      ctx.fill();

      ctx.restore();
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

    const time = Date.now() * 0.002;
    const dx = sx2 - sx1;
    const dy = sy2 - sy1;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Animated energy flow along the connection
    const flowSpeed = 0.003;
    const flowOffset = (time * flowSpeed) % 1;

    // Draw glow behind the line
    ctx.beginPath();
    ctx.moveTo(sx1, sy1);
    ctx.lineTo(sx2, sy2);
    ctx.strokeStyle = 'rgba(100, 150, 255, 0.15)';
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Main dashed connection line with gradient effect
    ctx.save();
    ctx.translate(sx1, sy1);
    ctx.rotate(angle);

    // Draw multiple dash patterns for animated effect
    const dashPattern = [8, 6];
    const totalDash = dashPattern[0] + dashPattern[1];
    const numDashes = Math.ceil(dist / totalDash);

    for (let i = 0; i < numDashes; i++) {
      const dashStart = i * totalDash + (flowOffset * totalDash);
      if (dashStart > dist) break;

      const gradient = ctx.createLinearGradient(dashStart, 0, dashStart + dashPattern[0], 0);
      gradient.addColorStop(0, 'rgba(100, 180, 255, 0.2)');
      gradient.addColorStop(0.5, 'rgba(150, 200, 255, 0.6)');
      gradient.addColorStop(1, 'rgba(200, 220, 255, 0.3)');

      ctx.beginPath();
      ctx.moveTo(dashStart, 0);
      ctx.lineTo(Math.min(dashStart + dashPattern[0], dist), 0);
      ctx.strokeStyle = gradient;
      ctx.lineWidth = 2;
      ctx.stroke();
    }

    ctx.restore();

    // Endpoint highlights
    const highlightPulse = 0.7 + 0.3 * Math.sin(time * 2);
    
    // Start point
    const startGradient = ctx.createRadialGradient(sx1, sy1, 0, sx1, sy1, 6);
    startGradient.addColorStop(0, `rgba(100, 200, 255, ${highlightPulse * 0.4})`);
    startGradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
    ctx.beginPath();
    ctx.arc(sx1, sy1, 6, 0, Math.PI * 2);
    ctx.fillStyle = startGradient;
    ctx.fill();

    // End point
    const endGradient = ctx.createRadialGradient(sx2, sy2, 0, sx2, sy2, 6);
    endGradient.addColorStop(0, `rgba(100, 200, 255, ${highlightPulse * 0.4})`);
    endGradient.addColorStop(1, 'rgba(100, 200, 255, 0)');
    ctx.beginPath();
    ctx.arc(sx2, sy2, 6, 0, Math.PI * 2);
    ctx.fillStyle = endGradient;
    ctx.fill();

    // Distance label with enhanced styling
    const actualDist = g1.distanceTo(g2);
    const mx = (sx1 + sx2) / 2;
    const my = (sy1 + sy2) / 2;

    let label: string;
    if (actualDist >= 1_000_000) {
      label = `${(actualDist / 1_000_000).toFixed(1)}M ly`;
    } else if (actualDist >= 1_000) {
      label = `${(actualDist / 1_000).toFixed(1)}K ly`;
    } else {
      label = `${actualDist.toFixed(0)} ly`;
    }

    ctx.font = '11px Courier New';
    
    // Label background with gradient
    const tw = ctx.measureText(label).width;
    const labelGradient = ctx.createLinearGradient(mx - tw / 2 - 6, my - 10, mx + tw / 2 + 6, my + 10);
    labelGradient.addColorStop(0, 'rgba(20, 30, 50, 0.85)');
    labelGradient.addColorStop(0.5, 'rgba(30, 50, 80, 0.9)');
    labelGradient.addColorStop(1, 'rgba(20, 30, 50, 0.85)');
    
    ctx.fillStyle = labelGradient;
    ctx.beginPath();
    ctx.roundRect(mx - tw / 2 - 6, my - 10, tw + 12, 18, 4);
    ctx.fill();

    // Label border
    ctx.strokeStyle = 'rgba(100, 180, 255, 0.5)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(mx - tw / 2 - 6, my - 10, tw + 12, 18, 4);
    ctx.stroke();

    // Label text with glow
    ctx.shadowColor = 'rgba(100, 180, 255, 0.8)';
    ctx.shadowBlur = 4;
    ctx.fillStyle = 'rgba(180, 220, 255, 0.95)';
    ctx.textAlign = 'center';
    ctx.fillText(label, mx, my + 4);
    ctx.shadowBlur = 0;
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
