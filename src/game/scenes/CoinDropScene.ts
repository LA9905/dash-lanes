import Phaser from 'phaser';
import { CurrencyManager } from '../managers/CurrencyManager';

export class CoinDropScene extends Phaser.Scene {
  private basket!: Phaser.Physics.Arcade.Sprite;
  private items!: Phaser.Physics.Arcade.Group;
  private score = 0;
  private runCoins = 0;
  private lives = 3;
  private spawnTimer = 0;
  private isOver = false;
  private ui!: Phaser.GameObjects.Text;
  private speed = 220;

  constructor() {
    super('CoinDropScene');
  }

  preload() {
    this.load.audio('coin', '/sounds/coin.mp3');
    this.load.audio('hit', '/sounds/hit.mp3');
  }

  create() {
    const { width, height } = this.scale;
    this.isOver = false;
    this.score = 0;
    this.runCoins = 0;
    this.lives = 3;
    this.spawnTimer = 0;
    this.speed = 220;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0f1a2a);

    if (!this.textures.exists('basket')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x00e6b8, 1);
      g.fillRoundedRect(0, 8, 64, 28, 8);
      g.fillStyle(0x00ffcc, 1);
      g.fillRect(4, 0, 56, 12);
      g.generateTexture('basket', 64, 36);
      g.destroy();
    }
    if (!this.textures.exists('drop_coin')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffd700, 1);
      g.fillCircle(12, 12, 12);
      g.generateTexture('drop_coin', 24, 24);
      g.destroy();
    }
    if (!this.textures.exists('drop_bad')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xff4466, 1);
      g.fillCircle(12, 12, 12);
      g.fillStyle(0xffffff, 1);
      g.fillRect(6, 10, 12, 4);
      g.generateTexture('drop_bad', 24, 24);
      g.destroy();
    }

    this.basket = this.physics.add.sprite(width / 2, height - 70, 'basket');
    this.basket.setCollideWorldBounds(true);
    this.basket.setImmovable(true);
    (this.basket.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    this.basket.setSize(60, 28);

    this.items = this.physics.add.group();

    this.physics.add.overlap(this.basket, this.items, (_b, item: any) => {
      if (!item?.active) return;
      const isBad = item.getData('bad');
      item.destroy();
      if (isBad) {
        this.lives--;
        try { this.sound.play('hit', { volume: 0.4 }); } catch (_) {}
        if (this.lives <= 0) this.gameOver();
      } else {
        this.runCoins++;
        this.score += 10;
        CurrencyManager.addCoins(1);
        try { this.sound.play('coin', { volume: 0.5 }); } catch (_) {}
      }
      this.refreshUI();
    });

    this.ui = this.add.text(16, 16, '', { fontFamily: 'Arial', fontSize: '15px', color: '#ffffff' });
    this.refreshUI();

    this.add.text(width / 2, 48, 'COIN DROP', {
      fontFamily: 'Arial Black', fontSize: '18px', color: '#ffd700'
    }).setOrigin(0.5);

    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (!this.isOver) this.basket.x = Phaser.Math.Clamp(p.x, 40, width - 40);
    });
    this.input.keyboard?.on('keydown-LEFT', () => {
      if (!this.isOver) this.basket.x = Math.max(40, this.basket.x - 32);
    });
    this.input.keyboard?.on('keydown-RIGHT', () => {
      if (!this.isOver) this.basket.x = Math.min(width - 40, this.basket.x + 32);
    });
  }

  private refreshUI() {
    this.ui.setText(`Pts ${this.score}  ●${this.runCoins}  ❤️${this.lives}  💰${CurrencyManager.getTotalCoins()}`);
  }

  private spawn() {
    const { width } = this.scale;
    
    const count = Math.random() < 0.45 ? 2 : 1;
    for (let i = 0; i < count; i++) {
      const x = Phaser.Math.Between(30, width - 30);
      const bad = Math.random() < 0.55; // más peligrosos
      const item = this.items.create(x, -20, bad ? 'drop_bad' : 'drop_coin') as Phaser.Physics.Arcade.Sprite;
      item.setData('bad', bad);
      const v = this.speed + Phaser.Math.Between(40, 120);
      item.setVelocityY(v);
      (item.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    }
  }

  update(_: number, delta: number) {
    if (this.isOver) return;

    this.speed = Math.min(220 + this.score * 0.55, 480);
    this.spawnTimer += delta;
    
    if (this.spawnTimer > Math.max(180, 520 - this.score * 1.5)) {
      this.spawnTimer = 0;
      this.spawn();
    }

    this.items.getChildren().forEach((o: any) => {
      if (o.y > this.scale.height + 40) o.destroy();
    });
  }

  private gameOver() {
    if (this.isOver) return;
    this.isOver = true;
    this.physics.pause();
    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.55);
    this.add.text(width / 2, height * 0.38, 'GAME OVER', {
      fontFamily: 'Arial Black', fontSize: '28px', color: '#ff4466'
    }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.48, `+${this.runCoins} monedas guardadas`, {
      fontFamily: 'Arial', fontSize: '16px', color: '#ffd700'
    }).setOrigin(0.5);

    const retry = this.add.rectangle(width / 2, height * 0.60, 180, 48, 0xffb300)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.60, 'REINTENTAR', {
      fontFamily: 'Arial Black', fontSize: '18px', color: '#1a1000'
    }).setOrigin(0.5);
    retry.on('pointerdown', () => this.scene.restart());

    const menu = this.add.rectangle(width / 2, height * 0.70, 180, 42, 0x333355)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.70, 'MENÚ', {
      fontFamily: 'Arial', fontSize: '16px', color: '#ffffff'
    }).setOrigin(0.5);
    menu.on('pointerdown', () => this.scene.start('CoinDropMenuScene'));

    const hub = this.add.rectangle(width / 2, height * 0.80, 180, 42, 0x222240)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.80, 'HUB', {
      fontFamily: 'Arial', fontSize: '16px', color: '#ccccdd'
    }).setOrigin(0.5);
    hub.on('pointerdown', () => this.scene.start('HubScene'));
  }
}