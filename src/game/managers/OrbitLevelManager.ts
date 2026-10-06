export interface OrbitLevelConfig {
  level: number;
  name: string;
  targetScore: number;
  baseSpawn: number;
  maxSpawn: number;
  enemyChance: number;
  shooterChance: number;
  rockSpeed: number;
  enemySpeed: number;
}

export class OrbitLevelManager {
static readonly LEVELS: OrbitLevelConfig[] = [
    { level: 1, name: 'Exploración', targetScore: 4500, baseSpawn: 900, maxSpawn: 1400, enemyChance: 0.35, shooterChance: 0.15, rockSpeed: 160, enemySpeed: 140 },
    { level: 2, name: 'Patrulla', targetScore: 9000, baseSpawn: 800, maxSpawn: 1200, enemyChance: 0.45, shooterChance: 0.25, rockSpeed: 180, enemySpeed: 160 },
    { level: 3, name: 'Emboscada', targetScore: 15000, baseSpawn: 700, maxSpawn: 1100, enemyChance: 0.55, shooterChance: 0.35, rockSpeed: 200, enemySpeed: 180 },
    { level: 4, name: 'Bloqueo', targetScore: 24000, baseSpawn: 600, maxSpawn: 1000, enemyChance: 0.60, shooterChance: 0.40, rockSpeed: 220, enemySpeed: 200 },
    { level: 5, name: 'Ofensiva', targetScore: 36000, baseSpawn: 550, maxSpawn: 900, enemyChance: 0.65, shooterChance: 0.45, rockSpeed: 240, enemySpeed: 220 },
    { level: 6, name: 'Asalto', targetScore: 52000, baseSpawn: 500, maxSpawn: 850, enemyChance: 0.70, shooterChance: 0.50, rockSpeed: 260, enemySpeed: 240 },
    { level: 7, name: 'Guerra', targetScore: 72000, baseSpawn: 450, maxSpawn: 800, enemyChance: 0.75, shooterChance: 0.55, rockSpeed: 280, enemySpeed: 260 },
    { level: 8, name: 'Invasión', targetScore: 98000, baseSpawn: 400, maxSpawn: 750, enemyChance: 0.78, shooterChance: 0.60, rockSpeed: 300, enemySpeed: 280 },
    { level: 9, name: 'Colapso', targetScore: 130000, baseSpawn: 350, maxSpawn: 700, enemyChance: 0.82, shooterChance: 0.65, rockSpeed: 320, enemySpeed: 300 },
    { level: 10, name: 'Última Órbita', targetScore: 180000, baseSpawn: 300, maxSpawn: 650, enemyChance: 0.85, shooterChance: 0.70, rockSpeed: 350, enemySpeed: 320 }
  ];

  static getLevel(n: number): OrbitLevelConfig {
    return this.LEVELS.find(l => l.level === n) || this.LEVELS[0];
  }

  static getUnlocked(): number {
    return parseInt(localStorage.getItem('orbit_unlocked') || '1');
  }

  static unlock(level: number) {
    const cur = this.getUnlocked();
    if (level > cur && level <= this.LEVELS.length) {
      localStorage.setItem('orbit_unlocked', level.toString());
    }
  }
}