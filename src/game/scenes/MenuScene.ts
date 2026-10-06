import Phaser from 'phaser';
import { ScoreManager } from '../managers/ScoreManager';
import { LevelManager } from '../managers/LevelManager';
import { CurrencyManager } from '../managers/CurrencyManager';

export class MenuScene extends Phaser.Scene {
  private menuMusic?: Phaser.Sound.BaseSound;
  private muteBtn?: Phaser.GameObjects.Text;

  constructor() {
    super('MenuScene');
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
    const unlocked = LevelManager.getCurrentUnlockedLevel();

    this.add.rectangle(width / 2, height / 2, width, height, 0x0a0a18);
    this.add.rectangle(width / 2, 0, width, 150, 0x00ffcc, 0.08);

    this.add.text(width / 2, 44, 'DASH LANES', {
      fontFamily: 'Arial Black',
      fontSize: '28px',
      color: '#00ffcc',
      stroke: '#003333',
      strokeThickness: 5
    }).setOrigin(0.5);

    this.add.text(width / 2, 70, `Récord ${ScoreManager.getHighScore()}  ·  💰 ${CurrencyManager.getTotalCoins()}`, {
      fontFamily: 'Arial',
      fontSize: '13px',
      color: '#ffd700'
    }).setOrigin(0.5);

    const instructions = this.add.text(
      width / 2,
      94,
      [
        'Esquiva obstáculos · Recoge monedas',
        'Móvil: desliza carril · doble toque centro = salto',
        'PC: ← → carril | Espacio salto | Z/X disparo | B balas',
        'Abuelas: −5💰  ·  Combustible: 10💰  ·  +3 balas: 6💰',
        'Autopista: tecla V cambia sentido de la vía'
      ].join('\n'),
      {
        fontFamily: 'Arial',
        fontSize: '11px',
        color: '#8899aa',
        align: 'center',
        lineSpacing: 4,
        wordWrap: { width: Math.max(120, width - 32) }
      }
    ).setOrigin(0.5, 0);

    // Silencio
    this.muteBtn = this.add.text(width - 16, 16, '', {
      fontFamily: 'Arial',
      fontSize: '13px',
      color: '#aaaaaa'
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    this.updateMuteLabel();
    this.muteBtn.on('pointerdown', () => this.toggleMute());

    const levelTitleY = instructions.y + instructions.height + 18;
    const gridTop = levelTitleY + 18;
    const gridBottom = height - 100;
    const rows = Math.max(1, Math.ceil(LevelManager.LEVELS.length / 2));
    const rowStep = Math.min(56, Math.max(1, (gridBottom - gridTop) / rows));
    const buttonHeight = Math.min(44, rowStep * 0.82);
    const buttonWidth = Math.min(140, (width - 48) / 2);
    const levelTextScale = Math.min(1, buttonWidth / 140, buttonHeight / 44);

    this.add.text(width / 2, levelTitleY, 'Elige nivel', {
      fontFamily: 'Arial',
      fontSize: '14px',
      color: '#888888'
    }).setOrigin(0.5);

    LevelManager.LEVELS.forEach((lvl, i) => {
      const isUnlocked = lvl.level <= unlocked;
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = col === 0 ? width * 0.25 : width * 0.75;
      const y = gridTop + buttonHeight / 2 + row * rowStep;

      const btn = this.add
        .rectangle(x, y, buttonWidth, buttonHeight, isUnlocked ? 0x00c9a0 : 0x222233)
        .setInteractive({ useHandCursor: isUnlocked });

      this.add
        .text(x, y - 7 * levelTextScale, isUnlocked ? `${lvl.level}. ${lvl.name}` : `${lvl.level} 🔒`, {
          fontFamily: 'Arial',
          fontSize: `${12 * levelTextScale}px`,
          color: isUnlocked ? '#003333' : '#555555'
        })
        .setOrigin(0.5);

      if (isUnlocked) {
        this.add
          .text(x, y + 11 * levelTextScale, `${lvl.minScore} pts`, {
            fontFamily: 'Arial',
            fontSize: `${10 * levelTextScale}px`,
            color: '#004440'
          })
          .setOrigin(0.5);

        btn.on('pointerdown', () => {
          this.menuMusic?.stop();
          this.scene.start('GameScene', { level: lvl.level });
        });
      }
    });

    this.add
    .text(width / 2, height - 66, 'Meta de puntos = desbloquea el siguiente nivel', {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: '#778899',
      align: 'center',
      wordWrap: { width: Math.max(120, width - 32) }
    })
    .setOrigin(0.5, 1);

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

    this.menuMusic = this.sound.add('menu', { loop: true, volume: 0.35 });
    if (!this.isMuted()) {
      try {
        this.menuMusic.play();
      } catch (_) {}
    }
  }
}