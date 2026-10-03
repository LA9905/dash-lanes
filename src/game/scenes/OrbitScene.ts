import Phaser from 'phaser';
import { CurrencyManager } from '../managers/CurrencyManager';

export class OrbitScene extends Phaser.Scene {
  private ship!: Phaser.Physics.Arcade.Sprite;
  private rocks!: Phaser.Physics.Arcade.Group;
  private score = 0;
  private runCoins = 0;
  private isOver = false;
  private spawnT = 0;
  private ui!: Phaser.GameObjects.Text;

  constructor() { super('OrbitScene'); }

  preload() {
    this.load.audio('coin', '/sounds/coin.mp3');
    this.load.audio('hit', '/sounds/hit.mp3');
  }

  create() {
    const { width, height } = this.scale;
    this.isOver = false; this.score = 0; this.runCoins = 0; this.spawnT = 0;
    this.add.rectangle(width / 2, height / 2, width, height, 0x0a1020);

    if (!this.textures.exists('ship')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x82b1ff, 1);
      g.fillTriangle(20, 0, 0, 36, 40, 36);
      g.generateTexture('ship', 40, 36);
      g.destroy();
    }
    if (!this.textures.exists('rock')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x8d6e63, 1);
      g.fillCircle(16, 16, 16);
      g.generateTexture('rock', 32, 32);
      g.destroy();
    }
    if (!this.textures.exists('orb_coin')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffd700, 1);
      g.fillCircle(10, 10, 10);
      g.generateTexture('orb_coin', 20, 20);
      g.destroy();
    }

    this.ship = this.physics.add.sprite(width / 2, height - 80, 'ship');
    this.ship.setCollideWorldBounds(true);
    (this.ship.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    this.ship.setSize(28, 28);

    this.rocks = this.physics.add.group();
    this.physics.add.overlap(this.ship, this.rocks, (_s, r: any) => {
      if (r.getData('coin')) {
        r.destroy();
        this.runCoins++;
        CurrencyManager.addCoins(1);
        try { this.sound.play('coin', { volume: 0.5 }); } catch (_) {}
      } else {
        this.endGame();
      }
    });

    this.ui = this.add.text(16, 16, '', { fontFamily: 'Arial', fontSize: '15px', color: '#fff' });
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!this.isOver) this.ship.x = Phaser.Math.Clamp(p.x, 30, width - 30);
    });
  }

  update(_: number, delta: number) {
    if (this.isOver) return;
    this.score += delta * 0.03;
    this.ui.setText(`Pts ${Math.floor(this.score)}  ●${this.runCoins}`);
    this.spawnT += delta;
    if (this.spawnT > Math.max(280, 700 - this.score)) {
      this.spawnT = 0;
      const x = Phaser.Math.Between(20, this.scale.width - 20);
      const isCoin = Math.random() < 0.28;
      const o = this.rocks.create(x, -20, isCoin ? 'orb_coin' : 'rock') as Phaser.Physics.Arcade.Sprite;
      o.setData('coin', isCoin);
      (o.body as Phaser.Physics.Arcade.Body).allowGravity = false;
      o.setVelocityY(180 + this.score * 0.4 + Phaser.Math.Between(0, 80));
    }
    this.rocks.getChildren().forEach((o: any) => { if (o.y > 700) o.destroy(); });
  }

  private endGame() {
    if (this.isOver) return;
    this.isOver = true;
    try { this.sound.play('hit', { volume: 0.5 }); } catch (_) {}
    this.physics.pause();
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55);
    this.add.text(width / 2, height * 0.4, `GAME OVER\n+${this.runCoins}💰`, {
      fontFamily: 'Arial Black', fontSize: '24px', color: '#82b1ff', align: 'center'
    }).setOrigin(0.5);
    this.add.rectangle(width / 2, height * 0.58, 160, 44, 0x2979ff)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.restart());
    this.add.text(width / 2, height * 0.58, 'REINTENTAR', {
      fontFamily: 'Arial', fontSize: '16px', color: '#fff'
    }).setOrigin(0.5);
    this.add.rectangle(width / 2, height * 0.68, 160, 40, 0x333355)
      .setInteractive({ useHandCursor: true })
      .on('pointerdown', () => this.scene.start('OrbitMenuScene'));
    this.add.text(width / 2, height * 0.68, 'MENÚ', {
      fontFamily: 'Arial', fontSize: '15px', color: '#fff'
    }).setOrigin(0.5);
  }
}