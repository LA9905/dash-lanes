export interface ReflexLevelConfig {
  level: number;
  name: string;
  mode: 'stroop' | 'memory' | 'math' | 'sequence' | 'odd';
  targetScore: number;
  timeMs: number;
  difficulty: number;
}

export class ReflexLevelManager {
  static readonly LEVELS: ReflexLevelConfig[] = [
    { level: 1, name: 'Stroop', mode: 'stroop', targetScore: 12, timeMs: 2800, difficulty: 1 },
    { level: 2, name: 'Stroop+', mode: 'stroop', targetScore: 18, timeMs: 2200, difficulty: 3 },
    { level: 3, name: 'Memoria', mode: 'memory', targetScore: 8, timeMs: 0, difficulty: 2 },
    { level: 4, name: 'Secuencia', mode: 'sequence', targetScore: 6, timeMs: 0, difficulty: 3 },
    { level: 5, name: 'Cálculo', mode: 'math', targetScore: 10, timeMs: 5000, difficulty: 3 },
    { level: 6, name: 'Intruso', mode: 'odd', targetScore: 10, timeMs: 3500, difficulty: 4 },
    { level: 7, name: 'Stroop Pro', mode: 'stroop', targetScore: 25, timeMs: 1600, difficulty: 6 },
    { level: 8, name: 'Memoria+', mode: 'memory', targetScore: 12, timeMs: 0, difficulty: 6 },
    { level: 9, name: 'Mate hard', mode: 'math', targetScore: 15, timeMs: 4000, difficulty: 7 },
    { level: 10, name: 'Maestro', mode: 'sequence', targetScore: 10, timeMs: 0, difficulty: 9 }
  ];

  static getLevel(n: number): ReflexLevelConfig {
    return this.LEVELS.find(l => l.level === n) || this.LEVELS[0];
  }

  static getUnlocked(): number {
    return parseInt(localStorage.getItem('reflex_unlocked') || '1');
  }

  static unlock(level: number) {
    const cur = this.getUnlocked();
    if (level > cur && level <= this.LEVELS.length) {
      localStorage.setItem('reflex_unlocked', level.toString());
    }
  }
}