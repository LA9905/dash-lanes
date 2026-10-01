import Phaser from 'phaser';

export class Player extends Phaser.Physics.Arcade.Sprite {
  private lanes: number[] = [90, 180, 270];
  private currentLane = 1;
  public coins = 0;

  constructor(scene: Phaser.Scene, x: number, y: number, highwayMode = false) {
    if (!scene.textures.exists('player')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x000000, 0.25);
      g.fillEllipse(20, 58, 28, 8);
      g.fillStyle(0x00e6b8, 1);
      g.fillRoundedRect(6, 14, 28, 40, 10);
      g.fillStyle(0x00ffcc, 1);
      g.fillRoundedRect(8, 4, 24, 18, 8);
      g.fillStyle(0x0f0f1a, 1);
      g.fillRoundedRect(11, 9, 18, 8, 3);
      g.fillStyle(0xffffff, 0.35);
      g.fillRoundedRect(10, 6, 8, 4, 2);
      g.generateTexture('player', 40, 64);
      g.destroy();
    }

    super(scene, x, y, 'player');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    // 3 carriles normales o 5 en autopista
    this.lanes = highwayMode
      ? [50, 110, 180, 250, 310]
      : [90, 180, 270];

    this.currentLane = highwayMode ? 2 : 1;
    this.x = this.lanes[this.currentLane];

    this.setCollideWorldBounds(true);
    this.setSize(30, 48);
    this.setOffset(5, 8);
    this.setBounce(0);
  }

  changeLane(dir: number) {
    this.currentLane = Phaser.Math.Clamp(this.currentLane + dir, 0, this.lanes.length - 1);
    this.scene.tweens.add({
      targets: this,
      x: this.lanes[this.currentLane],
      duration: 85,
      ease: 'Quad.easeOut'
    });
  }

  jump() {
    const body = this.body as Phaser.Physics.Arcade.Body;
    if (body && (body.blocked.down || body.touching.down)) {
      this.setVelocityY(-500);
    }
  }
}