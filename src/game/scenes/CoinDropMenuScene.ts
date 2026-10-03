import Phaser from 'phaser';
import { CurrencyManager } from '../managers/CurrencyManager';

export class CoinDropMenuScene extends Phaser.Scene {
  constructor() {
    super('CoinDropMenuScene');
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0f1a2a);
    this.add.text(width / 2, height * 0.22, 'COIN DROP', {
      fontFamily: 'Arial Black', fontSize: '32px', color: '#ffd700'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.32, `💰 ${CurrencyManager.getTotalCoins()}`, {
      fontFamily: 'Arial', fontSize: '18px', color: '#ffd700'
    }).setOrigin(0.5);

    this.add.text(width / 2, height * 0.40, 'Granja de monedas\nEsquiva los rojos · Atrapa los dorados', {
      fontFamily: 'Arial', fontSize: '14px', color: '#8888aa', align: 'center'
    }).setOrigin(0.5);

    const play = this.add.rectangle(width / 2, height * 0.58, 200, 56, 0xffb300)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.58, 'JUGAR', {
      fontFamily: 'Arial Black', fontSize: '22px', color: '#1a1000'
    }).setOrigin(0.5);
    play.on('pointerdown', () => this.scene.start('CoinDropScene'));

    const hub = this.add.text(16, height - 28, '← Hub', {
      fontFamily: 'Arial', fontSize: '14px', color: '#8888aa'
    }).setInteractive({ useHandCursor: true });
    hub.on('pointerdown', () => this.scene.start('HubScene'));
  }
}