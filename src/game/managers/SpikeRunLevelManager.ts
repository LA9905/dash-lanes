export interface SpikeLevelConfig {
  level: number;
  name: string;
  targetScore: number;
  baseSpeed: number;
  maxSpeed: number;
  spawnMin: number;
  spawnMax: number;
  spikeChance: number;
  doubleSpikeChance: number;
  floatingSpikeChance: number;
  coinChance: number;
}

export class SpikeRunLevelManager {
  static readonly LEVELS: SpikeLevelConfig[] = [
    { level: 1, name: 'Inicio', targetScore: 800, baseSpeed: 300, maxSpeed: 380, spawnMin: 900, spawnMax: 1400, spikeChance: 0.55, doubleSpikeChance: 0.08, floatingSpikeChance: 0.05, coinChance: 0.35 },
    { level: 2, name: 'Picos', targetScore: 1400, baseSpeed: 320, maxSpeed: 420, spawnMin: 800, spawnMax: 1300, spikeChance: 0.58, doubleSpikeChance: 0.12, floatingSpikeChance: 0.08, coinChance: 0.32 },
    { level: 3, name: 'Ritmo', targetScore: 2200, baseSpeed: 340, maxSpeed: 460, spawnMin: 700, spawnMax: 1200, spikeChance: 0.60, doubleSpikeChance: 0.15, floatingSpikeChance: 0.12, coinChance: 0.30 },
    { level: 4, name: 'Salto', targetScore: 3200, baseSpeed: 360, maxSpeed: 500, spawnMin: 650, spawnMax: 1100, spikeChance: 0.62, doubleSpikeChance: 0.18, floatingSpikeChance: 0.15, coinChance: 0.28 },
    { level: 5, name: 'Combo', targetScore: 4500, baseSpeed: 380, maxSpeed: 540, spawnMin: 600, spawnMax: 1000, spikeChance: 0.64, doubleSpikeChance: 0.22, floatingSpikeChance: 0.18, coinChance: 0.26 },
    { level: 6, name: 'Aire', targetScore: 6000, baseSpeed: 400, maxSpeed: 580, spawnMin: 550, spawnMax: 950, spikeChance: 0.66, doubleSpikeChance: 0.25, floatingSpikeChance: 0.22, coinChance: 0.25 },
    { level: 7, name: 'Caos', targetScore: 8000, baseSpeed: 420, maxSpeed: 620, spawnMin: 500, spawnMax: 900, spikeChance: 0.68, doubleSpikeChance: 0.28, floatingSpikeChance: 0.25, coinChance: 0.24 },
    { level: 8, name: 'Inferno', targetScore: 10000, baseSpeed: 450, maxSpeed: 660, spawnMin: 450, spawnMax: 850, spikeChance: 0.70, doubleSpikeChance: 0.32, floatingSpikeChance: 0.28, coinChance: 0.22 },
    { level: 9, name: 'Extremo', targetScore: 13000, baseSpeed: 480, maxSpeed: 700, spawnMin: 400, spawnMax: 800, spikeChance: 0.72, doubleSpikeChance: 0.35, floatingSpikeChance: 0.30, coinChance: 0.20 },
    { level: 10, name: 'Leyenda', targetScore: 18000, baseSpeed: 510, maxSpeed: 750, spawnMin: 350, spawnMax: 750, spikeChance: 0.74, doubleSpikeChance: 0.38, floatingSpikeChance: 0.32, coinChance: 0.18 }
  ];

  static getLevel(n: number): SpikeLevelConfig {
    return this.LEVELS.find(l => l.level === n) || this.LEVELS[0];
  }

  static getUnlocked(): number {
    return parseInt(localStorage.getItem('spikerun_unlocked') || '1');
  }

  static unlock(level: number) {
    const cur = this.getUnlocked();
    if (level > cur && level <= this.LEVELS.length) {
      localStorage.setItem('spikerun_unlocked', level.toString());
    }
  }
}