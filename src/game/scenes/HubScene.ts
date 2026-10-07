import Phaser from 'phaser';
import { CurrencyManager } from '../managers/CurrencyManager';
import { ScoreManager } from '../managers/ScoreManager';

type GameEntry = {
  id: string;
  title: string;
  subtitle: string;
  color: number;
  scene: string;
  ready: boolean;
};

export class HubScene extends Phaser.Scene {
  private menuMusic?: Phaser.Sound.BaseSound;
  private muteBtn?: Phaser.GameObjects.Text;

  constructor() {
    super('HubScene');
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
    if (this.muteBtn) {
      this.muteBtn.setText(this.isMuted() ? '🔇 Música' : '🔊 Música');
    }
  }

  private toggleMute() {
    const next = !this.isMuted();
    this.setMuted(next);
    if (next) {
      this.menuMusic?.stop();
    } else {
      try {
        this.menuMusic?.play();
      } catch (_) {}
    }
    this.updateMuteLabel();
  }

  create() {
    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a16);
    this.add.rectangle(width / 2, 0, width, 140, 0x00ffcc, 0.07);

    this.add.text(width / 2, 42, 'ARCADE PACK', {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#00ffcc',
      stroke: '#003333',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(width / 2, 80, `💰 ${CurrencyManager.getTotalCoins()}   ·   Récord DL ${ScoreManager.getHighScore()}`, {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffd700'
    }).setOrigin(0.5);

    this.add.text(width / 2, 108, 'Elige un juego', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#8888aa'
    }).setOrigin(0.5);

    // Botón silencio (arriba derecha)
    this.muteBtn = this.add.text(width - 16, 16, '', {
      fontFamily: 'Arial',
      fontSize: '13px',
      color: '#aaaaaa'
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    this.updateMuteLabel();
    this.muteBtn.on('pointerdown', () => this.toggleMute());

    const games: GameEntry[] = [
      { id: 'dash', title: 'DASH LANES', subtitle: 'Esquiva · Salta · Dispara', color: 0x00c9a0, scene: 'MenuScene', ready: true },
      { id: 'spike', title: 'SPIKE RUN', subtitle: 'Geometry · Niveles', color: 0xff4466, scene: 'SpikeRunMenuScene', ready: true },
      { id: 'coin', title: 'COIN DROP', subtitle: 'Granja de monedas', color: 0xffb300, scene: 'CoinDropMenuScene', ready: true },
      { id: 'orbit', title: 'ORBIT WAR', subtitle: 'Esquiva asteroides y naves enemigas', color: 0x2979ff, scene: 'OrbitMenuScene', ready: true },
      { id: 'climb', title: 'WALL CLIMB', subtitle: 'Trepa las paredes', color: 0xff9800, scene: 'ClimbMenuScene', ready: true },
      { id: 'reflex', title: 'REFLEX MIND', subtitle: 'Toca el color', color: 0xe040fb, scene: 'ReflexMenuScene', ready: true }
    ];

    games.forEach((g, i) => {
      const y = 148 + i * 70;

      const card = this.add.rectangle(width / 2, y, 300, 62, g.ready ? g.color : 0x222233)
        .setInteractive({ useHandCursor: g.ready });

      this.add.text(width / 2, y - 10, g.title, {
        fontFamily: 'Arial Black',
        fontSize: '18px',
        color: g.ready ? '#0a0a16' : '#555555'
      }).setOrigin(0.5);

      this.add.text(width / 2, y + 12, g.subtitle, {
        fontFamily: 'Arial',
        fontSize: '13px',
        color: g.ready ? '#1a1a2e' : '#444444'
      }).setOrigin(0.5);

      if (g.ready) {
        card.on('pointerover', () => card.setFillStyle(Phaser.Display.Color.IntegerToColor(g.color).lighten(20).color));
        card.on('pointerout', () => card.setFillStyle(g.color));
        card.on('pointerdown', () => {
          this.menuMusic?.stop();
          this.scene.start(g.scene);
        });
      }
    });

    this.add.text(width / 2, height - 50, 'Las monedas se comparten entre todos los juegos', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#ffffff'
    }).setOrigin(0.5);

    this.menuMusic = this.sound.add('menu', { loop: true, volume: 0.3 });
    if (!this.isMuted()) {
      try {
        this.menuMusic.play();
      } catch (_) {}
    }
  }
}