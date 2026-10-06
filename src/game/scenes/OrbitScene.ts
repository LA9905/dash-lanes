import Phaser from 'phaser';
import { CurrencyManager } from '../managers/CurrencyManager';
import { OrbitLevelManager, type OrbitLevelConfig } from '../managers/OrbitLevelManager';

export class OrbitScene extends Phaser.Scene {
  private ship!: Phaser.Physics.Arcade.Sprite;
  private enemies!: Phaser.Physics.Arcade.Group;
  private rocks!: Phaser.Physics.Arcade.Group;
  private coins!: Phaser.Physics.Arcade.Group;
  private playerBullets!: Phaser.Physics.Arcade.Group;
  private enemyBullets!: Phaser.Physics.Arcade.Group;

  private score = 0;
  private runCoins = 0;
  private lives = 2;
  private maxLives = 2;
  private invulnUntil = 0;
  private lifeBonusBought = false;
  private isOver = false;
  private levelUnlocked = false;
  private spawnT = 0;
  private fireT = 0;
  private currentLevel = 1;
  private levelConfig!: OrbitLevelConfig;

  private scoreText!: Phaser.GameObjects.Text;
  private livesText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private stars: Phaser.GameObjects.Rectangle[] = [];

  constructor() {
    super('OrbitScene');
  }

  init(data: { level?: number }) {
    this.currentLevel = data.level || 1;
    this.levelConfig = OrbitLevelManager.getLevel(this.currentLevel);
  }

  preload() {
    this.load.audio('coin', '/sounds/coin.mp3');
    this.load.audio('hit', '/sounds/hit.mp3');
    this.load.audio('disparo', '/sounds/disparo.mp3');
    this.load.audio('explosion', '/sounds/explosion.mp3');
    this.load.audio('level_passed', '/sounds/level-passed.mp3');
  }

  create() {
    const { width, height } = this.scale;
    this.isOver = false;
    this.levelUnlocked = false;
    this.score = 0;
    this.runCoins = 0;
    // Vidas: 1-2 → 2 | 3-6 → 3 | 7-10 → 4
    if (this.currentLevel <= 2) this.maxLives = 2;
    else if (this.currentLevel <= 6) this.maxLives = 3;
    else this.maxLives = 4;
    this.lives = this.maxLives;
    this.lifeBonusBought = false;
    this.invulnUntil = 0;
    this.spawnT = 0;
    this.fireT = 0;
    this.stars = [];

    this.physics.world.gravity.y = 0;

    // Fondo
    this.add.rectangle(width / 2, height / 2, width, height, 0x060b18);
    for (let i = 0; i < 40; i++) {
      const s = this.add.rectangle(
        Phaser.Math.Between(0, width),
        Phaser.Math.Between(0, height),
        Phaser.Math.Between(1, 2),
        Phaser.Math.Between(1, 2),
        0xffffff,
        Phaser.Math.FloatBetween(0.2, 0.8)
      );
      this.stars.push(s);
    }

    this.ensureTextures();

    this.ship = this.physics.add.sprite(width / 2, height - 90, 'ship');
    this.ship.setCollideWorldBounds(true);
    this.ship.setSize(28, 32);
    this.ship.setOffset(8, 8);
    (this.ship.body as Phaser.Physics.Arcade.Body).allowGravity = false;

    this.enemies = this.physics.add.group({ allowGravity: false });
    this.rocks = this.physics.add.group({ allowGravity: false });
    this.coins = this.physics.add.group({ allowGravity: false });
    this.playerBullets = this.physics.add.group({ allowGravity: false });
    this.enemyBullets = this.physics.add.group({ allowGravity: false });

    // Colisiones
    this.physics.add.overlap(this.ship, this.rocks, () => this.hurt());
    this.physics.add.overlap(this.ship, this.enemies, () => this.hurt());
    this.physics.add.overlap(this.ship, this.enemyBullets, (_s, b: any) => {
      if (b?.active) b.destroy();
      this.hurt();
    });
    
    this.physics.add.overlap(this.ship, this.coins, (_s, c: any) => {
      if (!c?.active) return;
      c.destroy();
      this.runCoins++;
      CurrencyManager.addCoins(1);
      try { this.sound.play('coin', { volume: 0.45 }); } catch (_) {}
      this.tryBuyExtraLife();
    });
    this.physics.add.overlap(this.playerBullets, this.enemies, (b: any, e: any) => {
      if (!b?.active || !e?.active) return;
      b.destroy();
      this.killEnemy(e);
    });
    this.physics.add.overlap(this.playerBullets, this.rocks, (b: any, r: any) => {
      if (!b?.active || !r?.active) return;
      b.destroy();
      this.explode(r.x, r.y);
      r.destroy();
      this.score += 15;
      try { this.sound.play('explosion', { volume: 0.35 }); } catch (_) {}
    });

    // UI
    this.add.rectangle(width / 2, 28, width - 12, 50, 0x000000, 0.45);
    this.add.text(16, 10, `Misión ${this.currentLevel}`, {
      fontFamily: 'Arial Black', fontSize: '12px', color: '#82b1ff'
    });
    this.scoreText = this.add.text(16, 28, '0', {
      fontFamily: 'Arial Black', fontSize: '18px', color: '#ffffff'
    });
    this.livesText = this.add.text(width - 16, 12, '♥'.repeat(this.lives), {
      fontFamily: 'Arial', fontSize: '16px', color: '#ff4466'
    }).setOrigin(1, 0);
    this.progressText = this.add.text(width / 2, 28, '', {
      fontFamily: 'Arial', fontSize: '12px', color: '#8899aa'
    }).setOrigin(0.5, 0);
    this.add.text(width - 16, 32, `💰 ${CurrencyManager.getTotalCoins()}`, {
      fontFamily: 'Arial', fontSize: '12px', color: '#ffd700'
    }).setOrigin(1, 0);

    // Controles: mover con dedo/ratón + disparo automático
    this.input.on('pointermove', (p: Phaser.Input.Pointer) => {
      if (this.isOver) return;
      this.ship.x = Phaser.Math.Clamp(p.x, 28, width - 28);
      this.ship.y = Phaser.Math.Clamp(p.y, height * 0.45, height - 50);
    });
    this.input.on('pointerdown', () => {
      if (!this.isOver) this.firePlayer();
    });
  }

  private ensureTextures() {
    if (!this.textures.exists('ship')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Nave espacial
      g.fillStyle(0x4fc3f7, 1);
      g.fillTriangle(22, 0, 4, 42, 40, 42);
      g.fillStyle(0xe1f5fe, 1);
      g.fillTriangle(22, 8, 14, 26, 30, 26);
      g.fillStyle(0x0288d1, 1);
      g.fillTriangle(0, 28, 10, 42, 4, 42);
      g.fillTriangle(44, 28, 34, 42, 40, 42);
      g.fillStyle(0x00e5ff, 1);
      g.fillRect(16, 38, 5, 8);
      g.fillRect(23, 38, 5, 8);
      g.fillStyle(0xffffff, 0.7);
      g.fillRect(17, 40, 3, 4);
      g.fillRect(24, 40, 3, 4);
      g.generateTexture('ship', 44, 48);
      g.destroy();
    }
    if (!this.textures.exists('enemy')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      // Nave espacial enemiga
      g.fillStyle(0xe53935, 1);
      g.fillTriangle(20, 40, 2, 4, 38, 4);
      g.fillStyle(0xb71c1c, 1);
      g.fillTriangle(0, 8, 12, 4, 8, 20);
      g.fillTriangle(40, 8, 28, 4, 32, 20);
      g.fillStyle(0xff8a80, 1);
      g.fillCircle(20, 14, 6);
      g.fillStyle(0x1a0000, 1);
      g.fillCircle(20, 14, 3);
      g.fillStyle(0xffc107, 1);
      g.fillRect(10, 28, 4, 10);
      g.fillRect(26, 28, 4, 10);
      g.generateTexture('enemy', 40, 42);
      g.destroy();
    }
    if (!this.textures.exists('enemy2')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xab47bc, 1);
      g.fillRoundedRect(4, 6, 36, 28, 6);
      g.fillStyle(0x7b1fa2, 1);
      g.fillTriangle(22, 34, 8, 34, 22, 44);
      g.fillTriangle(22, 34, 36, 34, 22, 44);
      g.fillStyle(0xea80fc, 1);
      g.fillCircle(14, 18, 4);
      g.fillCircle(30, 18, 4);
      g.generateTexture('enemy2', 44, 46);
      g.destroy();
    }
    if (!this.textures.exists('rock')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x8d6e63, 1);
      g.fillCircle(16, 16, 15);
      g.fillStyle(0x6d4c41, 1);
      g.fillCircle(10, 12, 5);
      g.fillStyle(0xa1887f, 1);
      g.fillCircle(20, 20, 4);
      g.generateTexture('rock', 32, 32);
      g.destroy();
    }
    if (!this.textures.exists('orb_coin')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xffd700, 1);
      g.fillCircle(10, 10, 10);
      g.fillStyle(0xfff3a0, 1);
      g.fillCircle(10, 10, 5);
      g.generateTexture('orb_coin', 20, 20);
      g.destroy();
    }
    if (!this.textures.exists('p_bullet')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x00e5ff, 1);
      g.fillRect(0, 0, 4, 14);
      g.fillStyle(0xffffff, 0.8);
      g.fillRect(1, 0, 2, 6);
      g.generateTexture('p_bullet', 4, 14);
      g.destroy();
    }
    if (!this.textures.exists('e_bullet')) {
      const g = this.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xff6b6b, 1);
      g.fillRect(0, 0, 4, 12);
      g.generateTexture('e_bullet', 4, 12);
      g.destroy();
    }
  }

  private firePlayer() {
    const b = this.playerBullets.create(this.ship.x, this.ship.y - 24, 'p_bullet') as Phaser.Physics.Arcade.Sprite;
    (b.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    b.setVelocityY(-520);
    try { this.sound.play('disparo', { volume: 0.25 }); } catch (_) {}
  }

  private spawnThing() {
    const { width } = this.scale;
    const cfg = this.levelConfig;
    const x = Phaser.Math.Between(30, width - 30);
    const r = Math.random();

    if (r < 0.06) {
      const c = this.coins.create(x, -20, 'orb_coin') as Phaser.Physics.Arcade.Sprite;
      (c.body as Phaser.Physics.Arcade.Body).allowGravity = false;
      c.setVelocityY(cfg.rockSpeed * 0.7);
      return;
    }

    if (r < 0.06 + Math.min(0.72, cfg.enemyChance + 0.15)) {
      const key = Math.random() < 0.4 ? 'enemy2' : 'enemy';
      const e = this.enemies.create(x, -30, key) as Phaser.Physics.Arcade.Sprite;
      (e.body as Phaser.Physics.Arcade.Body).allowGravity = false;
      e.setVelocityY(cfg.enemySpeed + Phaser.Math.Between(-20, 40));
      e.setSize(28, 30);
      e.setData('hp', 1);
      e.setData('shooter', Math.random() < Math.min(0.85, cfg.shooterChance + 0.1));
      e.setData('shootT', Phaser.Math.Between(300, 900));
      this.tweens.add({
        targets: e,
        x: Phaser.Math.Clamp(x + Phaser.Math.Between(-80, 80), 30, width - 30),
        duration: Phaser.Math.Between(700, 1200),
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut'
      });
      return;
    }

    // Rocas
    const rock = this.rocks.create(x, -20, 'rock') as Phaser.Physics.Arcade.Sprite;
    (rock.body as Phaser.Physics.Arcade.Body).allowGravity = false;
    rock.setVelocityY(cfg.rockSpeed + Phaser.Math.Between(0, 80));
    rock.setScale(Phaser.Math.FloatBetween(0.75, 1.4));
  }

  private killEnemy(e: any) {
    this.explode(e.x, e.y);
    e.destroy();
    this.score += 40;
    try { this.sound.play('explosion', { volume: 0.4 }); } catch (_) {}
    if (Math.random() < 0.12) {
      const c = this.coins.create(e.x, e.y, 'orb_coin') as Phaser.Physics.Arcade.Sprite;
      (c.body as Phaser.Physics.Arcade.Body).allowGravity = false;
      c.setVelocityY(80);
    }
  }

  private explode(x: number, y: number) {
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2;
      const p = this.add.circle(x, y, Phaser.Math.Between(2, 5), 0xff8866);
      this.tweens.add({
        targets: p,
        x: x + Math.cos(a) * Phaser.Math.Between(30, 70),
        y: y + Math.sin(a) * Phaser.Math.Between(30, 70),
        alpha: 0,
        duration: 350,
        onComplete: () => p.destroy()
      });
    }
  }

  private updateLivesText() {
    this.livesText.setText(this.lives > 0 ? '♥'.repeat(this.lives) : '—');
  }

  /** Si en la partida juntaste 20+ monedas, puedes gastar 20 del total por +1 vida extra (1 vez) */
  private tryBuyExtraLife() {
    if (this.lifeBonusBought || this.isOver) return;
    if (this.runCoins < 20) return;
    if (this.lives >= this.maxLives + 1) return;
    if (CurrencyManager.getTotalCoins() < 20) return;

    if (CurrencyManager.spendCoins(20)) {
      this.lifeBonusBought = true;
      this.lives++;
      this.updateLivesText();
      const tip = this.add.text(this.ship.x, this.ship.y - 40, '+1 ♥ (−20💰)', {
        fontFamily: 'Arial Black', fontSize: '14px', color: '#00ffcc'
      }).setOrigin(0.5);
      this.tweens.add({
        targets: tip, y: tip.y - 30, alpha: 0, duration: 900,
        onComplete: () => tip.destroy()
      });
    }
  }

  private hurt() {
    if (this.isOver) return;
    if (this.time.now < this.invulnUntil) return;

    this.lives--;
    this.invulnUntil = this.time.now + 1000;
    this.updateLivesText();

    try { this.sound.play('hit', { volume: 0.5 }); } catch (_) {}
    this.ship.setTint(0xff4466);
    this.tweens.add({
      targets: this.ship,
      alpha: 0.35,
      duration: 80,
      yoyo: true,
      repeat: 5,
      onComplete: () => {
        this.ship.setAlpha(1);
        this.ship.clearTint();
      }
    });

    if (this.lives <= 0) this.endGame();
  }

  update(_: number, delta: number) {
    if (this.isOver) return;

    this.score += delta * 0.010;
    this.scoreText.setText(`${Math.floor(this.score)}  ●${this.runCoins}`);

    // Meta de nivel
    if (this.score < this.levelConfig.targetScore) {
      this.progressText.setText(`Meta ${Math.ceil(this.levelConfig.targetScore - this.score)}`);
      this.progressText.setColor('#8899aa');
    } else {
      this.progressText.setText('¡Misión desbloqueada!');
      this.progressText.setColor('#00ffcc');
      if (!this.levelUnlocked) {
        this.levelUnlocked = true;
        OrbitLevelManager.unlock(this.currentLevel + 1);
        try { this.sound.play('level_passed', { volume: 0.55 }); } catch (_) {}
      }
    }

    // Auto-disparo
    this.fireT += delta;
    if (this.fireT >= 280) {
      this.fireT = 0;
      this.firePlayer();
    }

    this.spawnT += delta;
    const interval = Phaser.Math.Between(
      Math.floor(this.levelConfig.baseSpawn * 0.55),
      Math.floor(this.levelConfig.maxSpawn * 0.65)
    );
    if (this.spawnT >= interval) {
      this.spawnT = 0;
      this.spawnThing();
      if (Math.random() < 0.55) this.spawnThing();
      if (Math.random() < 0.25) this.spawnThing();
    }

    // Enemigos disparan
    this.enemies.getChildren().forEach((e: any) => {
      if (!e.active) return;
      if (e.y > 720) {
        e.destroy();
        return;
      }
      if (!e.getData('shooter')) return;
      let t = e.getData('shootT') - delta;
      if (t <= 0) {
        const eb = this.enemyBullets.create(e.x, e.y + 16, 'e_bullet') as Phaser.Physics.Arcade.Sprite;
        (eb.body as Phaser.Physics.Arcade.Body).allowGravity = false;
        eb.setVelocityY(280);
        t = Phaser.Math.Between(550, 1100);
      }
      e.setData('shootT', t);
    });

    [this.rocks, this.coins, this.playerBullets, this.enemyBullets].forEach(g => {
      g.getChildren().forEach((o: any) => {
        if (o.y > 720 || o.y < -40) o.destroy();
      });
    });

    this.stars.forEach(s => {
      s.y += 0.4;
      if (s.y > this.scale.height) s.y = 0;
    });
  }

  private endGame() {
    if (this.isOver) return;
    this.isOver = true;
    this.physics.pause();
    try { this.sound.play('hit', { volume: 0.55 }); } catch (_) {}

    const { width, height } = this.scale;
    this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0.6);
    this.add.text(width / 2, height * 0.28, 'GAME OVER', {
      fontFamily: 'Arial Black', fontSize: '32px', color: '#ff4466'
    }).setOrigin(0.5);
    this.add.text(width / 2, height * 0.38, `Pts ${Math.floor(this.score)}  ·  +${this.runCoins}💰`, {
      fontFamily: 'Arial', fontSize: '16px', color: '#ffffff'
    }).setOrigin(0.5);

    const retry = this.add.rectangle(width / 2, height * 0.52, 180, 48, 0x2979ff)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.52, 'REINTENTAR', {
      fontFamily: 'Arial Black', fontSize: '16px', color: '#ffffff'
    }).setOrigin(0.5);
    retry.on('pointerdown', () => this.scene.restart({ level: this.currentLevel }));

    const menu = this.add.rectangle(width / 2, height * 0.62, 180, 42, 0x333355)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.62, 'MENÚ ORBIT', {
      fontFamily: 'Arial', fontSize: '15px', color: '#ffffff'
    }).setOrigin(0.5);
    menu.on('pointerdown', () => this.scene.start('OrbitMenuScene'));

    const hub = this.add.rectangle(width / 2, height * 0.72, 180, 40, 0x222240)
      .setInteractive({ useHandCursor: true });
    this.add.text(width / 2, height * 0.72, 'HUB JUEGOS', {
      fontFamily: 'Arial', fontSize: '14px', color: '#aaaaaa'
    }).setOrigin(0.5);
    hub.on('pointerdown', () => this.scene.start('HubScene'));
  }
}