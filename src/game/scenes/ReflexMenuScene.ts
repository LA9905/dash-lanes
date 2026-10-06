import Phaser from 'phaser';
import { CurrencyManager } from '../managers/CurrencyManager';
import { ReflexLevelManager } from '../managers/ReflexLevelManager';

export class ReflexMenuScene extends Phaser.Scene {
  constructor() {
    super('ReflexMenuScene');
  }

  create() {
    const { width, height } = this.scale;
    const unlocked = ReflexLevelManager.getUnlocked();

    this.add.rectangle(width / 2, height / 2, width, height, 0x101018);
    this.add.rectangle(width / 2, 0, width, 110, 0xe040fb, 0.12);

    this.add.text(width / 2, 26, 'REFLEX MIND', {
      fontFamily: 'Arial Black', fontSize: '24px', color: '#e040fb',
      stroke: '#2a0030', strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(width / 2, 50, `💰 ${CurrencyManager.getTotalCoins()}`, {
      fontFamily: 'Arial', fontSize: '13px', color: '#ffd700'
    }).setOrigin(0.5);

    this.add.text(width / 2, 78, [
      'Juegos mentales · Lee bien las reglas de cada modo',
      'Stroop: elige el COLOR de la tinta, no la palabra',
      'Memoria / Secuencia / Mate / Intruso en otros niveles'
    ].join('\n'), {
      fontFamily: 'Arial', fontSize: '10px', color: '#9988aa', align: 'center', lineSpacing: 2
    }).setOrigin(0.5, 0);

    this.add.text(width / 2, 125, 'Elige desafío', {
      fontFamily: 'Arial', fontSize: '13px', color: '#776688'
    }).setOrigin(0.5);

    ReflexLevelManager.LEVELS.forEach((lvl, i) => {
      const isUnlocked = lvl.level <= unlocked;
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = col === 0 ? width * 0.28 : width * 0.72;
      const y = 155 + row * 52;

      const btn = this.add.rectangle(x, y, 140, 44, isUnlocked ? 0xe040fb : 0x1a1a28)
        .setInteractive({ useHandCursor: isUnlocked });

      this.add.text(x, y - 7, isUnlocked ? `${lvl.level}. ${lvl.name}` : `${lvl.level} 🔒`, {
        fontFamily: 'Arial', fontSize: '11px',
        color: isUnlocked ? '#ffffff' : '#555566'
      }).setOrigin(0.5);

      if (isUnlocked) {
        this.add.text(x, y + 10, `${lvl.mode} · ${lvl.targetScore}`, {
          fontFamily: 'Arial', fontSize: '9px', color: '#f0c0ff'
        }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setFillStyle(0xea80fc));
        btn.on('pointerout', () => btn.setFillStyle(0xe040fb));
        btn.on('pointerdown', () => {
          this.scene.start('ReflexScene', { level: lvl.level });
        });
      }
    });

    const hubBtn = this.add.rectangle(width / 2, height - 32, 160, 36, 0x222240)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(1, 0x3a3a5a);
    this.add.text(width / 2, height - 32, '← HUB JUEGOS', {
      fontFamily: 'Arial', fontSize: '13px', color: '#aaaaaa'
    }).setOrigin(0.5);
    hubBtn.on('pointerover', () => hubBtn.setFillStyle(0x2a2a50));
    hubBtn.on('pointerout', () => hubBtn.setFillStyle(0x222240));
    hubBtn.on('pointerdown', () => this.scene.start('HubScene'));
  }
}