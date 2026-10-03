import Phaser from 'phaser';
import { CurrencyManager } from '../managers/CurrencyManager';

export class ReflexMenuScene extends Phaser.Scene {
  constructor() { super('ReflexMenuScene'); }
  create() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x101018);
    this.add.text(width / 2, height * 0.25, 'REFLEX', {
      fontFamily: 'Arial Black', fontSize: '32px', color: '#e040fb'
    }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.36, `💰 ${CurrencyManager.getTotalCoins()}\nToca el color que dice la pantalla`, {
      fontFamily: 'Arial', fontSize: '14px', color: '#9988aa', align: 'center'
    }).setOrigin(0.5);
    const play = this.add.rectangle(width / 2, height * 0.55, 200, 54, 0xe040fb)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.55, 'JUGAR', {
      fontFamily: 'Arial Black', fontSize: '20px', color: '#ffffff'
    }).setOrigin(0.5);
    play.on('pointerdown', () => this.scene.start('ReflexScene'));
    this.add.text(16, height - 28, '← Hub', {
      fontFamily: 'Arial', fontSize: '14px', color: '#8888aa'
    }).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('HubScene'));
  }
}