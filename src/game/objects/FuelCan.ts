import Phaser from 'phaser';

export class FuelCan extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, speed: number) {
    if (!scene.textures.exists('fuel')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0x4caf50, 1);
      g.fillRoundedRect(4, 4, 28, 36, 6);
      g.fillStyle(0x81c784, 1);
      g.fillRoundedRect(10, 10, 16, 12, 3);
      g.fillStyle(0x2e7d32, 1);
      g.fillRect(14, 0, 8, 8);
      g.generateTexture('fuel', 36, 44);
      g.destroy();
    }

    super(scene, x, y, 'fuel');
    scene.add.existing(this);
    scene.physics.add.existing(this);
    this.setSize(30, 38);
    this.setVelocityY(speed);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (this.y > 720) this.destroy();
  }
}