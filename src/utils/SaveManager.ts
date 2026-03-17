import { Universe } from '../core/Universe';
import { GameConfig } from '../config';

export interface SaveData {
  version: string;
  timestamp: number;
  config: GameConfig;
  universe: object;
}

export class SaveManager {
  private readonly SAVE_KEY = 'darkforest_save';
  private readonly VERSION = '1.0.0';

  /** Save universe state to localStorage */
  save(universe: Universe, config: GameConfig): boolean {
    try {
      const data: SaveData = {
        version: this.VERSION,
        timestamp: Date.now(),
        config,
        universe: universe.export(),
      };
      
      const json = JSON.stringify(data);
      localStorage.setItem(this.SAVE_KEY, json);
      return true;
    } catch (e) {
      console.error('Failed to save:', e);
      return false;
    }
  }

  /** Load universe state from localStorage */
  load(universe: Universe): { success: boolean; data?: SaveData } {
    try {
      const json = localStorage.getItem(this.SAVE_KEY);
      if (!json) {
        return { success: false };
      }
      
      const data: SaveData = JSON.parse(json);
      
      if (data.version !== this.VERSION) {
        console.warn('Save version mismatch:', data.version, 'expected:', this.VERSION);
      }
      
      universe.import(data.universe);
      return { success: true, data };
    } catch (e) {
      console.error('Failed to load:', e);
      return { success: false };
    }
  }

  /** Check if save exists */
  hasSave(): boolean {
    return localStorage.getItem(this.SAVE_KEY) !== null;
  }

  /** Delete save */
  deleteSave(): void {
    localStorage.removeItem(this.SAVE_KEY);
  }

  /** Export to JSON file */
  exportToFile(universe: Universe, config: GameConfig): void {
    const data: SaveData = {
      version: this.VERSION,
      timestamp: Date.now(),
      config,
      universe: universe.export(),
    };
    
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `darkforest_${new Date().toISOString().slice(0, 19)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  /** Import from JSON file */
  importFromFile(universe: Universe): Promise<{ success: boolean; data?: SaveData }> {
    return new Promise((resolve) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (!file) {
          resolve({ success: false });
          return;
        }
        
        const reader = new FileReader();
        reader.onload = () => {
          try {
            const data: SaveData = JSON.parse(reader.result as string);
            universe.import(data.universe);
            resolve({ success: true, data });
          } catch (err) {
            console.error('Failed to parse save file:', err);
            resolve({ success: false });
          }
        };
        reader.readAsText(file);
      };
      
      input.click();
    });
  }

  /** Get save info */
  getSaveInfo(): { timestamp: number; round: number; age: number } | null {
    try {
      const json = localStorage.getItem(this.SAVE_KEY);
      if (!json) return null;
      
      const data: SaveData = JSON.parse(json);
      return {
        timestamp: data.timestamp,
        round: (data.universe as any).state?.round || 0,
        age: (data.universe as any).state?.age || 0,
      };
    } catch {
      return null;
    }
  }
}
