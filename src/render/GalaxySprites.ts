/** Galaxy sprite textures for different civilization levels */
export class GalaxySprites {
  private static sprites: Map<number, HTMLCanvasElement> = new Map();
  private static initialized = false;

  /** Initialize all galaxy sprites */
  static init(): void {
    if (this.initialized) return;

    this.sprites.set(0, this.createSimpleSpiral([150, 150, 150], 0.9, 0.18));
    this.sprites.set(1, this.createSimpleSpiral([255, 200, 100], 1, 0.2));
    this.sprites.set(2, this.createSimpleSpiral([255, 180, 80], 1.05, 0.22));

    this.sprites.set(3, this.createBandedSpiral([255, 150, 50], 1.15, 3));
    this.sprites.set(4, this.createBandedSpiral([255, 120, 30], 1.2, 3));
    this.sprites.set(5, this.createBandedSpiral([255, 100, 20], 1.25, 4));

    this.sprites.set(6, this.createCoreHalo([255, 80, 30], 1.35, 0.22));
    this.sprites.set(7, this.createCoreHalo([255, 60, 20], 1.45, 0.24));
    this.sprites.set(8, this.createCoreHalo([255, 50, 100], 1.55, 0.26));

    this.sprites.set(9, this.createElliptical([180, 80, 255], 1.65));
    this.sprites.set(10, this.createElliptical([150, 50, 255], 1.8));

    this.initialized = true;
  }

  /** Get sprite for civilization level */
  static getSprite(level: number): HTMLCanvasElement | null {
    if (!this.initialized) this.init();
    const clampedLevel = Math.min(Math.max(Math.floor(level), 0), 10);
    return this.sprites.get(clampedLevel) || null;
  }

  private static createCanvas(scale: number): [HTMLCanvasElement, CanvasRenderingContext2D, number] {
    const size = Math.round(48 * scale);
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    return [canvas, ctx, size];
  }

  private static createSimpleSpiral(
    color: [number, number, number],
    scale: number,
    coreRadius: number
  ): HTMLCanvasElement {
    const [canvas, ctx, size] = this.createCanvas(scale);
    const center = size / 2;

    this.fillGlow(ctx, center, center, size * 0.42, color, [0.22, 0.1, 0]);
    this.drawSoftArms(ctx, center, center, size, color, 2, size * 0.09, 0.7);
    this.fillCore(ctx, center, center, size * coreRadius, color, 0.88);

    return canvas;
  }

  private static createBandedSpiral(
    color: [number, number, number],
    scale: number,
    armCount: number
  ): HTMLCanvasElement {
    const [canvas, ctx, size] = this.createCanvas(scale);
    const center = size / 2;

    this.fillGlow(ctx, center, center, size * 0.45, color, [0.28, 0.14, 0]);
    this.drawDisk(ctx, center, center, size * 0.28, color, 0.18);
    this.drawSoftArms(ctx, center, center, size, color, armCount, size * 0.075, 0.95);
    this.fillCore(ctx, center, center, size * 0.2, color, 0.94);

    return canvas;
  }

  private static createCoreHalo(
    color: [number, number, number],
    scale: number,
    coreRadius: number
  ): HTMLCanvasElement {
    const [canvas, ctx, size] = this.createCanvas(scale);
    const center = size / 2;

    this.fillGlow(ctx, center, center, size * 0.48, color, [0.34, 0.2, 0]);
    this.drawDisk(ctx, center, center, size * 0.32, color, 0.2);
    this.drawSoftArms(ctx, center, center, size, color, 2, size * 0.1, 1.2);
    this.fillCore(ctx, center, center, size * coreRadius, color, 1);
    this.drawRing(ctx, center, center, size * 0.18, size * 0.03, color, 0.2);

    return canvas;
  }

  private static createElliptical(color: [number, number, number], scale: number): HTMLCanvasElement {
    const [canvas, ctx, size] = this.createCanvas(scale);
    const center = size / 2;

    const glow = ctx.createRadialGradient(center, center, 0, center, center, size * 0.48);
    glow.addColorStop(0, this.rgba(color, 0.4));
    glow.addColorStop(0.45, this.rgba(this.tint(color, 0.82), 0.18));
    glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.ellipse(center, center, size * 0.43, size * 0.34, 0, 0, Math.PI * 2);
    ctx.fillStyle = glow;
    ctx.fill();

    const body = ctx.createRadialGradient(center, center, 0, center, center, size * 0.3);
    body.addColorStop(0, this.rgba(this.tint(color, 1.35), 0.96));
    body.addColorStop(0.55, this.rgba(color, 0.62));
    body.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.ellipse(center, center, size * 0.28, size * 0.2, 0, 0, Math.PI * 2);
    ctx.fillStyle = body;
    ctx.fill();

    this.drawRing(ctx, center, center, size * 0.18, size * 0.035, color, 0.18);
    return canvas;
  }

  private static fillGlow(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: [number, number, number],
    alphaStops: [number, number, number]
  ): void {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, this.rgba(color, alphaStops[0]));
    gradient.addColorStop(0.55, this.rgba(this.tint(color, 0.72), alphaStops[1]));
    gradient.addColorStop(1, `rgba(${Math.floor(color[0] * 0.45)}, ${Math.floor(color[1] * 0.45)}, ${Math.floor(color[2] * 0.5)}, ${alphaStops[2]})`);
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  private static drawDisk(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: [number, number, number],
    alpha: number
  ): void {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, this.rgba(this.tint(color, 1.1), alpha));
    gradient.addColorStop(0.7, this.rgba(this.tint(color, 0.8), alpha * 0.45));
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  private static fillCore(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    color: [number, number, number],
    alpha: number
  ): void {
    const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
    gradient.addColorStop(0, this.rgba(this.tint(color, 1.45), alpha));
    gradient.addColorStop(0.55, this.rgba(color, alpha * 0.6));
    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
  }

  private static drawSoftArms(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    size: number,
    color: [number, number, number],
    armCount: number,
    width: number,
    turnAmount: number
  ): void {
    ctx.save();
    ctx.translate(x, y);

    for (let arm = 0; arm < armCount; arm++) {
      ctx.save();
      ctx.rotate((arm / armCount) * Math.PI * 2);

      const path = new Path2D();
      for (let i = 0; i <= 16; i++) {
        const t = i / 16;
        const angle = t * Math.PI * turnAmount;
        const radius = size * (0.08 + t * 0.28);
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius * 0.42;
        if (i === 0) path.moveTo(px, py);
        else path.lineTo(px, py);
      }

      const gradient = ctx.createLinearGradient(0, 0, size * 0.38, 0);
      gradient.addColorStop(0, this.rgba(this.tint(color, 1.05), 0.5));
      gradient.addColorStop(0.55, this.rgba(this.tint(color, 0.8), 0.22));
      gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.strokeStyle = gradient;
      ctx.lineWidth = width;
      ctx.lineCap = 'round';
      ctx.stroke(path);
      ctx.restore();
    }

    ctx.restore();
  }

  private static drawRing(
    ctx: CanvasRenderingContext2D,
    x: number,
    y: number,
    radius: number,
    width: number,
    color: [number, number, number],
    alpha: number
  ): void {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.strokeStyle = this.rgba(this.tint(color, 1.1), alpha);
    ctx.lineWidth = width;
    ctx.stroke();
  }

  private static tint(color: [number, number, number], factor: number): [number, number, number] {
    return [
      Math.min(255, Math.round(color[0] * factor)),
      Math.min(255, Math.round(color[1] * factor)),
      Math.min(255, Math.round(color[2] * factor)),
    ];
  }

  private static rgba(color: [number, number, number], alpha: number): string {
    return `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${alpha})`;
  }
}
