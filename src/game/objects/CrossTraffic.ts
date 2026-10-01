import Phaser from 'phaser';

export class CrossTraffic extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, y: number, speed: number, fromLeft: boolean) {
    if (!scene.textures.exists('cross_car')) {
      const g = scene.make.graphics({ x: 0, y: 0 });
      g.fillStyle(0xff9800, 1);
      g.fillRoundedRect(0, 0, 50, 28, 6);
      g.fillStyle(0xffc107, 1);
      g.fillRoundedRect(6, 6, 16, 16, 3);
      g.fillStyle(0x212121, 1);
      g.fillCircle(12, 28, 5);
      g.fillCircle(38, 28, 5);
      g.generateTexture('cross_car', 50, 34);
      g.destroy();
    }

    const startX = fromLeft ? -40 : 400;
    super(scene, startX, y, 'cross_car');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setSize(46, 26);
    const body = this.body as Phaser.Physics.Arcade.Body;
    body.allowGravity = false;
    body.setVelocityX(fromLeft ? speed * 0.9 : -speed * 0.9);
    body.setVelocityY(speed * 0.35);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (this.x < -80 || this.x > 440 || this.y > 720) {
      this.destroy();
    }
  }
}