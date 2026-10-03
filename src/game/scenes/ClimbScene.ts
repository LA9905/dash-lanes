import Phaser from 'phaser';
import { CurrencyManager } from '../managers/CurrencyManager';

export class ClimbScene extends Phaser.Scene {
  private player!: Phaser.GameObjects.Rectangle;
  private side = 0;
  private yPos = 500;
  private scroll = 0;
  private score = 0;
  private gaps: { y: number; side: number }[] = [];
  private isOver = false;
  private ui!: Phaser.GameObjects.Text;
  private walls: Phaser.GameObjects.Rectangle[] = [];

  constructor() { super('ClimbScene'); }

  create() {
    const { width, height } = this.scale;
    this.isOver = false; this.side = 0; this.yPos = height - 120; this.scroll = 0; this.score = 0;
    this.gaps = []; this.walls = [];

    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1208);
    this.walls.push(this.add.rectangle(30, height / 2, 40, height * 3, 0x5d4037));
    this.walls.push(this.add.rectangle(width - 30, height / 2, 40, height * 3, 0x5d4037));

    this.player = this.add.rectangle(55, this.yPos, 28, 28, 0xff9800);
    this.ui = this.add.text(16, 16, '', { fontFamily: 'Arial', fontSize: '15px', color: '#fff' });

    // huecos peligrosos
    for (let i = 0; i < 40; i++) {
      this.gaps.push({ y: 400 - i * 140, side: i % 2 });
    }

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.isOver) return;
      this.side = p.x < width / 2 ? 0 : 1;
      this.player.x = this.side === 0 ? 55 : width - 55;
      this.yPos -= 70;
      this.score += 10;
      if (Math.random() < 0.2) {
        CurrencyManager.addCoins(1);
      }
    });
  }

  update(_: number, delta: number) {
    if (this.isOver) return;
    this.scroll += delta * 0.08;
    this.player.y = this.yPos + this.scroll * 0.3;
    this.ui.setText(`Altura ${this.score}  💰${CurrencyManager.getTotalCoins()}`);

    for (const g of this.gaps) {
      const gy = g.y + this.scroll;
      if (Math.abs(gy - this.player.y) < 25 && g.side === this.side) {
        this.isOver = true;
        this.add.rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width, this.scale.height, 0x000000, 0.55);
        this.add.text(this.scale.width / 2, this.scale.height * 0.4, `CAÍSTE\n${this.score}`, {
          fontFamily: 'Arial Black', fontSize: '26px', color: '#ff9800', align: 'center'
        }).setOrigin(0.5);
        this.add.rectangle(this.scale.width / 2, this.scale.height * 0.58, 160, 44, 0xff9800)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => this.scene.restart());
        this.add.text(this.scale.width / 2, this.scale.height * 0.58, 'REINTENTAR', {
          fontFamily: 'Arial', fontSize: '15px', color: '#1a1000'
        }).setOrigin(0.5);
        this.add.rectangle(this.scale.width / 2, this.scale.height * 0.68, 160, 40, 0x333355)
          .setInteractive({ useHandCursor: true })
          .on('pointerdown', () => this.scene.start('ClimbMenuScene'));
        this.add.text(this.scale.width / 2, this.scale.height * 0.68, 'MENÚ', {
          fontFamily: 'Arial', fontSize: '15px', color: '#fff'
        }).setOrigin(0.5);
        break;
      }
    }
  }
}