export class Camera {
  // Rotation angles (radians)
  rotX: number = 0.3;   // pitch
  rotY: number = 0;     // yaw
  zoom: number = 1;

  // Screen offset for panning
  panX: number = 0;
  panY: number = 0;

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
      this.zoom *= zoomFactor;
    }, { passive: false });

    this.canvas.addEventListener('mousedown', (e) => {
      // Only rotate on left button drag
      if (e.button === 0) {
        this.dragging = true;
        this.lastMouseX = e.clientX;
        this.lastMouseY = e.clientY;
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (!this.dragging) return;
      const dx = e.clientX - this.lastMouseX;
      const dy = e.clientY - this.lastMouseY;

      this.rotY += dx * 0.005;
      this.rotX += dy * 0.005;

      // Clamp pitch to avoid flipping
      this.rotX = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotX));

      this.lastMouseX = e.clientX;
      this.lastMouseY = e.clientY;
    });

    window.addEventListener('mouseup', () => {
      this.dragging = false;
    });
  }

  get isDragging(): boolean {
    return this.dragging;
  }

  /** Project 3D world coordinates to 2D screen coordinates */
  project(wx: number, wy: number, wz: number): [number, number, number] {
    // Rotate around Y axis (yaw)
    const cosY = Math.cos(this.rotY);
    const sinY = Math.sin(this.rotY);
    let x1 = wx * cosY + wz * sinY;
    const y1 = wy;
    let z1 = -wx * sinY + wz * cosY;

    // Rotate around X axis (pitch)
    const cosX = Math.cos(this.rotX);
    const sinX = Math.sin(this.rotX);
    const x2 = x1;
    const y2 = y1 * cosX - z1 * sinX;
    const z2 = y1 * sinX + z1 * cosX;

    // Orthographic projection with zoom
    const cx = this.canvas.width / 2;
    const cy = this.canvas.height / 2;

    const sx = cx + x2 * this.zoom + this.panX;
    const sy = cy - y2 * this.zoom + this.panY;

    return [sx, sy, z2];
  }

  /** Center the camera on the universe */
  centerOn(canvasWidth: number, canvasHeight: number, universeRadius: number): void {
    const padding = 0.8;
    this.zoom = (Math.min(canvasWidth, canvasHeight) * padding) / (universeRadius * 2);
    this.panX = 0;
    this.panY = 0;
    this.rotX = 0.3;
    this.rotY = 0;
  }
}
