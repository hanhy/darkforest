export class Camera {
  offsetX: number = 0;
  offsetY: number = 0;
  scale: number = 1;

  private canvas: HTMLCanvasElement;
  private dragging: boolean = false;
  private lastMouseX: number = 0;
  private lastMouseY: number = 0;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.bindEvents();
  }

  private bindEvents(): void {
    this.canvas.addEventListener('wheel', (e) => {
      e.preventDefault();
      const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;

      // Zoom towards mouse position
      const rect = this.canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      const worldX = (mouseX - this.offsetX) / this.scale;
      const worldY = (mouseY - this.offsetY) / this.scale;

      this.scale *= zoomFactor;

      this.offsetX = mouseX - worldX * this.scale;
      this.offsetY = mouseY - worldY * this.scale;
    }, { passive: false });

    this.canvas.addEventListener('mousedown', (e) => {
      this.dragging = true;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;
      this.offsetX += dx;
      this.offsetY += dy;
      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.dragging = false;
    });
  }

  /** Convert world coordinates to screen coordinates */
  worldToScreen(wx: number, wy: number): [number, number] {
    return [
      wx * this.scale + this.offsetX,
      wy * this.scale + this.offsetY,
    ];
  }

  /** Convert screen coordinates to world coordinates */
  screenToWorld(sx: number, sy: number): [number, number] {
    return [
      (sx - this.offsetX) / this.scale,
      (sy - this.offsetY) / this.scale,
    ];
  }

  /** Center the camera on the universe */
  centerOn(canvasWidth: number, canvasHeight: number, universeRadius: number): void {
    // Fit the universe in the viewport with some padding
    const padding = 0.8;
    this.scale = (Math.min(canvasWidth, canvasHeight) * padding) / (universeRadius * 2);
    this.offsetX = canvasWidth / 2;
    this.offsetY = canvasHeight / 2;
  }
}
