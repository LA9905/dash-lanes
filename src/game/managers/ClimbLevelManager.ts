export interface ClimbLevelConfig {
  level: number;
  name: string;
  targetHeight: number;
  gravity: number;
  jumpX: number;
  jumpY: number;
  spikeChance: number;
  lavaSpeed: number;
  coinChance: number;
}

export class ClimbLevelManager {
  static readonly LEVELS: ClimbLevelConfig[] = [
    { level: 1, name: 'Roca', targetHeight: 80, gravity: 900, jumpX: 420, jumpY: -420, spikeChance: 0.12, lavaSpeed: 22, coinChance: 0.22 },
    { level: 2, name: 'Grieta', targetHeight: 140, gravity: 950, jumpX: 440, jumpY: -440, spikeChance: 0.18, lavaSpeed: 24, coinChance: 0.20 },
    { level: 3, name: 'Fisura', targetHeight: 200, gravity: 1000, jumpX: 460, jumpY: -460, spikeChance: 0.24, lavaSpeed: 28, coinChance: 0.18 },
    { level: 4, name: 'Cumbre', targetHeight: 280, gravity: 1050, jumpX: 480, jumpY: -480, spikeChance: 0.28, lavaSpeed: 29, coinChance: 0.16 },
    { level: 5, name: 'Pico', targetHeight: 380, gravity: 1100, jumpX: 500, jumpY: -500, spikeChance: 0.32, lavaSpeed: 30, coinChance: 0.15 },
    { level: 6, name: 'Nube', targetHeight: 500, gravity: 1150, jumpX: 510, jumpY: -510, spikeChance: 0.36, lavaSpeed: 31, coinChance: 0.14 },
    { level: 7, name: 'Tormenta', targetHeight: 650, gravity: 1200, jumpX: 520, jumpY: -520, spikeChance: 0.40, lavaSpeed: 32, coinChance: 0.13 },
    { level: 8, name: 'Abismo', targetHeight: 820, gravity: 1250, jumpX: 530, jumpY: -540, spikeChance: 0.44, lavaSpeed: 33, coinChance: 0.12 },
    { level: 9, name: 'Infierno', targetHeight: 1000, gravity: 1300, jumpX: 540, jumpY: -560, spikeChance: 0.48, lavaSpeed: 35, coinChance: 0.11 },
    { level: 10, name: 'Leyenda', targetHeight: 1300, gravity: 1350, jumpX: 550, jumpY: -580, spikeChance: 0.52, lavaSpeed: 37, coinChance: 0.10 }
  ];

  static getLevel(n: number): ClimbLevelConfig {
    const config = this.LEVELS.find(l => l.level === n) || this.LEVELS[0];
    return {
        ...config,
        targetHeight: config.targetHeight * 3,
        lavaSpeed: config.lavaSpeed * 6
     };
  }

  static getUnlocked(): number {
    return parseInt(localStorage.getItem('climb_unlocked') || '1');
  }

  static unlock(level: number) {
    const cur = this.getUnlocked();
    if (level > cur && level <= this.LEVELS.length) {
      localStorage.setItem('climb_unlocked', level.toString());
    }
  }
}