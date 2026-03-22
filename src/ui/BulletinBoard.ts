/**
 * Bulletin Board - notification panel for dark forest events
 */

type MessageType = 'broadcast' | 'strike_photoid' | 'strike_dvf' | 'strike_cleaning' | 'evolution' | 'extinction';

interface BulletinMessage {
  type: MessageType;
  text: string;
  timestamp: string; // universe age
  element: HTMLDivElement;
  addedAt: number; // real time ms
}

const TYPE_CONFIG: Record<MessageType, { icon: string; color: string }> = {
  broadcast:       { icon: '📡', color: '#e8a820' },
  strike_photoid:  { icon: '💥', color: '#ff4444' },
  strike_dvf:      { icon: '🌀', color: '#b060ff' },
  strike_cleaning: { icon: '☄️', color: '#ff3030' },
  evolution:       { icon: '⬆️', color: '#40d060' },
  extinction:      { icon: '☠️', color: '#8b0000' },
};

const MAX_MESSAGES = 20;
const FADE_AFTER_MS = 30000;

export class BulletinBoard {
  private container: HTMLDivElement | null = null;
  private messages: BulletinMessage[] = [];
  private fadeInterval: number = 0;

  constructor() {
    // Defer init until DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => this.init());
    } else {
      this.init();
    }
  }

  private init(): void {
    this.container = document.getElementById('bulletin-messages') as HTMLDivElement | null;
    // Start fade timer
    this.fadeInterval = window.setInterval(() => this.updateFades(), 1000);
  }

  addMessage(type: MessageType, text: string, universeAge?: number): void {
    if (!this.container) {
      this.container = document.getElementById('bulletin-messages') as HTMLDivElement | null;
    }
    if (!this.container) return;

    const config = TYPE_CONFIG[type];
    const ageStr = universeAge !== undefined ? this.formatAge(universeAge) : '';

    const el = document.createElement('div');
    el.className = 'bulletin-msg';
    el.style.color = config.color;
    el.style.opacity = '0';
    el.innerHTML = `<span class="bulletin-time">${ageStr}</span> ${config.icon} ${this.escapeHtml(text)}`;

    // Fade-in
    this.container.appendChild(el);
    requestAnimationFrame(() => {
      el.style.opacity = '1';
    });

    // Auto-scroll to bottom
    this.container.scrollTop = this.container.scrollHeight;

    const msg: BulletinMessage = {
      type,
      text,
      timestamp: ageStr,
      element: el,
      addedAt: Date.now(),
    };
    this.messages.push(msg);

    // Remove oldest if exceeded
    while (this.messages.length > MAX_MESSAGES) {
      const old = this.messages.shift()!;
      old.element.remove();
    }
  }

  private updateFades(): void {
    const now = Date.now();
    for (const msg of this.messages) {
      const elapsed = now - msg.addedAt;
      if (elapsed > FADE_AFTER_MS) {
        // Gradually dim: from 1.0 to 0.25 over another 30s
        const fadeProg = Math.min((elapsed - FADE_AFTER_MS) / 30000, 1);
        msg.element.style.opacity = String(1 - fadeProg * 0.75);
      }
    }
  }

  private formatAge(years: number): string {
    if (years >= 1e9) return `${(years / 1e9).toFixed(1)}B`;
    if (years >= 1e6) return `${(years / 1e6).toFixed(1)}M`;
    if (years >= 1e3) return `${(years / 1e3).toFixed(1)}K`;
    return `${years}`;
  }

  private escapeHtml(text: string): string {
    const d = document.createElement('div');
    d.textContent = text;
    return d.innerHTML;
  }
}

/** Format a galaxy position as abbreviated coordinates */
export function formatPos(x: number, y: number, z: number): string {
  const fmt = (v: number): string => {
    const abs = Math.abs(v);
    const sign = v < 0 ? '-' : '';
    if (abs >= 1e9) return `${sign}${(abs / 1e9).toFixed(0)}B`;
    if (abs >= 1e6) return `${sign}${(abs / 1e6).toFixed(0)}M`;
    if (abs >= 1e3) return `${sign}${(abs / 1e3).toFixed(0)}K`;
    return `${sign}${abs.toFixed(0)}`;
  };
  return `(${fmt(x)}, ${fmt(y)}, ${fmt(z)})`;
}

// Singleton
export const bulletinBoard = new BulletinBoard();
