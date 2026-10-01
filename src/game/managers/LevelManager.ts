export interface LevelConfig {
  level: number;
  name: string;
  minScore: number;
  baseSpeed: number;
  maxSpeed: number;
  spawnRate: number;
  canShoot: boolean;
  maxShots: number;
  obstacleChance: number;
  highwayMode: boolean;
}

export class LevelManager {
  static readonly LEVELS: LevelConfig[] = [
    {
      level: 1,
      name: 'Principiante',
      minScore: 2500,
      baseSpeed: 320,
      maxSpeed: 480,
      spawnRate: 1.0,
      canShoot: false,
      maxShots: 0,
      obstacleChance: 0.65,
      highwayMode: false
    },
    {
      level: 2,
      name: 'Callejón',
      minScore: 5500,
      baseSpeed: 360,
      maxSpeed: 520,
      spawnRate: 0.9,
      canShoot: true,
      maxShots: 3,
      obstacleChance: 0.70,
      highwayMode: false
    },
    {
      level: 3,
      name: 'Autopista',
      minScore: 9000,
      baseSpeed: 400,
      maxSpeed: 580,
      spawnRate: 0.8,
      canShoot: true,
      maxShots: 3,
      obstacleChance: 0.72,
      highwayMode: true
    },
    {
      level: 4,
      name: 'Caos Total',
      minScore: 15000,
      baseSpeed: 440,
      maxSpeed: 650,
      spawnRate: 0.7,
      canShoot: true,
      maxShots: 3,
      obstacleChance: 0.78,
      highwayMode: true
    }
  ];

  static getLevel(levelNumber: number): LevelConfig {
    return this.LEVELS.find(l => l.level === levelNumber) || this.LEVELS[0];
  }

  static getCurrentUnlockedLevel(): number {
    return parseInt(localStorage.getItem('dashlanes_unlocked_level') || '1');
  }

  static unlockLevel(level: number) {
    const current = this.getCurrentUnlockedLevel();
    if (level > current) {
      localStorage.setItem('dashlanes_unlocked_level', level.toString());
    }
  }
}