import Phaser from 'phaser';
import { CurrencyManager } from '../managers/CurrencyManager';

export class ClimbMenuScene extends Phaser.Scene {
  constructor() { super('ClimbMenuScene'); }
  create() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1208);
    this.add.text(width / 2, height * 0.25, 'WALL CLIMB', {
      fontFamily: 'Arial Black', fontSize: '28px', color: '#ff9800'
    }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.36, `💰 ${CurrencyManager.getTotalCoins()}\nToca izq/der para trepar`, {
      fontFamily: 'Arial', fontSize: '14px', color: '#aa8866', align: 'center'
    }).setOrigin(0.5);
    const play = this.add.rectangle(width / 2, height * 0.55, 200, 54, 0xff9800)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.55, 'JUGAR', {
      fontFamily: 'Arial Black', fontSize: '20px', color: '#1a1000'
    }).setOrigin(0.5);
    play.on('pointerdown', () => this.scene.start('ClimbScene'));
    this.add.text(16, height - 28, '← Hub', {
      fontFamily: 'Arial', fontSize: '14px', color: '#8888aa'
    }).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('HubScene'));
  }
}