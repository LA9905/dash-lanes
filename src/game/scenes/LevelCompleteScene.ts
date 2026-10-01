import Phaser from 'phaser';
import { LevelManager } from '../managers/LevelManager';

export class LevelCompleteScene extends Phaser.Scene {
  private level = 1;
  private score = 0;
  private coins = 0;

  constructor() {
    super('LevelCompleteScene');
  }

  init(data: { level: number; score: number; coins: number }) {
    this.level = data.level || 1;
    this.score = data.score || 0;
    this.coins = data.coins || 0;
  }

  create() {
    const { width, height } = this.scale;
    const nextLevel = this.level + 1;
    const hasNext = nextLevel <= LevelManager.LEVELS.length;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0f0f1a);

    this.add.text(width / 2, height * 0.22, '¡NIVEL COMPLETADO!', {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: '#00ffcc'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.34, `Nivel ${this.level}`, {
      fontFamily: 'Arial',
      fontSize: '22px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.44, `Puntos: ${this.score}`, {
      fontFamily: 'Arial',
      fontSize: '20px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.52, `Monedas: ${this.coins}`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffd700'
    }).setOrigin(0.5);

    if (hasNext) {
      const nextBtn = this.add.rectangle(width / 2, height * 0.66, 220, 56, 0x00ffcc)
        .setInteractive({ useHandCursor: true });

      this.add.text(width / 2, height * 0.66, `NIVEL ${nextLevel}`, {
        fontFamily: 'Arial Black',
        fontSize: '22px',
        color: '#003333'
      }).setOrigin(0.5);

      nextBtn.on('pointerdown', () => {
        this.scene.start('GameScene', { level: nextLevel });
      });
    }

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
  }
}