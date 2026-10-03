import Phaser from 'phaser';
import { Player } from '../objects/Player';
import { Obstacle } from '../objects/Obstacle';
import { Coin } from '../objects/Coin';
import { Pedestrian } from '../objects/Pedestrian';
import { CrossTraffic } from '../objects/CrossTraffic';
import { FuelCan } from '../objects/FuelCan';
import { ScoreManager } from '../managers/ScoreManager';
import { CurrencyManager } from '../managers/CurrencyManager';
import { LevelManager, type LevelConfig } from '../managers/LevelManager';

export class GameScene extends Phaser.Scene {
  private player!: Player;
  private obstacles!: Phaser.Physics.Arcade.Group;
  private coins!: Phaser.Physics.Arcade.Group;
  private bullets!: Phaser.Physics.Arcade.Group;
  private pedestrians!: Phaser.Physics.Arcade.Group;
  private crossTraffic!: Phaser.Physics.Arcade.Group;
  private fuels!: Phaser.Physics.Arcade.Group;

  private scoreText!: Phaser.GameObjects.Text;
  private coinsText!: Phaser.GameObjects.Text;
  private shotsText!: Phaser.GameObjects.Text;
  private progressText!: Phaser.GameObjects.Text;
  private totalCoinsText!: Phaser.GameObjects.Text;
  private fuelBar?: Phaser.GameObjects.Rectangle;
  private buyShotsBtn?: Phaser.GameObjects.Container;

  private score = 0;
  private distance = 0;
  private speed = 220;
  private spawnTimer = 0;
  private nextSpawn = 800;
  private isGameOver = false;
  private audioUnlocked = false;

  private currentLevel = 1;
  private levelConfig!: LevelConfig;
  private shotsLeft = 0;
  private canShoot = false;
  private levelUnlocked = false;

  private decorations: Phaser.GameObjects.Rectangle[] = [];
  private isHighway = false;

    /** 1 = tráfico en contra a la izquierda; -1 = invertido */
  private roadSense = 1;
  private directionText?: Phaser.GameObjects.Text;

  private fuel = 100;
  private needsFuel = false;
  private fuelDrainRate = 0;
  private runCoins = 0;
  private swipeStartX = 0;
  private swipeStartY = 0;
  private swipeStartTime = 0;
  private lastTapTime = 0;
  private laneChangedThisTouch = false;
  private ignoreTouch = false;

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
    this.load.audio('grandma_hit', '/sounds/shock-gasp383751.mp3');
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
    this.runCoins = 0;
    this.buyShotsBtn = undefined;

    this.needsFuel = this.levelConfig.needsFuel;
    this.fuel = 100;
    this.fuelDrainRate = this.levelConfig.fuelDrain > 0
      ? 100 / (this.levelConfig.fuelDrain * 1000)
      : 0;

    const { width, height } = this.scale;

    this.add.rectangle(width / 2, height / 2, width, height, 0x0f0f1a);
    this.createSideDecorations();

    this.isHighway = this.levelConfig.highwayMode;

    this.roadSense = 1;
    this.drawRoad();

    this.player = new Player(this, 180, 520, this.isHighway);

    if (this.isHighway) {
      this.directionText = this.add.text(width / 2, 100, 'VÍA →  |  V = cambiar sentido', {
        fontFamily: 'Arial', fontSize: '12px', color: '#ffcc00'
      }).setOrigin(0.5);
    }

    this.obstacles = this.physics.add.group();
    this.coins = this.physics.add.group();
    this.pedestrians = this.physics.add.group();
    this.crossTraffic = this.physics.add.group();
    this.fuels = this.physics.add.group();
    this.bullets = this.physics.add.group({ allowGravity: false });

    this.physics.add.overlap(this.player, this.obstacles, this.onHitObstacle as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
    this.physics.add.overlap(this.player, this.coins, this.onCollectCoin as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
    this.physics.add.overlap(this.player, this.pedestrians, this.onHitPedestrian as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
    this.physics.add.overlap(this.player, this.crossTraffic, this.onHitObstacle as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
    this.physics.add.overlap(this.player, this.fuels, this.onCollectFuel as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
    this.physics.add.overlap(this.bullets, this.obstacles, this.onBulletHitObstacle as Phaser.Types.Physics.Arcade.ArcadePhysicsCallback, undefined, this);
    this.add.rectangle(width / 2, 36, width - 16, 64, 0x000000, 0.45).setOrigin(0.5);

    this.add.text(16, 12, `Nv.${this.currentLevel}`, {
      fontFamily: 'Arial Black', fontSize: '14px', color: '#00ffcc'
    });

    this.scoreText = this.add.text(16, 32, '0', {
      fontFamily: 'Arial Black', fontSize: '22px', color: '#ffffff'
    });

    this.coinsText = this.add.text(16, 56, '● 0', {
      fontFamily: 'Arial', fontSize: '15px', color: '#ffd700'
    });

    this.totalCoinsText = this.add.text(width - 16, 12, `💰 ${CurrencyManager.getTotalCoins()}`, {
      fontFamily: 'Arial', fontSize: '14px', color: '#ffd700'
    }).setOrigin(1, 0);

    this.shotsText = this.add.text(width - 16, 32, '', {
      fontFamily: 'Arial Black', fontSize: '16px', color: '#ff8866'
    }).setOrigin(1, 0);

    this.progressText = this.add.text(width / 2, 56, '', {
      fontFamily: 'Arial', fontSize: '13px', color: '#aaaaaa'
    }).setOrigin(0.5, 0);

    if (this.needsFuel) {
      this.add.rectangle(width / 2, 78, 160, 10, 0x333333).setOrigin(0.5);
      this.fuelBar = this.add.rectangle(width / 2 - 80, 78, 160, 10, 0x4caf50).setOrigin(0, 0.5);
    }

    this.updateShotsText();

    this.input.once('pointerdown', () => this.unlockAudio());

    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.isGameOver) return;
      if (!this.audioUnlocked) this.unlockAudio();

      // Zona botones ABAJO-DERECHA (disparar / comprar)
      if (pointer.y > height - 130 && pointer.x > width - 120) {
        this.ignoreTouch = true;
        return;
      }
      // Zona botón COMPRAR de arriba
      if (pointer.y < 110 && pointer.x > width - 160) {
        this.ignoreTouch = true;
        return;
      }

      this.ignoreTouch = false;
      this.swipeStartX = pointer.x;
      this.swipeStartY = pointer.y;
      this.swipeStartTime = this.time.now;
      this.laneChangedThisTouch = false;

      if (pointer.x < width * 0.38) {
        this.player.changeLane(-1);
        this.laneChangedThisTouch = true;
      } else if (pointer.x > width * 0.62) {
        this.player.changeLane(1);
        this.laneChangedThisTouch = true;
      }
    });

    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.isGameOver || !pointer.isDown) return;
      if (this.ignoreTouch || this.laneChangedThisTouch) return;
      if (pointer.y > height - 130 && pointer.x > width - 120) return;
      if (pointer.y < 110 && pointer.x > width - 160) return;

      const dx = pointer.x - this.swipeStartX;
      if (Math.abs(dx) > 18) {
        if (dx > 0) this.player.changeLane(1);
        else this.player.changeLane(-1);
        this.laneChangedThisTouch = true;
      }
    });

    this.input.on('pointerup', (pointer: Phaser.Input.Pointer) => {
      if (this.isGameOver) return;
      if (this.ignoreTouch) {
        this.ignoreTouch = false;
        return;
      }
      if (pointer.y > height - 130 && pointer.x > width - 120) return;
      if (pointer.y < 110 && pointer.x > width - 160) return;

      const dx = pointer.x - this.swipeStartX;
      const dy = pointer.y - this.swipeStartY;
      const dt = this.time.now - this.swipeStartTime;

      if (!this.laneChangedThisTouch && Math.abs(dx) > 12 && Math.abs(dx) > Math.abs(dy)) {
        if (dx > 0) this.player.changeLane(1);
        else this.player.changeLane(-1);
        return;
      }

      if (!this.laneChangedThisTouch && Math.abs(dx) < 15 && Math.abs(dy) < 15 && dt < 280) {
        if (pointer.x > width * 0.30 && pointer.x < width * 0.70) {
          const now = this.time.now;
          if (now - this.lastTapTime < 320) {
            this.player.jump();
            this.playSound('jump', 0.5);
            this.lastTapTime = 0;
          } else {
            this.lastTapTime = now;
          }
        }
      }
    });

    this.createMobileButtons(width, height);

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
    this.input.keyboard?.on('keydown-B', () => { if (!this.isGameOver) this.tryBuyShots(); });
    this.input.keyboard?.on('keydown-C', () => { if (!this.isGameOver) this.tryBuyShots(); });
    this.input.keyboard?.on('keydown-V', () => {
      if (!this.isGameOver && this.isHighway) this.flipRoadSense();
    });
  }

  private updateShotsText() {
    if (!this.canShoot) {
      this.shotsText.setText('');
      return;
    }
    this.shotsText.setText(`🔫 ${this.shotsLeft}`);

    if (this.shotsLeft <= 0 && !this.buyShotsBtn) {
      this.showBuyShotsButton();
    }
  }

  private showBuyShotsButton() {
    const { width } = this.scale;
    const bg = this.add.rectangle(0, 0, 130, 36, 0xff9800)
      .setInteractive({ useHandCursor: true });
    const txt = this.add.text(0, 0, 'Balas +3 (6💰)', {
      fontFamily: 'Arial', fontSize: '13px', color: '#000000'
    }).setOrigin(0.5);

    this.buyShotsBtn = this.add.container(width - 80, 70, [bg, txt]);

    bg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.ignoreTouch = true;
      pointer.event?.stopPropagation?.();
      if (CurrencyManager.spendCoins(6)) {
        this.shotsLeft = 3;
        this.totalCoinsText.setText(`💰 ${CurrencyManager.getTotalCoins()}`);
        this.buyShotsBtn?.destroy();
        this.buyShotsBtn = undefined;
        this.updateShotsText();
      }
    });
  }

    private createMobileButtons(width: number, height: number) {
    // Botón DISPARAR
    if (this.canShoot) {
      const shootBg = this.add.circle(width - 50, height - 90, 32, 0x00ffcc, 0.9)
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0)
        .setDepth(100);

      this.add.text(width - 50, height - 90, '🔫', {
        fontSize: '22px'
      }).setOrigin(0.5).setDepth(101);

      shootBg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.ignoreTouch = true;
        pointer.event?.stopPropagation?.();
        if (!this.isGameOver) this.shoot();
      });
    }

    // Botón COMPRAR BALAS
    if (this.canShoot) {
      const buyBg = this.add.rectangle(width - 50, height - 40, 90, 36, 0xff9800)
        .setInteractive({ useHandCursor: true })
        .setScrollFactor(0)
        .setDepth(100);

      this.add.text(width - 50, height - 40, '+3 💰6', {
        fontFamily: 'Arial Black', fontSize: '12px', color: '#000000'
      }).setOrigin(0.5).setDepth(101);

      buyBg.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
        this.ignoreTouch = true;
        pointer.event?.stopPropagation?.();
        this.tryBuyShots();
      });
    }
  }

  private tryBuyShots() {
    if (!this.canShoot || this.isGameOver) return;
    if (CurrencyManager.spendCoins(6)) {
      this.shotsLeft += 3;
      this.totalCoinsText.setText(`💰 ${CurrencyManager.getTotalCoins()}`);
      this.updateShotsText();
      if (this.buyShotsBtn) {
        this.buyShotsBtn.destroy();
        this.buyShotsBtn = undefined;
      }
    }
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

    // Score más lento
    this.distance += this.speed * (delta / 1000) * 0.10;
    this.score = Math.floor(this.distance) + this.runCoins * 5;

    const timeProgress = Math.min(this.distance / 3000, 1);
    this.speed = Phaser.Math.Linear(
      this.levelConfig.baseSpeed,
      this.levelConfig.maxSpeed,
      timeProgress
    );

    this.obstacles.getChildren().forEach((obj: any) => {
      if (!obj.body) return;
      const mult = obj.kind === 'oncoming' ? 1.45 : obj.kind === 'same' ? 0.55 : 1;
      obj.body.setVelocityY(this.speed * mult);
    });
    this.coins.getChildren().forEach((obj: any) => {
      if (obj.body) obj.body.setVelocityY(this.speed);
    });
    this.pedestrians.getChildren().forEach((obj: any) => {
      if (obj.body) obj.body.setVelocityY(this.speed * 0.75);
    });
    this.fuels.getChildren().forEach((obj: any) => {
      if (obj.body) obj.body.setVelocityY(this.speed);
    });

    // Combustible
    if (this.needsFuel) {
      this.fuel -= this.fuelDrainRate * delta;
      if (this.fuelBar) {
        this.fuelBar.width = Math.max(0, (this.fuel / 100) * 160);
        this.fuelBar.fillColor = this.fuel > 40 ? 0x4caf50 : this.fuel > 20 ? 0xff9800 : 0xf44336;
      }
      if (this.fuel <= 0) {
        this.fuel = 0;
        this.triggerGameOver();
        return;
      }
    }

    this.scoreText.setText(`${this.score}`);
    this.coinsText.setText(`● ${this.runCoins}`);
    this.updateDecorations(delta);

    if (this.score < this.levelConfig.minScore) {
      this.progressText.setText(`Faltan ${this.levelConfig.minScore - this.score}`);
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
      this.nextSpawn = Phaser.Math.Between(320, 700);
      this.spawnItem();
    }
  }

  private spawnItem() {
    const lanes = this.isHighway ? [50, 110, 180, 250, 310] : [90, 180, 270];
    const count = Math.random() < (this.isHighway ? 0.50 : 0.40) ? 2 : 1;

    for (let i = 0; i < count; i++) {
      const laneIndex = Phaser.Math.Between(0, lanes.length - 1);
      const laneX = lanes[laneIndex];
      const roll = Math.random();

      // Combustible
      const fuelChance = this.needsFuel
        ? Math.max(0.03, 0.07 - this.currentLevel * 0.004)
        : 0;
      if (this.needsFuel && Math.random() < fuelChance) {
        const fuel = new FuelCan(this, laneX, -50, this.speed);
        this.fuels.add(fuel);
        continue;
      }

      // Tráfico cruzado (solo autopista)
      if (this.isHighway && Math.random() < 0.22) {
        const y = Phaser.Math.Between(100, 400);
        const fromLeft = Math.random() > 0.5;
        const car = new CrossTraffic(this, y, this.speed, fromLeft);
        this.crossTraffic.add(car);
        continue;
      }

      // Abuelas
      const pedChance = this.isHighway
        ? Math.max(0.05, 0.12 - this.currentLevel * 0.006)
        : Math.max(0.04, 0.10 - this.currentLevel * 0.008);
      if (this.currentLevel >= 2 && Math.random() < pedChance) {
        const ped = new Pedestrian(this, laneX, -50, this.speed);
        this.pedestrians.add(ped);
        continue;
      }

      const obstacleRoll = this.levelConfig.obstacleChance * 0.72;

      if (this.isHighway) {
        const leftSide = this.roadSense === 1 ? laneIndex <= 1 : laneIndex >= 3;
        const rightSide = this.roadSense === 1 ? laneIndex >= 3 : laneIndex <= 1;
        const center = laneIndex === 2;

        let kind: 'oncoming' | 'same' | 'normal' = 'normal';
        if (leftSide) kind = 'oncoming';
        else if (rightSide) kind = 'same';
        else if (center) kind = Math.random() < 0.5 ? 'oncoming' : 'same';

        if (roll < obstacleRoll) {
          const obs = new Obstacle(this, laneX, -50, this.speed, kind);
          this.obstacles.add(obs);
        } else {
          const coin = new Coin(this, laneX, -50, this.speed);
          this.coins.add(coin);
        }
      } else {
        if (roll < obstacleRoll) {
          const obs = new Obstacle(this, laneX, -50, this.speed);
          this.obstacles.add(obs);
        } else {
          const coin = new Coin(this, laneX, -50, this.speed);
          this.coins.add(coin);
        }
      }
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

  private drawRoad() {
    const { width, height } = this.scale;

    if (this.isHighway) {
      // Asfalto
      this.add.rectangle(width / 2, height / 2, 280, height, 0x2a2a32).setDepth(-1);

      // Carriles
      const lanes = [50, 110, 180, 250, 310];
      lanes.forEach(x => {
        this.add.rectangle(x, height / 2, 2, height, 0x555566).setAlpha(0.5);
      });

      // Línea central amarilla (doble)
      this.add.rectangle(180, height / 2, 4, height, 0xffcc00).setAlpha(0.85);
      this.add.rectangle(186, height / 2, 2, height, 0xffcc00).setAlpha(0.5);

      // Indicadores de sentido
      this.add.text(90, 140, this.roadSense === 1 ? '⬅ CONTRA' : 'A FAVOR ➡', {
        fontFamily: 'Arial', fontSize: '11px', color: '#ff6b6b'
      }).setOrigin(0.5);
      this.add.text(270, 140, this.roadSense === 1 ? 'A FAVOR ➡' : '⬅ CONTRA', {
        fontFamily: 'Arial', fontSize: '11px', color: '#82b1ff'
      }).setOrigin(0.5);
    } else {
      [90, 180, 270].forEach(x => {
        this.add.rectangle(x, height / 2, 3, height, 0x1a1a3a).setAlpha(0.6);
      });
    }
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
      const particle = this.add.circle(
        x, y, size,
        Phaser.Math.RND.pick([0xff3b5c, 0xff6b81, 0xffaa00, 0xffffff])
      );
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

  private triggerGameOver() {
    if (this.isGameOver) return;
    this.isGameOver = true;
    this.physics.pause();
    ScoreManager.saveHighScore(this.score);
    this.time.delayedCall(300, () => {
      this.scene.start('GameOverScene', {
        score: this.score,
        coins: this.runCoins,
        level: this.currentLevel
      });
    });
  }

  private onHitObstacle = (_player: any, obstacle: any) => {
    if (this.isGameOver) return;

    const ox = obstacle.x;
    const oy = obstacle.y;
    if (obstacle?.active) obstacle.disableBody(true, true);

    this.createExplosion(ox, oy);
    this.playSound('explosion', 0.7);
    this.playSound('hit', 0.4);
    this.triggerGameOver();
  };

  private onHitPedestrian = (_player: any, ped: any) => {
    if (!ped?.active || this.isGameOver) return;

    const px = ped.x;
    const py = ped.y;
    ped.disableBody(true, true);

    // Abuela Sale volando
    const ghost = this.add.image(px, py, 'pedestrian');
    this.tweens.add({
      targets: ghost,
      x: px + Phaser.Math.Between(-80, 80),
      y: py - 120,
      angle: Phaser.Math.Between(-90, 90),
      alpha: 0,
      duration: 600,
      onComplete: () => ghost.destroy()
    });

    this.playSound('grandma_hit', 0.7);

    const penalty = Math.min(5, CurrencyManager.getTotalCoins());
    if (penalty > 0) {
      CurrencyManager.spendCoins(penalty);
      this.totalCoinsText.setText(`💰 ${CurrencyManager.getTotalCoins()}`);
    }

    const tip = this.add.text(px, py - 30, `-${penalty} 💰`, {
      fontFamily: 'Arial Black', fontSize: '16px', color: '#ff4466'
    }).setOrigin(0.5);
    this.tweens.add({
      targets: tip, y: py - 60, alpha: 0, duration: 700,
      onComplete: () => tip.destroy()
    });
  };

  private onCollectCoin = (_player: any, coin: any) => {
    if (!coin?.active) return;
    coin.disableBody(true, true);
    this.runCoins += 1;
    CurrencyManager.addCoins(1);
    this.player.coins = this.runCoins;
    this.playSound('coin', 0.55);
    this.coinsText.setText(`● ${this.runCoins}`);
    this.totalCoinsText.setText(`💰 ${CurrencyManager.getTotalCoins()}`);
  };

  private onCollectFuel = (_player: any, fuelObj: any) => {
    if (!fuelObj?.active) return;
    fuelObj.disableBody(true, true);

    // Solo llena si hay monedas suficientes (5)
    if (CurrencyManager.getTotalCoins() >= 10) {
      CurrencyManager.spendCoins(10);
      this.fuel = Math.min(100, this.fuel + 50);
      this.totalCoinsText.setText(`💰 ${CurrencyManager.getTotalCoins()}`);
      this.playSound('coin', 0.4);

      const tip = this.add.text(this.player.x, this.player.y - 40, '-10 💰 +fuel', {
        fontFamily: 'Arial', fontSize: '14px', color: '#4caf50'
      }).setOrigin(0.5);
      this.tweens.add({
        targets: tip, y: this.player.y - 70, alpha: 0, duration: 700,
        onComplete: () => tip.destroy()
      });
    } else {
      // Sin monedas: no llena
      const tip = this.add.text(this.player.x, this.player.y - 40, 'Sin monedas', {
        fontFamily: 'Arial', fontSize: '14px', color: '#ff4466'
      }).setOrigin(0.5);
      this.tweens.add({
        targets: tip, y: this.player.y - 70, alpha: 0, duration: 700,
        onComplete: () => tip.destroy()
      });
    }
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

  private flipRoadSense() {
    this.roadSense *= -1;
    const tip = this.add.text(this.scale.width / 2, 200, '¡SENTIDO CAMBIADO!', {
      fontFamily: 'Arial Black', fontSize: '18px', color: '#ffcc00'
    }).setOrigin(0.5);
    this.tweens.add({
      targets: tip, alpha: 0, y: 170, duration: 900,
      onComplete: () => tip.destroy()
    });
    if (this.directionText) {
      this.directionText.setText(
        this.roadSense === 1
          ? 'VÍA →  |  V = cambiar sentido'
          : '← VÍA  |  V = cambiar sentido'
      );
    }
  }
}