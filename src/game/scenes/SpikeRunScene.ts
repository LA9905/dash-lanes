import Phaser from 'phaser';
import { CurrencyManager } from '../managers/CurrencyManager';
import { SpikeRunLevelManager, type SpikeLevelConfig } from '../managers/SpikeRunLevelManager';

export class SpikeRunScene extends Phaser.Scene {
  private player!: Phaser.Physics.Arcade.Sprite;
  private solid!: Phaser.Physics.Arcade.Group;
  private hazards!: Phaser.Physics.Arcade.Group;
  private coins!: Phaser.Physics.Arcade.Group;

  private score = 0;
  private runCoins = 0;
  private speed = 300;
  private isOver = false;
  private levelUnlocked = false;
  private jumpsLeft = 2;
  private currentLevel = 1;
  private levelConfig!: SpikeLevelConfig;

  private scoreText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private bgLayers: Phaser.GameObjects.Rectangle[] = [];

  private genX = 400;

  constructor() {
    super('SpikeRunScene');
  }

  init(data: { level?: number }) {
    this.currentLevel = data.level || 1;
    this.levelConfig = SpikeRunLevelManager.getLevel(this.currentLevel);
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
    this.speed = this.levelConfig.baseSpeed;
    this.bgLayers = [];
    this.genX = 0;
    this.jumpsLeft = 2;

    // Fondo
    this.add.rectangle(width / 2, height / 2, width, height, 0x12081c);
    for (let i = 0; i < 8; i++) {
      const bar = this.add.rectangle(
        i * 100,
        height * 0.28,
        Phaser.Math.Between(24, 50),
        Phaser.Math.Between(50, 160),
        0x2a1840,
        0.45
      );
      this.bgLayers.push(bar);
    }
    for (let gx = 0; gx < 12; gx++) {
      this.add.rectangle(gx * 40, height / 2, 1, height, 0xffffff, 0.03);
    }

    this.ensureTextures();

    this.solid = this.physics.add.group({ allowGravity: false, immovable: true });
    this.hazards = this.physics.add.group({ allowGravity: false });
    this.coins = this.physics.add.group({ allowGravity: false });
    this.spawnGroundBlock(0, 320);
    this.genX = 320;

    // Jugador
    this.player = this.physics.add.sprite(100, height - 120, 'cube');
    this.player.setBounce(0);
    this.player.setSize(28, 28);
    this.player.setOffset(4, 4);
    this.player.setCollideWorldBounds(false);

    this.physics.world.gravity.y = 0;
    const body = this.player.body as Phaser.Physics.Arcade.Body;
    body.setGravityY(1850);
    body.setMaxVelocityY(1100);

    this.physics.add.collider(this.player, this.solid, () => {
      const b = this.player.body as Phaser.Physics.Arcade.Body;
      if (b.blocked.down || b.touching.down) {
        this.jumpsLeft = 2;
        this.player.setAngle(0);
      }
    });

    this.physics.add.overlap(this.player, this.hazards, () => this.gameOver());
    this.physics.add.overlap(this.player, this.coins, (_p, c: any) => {
      if (!c?.active) return;
      c.destroy();
      this.runCoins++;
      CurrencyManager.addCoins(1);
      try {
        this.sound.play('coin', { volume: 0.5 });
      } catch (_) {}
    });

    // UI
    this.add.rectangle(width / 2, 28, width - 12, 48, 0x000000, 0.4);
    this.add.text(16, 10, `Nv.${this.currentLevel}`, {
      fontFamily: 'Arial Black',
      fontSize: '13px',
      color: '#ff4466'
    });
    this.scoreText = this.add.text(16, 28, '0', {
      fontFamily: 'Arial Black',
      fontSize: '20px',
      color: '#ffffff'
    });
    this.progressText = this.add.text(width / 2, 18, '', {
      fontFamily: 'Arial',
      fontSize: '12px',
      color: '#aaaaaa'
    }).setOrigin(0.5, 0);
    this.add.text(width - 16, 16, `💰 ${CurrencyManager.getTotalCoins()}`, {
      fontFamily: 'Arial',
      fontSize: '13px',
      color: '#ffd700'
    }).setOrigin(1, 0);

    // PC + móvil + tablet
    this.input.on('pointerdown', () => this.jump());
    this.input.keyboard?.on('keydown-SPACE', () => this.jump());
    this.input.keyboard?.on('keydown-UP', () => this.jump());
  }

  private ensureTextures() {
    if (!this.textures.exists('cube')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x00ffcc, 1);
      g.fillRoundedRect(0, 0, 36, 36, 4);
      g.fillStyle(0xffffff, 0.4);
      g.fillRect(4, 4, 14, 10);
      g.lineStyle(3, 0x00aa88, 1);
      g.strokeRoundedRect(1, 1, 34, 34, 4);
      g.generateTexture('cube', 36, 36);
      g.destroy();
    }
    if (!this.textures.exists('plat')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x5c4d7a, 1);
      g.fillRect(0, 0, 80, 18);
      g.fillStyle(0xff4466, 1);
      g.fillRect(0, 0, 80, 3);
      g.generateTexture('plat', 80, 18);
      g.destroy();
    }
    if (!this.textures.exists('ground_seg')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x3d2b56, 1);
      g.fillRect(0, 0, 64, 48);
      g.fillStyle(0xff4466, 0.8);
      g.fillRect(0, 0, 64, 4);
      g.generateTexture('ground_seg', 64, 48);
      g.destroy();
    }
    if (!this.textures.exists('spike')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xff4466, 1);
      g.fillTriangle(0, 40, 20, 0, 40, 40);
      g.fillStyle(0xff8a9a, 1);
      g.fillTriangle(8, 40, 20, 12, 32, 40);
      g.generateTexture('spike', 40, 40);
      g.destroy();
    }
    if (!this.textures.exists('spike_down')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xff9800, 1);
      g.fillTriangle(0, 0, 20, 40, 40, 0);
      g.generateTexture('spike_down', 40, 40);
      g.destroy();
    }
    if (!this.textures.exists('sr_coin')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffd700, 1);
      g.fillCircle(12, 12, 12);
      g.fillStyle(0xfff3a0, 1);
      g.fillCircle(12, 12, 6);
      g.generateTexture('sr_coin', 24, 24);
      g.destroy();
    }
  }

  /** Salto alto + doble salto en el aire */
  private jump() {
    if (this.isOver) return;
    if (this.jumpsLeft <= 0) return;

    const body = this.player.body as Phaser.Physics.Arcade.Body;
    const power = this.jumpsLeft === 2 ? -630 : -570;
    body.setVelocityY(power);
    this.jumpsLeft--;

    this.tweens.add({
      targets: this.player,
      angle: this.player.angle + 90,
      duration: 280,
      ease: 'Sine.easeIn'
    });

    try {
      this.sound.play('jump', { volume: 0.45 });
    } catch (_) {}
  }

  private spawnGroundBlock(startX: number, totalW: number) {
    const { height } = this.scale;
    const segs = Math.ceil(totalW / 64);
    for (let i = 0; i < segs; i++) {
      const s = this.solid.create(
        startX + i * 64 + 32,
        height - 24,
        'ground_seg'
      ) as Phaser.Physics.Arcade.Sprite;
      s.setImmovable(true);
      (s.body as Phaser.Physics.Arcade.Body).allowGravity = false;
      s.setData('scroll', true);
    }
  }

  private spawnPlatform(x: number, y: number, count = 1) {
    for (let i = 0; i < count; i++) {
      const p = this.solid.create(x + i * 80, y, 'plat') as Phaser.Physics.Arcade.Sprite;
      p.setImmovable(true);
      (p.body as Phaser.Physics.Arcade.Body).allowGravity = false;
      p.setData('scroll', true);
    }
  }

  private spawnSpike(x: number, y: number, down = false) {
    const key = down ? 'spike_down' : 'spike';
    const s = this.hazards.create(x, y, key) as Phaser.Physics.Arcade.Sprite;
    (s.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    s.setSize(28, 30);
    s.setData('scroll', true);
  }

  private spawnCoin(x: number, y: number) {
    const c = this.coins.create(x, y, 'sr_coin') as Phaser.Physics.Arcade.Sprite;
    (c.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    c.setData('scroll', true);
  }

  private appendPattern() {
    const { height } = this.scale;
    const groundY = height - 24;

    const patterns: (() => void)[] = [
      // suelo + picos
      () => {
        this.spawnGroundBlock(this.genX, 200);
        this.spawnSpike(this.genX + 100, groundY - 44);
        this.spawnCoin(this.genX + 100, groundY - 130);
        this.genX += 200;
      },
      // hueco
      () => {
        this.spawnGroundBlock(this.genX, 120);
        this.genX += 120;
        this.genX += 90;
        this.spawnGroundBlock(this.genX, 160);
        this.spawnCoin(this.genX - 45, groundY - 110);
        this.genX += 160;
      },
      // plataforma media
      () => {
        this.spawnGroundBlock(this.genX, 100);
        this.genX += 100;
        this.spawnPlatform(this.genX + 40, height - 150, 2);
        this.spawnCoin(this.genX + 80, height - 195);
        this.spawnSpike(this.genX + 80, height - 168);
        this.genX += 220;
        this.spawnGroundBlock(this.genX, 140);
        this.genX += 140;
      },
      // plataformas alta + baja
      () => {
        this.spawnGroundBlock(this.genX, 80);
        this.genX += 80;
        this.genX += 70;
        this.spawnPlatform(this.genX, height - 200, 2);
        this.spawnCoin(this.genX + 40, height - 250);
        this.genX += 180;
        this.spawnPlatform(this.genX, height - 130, 1);
        this.genX += 100;
        this.spawnGroundBlock(this.genX, 120);
        this.genX += 120;
      },
      // doble pico + monedas
      () => {
        this.spawnGroundBlock(this.genX, 260);
        this.spawnSpike(this.genX + 90, groundY - 44);
        this.spawnSpike(this.genX + 128, groundY - 44);
        this.spawnCoin(this.genX + 110, groundY - 150);
        this.spawnCoin(this.genX + 110, groundY - 195);
        this.genX += 260;
      },
      // picos del techo
      () => {
        this.spawnGroundBlock(this.genX, 220);
        this.spawnSpike(this.genX + 80, 110, true);
        this.spawnSpike(this.genX + 130, 110, true);
        this.spawnCoin(this.genX + 105, height - 110);
        this.genX += 220;
      },
      // escalera
      () => {
        this.spawnGroundBlock(this.genX, 60);
        this.genX += 60;
        this.spawnPlatform(this.genX + 20, height - 115, 1);
        this.spawnPlatform(this.genX + 100, height - 170, 1);
        this.spawnPlatform(this.genX + 180, height - 225, 1);
        this.spawnCoin(this.genX + 180, height - 275);
        this.genX += 280;
        this.genX += 60;
        this.spawnGroundBlock(this.genX, 140);
        this.genX += 140;
      },
      // gap + plataforma central
      () => {
        this.spawnGroundBlock(this.genX, 100);
        this.genX += 100;
        this.genX += 50;
        this.spawnPlatform(this.genX, height - 140, 1);
        this.spawnCoin(this.genX, height - 190);
        this.genX += 100;
        this.genX += 50;
        this.spawnGroundBlock(this.genX, 160);
        this.spawnSpike(this.genX + 80, groundY - 44);
        this.genX += 160;
      }
    ];

    const maxPat = Math.min(patterns.length - 1, 2 + Math.floor(this.currentLevel / 2));
    const idx = Phaser.Math.Between(0, maxPat);
    patterns[idx]();
  }

  private scrollGroup(group: Phaser.Physics.Arcade.Group, dx: number) {
    group.getChildren().forEach((obj: any) => {
      if (!obj.active) return;
      obj.x -= dx;
      if (obj.body) {
        obj.body.reset(obj.x, obj.y);
      }
      if (obj.x < -100) obj.destroy();
    });
  }

  update(_: number, delta: number) {
    if (this.isOver) return;

    this.score += delta * 0.04 * (this.speed / 300);
    const t = Math.min(this.score / this.levelConfig.targetScore, 1);
    this.speed = Phaser.Math.Linear(
      this.levelConfig.baseSpeed,
      this.levelConfig.maxSpeed,
      t
    );

    this.scoreText.setText(`${Math.floor(this.score)}  ●${this.runCoins}`);

    if (this.score < this.levelConfig.targetScore) {
      this.progressText.setText(`Meta ${Math.ceil(this.levelConfig.targetScore - this.score)}`);
      this.progressText.setColor('#aaaaaa');
    } else {
      this.progressText.setText('¡Nivel desbloqueado!');
      this.progressText.setColor('#00ffcc');
      if (!this.levelUnlocked) {
        this.levelUnlocked = true;
        SpikeRunLevelManager.unlock(this.currentLevel + 1);
        try {
          this.sound.play('level_passed', { volume: 0.6 });
        } catch (_) {}
      }
    }

    const dx = this.speed * (delta / 1000);

    this.scrollGroup(this.solid, dx);
    this.scrollGroup(this.hazards, dx);
    this.scrollGroup(this.coins, dx);
    this.genX -= dx;

    while (this.genX < this.scale.width + 180) {
      this.appendPattern();
    }

    this.bgLayers.forEach(b => {
      b.x -= dx * 0.25;
      if (b.x < -60) {
        b.x = this.scale.width + Phaser.Math.Between(20, 80);
      }
    });

    if (this.player.y > this.scale.height + 40) {
      this.gameOver();
    }

    this.player.x = 100;
  }

  private gameOver() {
    if (this.isOver) return;
    this.isOver = true;

    try {
      this.sound.play('hit', { volume: 0.5 });
    } catch (_) {}

    this.physics.pause();

    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
    this.add.text(width / 2, height * 0.30, 'GAME OVER', {
      fontFamily: 'Arial Black',
      fontSize: '32px',
      color: '#ff4466'
    }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.40, `Puntos ${Math.floor(this.score)}  ·  +${this.runCoins}💰`, {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);

    const retry = this.add.rectangle(width / 2, height * 0.54, 180, 48, 0xff4466)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.54, 'REINTENTAR', {
      fontFamily: 'Arial Black',
      fontSize: '18px',
      color: '#ffffff'
    }).setOrigin(0.5);
    retry.on('pointerdown', () => this.scene.restart({ level: this.currentLevel }));

    const menu = this.add.rectangle(width / 2, height * 0.64, 180, 42, 0x333355)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.64, 'MENÚ SPIKE RUN', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ffffff'
    }).setOrigin(0.5);
    menu.on('pointerdown', () => this.scene.start('SpikeRunMenuScene'));

    const hub = this.add.rectangle(width / 2, height * 0.74, 180, 42, 0x222240)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.74, 'HUB JUEGOS', {
      fontFamily: 'Arial',
      fontSize: '16px',
      color: '#ccccdd'
    }).setOrigin(0.5);
    hub.on('pointerdown', () => this.scene.start('HubScene'));
  }
}