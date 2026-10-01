import Phaser from 'phaser';

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, speed: number) {
    if (!scene.textures.exists('obstacle')) {
      const g = scene.make.graphics({ x: 0, y: 0 });

      // Caja principal
      g.fillStyle(0xff3b5c, 1);
      g.fillRoundedRect(2, 2, 40, 40, 8);

      // Detalle interno
      g.fillStyle(0xff6b81, 1);
      g.fillRoundedRect(10, 10, 24, 24, 5);

      // Líneas de peligro
      g.lineStyle(2, 0xffffff, 0.5);
      g.lineBetween(8, 8, 36, 36);
      g.lineBetween(36, 8, 8, 36);

      g.generateTexture('obstacle', 44, 44);
      g.destroy();
    }

    super(scene, x, y, 'obstacle');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setSize(36, 36);
    this.setVelocityY(speed);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (this.y > 720) this.destroy();
  }
}