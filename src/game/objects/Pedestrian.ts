import Phaser from 'phaser';

export class Pedestrian extends Phaser.Physics.Arcade.Sprite {
  constructor(scene: Phaser.Scene, x: number, y: number, speed: number) {
    if (!scene.textures.exists('pedestrian')) {
      const g = scene.make.graphics({ x: 0, y: 0 });

      // Cuerpo (persona mayor)
      g.fillStyle(0xf5d0c5, 1); // piel
      g.fillCircle(16, 10, 9);  // cabeza

      g.fillStyle(0x5c6bc0, 1); // ropa
      g.fillRoundedRect(6, 18, 20, 26, 4);

      // Bastón
      g.lineStyle(3, 0x8d6e63, 1);
      g.lineBetween(28, 22, 28, 48);

      g.generateTexture('pedestrian', 36, 52);
      g.destroy();
    }

    super(scene, x, y, 'pedestrian');
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setSize(28, 44);
    this.setOffset(4, 4);
    this.setVelocityY(speed * 0.7);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (this.y > 720) this.destroy();
  }
}