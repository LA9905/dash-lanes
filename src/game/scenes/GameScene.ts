import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { Obstacle } from '../objects/Obstacle';
import { Coin } from '../objects/Coin';
import { Pedestrian } from '../objects/Pedestrian';
import { ScoreManager } from '../managers/ScoreManager';
import { LevelManager, type LevelConfig } from '../managers/LevelManager';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private coins!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private pedestrians!: Phaser.Physics.Arcade.Group;

  private scoreText!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;
  private shotsText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;

  private score = 0;
  private distance = 0;
  private speed = 220;
  private spawnTimer = 0;
  private nextSpawn = 1100;
  private isGameOver = false;
  private audioUnlocked = false;

  private currentLevel = 1;
  private levelConfig!: LevelConfig;
  private shotsLeft = 0;
  private canShoot = false;
  private levelUnlocked = false;

  private decorations: Phaser.GameObjects.Rectangle[] = [];

  constructor() {
    super('GameScene');
  }

  init(data: { level?: number }) {
    this.currentLevel = data.level || 1;
    this.levelConfig = LevelManager.getLevel(this.currentLevel);
  }

  preload() {
    this.load.audio('jump', '/sounds/jump.mp3');
    this.load.audio('coin', '/sounds/coin.mp3');
    this.load.audio('hit', '/sounds/hit.mp3');
    this.load.audio('explosion', '/sounds/explosion.mp3');
    this.load.audio('disparo', '/sounds/disparo.mp3');
    this.load.audio('level_passed', '/sounds/level-passed.mp3');
  }

  create() {
    this.isGameOver = false;
    this.audioUnlocked = false;
    this.levelUnlocked = false;
    this.score = 0;
    this.distance = 0;
    this.speed = this.levelConfig.baseSpeed;
    this.shotsLeft = this.levelConfig.maxShots;
    this.canShoot = this.levelConfig.canShoot;
    this.decorations = [];

    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0f0f1a);
    this.createSideDecorations();

    [90, 180, 270].forEach(x => {
      this.add.rectangle(x, height / 2, 3, height, 0x1a1a3a).setAlpha(0.6);
    });

    this.player = new Player(this, 180, 520);

    this.obstacles = this.physics.add.group();
    this.coins = this.physics.add.group();
    this.pedestrians = this.physics.add.group();
    this.bullets = this.physics.add.group({ allowGravity: false });

    this.physics.add.overlap(this.player, this.obstacles, this.onHitObstacle as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
    this.physics.add.overlap(this.player, this.coins, this.onCollectCoin as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
    this.physics.add.overlap(this.player, this.pedestrians, this.onHitObstacle as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
    this.physics.add.overlap(this.bullets, this.obstacles, this.onBulletHitObstacle as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);

    this.add.text(16, 12, `Nivel ${this.currentLevel}: ${this.levelConfig.name}`, {
      fontFamily: 'Arial', fontSize: '16px', color: '#00ffcc'
    });

    this.scoreText = this.add.text(16, 36, 'Puntos: 0', {
      fontFamily: 'Arial', fontSize: '18px', color: '#ffffff'
    });

    this.coinsText = this.add.text(16, 58, 'Monedas: 0', {
      fontFamily: 'Arial', fontSize: '16px', color: '#ffd700'
    });

    this.progressText = this.add.text(16, 80, `Faltan: ${this.levelConfig.minScore}`, {
      fontFamily: 'Arial', fontSize: '15px', color: '#aaaaaa'
    });

    this.shotsText = this.add.text(width - 16, 16, '', {
      fontFamily: 'Arial', fontSize: '16px', color: '#ff8866'
    }).setOrigin(1, 0);

    this.updateShotsText();

    this.input.once('pointerdown', () => this.unlockAudio());

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isGameOver) return;
      if (!this.audioUnlocked) this.unlockAudio();

      if (pointer.x < width * 0.25) {
        this.player.changeLane(-1);
      } else if (pointer.x > width * 0.75) {
        this.player.changeLane(1);
      } else if (pointer.y < height * 0.4 && this.canShoot && this.shotsLeft > 0) {
        this.shoot();
      } else {
        this.player.jump();
        this.playSound('jump', 0.5);
      }
    });

    this.input.keyboard?.on('keydown-LEFT', () => { if (!this.isGameOver) this.player.changeLane(-1); });
    this.input.keyboard?.on('keydown-RIGHT', () => { if (!this.isGameOver) this.player.changeLane(1); });
    this.input.keyboard?.on('keydown-SPACE', () => {
      if (!this.isGameOver) { this.player.jump(); this.playSound('jump', 0.5); }
    });
    this.input.keyboard?.on('keydown-UP', () => {
      if (!this.isGameOver) { this.player.jump(); this.playSound('jump', 0.5); }
    });
    this.input.keyboard?.on('keydown-Z', () => { if (!this.isGameOver) this.shoot(); });
    this.input.keyboard?.on('keydown-X', () => { if (!this.isGameOver) this.shoot(); });
  }

  private updateShotsText() {
    this.shotsText.setText(this.canShoot ? `Disparos: ${this.shotsLeft}` : '');
  }

  private shoot() {
    if (!this.canShoot || this.shotsLeft <= 0 || this.isGameOver) return;

    this.shotsLeft--;
    this.updateShotsText();
    this.playSound('disparo', 0.55);

    const bullet = this.add.rectangle(this.player.x, this.player.y - 45, 6, 18, 0x00ffcc);
    this.physics.add.existing(bullet);
    const body = bullet.body as Phaser.Physics.Arcade.Body;
    body.allowGravity = false;
    body.setGravity(0, 0);
    body.setVelocity(0, -600);
    this.bullets.add(bullet);
    body.allowGravity = false;
    body.setVelocity(0, -600);

    this.time.delayedCall(2000, () => {
      if (bullet && bullet.active) bullet.destroy();
    });
  }

  private unlockAudio() {
    if (this.audioUnlocked) return;
    try {
      this.sound.unlock();
      this.sound.play('jump', { volume: 0 });
      this.audioUnlocked = true;
    } catch (e) {}
  }

  private playSound(key: string, volume = 0.5) {
    try { this.sound.play(key, { volume }); } catch (e) {}
  }

  update(_: number, delta: number) {
    if (this.isGameOver) return;

    // Score
        this.distance += this.speed * (delta / 1000) * 0.35;
    this.score = Math.floor(this.distance) + this.player.coins * 10;

    // Velocidad progresiva
    const timeProgress = Math.min(this.distance / 2500, 1);
    this.speed = Phaser.Math.Linear(
      this.levelConfig.baseSpeed,
      this.levelConfig.maxSpeed,
      timeProgress
    );

    this.obstacles.getChildren().forEach((obj: any) => {
      if (obj.body) obj.body.setVelocityY(this.speed);
    });
    this.coins.getChildren().forEach((obj: any) => {
      if (obj.body) obj.body.setVelocityY(this.speed);
    });
    this.pedestrians.getChildren().forEach((obj: any) => {
      if (obj.body) obj.body.setVelocityY(this.speed * 0.75);
    });

    this.scoreText.setText(`Puntos: ${this.score}`);
    this.coinsText.setText(`Monedas: ${this.player.coins}`);
    this.updateDecorations(delta);

    if (this.score < this.levelConfig.minScore) {
      this.progressText.setText(`Faltan: ${this.levelConfig.minScore - this.score}`);
      this.progressText.setColor('#aaaaaa');
    } else {
      this.progressText.setText('¡Nivel desbloqueado!');
      this.progressText.setColor('#00ffcc');

      if (!this.levelUnlocked) {
        this.levelUnlocked = true;
        LevelManager.unlockLevel(this.currentLevel + 1);
        this.playSound('level_passed', 0.65);

        const msg = this.add.text(this.scale.width / 2, this.scale.height * 0.35, '¡NIVEL DESBLOQUEADO!', {
          fontFamily: 'Arial Black', fontSize: '22px', color: '#00ffcc',
          stroke: '#003333', strokeThickness: 4
        }).setOrigin(0.5).setAlpha(0);

        this.tweens.add({
          targets: msg, alpha: 1, y: this.scale.height * 0.32,
          duration: 400, yoyo: true, hold: 1400,
          onComplete: () => msg.destroy()
        });
      }
    }

    this.spawnTimer += delta;
    if (this.spawnTimer >= this.nextSpawn * this.levelConfig.spawnRate) {
      this.spawnTimer = 0;
      this.nextSpawn = Phaser.Math.Between(700, 1400);
      this.spawnItem();
    }
  }

    private spawnItem() {
    const laneX = [90, 180, 270][Phaser.Math.Between(0, 2)];
    const rand = Math.random();

    if (this.currentLevel >= 2 && rand < 0.12) {
      const ped = new Pedestrian(this, laneX, -50, this.speed);
      this.pedestrians.add(ped);
    } else if (rand < this.levelConfig.obstacleChance) {
      const obs = new Obstacle(this, laneX, -50, this.speed);
      this.obstacles.add(obs);
    } else {
      const coin = new Coin(this, laneX, -50, this.speed);
      this.coins.add(coin);
    }
  }

  private createSideDecorations() {
    const buildingColors = [0x4a5568, 0x2d3748, 0x553c9a, 0x2b6cb0, 0x2f855a, 0xc53030, 0xb7791f];
    const windowColor = 0xffeaa7;

    const createBuilding = (x: number, y: number) => {
      const h = Phaser.Math.Between(55, 130);
      const color = Phaser.Math.RND.pick(buildingColors);
      const building = this.add.rectangle(x, y, 42, h, color);
      building.setAlpha(0.9);
      this.decorations.push(building);

      const rows = Math.floor(h / 18);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < 2; c++) {
          if (Math.random() > 0.3) {
            const wx = x - 10 + c * 20;
            const wy = y - h / 2 + 12 + r * 16;
            const window = this.add.rectangle(wx, wy, 8, 8, windowColor);
            window.setAlpha(0.85);
            this.decorations.push(window);
          }
        }
      }
    };

    for (let i = 0; i < 7; i++) createBuilding(24, i * 110 - 80);
    for (let i = 0; i < 7; i++) createBuilding(336, i * 110 - 40);
  }

  private updateDecorations(delta: number) {
    const move = this.speed * (delta / 1000) * 1.4;
    this.decorations.forEach(b => {
      b.y += move;
      if (b.y > 750) b.y = -120;
    });
  }

  private createExplosion(x: number, y: number) {
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const speed = Phaser.Math.Between(80, 180);
      const size = Phaser.Math.Between(4, 10);
      const particle = this.add.circle(x, y, size, Phaser.Math.RND.pick([0xff3b5c, 0xff6b81, 0xffaa00, 0xffffff]));
      this.tweens.add({
        targets: particle,
        x: x + Math.cos(angle) * speed,
        y: y + Math.sin(angle) * speed,
        alpha: 0, scale: 0.2,
        duration: Phaser.Math.Between(300, 500),
        ease: 'Cubic.easeOut',
        onComplete: () => particle.destroy()
      });
    }
  }

  private onHitObstacle = (_player: any, obstacle: any) => {
    if (this.isGameOver) return;
    this.isGameOver = true;

    const ox = obstacle.x;
    const oy = obstacle.y;
    if (obstacle?.active) obstacle.disableBody(true, true);

    this.createExplosion(ox, oy);
    this.playSound('explosion', 0.7);
    this.playSound('hit', 0.4);
    this.physics.pause();
    ScoreManager.saveHighScore(this.score);

    this.time.delayedCall(450, () => {
      this.scene.start('GameOverScene', {
        score: this.score,
        coins: this.player.coins,
        level: this.currentLevel
      });
    });
  };

  private onCollectCoin = (_player: any, coin: any) => {
    if (!coin?.active) return;
    coin.disableBody(true, true);
    this.player.coins += 1;
    this.playSound('coin', 0.55);
  };

  private onBulletHitObstacle = (bullet: any, obstacle: any) => {
    if (!bullet?.active || !obstacle?.active) return;
    const ox = obstacle.x;
    const oy = obstacle.y;
    bullet.destroy();
    obstacle.disableBody(true, true);
    this.createExplosion(ox, oy);
    this.playSound('explosion', 0.6);
  };
}