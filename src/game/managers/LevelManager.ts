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
  needsFuel: boolean;
  fuelDrain: number;
}

export class LevelManager {
  static readonly LEVELS: LevelConfig[] = [
    { level: 1, name: 'Principiante', minScore: 1000, baseSpeed: 280, maxSpeed: 380, spawnRate: 1.0, canShoot: false, maxShots: 0, obstacleChance: 0.60, highwayMode: false, needsFuel: false, fuelDrain: 0 },
    { level: 2, name: 'Callejón', minScore: 2000, baseSpeed: 300, maxSpeed: 420, spawnRate: 0.95, canShoot: true, maxShots: 3, obstacleChance: 0.65, highwayMode: false, needsFuel: false, fuelDrain: 0 },
    { level: 3, name: 'Zona Urbana', minScore: 5000, baseSpeed: 330, maxSpeed: 460, spawnRate: 0.90, canShoot: true, maxShots: 3, obstacleChance: 0.68, highwayMode: false, needsFuel: true, fuelDrain: 45 },
    { level: 4, name: 'Avenida', minScore: 6500, baseSpeed: 360, maxSpeed: 500, spawnRate: 0.85, canShoot: true, maxShots: 3, obstacleChance: 0.70, highwayMode: false, needsFuel: true, fuelDrain: 40 },
    { level: 5, name: 'Autopista', minScore: 8500, baseSpeed: 390, maxSpeed: 540, spawnRate: 0.80, canShoot: true, maxShots: 3, obstacleChance: 0.72, highwayMode: true, needsFuel: true, fuelDrain: 35 },
    { level: 6, name: 'Express', minScore: 10800, baseSpeed: 420, maxSpeed: 580, spawnRate: 0.75, canShoot: true, maxShots: 3, obstacleChance: 0.74, highwayMode: true, needsFuel: true, fuelDrain: 32 },
    { level: 7, name: 'Megavía', minScore: 14000, baseSpeed: 450, maxSpeed: 620, spawnRate: 0.70, canShoot: true, maxShots: 3, obstacleChance: 0.76, highwayMode: true, needsFuel: true, fuelDrain: 28 },
    { level: 8, name: 'Caos Norte', minScore: 17000, baseSpeed: 480, maxSpeed: 660, spawnRate: 0.65, canShoot: true, maxShots: 3, obstacleChance: 0.78, highwayMode: true, needsFuel: true, fuelDrain: 25 },
    { level: 9, name: 'Inferno', minScore: 20000, baseSpeed: 510, maxSpeed: 700, spawnRate: 0.60, canShoot: true, maxShots: 3, obstacleChance: 0.80, highwayMode: true, needsFuel: true, fuelDrain: 22 },
    { level: 10, name: 'Leyenda', minScore: 30000, baseSpeed: 540, maxSpeed: 750, spawnRate: 0.55, canShoot: true, maxShots: 3, obstacleChance: 0.82, highwayMode: true, needsFuel: true, fuelDrain: 20 }
  ];

  static getLevel(levelNumber: number): LevelConfig {
    return this.LEVELS.find(l => l.level === levelNumber) || this.LEVELS[0];
  }

  static getCurrentUnlockedLevel(): number {
    return parseInt(localStorage.getItem('dashlanes_unlocked_level') || '1');
  }

  static unlockLevel(level: number) {
    const current = this.getCurrentUnlockedLevel();
    if (level > current && level <= this.LEVELS.length) {
      localStorage.setItem('dashlanes_unlocked_level', level.toString());
    }
  }
}