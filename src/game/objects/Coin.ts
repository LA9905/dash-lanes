import Phaser from 'phaser';

export class Coin extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, speed: number) {
    if (!scene.textures.exists('coin')) {
      const g = scene.make.graphics({ x: 0, y: 0 });

      g.fillStyle(0xffd700, 1);
      g.fillCircle(16, 16, 15);

      g.fillStyle(0xfff3a0, 1);
      g.fillCircle(16, 16, 8);

      g.lineStyle(2, 0xe6b800, 1);
      g.strokeCircle(16, 16, 15);

      g.generateTexture('coin', 32, 32);
      g.destroy();
    }

    super(scene, x, y, 'coin');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setSize(26, 26);
    this.setVelocityY(speed);

    scene.tweens.add({
      targets: this,
      angle: 360,
      duration: 1200,
      repeat: -1
    });
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (this.y > 700) this.destroy();
  }
}