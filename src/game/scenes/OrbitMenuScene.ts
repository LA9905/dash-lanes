import Phaser from 'phaser';
import { CurrencyManager } from '../managers/CurrencyManager';

export class OrbitMenuScene extends Phaser.Scene {
  constructor() { super('OrbitMenuScene'); }
  create() {
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a1020);
    this.add.text(width / 2, height * 0.25, 'ORBIT DODGE', {
      fontFamily: 'Arial Black', fontSize: '28px', color: '#82b1ff'
    }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.35, `💰 ${CurrencyManager.getTotalCoins()}\nMueve la nave · Esquiva rocas`, {
      fontFamily: 'Arial', fontSize: '14px', color: '#8899aa', align: 'center'
    }).setOrigin(0.5);
    const play = this.add.rectangle(width / 2, height * 0.55, 200, 54, 0x2979ff)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.55, 'JUGAR', {
      fontFamily: 'Arial Black', fontSize: '20px', color: '#ffffff'
    }).setOrigin(0.5);
    play.on('pointerdown', () => this.scene.start('OrbitScene'));
    this.add.text(16, height - 28, '← Hub', {
      fontFamily: 'Arial', fontSize: '14px', color: '#8888aa'
    }).setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('HubScene'));
  }
}