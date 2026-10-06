import Phaser from 'phaser';
import { CurrencyManager } from '../managers/CurrencyManager';
import { SpikeRunLevelManager } from '../managers/SpikeRunLevelManager';

export class SpikeRunMenuScene extends Phaser.Scene {
  constructor() {
    super('SpikeRunMenuScene');
  }

  create() {
    const { width, height } = this.scale;
    const unlocked = SpikeRunLevelManager.getUnlocked();

    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1028);
    this.add.rectangle(width / 2, 0, width, 150, 0xff4466, 0.12);

    this.add.text(width / 2, 26, 'SPIKE RUN', {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: '#ff4466',
      stroke: '#4a0010',
      strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(width / 2, 52, `💰 ${CurrencyManager.getTotalCoins()}`, {
      fontFamily: 'Arial',
      fontSize: '13px',
      color: '#ffd700'
    }).setOrigin(0.5);

    this.add.text(
      width / 2,
      78,
      [
        'Corre sin parar · Evita picos y huecos',
        'Toca / Espacio / ↑ = saltar (doble salto en el aire)',
        'Llega a la meta de puntos para desbloquear nivel'
      ].join('\n'),
      {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: '#aa99bb',
        align: 'center',
        lineSpacing: 2
      }
    ).setOrigin(0.5, 0);

    this.add.text(width / 2, 148, 'Elige nivel', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#8888aa'
    }).setOrigin(0.5);

    SpikeRunLevelManager.LEVELS.forEach((lvl, i) => {
      const isUnlocked = lvl.level <= unlocked;
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = col === 0 ? width * 0.28 : width * 0.72;
      const y = 175 + row * 52;

      const btn = this.add
        .rectangle(x, y, 140, 44, isUnlocked ? 0xff4466 : 0x2a2038)
        .setInteractive({ useHandCursor: isUnlocked });

      this.add
        .text(x, y - 7, isUnlocked ? `${lvl.level}. ${lvl.name}` : `${lvl.level} 🔒`, {
          fontFamily: 'Arial',
          fontSize: '12px',
          color: isUnlocked ? '#ffffff' : '#555555'
        })
        .setOrigin(0.5);

      if (isUnlocked) {
        this.add
          .text(x, y + 11, `${lvl.targetScore} pts`, {
            fontFamily: 'Arial',
            fontSize: '10px',
            color: '#ffcccc'
          })
          .setOrigin(0.5);

        btn.on('pointerover', () => btn.setFillStyle(0xff6b81));
        btn.on('pointerout', () => btn.setFillStyle(0xff4466));
        btn.on('pointerdown', () => {
          this.scene.start('SpikeRunScene', { level: lvl.level });
        });
      }
    });

    this.add
      .text(width / 2, height - 48, 'Caer al vacío o tocar un pico = game over', {
        fontFamily: 'Arial',
        fontSize: '10px',
        color: '#665577'
      })
      .setOrigin(0.5);

    const hub = this.add
      .text(16, height - 28, '← Hub', {
        fontFamily: 'Arial',
        fontSize: '14px',
        color: '#8888aa'
      })
      .setInteractive({ useHandCursor: true });

    hub.on('pointerdown', () => this.scene.start('HubScene'));
  }
}