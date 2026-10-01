import Phaser from 'phaser';
import { ScoreManager } from '../managers/ScoreManager';
import { LevelManager } from '../managers/LevelManager';

export class GameOverScene extends Phaser.Scene {
  private finalScore = 0;
  private finalCoins = 0;

  constructor() {
    super('GameOverScene');
  }

  preload() {
    this.load.audio('game_over', '/sounds/game_over.mp3');
  }

  init(data: { score: number; coins: number }) {
    this.finalScore = data.score || 0;
    this.finalCoins = data.coins || 0;
  }

  create() {
    const { width, height } = this.scale;

    // Guardar récord
    ScoreManager.saveHighScore(this.finalScore);
    const highScore = ScoreManager.getHighScore();
    const isNewRecord = this.finalScore >= highScore && this.finalScore > 0;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0f0f1a);

    this.add.text(width / 2, height * 0.18, '¡GAME OVER!', {
      fontFamily: 'Arial Black',
      fontSize: '36px',
      color: '#ff4466'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.32, `Puntos: ${this.finalScore}`, {
      fontFamily: 'Arial',
      fontSize: '26px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.40, `Monedas: ${this.finalCoins}`, {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ffd700'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.48, `Récord: ${highScore}`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: isNewRecord ? '#00ffcc' : '#aaaaaa'
    }).setOrigin(0.5);

    if (isNewRecord) {
      this.add.text(width / 2, height * 0.54, '¡NUEVO RÉCORD!', {
        fontFamily: 'Arial Black',
        fontSize: '18px',
        color: '#00ffcc'
      }).setOrigin(0.5);
    }

    // Botón Reintentar
    const retryBtn = this.add.rectangle(width / 2, height * 0.66, 200, 56, 0x00ffcc)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height * 0.66, 'REINTENTAR', {
      fontFamily: 'Arial Black',
      fontSize: '22px',
      color: '#003333'
    }).setOrigin(0.5);

    retryBtn.on('pointerdown', () => {
      const unlocked = LevelManager.getCurrentUnlockedLevel();
      this.scene.start('GameScene', { level: unlocked });
    });

    // Botón Menú
    const menuBtn = this.add.rectangle(width / 2, height * 0.78, 200, 48, 0x333355)
      .setInteractive({ useHandCursor: true });

    this.add.text(width / 2, height * 0.78, 'MENÚ', {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    menuBtn.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // Sonido de Game Over
    this.sound.play('game_over', { volume: 0.6 });
  }
}