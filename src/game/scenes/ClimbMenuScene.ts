import Phaser from 'phaser';
import { CurrencyManager } from '../managers/CurrencyManager';
import { ClimbLevelManager } from '../managers/ClimbLevelManager';

export class ClimbMenuScene extends Phaser.Scene {
  private menuMusic?: Phaser.Sound.BaseSound;
  private muteBtn?: Phaser.GameObjects.Text;

  constructor() {
    super('ClimbMenuScene');
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
    const unlocked = ClimbLevelManager.getUnlocked();

    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1208);
    this.add.rectangle(width / 2, 0, width, 100, 0xff9800, 0.12);

    this.muteBtn = this.add.text(width - 16, 16, '', {
      fontFamily: 'Arial', fontSize: '13px', color: '#aaaaaa'
    }).setOrigin(1, 0).setInteractive({ useHandCursor: true });
    this.updateMuteLabel();
    this.muteBtn.on('pointerdown', () => this.toggleMute());

    this.add.text(width / 2, 46, 'WALL CLIMB', {
      fontFamily: 'Arial Black', fontSize: '26px', color: '#ff9800',
      stroke: '#3e2723', strokeThickness: 4
    }).setOrigin(0.5);

    this.add.text(width / 2, 72, `💰 ${CurrencyManager.getTotalCoins()}`, {
      fontFamily: 'Arial', fontSize: '13px', color: '#ffd700'
    }).setOrigin(0.5);

    const instructions = this.add.text(width / 2, 96, [
      'Salta de pared a pared (toca izq / der)',
      'Evita pinchos · No dejes que la lava te alcance',
      'Sube para desbloquear la siguiente torre'
    ].join('\n'), {
      fontFamily: 'Arial',
      fontSize: '11px',
      color: '#bb9977',
      align: 'center',
      lineSpacing: 4,
      wordWrap: { width: Math.max(120, width - 32) }
    }).setOrigin(0.5, 0);

    const towerTitleY = instructions.y + instructions.height + 18;
    const gridTop = towerTitleY + 22;
    const gridBottom = height - 80;
    const rows = Math.max(1, Math.ceil(ClimbLevelManager.LEVELS.length / 2));
    const rowStep = Math.min(56, Math.max(1, (gridBottom - gridTop) / rows));
    const buttonHeight = Math.min(44, rowStep * 0.82);
    const buttonWidth = Math.min(140, (width - 48) / 2);
    const levelTextScale = Math.min(1, buttonWidth / 140, buttonHeight / 44);

    this.add.text(width / 2, towerTitleY, 'Elige torre', {
      fontFamily: 'Arial', fontSize: '14px', color: '#bb9977'
    }).setOrigin(0.5);

    ClimbLevelManager.LEVELS.forEach((lvl, i) => {
      const isUnlocked = lvl.level <= unlocked;
      const col = i % 2;
      const row = Math.floor(i / 2);
      const x = col === 0 ? width * 0.25 : width * 0.75;
      const y = gridTop + buttonHeight / 2 + row * rowStep;

      const btn = this.add.rectangle(
        x, y, buttonWidth, buttonHeight,
        isUnlocked ? 0xff9800 : 0x2a2018
      ).setInteractive({ useHandCursor: isUnlocked });

      this.add.text(
        x,
        y - 7 * levelTextScale,
        isUnlocked ? `${lvl.level}. ${lvl.name}` : `${lvl.level} 🔒`,
        {
          fontFamily: 'Arial',
          fontSize: `${11 * levelTextScale}px`,
          color: isUnlocked ? '#1a1000' : '#555544'
        }
      ).setOrigin(0.5);

      if (isUnlocked) {
        this.add.text(x, y + 10 * levelTextScale, `Altura ${lvl.targetHeight}`, {
          fontFamily: 'Arial',
          fontSize: `${10 * levelTextScale}px`,
          color: '#5d4037'
        }).setOrigin(0.5);

        btn.on('pointerover', () => btn.setFillStyle(0xffb74d));
        btn.on('pointerout', () => btn.setFillStyle(0xff9800));
        btn.on('pointerdown', () => {
          this.menuMusic?.stop();
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