import Phaser from 'phaser';
import { CurrencyManager } from '../managers/CurrencyManager';
import { ClimbLevelManager, type ClimbLevelConfig } from '../managers/ClimbLevelManager';

type Hold = {
  y: number;
  side: 0 | 1;
  spike: boolean;
  coin: boolean;
  sprite?: Phaser.GameObjects.Rectangle;
  spikeSpr?: Phaser.GameObjects.Triangle;
  coinSpr?: Phaser.GameObjects.Arc;
};

export class ClimbScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private side: 0 | 1 = 0;
  private onWall = true;
  private isOver = false;
  private levelUnlocked = false;
  private score = 0;
  private runCoins = 0;
  private highestY = 0;
  private lavaY = 0;
  private currentLevel = 1;
  private levelConfig!: ClimbLevelConfig;

  private holds: Hold[] = [];
  private nextHoldY = 0;
  private lava!: Phaser.GameObjects.Graphics;

  private scoreText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;

  private readonly leftX = 52;
  private readonly rightX = 308;

  constructor() {
    super('ClimbScene');
  }

  init(data: { level?: number }) {
    this.currentLevel = data.level || 1;
    this.levelConfig = ClimbLevelManager.getLevel(this.currentLevel);
  }

  preload() {
    this.load.audio('jump', '/sounds/jump.mp3');
    this.load.audio('coin', '/sounds/coin.mp3');
    this.load.audio('hit', '/sounds/hit.mp3');
    this.load.audio('level_passed', '/sounds/level-passed.mp3');
  }

  create() {
    const { width, height } = this.scale;
    this.isOver = false;
    this.levelUnlocked = false;
    this.score = 0;
    this.runCoins = 0;
    this.side = 0;
    this.onWall = true;
    this.holds = [];
    this.highestY = 0;
    this.lavaY = height + 40;

    this.physics.world.gravity.y = this.levelConfig.gravity;

    // Fondo
    this.add.rectangle(width / 2, height / 2, width, height, 0x1a1208).setScrollFactor(0);

    // Paredes
    this.add.rectangle(22, height / 2, 44, height + 40, 0x5d4037).setScrollFactor(0).setDepth(1);
    this.add.rectangle(width - 22, height / 2, 44, height + 40, 0x5d4037).setScrollFactor(0).setDepth(1);
    // Detalle ladrillos
    for (let i = 0; i < 20; i++) {
      this.add.rectangle(22, i * 40, 44, 2, 0x3e2723, 0.5).setScrollFactor(0).setDepth(1);
      this.add.rectangle(width - 22, i * 40, 44, 2, 0x3e2723, 0.5).setScrollFactor(0).setDepth(1);
    }

    this.ensureTextures();

    // Jugador
    this.player = this.physics.add.sprite(this.leftX, height - 100, 'climber');
    this.player.setCollideWorldBounds(false);
    this.player.setBounce(0);
    this.player.setSize(22, 26);
    this.player.setDepth(5);
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setAllowGravity(true);
    body.setDragX(0);
    body.setMaxVelocity(900, 1200);
    body.setFriction(0, 0);

    // Pegado a pared izquierda al inicio
    this.stickToWall(0);

    // Lava
    this.lava = this.add.graphics().setScrollFactor(0).setDepth(4);
    this.nextHoldY = height - 180;
    for (let i = 0; i < 25; i++) this.spawnHold();

    // UI
    this.add.rectangle(width / 2, 26, width - 12, 48, 0x000000, 0.5).setScrollFactor(0).setDepth(20);
    this.add.text(16, 10, `Torre ${this.currentLevel}`, {
      fontFamily: 'Arial Black', fontSize: '12px', color: '#ff9800'
    }).setScrollFactor(0).setDepth(21);
    this.scoreText = this.add.text(16, 28, '0', {
      fontFamily: 'Arial Black', fontSize: '16px', color: '#ffffff'
    }).setScrollFactor(0).setDepth(21);
    this.progressText = this.add.text(width / 2, 18, '', {
      fontFamily: 'Arial', fontSize: '12px', color: '#aa8866'
    }).setOrigin(0.5, 0).setScrollFactor(0).setDepth(21);
    this.add.text(width - 16, 16, `💰 ${CurrencyManager.getTotalCoins()}`, {
      fontFamily: 'Arial', fontSize: '12px', color: '#ffd700'
    }).setOrigin(1, 0).setScrollFactor(0).setDepth(21);

    this.input.on('pointerdown', (p: Phaser.Input.Pointer) => {
      if (this.isOver) return;
      const toLeft = p.x < width / 2;
      this.jumpTo(toLeft ? 0 : 1);
    });
  }

  private ensureTextures() {
    if (!this.textures.exists('climber')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xff9800, 1);
      g.fillRoundedRect(4, 4, 24, 28, 5);
      g.fillStyle(0xffe0b2, 1);
      g.fillCircle(16, 12, 6);
      g.fillStyle(0xe65100, 1);
      g.fillRect(8, 24, 6, 10);
      g.fillRect(18, 24, 6, 10);
      g.generateTexture('climber', 32, 36);
      g.destroy();
    }
  }

  private stickToWall(side: 0 | 1) {
    this.side = side;
    this.onWall = true;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setVelocity(0, 0);
    body.allowGravity = false;
    this.player.x = side === 0 ? this.leftX : this.rightX;
    this.player.setFlipX(side === 1);
  }

  private jumpTo(targetSide: 0 | 1) {
    if (this.isOver) return;

  const body = this.player.body as Phaser.Physics.Arcade.Body;

  if (!this.onWall) {
    const targetX = targetSide === 0 ? this.leftX : this.rightX;
    const distanceX = targetX - this.player.x;

    if (Math.abs(distanceX) <= 16) return;

    const direction = distanceX < 0 ? -1 : 1;
    body.setVelocityX(direction * Math.max(560, this.levelConfig.jumpX));
    this.player.setFlipX(direction > 0);
    return;
  }

  body.allowGravity = true;
    body.setDrag(0, 0);
    this.onWall = false;

    // Mismo lado = impulso corto hacia arriba
    if (targetSide === this.side) {
      const nudge = targetSide === 0 ? -80 : 80;
      body.setVelocity(nudge, this.levelConfig.jumpY * 0.65);
      try { this.sound.play('jump', { volume: 0.3 }); } catch (_) {}
      return;
    }

    // Pared contraria
    const dir = targetSide === 0 ? -1 : 1;
    const vx = dir * Math.max(560, this.levelConfig.jumpX);
    const vy = Math.min(-480, this.levelConfig.jumpY);
    body.setVelocity(vx, vy);
    try { this.sound.play('jump', { volume: 0.45 }); } catch (_) {}
  }

  private spawnHold() {
    const side = (this.holds.length % 2) as 0 | 1;
    const spike = Math.random() < this.levelConfig.spikeChance;
    const coin = !spike && Math.random() < this.levelConfig.coinChance;
    const y = this.nextHoldY;
    this.nextHoldY -= Phaser.Math.Between(70, 100);

    const x = side === 0 ? 48 : this.scale.width - 48;
    const spr = this.add.rectangle(x, y, 18, 10, spike ? 0xff1744 : 0x8d6e63).setDepth(2);

    let spikeSpr: Phaser.GameObjects.Triangle | undefined;
    if (spike) {
      spikeSpr = this.add.triangle(
        x + (side === 0 ? 14 : -14), y,
        0, 10, 12, 0, 24, 10,
        0xff5252
      ).setDepth(3);
    }

    let coinSpr: Phaser.GameObjects.Arc | undefined;
    if (coin) {
      coinSpr = this.add.circle(this.scale.width / 2, y - 20, 8, 0xffd700).setDepth(3);
    }

    this.holds.push({ y, side, spike, coin, sprite: spr, spikeSpr, coinSpr });
  }

  update(_: number, delta: number) {
    if (this.isOver) return;

    const { height } = this.scale;
    const body = this.player.body as Phaser.Physics.Arcade.Body;

    const heightScore = Math.max(0, Math.floor(((height - 100) - this.player.y) / 8));
    if (heightScore > this.score) this.score = heightScore;
    if (this.player.y < this.highestY || this.highestY === 0) {
      this.highestY = this.player.y;
    }

    this.scoreText.setText(`Altura ${this.score}  ●${this.runCoins}`);

    if (this.score < this.levelConfig.targetHeight) {
      this.progressText.setText(`Meta ${this.levelConfig.targetHeight - this.score}`);
      this.progressText.setColor('#aa8866');
    } else {
      this.progressText.setText('¡Torre desbloqueada!');
      this.progressText.setColor('#00e676');
      if (!this.levelUnlocked) {
        this.levelUnlocked = true;
        ClimbLevelManager.unlock(this.currentLevel + 1);
        try { this.sound.play('level_passed', { volume: 0.55 }); } catch (_) {}
      }
    }

    if (!this.onWall) {
      if (body.velocity.x < 0 && this.player.x <= this.leftX + 16) {
        this.player.x = this.leftX;
        this.stickToWall(0);
        this.checkSpikeOnLand();
      } else if (body.velocity.x > 0 && this.player.x >= this.rightX - 16) {
        this.player.x = this.rightX;
        this.stickToWall(1);
        this.checkSpikeOnLand();
      }
    } else {
      this.player.x = this.side === 0 ? this.leftX : this.rightX;
      body.setVelocity(0, 0);
    }

    // Monedas
    this.holds.forEach(h => {
      if (h.coin && h.coinSpr && h.coinSpr.active) {
        const dx = this.player.x - h.coinSpr.x;
        const dy = this.player.y - h.coinSpr.y;
        if (dx * dx + dy * dy < 28 * 28) {
          h.coinSpr.destroy();
          h.coin = false;
          this.runCoins++;
          CurrencyManager.addCoins(1);
          try { this.sound.play('coin', { volume: 0.45 }); } catch (_) {}
        }
      }
    });

    while (this.nextHoldY > this.player.y - 600) {
      this.spawnHold();
    }

    // Lava sube más rápido si el jugador se aleja demasiado
    const dt = Math.min(delta / 1000, 0.05);
    const gap = this.lavaY - this.player.y;
    const catchUpSpeed = Phaser.Math.Clamp((gap - 180) * 2, 0, 260);

    this.lavaY -= (this.levelConfig.lavaSpeed + catchUpSpeed) * dt;

    if (this.player.y > this.lavaY) {
      this.die();
      return;
    }

    if (this.player.y > height + 80) {
      this.die();
      return;
    }

    // Cámara sigue al jugdor
    this.cameras.main.scrollY = this.player.y - height * 0.65;
    this.drawLava();
  }

  private drawLava() {
  const { width, height } = this.scale;
  const surfaceY = this.lavaY - this.cameras.main.scrollY;
  const time = this.time.now / 1000;
  const left = 44;
  const lavaWidth = width - 88;

  this.lava.clear();

  if (surfaceY >= height) return;

  const top = Math.max(0, surfaceY);

  // Relleno
  this.lava.fillStyle(0xc62800, 1);
  this.lava.fillRect(left, top, lavaWidth, height - top + 2);

  this.lava.fillStyle(0xff4b00, 1);
  this.lava.fillRect(
    left,
    top,
    lavaWidth,
    Math.max(0, Math.min(height - top, surfaceY + 65 - top))
  );

  for (let i = 0; i < 18; i++) {
    const x = left + 12 + ((i * 47) % Math.max(1, lavaWidth - 24));
    const y = surfaceY + 18 + ((i * 37 + time * 28) % 240);

    if (y < 0 || y > height + 10) continue;

    this.lava.fillStyle(i % 2 === 0 ? 0xff9100 : 0xff6500, 0.8);
    this.lava.fillEllipse(x, y, 12 + (i % 3) * 6, 5);
  }

  if (surfaceY >= 0) {
    this.lava.fillStyle(0xffb300, 1);
    this.lava.fillRect(left, surfaceY, lavaWidth, 8);

    this.lava.lineStyle(3, 0xffec80, 1);
    this.lava.lineBetween(left, surfaceY, width - left, surfaceY);

    for (let i = 0; i < 12; i++) {
      const x = left + 10 + (i / 11) * (lavaWidth - 20);
      const radius = 2 + (Math.sin(time * 5 + i * 1.7) + 1) * 2;

      this.lava.fillStyle(0xffd740, 0.9);
      this.lava.fillCircle(x, surfaceY + 5, radius);
    }
  }
}

  private checkSpikeOnLand() {
    for (const h of this.holds) {
      if (h.side !== this.side || !h.spike) continue;
      if (Math.abs(h.y - this.player.y) < 28) {
        this.die();
        return;
      }
    }
  }

  private die() {
    if (this.isOver) return;
    this.isOver = true;
    try { this.sound.play('hit', { volume: 0.5 }); } catch (_) {}
    this.physics.pause();

    const { width, height } = this.scale;
    const cam = this.cameras.main.scrollY;

    this.add.rectangle(width / 2, cam + height / 2, width, height, 0x000000, 0.6).setScrollFactor(1).setDepth(30);
    this.add.text(width / 2, cam + height * 0.32, 'CAÍSTE', {
      fontFamily: 'Arial Black', fontSize: '32px', color: '#ff9800'
    }).setOrigin(0.5).setDepth(31);
    this.add.text(width / 2, cam + height * 0.42, `Altura ${this.score}  ·  +${this.runCoins}💰`, {
      fontFamily: 'Arial', fontSize: '16px', color: '#ffffff'
    }).setOrigin(0.5).setDepth(31);

    const retry = this.add.rectangle(width / 2, cam + height * 0.54, 180, 48, 0xff9800)
      .setInteractive({ useHandCursor: true }).setDepth(31);
    this.add.text(width / 2, cam + height * 0.54, 'REINTENTAR', {
      fontFamily: 'Arial Black', fontSize: '16px', color: '#1a1000'
    }).setOrigin(0.5).setDepth(32);
    retry.on('pointerdown', () => this.scene.restart({ level: this.currentLevel }));

    const menu = this.add.rectangle(width / 2, cam + height * 0.64, 180, 42, 0x4e342e)
      .setInteractive({ useHandCursor: true }).setDepth(31);
    this.add.text(width / 2, cam + height * 0.64, 'MENÚ CLIMB', {
      fontFamily: 'Arial', fontSize: '15px', color: '#ffffff'
    }).setOrigin(0.5).setDepth(32);
    menu.on('pointerdown', () => this.scene.start('ClimbMenuScene'));

    const hub = this.add.rectangle(width / 2, cam + height * 0.74, 180, 40, 0x2a2018)
      .setInteractive({ useHandCursor: true }).setDepth(31);
    this.add.text(width / 2, cam + height * 0.74, 'HUB JUEGOS', {
      fontFamily: 'Arial', fontSize: '14px', color: '#aa8866'
    }).setOrigin(0.5).setDepth(32);
    hub.on('pointerdown', () => this.scene.start('HubScene'));
  }
}