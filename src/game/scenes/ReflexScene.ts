import Phaser from 'phaser';
import { CurrencyManager } from '../managers/CurrencyManager';

const COLORS = [
  { name: 'ROJO', color: 0xff4466 },
  { name: 'AZUL', color: 0x2979ff },
  { name: 'VERDE', color: 0x4caf50 },
  { name: 'AMARILLO', color: 0xffd700 }
];

export class ReflexScene extends Phaser.Scene {
  private target = 0;
  private score = 0;
  private timeLeft = 3000;
  private isOver = false;
  private label!: Phaser.GameObjects.Text;
  private timerBar!: Phaser.GameObjects.Rectangle;

  constructor() { super('ReflexScene'); }

  create() {
    const { width, height } = this.scale;
    this.isOver = false; this.score = 0; this.timeLeft = 3000;
    this.add.rectangle(width / 2, height / 2, width, height, 0x101018);

    this.label = this.add.text(width / 2, height * 0.22, '', {
      fontFamily: 'Arial Black', fontSize: '28px', color: '#ffffff'
    }).setOrigin(0.5);

    this.timerBar = this.add.rectangle(width / 2, height * 0.30, 200, 10, 0xe040fb);

    COLORS.forEach((c, i) => {
      const x = (i % 2 === 0) ? width * 0.30 : width * 0.70;
      const y = height * 0.48 + Math.floor(i / 2) * 90;
      const btn = this.add.rectangle(x, y, 120, 70, c.color)
        .setInteractive({ useHandCursor: true });
      btn.on('pointerdown', () => this.pick(i));
    });

    this.nextRound();
  }

  private nextRound() {
    this.target = Phaser.Math.Between(0, 3);
    this.label.setText(COLORS[this.target].name);
    this.timeLeft = Math.max(1200, 3000 - this.score * 40);
    this.timerBar.width = 200;
  }

  private pick(i: number) {
    if (this.isOver) return;
    if (i === this.target) {
      this.score++;
      if (this.score % 3 === 0) CurrencyManager.addCoins(1);
      this.nextRound();
    } else {
      this.endGame();
    }
  }

  update(_: number, delta: number) {
    if (this.isOver) return;
    this.timeLeft -= delta;
    this.timerBar.width = Math.max(0, (this.timeLeft / 3000) * 200);
    if (this.timeLeft <= 0) this.endGame();
  }

  private endGame() {
    if (this.isOver) return;
    this.isOver = true;
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
    this.add.text(width / 2, height * 0.4, `FIN\nAciertos ${this.score}`, {
      fontFamily: 'Arial Black', fontSize: '26px', color: '#e040fb', align: 'center'
    }).setOrigin(0.5);
    this.add.rectangle(width / 2, height * 0.58, 160, 44, 0xe040fb)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.restart());
    this.add.text(width / 2, height * 0.58, 'REINTENTAR', {
      fontFamily: 'Arial', fontSize: '15px', color: '#fff'
    }).setOrigin(0.5);
    this.add.rectangle(width / 2, height * 0.68, 160, 40, 0x333355)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('ReflexMenuScene'));
    this.add.text(width / 2, height * 0.68, 'MENÚ', {
      fontFamily: 'Arial', fontSize: '15px', color: '#fff'
    }).setOrigin(0.5);
  }
}