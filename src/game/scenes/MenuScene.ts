import Phaser from 'phaser';
import { ScoreManager } from '../managers/ScoreManager';
import { LevelManager } from '../managers/LevelManager';
import { CurrencyManager } from '../managers/CurrencyManager';

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

    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a18);
    this.add.rectangle(width / 2, 0, width, 160, 0x00ffcc, 0.08);

    this.add.text(width / 2, 50, 'DASH LANES', {
      fontFamily: 'Arial Black', fontSize: '34px', color: '#00ffcc',
      stroke: '#003333', strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(width / 2, 90, `Récord ${ScoreManager.getHighScore()}  ·  💰 ${CurrencyManager.getTotalCoins()}`, {
      fontFamily: 'Arial', fontSize: '14px', color: '#ffd700'
    }).setOrigin(0.5);

    this.add.text(width / 2, 120, 'Elige nivel', {
      fontFamily: 'Arial', fontSize: '15px', color: '#888888'
    }).setOrigin(0.5);

    LevelManager.LEVELS.forEach((lvl, i) => {
      const isUnlocked = lvl.level <= unlocked;
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = col === 0 ? width * 0.28 : width * 0.72;
      const y = 160 + row * 58;

      const btn = this.add.rectangle(x, y, 140, 48, isUnlocked ? 0x00c9a0 : 0x222233)
        .setInteractive({ useHandCursor: isUnlocked });

      this.add.text(x, y - 8, isUnlocked ? `${lvl.level}. ${lvl.name}` : `${lvl.level} 🔒`, {
        fontFamily: 'Arial', fontSize: '13px',
        color: isUnlocked ? '#003333' : '#555555'
      }).setOrigin(0.5);

      if (isUnlocked) {
        this.add.text(x, y + 12, `${lvl.minScore} pts`, {
          fontFamily: 'Arial', fontSize: '11px', color: '#004440'
        }).setOrigin(0.5);

        btn.on('pointerdown', () => {
          this.menuMusic?.stop();
          this.scene.start('GameScene', { level: lvl.level });
        });
      }
    });

    this.add.text(width / 2, height - 30, '← → carril  |  centro saltar  |  arriba disparar', {
      fontFamily: 'Arial', fontSize: '11px', color: '#555555'
    }).setOrigin(0.5);

    const hubBtn = this.add.text(16, height - 28, '← Hub', {
      fontFamily: 'Arial', fontSize: '14px', color: '#8888aa'
    }).setInteractive({ useHandCursor: true });
    hubBtn.on('pointerdown', () => {
      this.menuMusic?.stop();
      this.scene.start('HubScene');
    });

    this.menuMusic = this.sound.add('menu', { loop: true, volume: 0.35 });
    this.menuMusic.play();
  }
}