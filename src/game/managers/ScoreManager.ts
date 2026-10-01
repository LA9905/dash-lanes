export class ScoreManager {
  static getHighScore(): number {
    return parseInt(localStorage.getItem('dashlanes_highscore') || '0');
  }

  static saveHighScore(score: number) {
    const current = this.getHighScore();
    if (score > current) {
      localStorage.setItem('dashlanes_highscore', score.toString());
    }
  }
}