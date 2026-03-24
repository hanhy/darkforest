/** Galaxy sprite textures for different civilization levels */
export class GalaxySprites {
  private static sprites: Map<number, HTMLCanvasElement> = new Map();
  private static initialized = false;

  /** Initialize all galaxy sprites */
  static init(): void {
    if (this.initialized) return;

    // Level 0-2: Basic spiral galaxies
    this.sprites.set(0, this.createSpiralGalaxy([150, 150, 150], 1));
    this.sprites.set(1, this.createSpiralGalaxy([255, 200, 100], 1.2));
    this.sprites.set(2, this.createSpiralGalaxy([255, 180, 80], 1.4));

    // Level 3-5: Developed spiral with arms
    this.sprites.set(3, this.createDevelopedSpiral([255, 150, 50], 1.6));
    this.sprites.set(4, this.createDevelopedSpiral([255, 120, 30], 1.8));
    this.sprites.set(5, this.createDevelopedSpiral([255, 100, 20], 2));

    // Level 6-8: Grand design spiral with bright core
    this.sprites.set(6, this.createGrandDesignSpiral([255, 80, 30], 2.2));
    this.sprites.set(7, this.createGrandDesignSpiral([255, 60, 20], 2.5));
    this.sprites.set(8, this.createGrandDesignSpiral([255, 50, 100], 2.8));

    // Level 9-10: Elliptical with intense core glow
    this.sprites.set(9, this.createElliptical([180, 80, 255], 3));
    this.sprites.set(10, this.createElliptical([150, 50, 255], 3.5));

    this.initialized = true;
  }

  /** Get sprite for civilization level */
  static getSprite(level: number): HTMLCanvasElement | null {
    if (!this.initialized) this.init();
    const clampedLevel = Math.min(Math.max(Math.floor(level), 0), 10);
    return this.sprites.get(clampedLevel) || null;
  }

  /** Create basic spiral galaxy sprite */
  private static createSpiralGalaxy(color: [number, number, number], scale: number): HTMLCanvasElement {
    const size = 64 * scale;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const center = size / 2;

    // Outer glow
    const glowGradient = ctx.createRadialGradient(center, center, 0, center, center, size * 0.45);
    glowGradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.3)`);
    glowGradient.addColorStop(0.5, `rgba(${color[0] * 0.7}, ${color[1] * 0.7}, ${color[2] * 0.8}, 0.15)`);
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(center, center, size * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Spiral arms (2 arms)
    ctx.save();
    ctx.translate(center, center);
    for (let arm = 0; arm < 2; arm++) {
      ctx.rotate((arm / 2) * Math.PI);
      this.drawSpiralArm(ctx, color, size, 0.4);
    }
    ctx.restore();

    // Bright core
    const coreGradient = ctx.createRadialGradient(center, center, 0, center, center, size * 0.15);
    coreGradient.addColorStop(0, `rgba(${Math.min(color[0] + 100, 255)}, ${Math.min(color[1] + 100, 255)}, ${Math.min(color[2] + 100, 255)}, 0.9)`);
    coreGradient.addColorStop(0.5, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.6)`);
    coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(center, center, size * 0.15, 0, Math.PI * 2);
    ctx.fillStyle = coreGradient;
    ctx.fill();

    return canvas;
  }

  /** Create developed spiral galaxy with more arms */
  private static createDevelopedSpiral(color: [number, number, number], scale: number): HTMLCanvasElement {
    const size = 64 * scale;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const center = size / 2;

    // Outer glow
    const glowGradient = ctx.createRadialGradient(center, center, 0, center, center, size * 0.48);
    glowGradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.35)`);
    glowGradient.addColorStop(0.6, `rgba(${color[0] * 0.6}, ${color[1] * 0.6}, ${color[2] * 0.7}, 0.15)`);
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(center, center, size * 0.48, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Spiral arms (3-4 arms)
    ctx.save();
    ctx.translate(center, center);
    const armCount = 3 + Math.floor(scale);
    for (let arm = 0; arm < armCount; arm++) {
      ctx.rotate((arm / armCount) * Math.PI * 2);
      this.drawSpiralArm(ctx, color, size, 0.5, arm * 0.3);
    }
    ctx.restore();

    // Bright core with star cluster effect
    const coreGradient = ctx.createRadialGradient(center, center, 0, center, center, size * 0.18);
    coreGradient.addColorStop(0, `rgba(${Math.min(color[0] + 120, 255)}, ${Math.min(color[1] + 100, 255)}, ${Math.min(color[2] + 80, 255)}, 0.95)`);
    coreGradient.addColorStop(0.4, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.7)`);
    coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(center, center, size * 0.18, 0, Math.PI * 2);
    ctx.fillStyle = coreGradient;
    ctx.fill();

    // Add some star dots in core
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const dist = size * 0.08;
      const starX = center + Math.cos(angle) * dist;
      const starY = center + Math.sin(angle) * dist;
      ctx.beginPath();
      ctx.arc(starX, starY, size * 0.02, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Math.min(color[0] + 50, 255)}, ${Math.min(color[1] + 50, 255)}, ${Math.min(color[2] + 50, 255)}, 0.8)`;
      ctx.fill();
    }

    return canvas;
  }

  /** Create grand design spiral galaxy */
  private static createGrandDesignSpiral(color: [number, number, number], scale: number): HTMLCanvasElement {
    const size = 64 * scale;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const center = size / 2;

    // Extended outer glow
    const glowGradient = ctx.createRadialGradient(center, center, 0, center, center, size * 0.5);
    glowGradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.4)`);
    glowGradient.addColorStop(0.4, `rgba(${color[0] * 0.8}, ${color[1] * 0.8}, ${color[2] * 0.9}, 0.2)`);
    glowGradient.addColorStop(0.7, `rgba(${color[0] * 0.5}, ${color[1] * 0.5}, ${color[2] * 0.6}, 0.1)`);
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(center, center, size * 0.5, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Prominent spiral arms (2-3 major arms)
    ctx.save();
    ctx.translate(center, center);
    const armCount = 2;
    for (let arm = 0; arm < armCount; arm++) {
      ctx.rotate((arm / armCount) * Math.PI * 2);
      this.drawProminentSpiralArm(ctx, color, size, 0.6);
    }
    ctx.restore();

    // Intense bright core
    const coreGradient = ctx.createRadialGradient(center, center, 0, center, center, size * 0.22);
    coreGradient.addColorStop(0, `rgba(${Math.min(color[0] + 150, 255)}, ${Math.min(color[1] + 120, 255)}, ${Math.min(color[2] + 100, 255)}, 1)`);
    coreGradient.addColorStop(0.3, `rgba(${color[0] + 50}, ${color[1] + 40}, ${color[2] + 30}, 0.8)`);
    coreGradient.addColorStop(0.6, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.6)`);
    coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.arc(center, center, size * 0.22, 0, Math.PI * 2);
    ctx.fillStyle = coreGradient;
    ctx.fill();

    // Core star clusters
    for (let ring = 0; ring < 2; ring++) {
      const ringCount = 6 + ring * 3;
      const ringDist = size * (0.1 + ring * 0.05);
      for (let i = 0; i < ringCount; i++) {
        const angle = (i / ringCount) * Math.PI * 2 + ring * 0.3;
        const starX = center + Math.cos(angle) * ringDist;
        const starY = center + Math.sin(angle) * ringDist;
        ctx.beginPath();
        ctx.arc(starX, starY, size * (0.025 - ring * 0.005), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${Math.min(color[0] + 80, 255)}, ${Math.min(color[1] + 60, 255)}, ${Math.min(color[2] + 40, 255)}, ${0.7 - ring * 0.15})`;
        ctx.fill();
      }
    }

    return canvas;
  }

  /** Create elliptical galaxy */
  private static createElliptical(color: [number, number, number], scale: number): HTMLCanvasElement {
    const size = 64 * scale;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d')!;
    const center = size / 2;

    // Large diffuse glow
    const glowGradient = ctx.createRadialGradient(center, center, 0, center, center, size * 0.48);
    glowGradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.5)`);
    glowGradient.addColorStop(0.3, `rgba(${color[0] * 0.9}, ${color[1] * 0.85}, ${color[2] * 0.8}, 0.3)`);
    glowGradient.addColorStop(0.6, `rgba(${color[0] * 0.6}, ${color[1] * 0.55}, ${color[2] * 0.5}, 0.15)`);
    glowGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.ellipse(center, center, size * 0.45, size * 0.38, 0, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Bright elliptical core
    const coreGradient = ctx.createRadialGradient(center, center, 0, center, center, size * 0.25);
    coreGradient.addColorStop(0, `rgba(${Math.min(color[0] + 180, 255)}, ${Math.min(color[1] + 150, 255)}, ${Math.min(color[2] + 120, 255)}, 1)`);
    coreGradient.addColorStop(0.2, `rgba(${color[0] + 80}, ${color[1] + 60}, ${color[2] + 50}, 0.9)`);
    coreGradient.addColorStop(0.5, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.7)`);
    coreGradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.beginPath();
    ctx.ellipse(center, center, size * 0.22, size * 0.18, 0, 0, Math.PI * 2);
    ctx.fillStyle = coreGradient;
    ctx.fill();

    // Dense star field in core
    for (let i = 0; i < 30; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * size * 0.18;
      const starX = center + Math.cos(angle) * dist * 0.8;
      const starY = center + Math.sin(angle) * dist * 0.6;
      const starSize = Math.random() * size * 0.02 + size * 0.01;
      ctx.beginPath();
      ctx.arc(starX, starY, starSize, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Math.min(color[0] + 100, 255)}, ${Math.min(color[1] + 80, 255)}, ${Math.min(color[2] + 60, 255)}, ${0.5 + Math.random() * 0.4})`;
      ctx.fill();
    }

    return canvas;
  }

  /** Draw a spiral arm */
  private static drawSpiralArm(ctx: CanvasRenderingContext2D, color: [number, number, number], size: number, opacity: number, twist: number = 0): void {
    const armLength = size * 0.35;
    ctx.save();

    const gradient = ctx.createLinearGradient(0, 0, armLength, 0);
    gradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity * 0.8})`);
    gradient.addColorStop(0.5, `rgba(${color[0] * 0.8}, ${color[1] * 0.75}, ${color[2] * 0.7}, ${opacity * 0.4})`);
    gradient.addColorStop(1, `rgba(${color[0] * 0.5}, ${color[1] * 0.45}, ${color[2] * 0.4}, 0)`);

    ctx.beginPath();
    ctx.moveTo(0, 0);

    // Spiral curve
    for (let t = 0; t <= 1; t += 0.05) {
      const spiralAngle = t * Math.PI * (0.8 + twist);
      const radius = t * armLength;
      const x = Math.cos(spiralAngle) * radius;
      const y = Math.sin(spiralAngle) * radius * 0.3; // Flatten the spiral
      ctx.lineTo(x, y);
    }

    ctx.strokeStyle = gradient;
    ctx.lineWidth = size * 0.08;
    ctx.lineCap = 'round';
    ctx.stroke();

    ctx.restore();
  }

  /** Draw a prominent spiral arm */
  private static drawProminentSpiralArm(ctx: CanvasRenderingContext2D, color: [number, number, number], size: number, opacity: number): void {
    const armLength = size * 0.45;
    ctx.save();

    // Main arm
    const gradient = ctx.createLinearGradient(0, 0, armLength, 0);
    gradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, ${opacity * 0.9})`);
    gradient.addColorStop(0.3, `rgba(${color[0] * 0.9}, ${color[1] * 0.85}, ${color[2] * 0.8}, ${opacity * 0.6})`);
    gradient.addColorStop(0.7, `rgba(${color[0] * 0.7}, ${color[1] * 0.65}, ${color[2] * 0.6}, ${opacity * 0.3})`);
    gradient.addColorStop(1, `rgba(${color[0] * 0.4}, ${color[1] * 0.35}, ${color[2] * 0.3}, 0)`);

    ctx.beginPath();
    ctx.moveTo(0, 0);

    // Wider spiral curve with dust lanes
    for (let t = 0; t <= 1; t += 0.02) {
      const spiralAngle = t * Math.PI * 1.2;
      const radius = t * armLength;
      const x = Math.cos(spiralAngle) * radius;
      const y = Math.sin(spiralAngle) * radius * 0.35;
      const width = size * (0.12 - t * 0.06);

      ctx.lineTo(x, y);
    }

    ctx.strokeStyle = gradient;
    ctx.lineWidth = size * 0.12;
    ctx.lineCap = 'round';
    ctx.stroke();

    // Add star clusters along the arm
    for (let i = 0; i < 5; i++) {
      const t = 0.2 + i * 0.15;
      const spiralAngle = t * Math.PI * 1.2;
      const radius = t * armLength;
      const x = Math.cos(spiralAngle) * radius;
      const y = Math.sin(spiralAngle) * radius * 0.35;

      ctx.beginPath();
      ctx.arc(x, y, size * (0.04 - t * 0.015), 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${Math.min(color[0] + 50, 255)}, ${Math.min(color[1] + 40, 255)}, ${Math.min(color[2] + 30, 255)}, ${opacity * 0.6})`;
      ctx.fill();
    }

    ctx.restore();
  }
}
