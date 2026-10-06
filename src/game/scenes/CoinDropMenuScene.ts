import Phaser from 'phaser';
import { CurrencyManager } from '../managers/CurrencyManager';

export class CoinDropMenuScene extends Phaser.Scene {
  private menuMusic?: Phaser.Sound.BaseSound;
  private muteBtn?: Phaser.GameObjects.Text;

  constructor() {
    super('CoinDropMenuScene');
  }

  preload() {
    this.load.audio('menu', '/sounds/menu.mp3');
  }

  private isMuted(): boolean {
    return localStorage.getItem('arcade_music_muted') === '1';
  }

  private setMuted(muted: boolean) {
    localStorage.setItem('arcade_music_muted', muted ? '1' : '0');
  }

  private updateMuteLabel() {
    if (this.muteBtn) this.muteBtn.setText(this.isMuted() ? '🔇 Música' : '🔊 Música');
  }

  private toggleMute() {
    const next = !this.isMuted();
    this.setMuted(next);
    if (next) this.menuMusic?.stop();
    else {
      try { this.menuMusic?.play(); } catch (_) {}
    }
    this.updateMuteLabel();
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0f1a2a);

    this.muteBtn = this.add.text(width - 16, 16, '', {
      fontFamily: 'Arial', fontSize: '13px', color: '#aaaaaa'
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    this.updateMuteLabel();
    this.muteBtn.on('pointerdown', () => this.toggleMute());

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
    play.on('pointerdown', () => {
      this.menuMusic?.stop();
      this.scene.start('CoinDropScene');
    });

    const hubBtn = this.add.rectangle(width / 2, height - 32, 160, 36, 0x222240)
      .setInteractive({ useHandCursor: true })
      .setStrokeStyle(1, 0x3a3a5a);

    this.add.text(width / 2, height - 32, '← HUB JUEGOS', {
      fontFamily: 'Arial', fontSize: '13px', color: '#aaaaaa'
    }).setOrigin(0.5);

    hubBtn.on('pointerover', () => hubBtn.setFillStyle(0x2a2a50));
    hubBtn.on('pointerout', () => hubBtn.setFillStyle(0x222240));
    hubBtn.on('pointerdown', () => {
      this.menuMusic?.stop();
      this.scene.start('HubScene');
    });

    this.menuMusic = this.sound.add('menu', { loop: true, volume: 0.3 });
    if (!this.isMuted()) {
      try { this.menuMusic.play(); } catch (_) {}
    }
  }
}