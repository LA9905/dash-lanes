import { maybeShowGameOverAd } from '../ads';
import Phaser from 'phaser';
import { ScoreManager } from '../managers/ScoreManager';
import { LevelManager } from '../managers/LevelManager';
import { CurrencyManager } from '../managers/CurrencyManager';

export class GameOverScene extends Phaser.Scene {
  private finalScore = 0;
  private finalCoins = 0;
  private finalLevel = 1;

  constructor() {
    super('GameOverScene');
  }

  preload() {
    this.load.audio('game_over', '/sounds/game_over.mp3');
  }

  init(data: { score: number; coins: number; level?: number }) {
    this.finalScore = data.score || 0;
    this.finalCoins = data.coins || 0;
    this.finalLevel = data.level || 1;
  }

  create() {
    const { width, height } = this.scale;

    ScoreManager.saveHighScore(this.finalScore);
    const highScore = ScoreManager.getHighScore();
    const isNewRecord = this.finalScore >= highScore && this.finalScore > 0;
    const totalCoins = CurrencyManager.getTotalCoins();

    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a16);
    this.add.rectangle(width / 2, 0, width, 120, 0xff4466, 0.12);

    this.add.text(width / 2, height * 0.14, 'GAME OVER', {
      fontFamily: 'Arial Black',
      fontSize: '40px',
      color: '#ff4466',
      stroke: '#4a0010',
      strokeThickness: 6
    }).setOrigin(0.5);

    // Card de estadísticas
    this.add.rectangle(width / 2, height * 0.42, 280, 200, 0x16162a, 0.95)
      .setStrokeStyle(2, 0x2a2a4a);

    // Nivel
    this.add.text(width / 2, height * 0.30, `Nivel ${this.finalLevel}`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#8888aa'
    }).setOrigin(0.5);

    // Puntos
    this.add.text(width / 2, height * 0.37, `${this.finalScore}`, {
      fontFamily: 'Arial Black',
      fontSize: '42px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.44, 'PUNTOS', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#666688'
    }).setOrigin(0.5);

    // Monedas de la partida + total
    this.add.text(width / 2 - 60, height * 0.52, `● ${this.finalCoins}`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffd700'
    }).setOrigin(0.5);

    this.add.text(width / 2 + 60, height * 0.52, `💰 ${totalCoins}`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffd700'
    }).setOrigin(0.5);

    // Récord
    this.add.text(width / 2, height * 0.60, isNewRecord ? '★ NUEVO RÉCORD ★' : `Récord: ${highScore}`, {
      fontFamily: 'Arial Black',
      fontSize: isNewRecord ? '16px' : '14px',
      color: isNewRecord ? '#00ffcc' : '#666688'
    }).setOrigin(0.5);

    // Botón Reintentar
    const retryBg = this.add.rectangle(width / 2, height * 0.72, 220, 54, 0x00e6b8)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.72, 'REINTENTAR', {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#003328'
    }).setOrigin(0.5);

    retryBg.on('pointerover', () => retryBg.setFillStyle(0x00ffcc));
    retryBg.on('pointerout', () => retryBg.setFillStyle(0x00e6b8));
    retryBg.on('pointerdown', () => {
      const unlocked = LevelManager.getCurrentUnlockedLevel();
      this.scene.start('GameScene', { level: this.finalLevel <= unlocked ? this.finalLevel : unlocked });
    });

    // Menú de Dash Lanes
    const menuBg = this.add.rectangle(width / 2, height * 0.82, 220, 44, 0x222240)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(1, 0x3a3a5a);
    this.add.text(width / 2, height * 0.82, 'MENÚ DASH LANES', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ccccdd'
    }).setOrigin(0.5);

    menuBg.on('pointerover', () => menuBg.setFillStyle(0x2a2a50));
    menuBg.on('pointerout', () => menuBg.setFillStyle(0x222240));
    menuBg.on('pointerdown', () => {
      this.scene.start('MenuScene');
    });

    // Hub del paquete
    const hubBg = this.add.rectangle(width / 2, height * 0.91, 220, 40, 0x16162a)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(1, 0x2a2a4a);
    this.add.text(width / 2, height * 0.91, 'HUB JUEGOS', {
      fontFamily: 'Arial',
      fontSize: '15px',
      color: '#8888aa'
    }).setOrigin(0.5);

    hubBg.on('pointerover', () => hubBg.setFillStyle(0x1e1e38));
    hubBg.on('pointerout', () => hubBg.setFillStyle(0x16162a));
    hubBg.on('pointerdown', () => {
      this.scene.start('HubScene');
    });

    this.sound.play('game_over', { volume: 0.55 });
    maybeShowGameOverAd();
  }
}