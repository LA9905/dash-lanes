import Phaser from 'phaser';
import { CurrencyManager } from '../managers/CurrencyManager';
import { ClimbLevelManager } from '../managers/ClimbLevelManager';

export class ClimbMenuScene extends Phaser.Scene {
  constructor() {
    super('ClimbMenuScene');
  }

  create() {
    const { width, height } = this.scale;
    const unlocked = ClimbLevelManager.getUnlocked();

    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1208);
    this.add.rectangle(width / 2, 0, width, 100, 0xff9800, 0.12);

    this.add.text(width / 2, 28, 'WALL CLIMB', {
      fontFamily: 'Arial Black', fontSize: '26px', color: '#ff9800',
      stroke: '#3e2723', strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(width / 2, 54, `💰 ${CurrencyManager.getTotalCoins()}`, {
      fontFamily: 'Arial', fontSize: '13px', color: '#ffd700'
    }).setOrigin(0.5);

    this.add.text(width / 2, 78, [
      'Salta de pared a pared (toca izq / der)',
      'Evita pinchos · No dejes que la lava te alcance',
      'Sube para desbloquear la siguiente torre'
    ].join('\n'), {
      fontFamily: 'Arial', fontSize: '11px', color: '#aa8866', align: 'center', lineSpacing: 3
    }).setOrigin(0.5, 0);

    this.add.text(width / 2, 128, 'Elige torre', {
      fontFamily: 'Arial', fontSize: '13px', color: '#887766'
    }).setOrigin(0.5);

    ClimbLevelManager.LEVELS.forEach((lvl, i) => {
      const isUnlocked = lvl.level <= unlocked;
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = col === 0 ? width * 0.28 : width * 0.72;
      const y = 158 + row * 52;

      const btn = this.add.rectangle(x, y, 140, 44, isUnlocked ? 0xff9800 : 0x2a2018)
        .setInteractive({ useHandCursor: isUnlocked });

      this.add.text(x, y - 7, isUnlocked ? `${lvl.level}. ${lvl.name}` : `${lvl.level} 🔒`, {
        fontFamily: 'Arial', fontSize: '11px',
        color: isUnlocked ? '#1a1000' : '#555544'
      }).setOrigin(0.5);

      if (isUnlocked) {
        this.add.text(x, y + 10, `Altura ${lvl.targetHeight}`, {
          fontFamily: 'Arial', fontSize: '10px', color: '#5d4037'
        }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setFillStyle(0xffb74d));
        btn.on('pointerout', () => btn.setFillStyle(0xff9800));
        btn.on('pointerdown', () => {
          this.scene.start('ClimbScene', { level: lvl.level });
        });
      }
    });

    const hubBtn = this.add.rectangle(width / 2, height - 32, 160, 36, 0x2a2018)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(1, 0x5d4037);
    this.add.text(width / 2, height - 32, '← HUB JUEGOS', {
      fontFamily: 'Arial', fontSize: '13px', color: '#aa8866'
    }).setOrigin(0.5);

    hubBtn.on('pointerover', () => hubBtn.setFillStyle(0x3e2c20));
    hubBtn.on('pointerout', () => hubBtn.setFillStyle(0x2a2018));
    hubBtn.on('pointerdown', () => this.scene.start('HubScene'));
  }
}