import Phaser from 'phaser';
import { CurrencyManager } from '../managers/CurrencyManager';
import { OrbitLevelManager } from '../managers/OrbitLevelManager';

export class OrbitMenuScene extends Phaser.Scene {
  constructor() {
    super('OrbitMenuScene');
  }

  create() {
    const { width, height } = this.scale;
    const unlocked = OrbitLevelManager.getUnlocked();

    this.add.rectangle(width / 2, height / 2, width, height, 0x0a1020);
    this.add.rectangle(width / 2, 0, width, 88, 0x2979ff, 0.12);

    this.add.text(width / 2, 28, 'ORBIT WAR', {
      fontFamily: 'Arial Black', fontSize: '26px', color: '#82b1ff',
      stroke: '#0a2040', strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(width / 2, 54, `💰 ${CurrencyManager.getTotalCoins()}`, {
      fontFamily: 'Arial', fontSize: '13px', color: '#ffd700'
    }).setOrigin(0.5);

    // Reglas
    this.add.text(width / 2, 78, [
      'Mueve la nave · Disparo automático',
      'Nv1-2: 2♥  |  Nv3-6: 3♥  |  Nv7-10: 4♥',
      'Con 20● en la partida: +1♥ (−20💰 total)'
    ].join('\n'), {
      fontFamily: 'Arial', fontSize: '11px', color: '#778899', align: 'center', lineSpacing: 3
    }).setOrigin(0.5, 0);

    this.add.text(width / 2, 128, 'Elige misión', {
      fontFamily: 'Arial', fontSize: '13px', color: '#667788'
    }).setOrigin(0.5);

    OrbitLevelManager.LEVELS.forEach((lvl, i) => {
      const isUnlocked = lvl.level <= unlocked;
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = col === 0 ? width * 0.28 : width * 0.72;
      const y = 158 + row * 52;

      const btn = this.add.rectangle(x, y, 140, 44, isUnlocked ? 0x2979ff : 0x1a1a2e)
        .setInteractive({ useHandCursor: isUnlocked });

      this.add.text(x, y - 7, isUnlocked ? `${lvl.level}. ${lvl.name}` : `${lvl.level} 🔒`, {
        fontFamily: 'Arial', fontSize: '11px',
        color: isUnlocked ? '#ffffff' : '#555566'
      }).setOrigin(0.5);

      if (isUnlocked) {
        this.add.text(x, y + 10, `${lvl.targetScore} pts`, {
          fontFamily: 'Arial', fontSize: '10px', color: '#a0c4ff'
        }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setFillStyle(0x448aff));
        btn.on('pointerout', () => btn.setFillStyle(0x2979ff));
        btn.on('pointerdown', () => {
          this.scene.start('OrbitScene', { level: lvl.level });
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