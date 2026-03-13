export class TimeEngine {
  private intervalId: number | null = null;
  private realTimePerSlice: number; // seconds
  private onTick: () => void;

  running: boolean = false;

  constructor(realTimePerSlice: number, onTick: () => void) {
    this.realTimePerSlice = realTimePerSlice;
    this.onTick = onTick;
  }

  setSpeed(realTimePerSlice: number): void {
    this.realTimePerSlice = realTimePerSlice;
    if (this.running) {
      this.pause();
      this.start();
    }
  }

  start(): void {
    if (this.running) return;
    this.running = true;
    this.intervalId = window.setInterval(() => {
      this.onTick();
    }, this.realTimePerSlice * 1000);
  }

  pause(): void {
    if (this.intervalId !== null) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.running = false;
  }

  reset(realTimePerSlice: number, onTick: () => void): void {
    this.pause();
    this.realTimePerSlice = realTimePerSlice;
    this.onTick = onTick;
  }
}
