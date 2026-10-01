import Phaser from 'phaser';
import { ScoreManager } from '../managers/ScoreManager';
import { LevelManager } from '../managers/LevelManager';

export class MenuScene extends Phaser.Scene {
  private menuMusic?: Phaser.Sound.BaseSound;

  constructor() {
    super('MenuScene');
  }

  preload() {
    this.load.audio('menu', '/sounds/menu.mp3');
  }

  create() {
    const { width, height } = this.scale;
    const unlocked = LevelManager.getCurrentUnlockedLevel();

    this.add.rectangle(width / 2, height / 2, width, height, 0x0f0f1a);

    this.add.text(width / 2, height * 0.12, 'DASH LANES', {
      fontFamily: 'Arial Black',
      fontSize: '36px',
      color: '#00ffcc',
      stroke: '#003333',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.20, 'Esquiva • Salta • Corre', {
      fontFamily: 'Arial',
      fontSize: '15px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    const highScore = ScoreManager.getHighScore();
    this.add.text(width / 2, height * 0.27, `Récord: ${highScore}`, {
      fontFamily: 'Arial',
      fontSize: '18px',
      color: '#ffd700'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.34, 'Elige nivel:', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    // Botones de nivel
    LevelManager.LEVELS.forEach((lvl, index) => {
      const isUnlocked = lvl.level <= unlocked;
      const y = height * 0.42 + index * 52;

      const btn = this.add.rectangle(width / 2, y, 240, 44, isUnlocked ? 0x00ffcc : 0x333344)
        .setInteractive({ useHandCursor: isUnlocked });

      this.add.text(width / 2, y, isUnlocked ? `Nivel ${lvl.level}: ${lvl.name}` : `Nivel ${lvl.level} 🔒`, {
        fontFamily: 'Arial',
        fontSize: '16px',
        color: isUnlocked ? '#003333' : '#666666'
      }).setOrigin(0.5);

      if (isUnlocked) {
        btn.on('pointerdown', () => {
          this.menuMusic?.stop();
          this.scene.start('GameScene', { level: lvl.level });
        });
      }
    });

    // Instrucciones
    this.add.text(width / 2, height * 0.92, 'Izq/Der → carril  |  Centro → saltar  |  Arriba → disparar', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#666666',
      align: 'center'
    }).setOrigin(0.5);

    this.menuMusic = this.sound.add('menu', { loop: true, volume: 0.4 });
    this.menuMusic.play();
  }
}