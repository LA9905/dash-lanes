import Phaser from 'phaser';

export class Obstacle extends Phaser.Physics.Arcade.Sprite {
  public kind: 'normal' | 'oncoming' | 'same' = 'normal';

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    speed: number,
    kind: 'normal' | 'oncoming' | 'same' = 'normal'
  ) {
    const key = kind === 'oncoming' ? 'obstacle_oncoming'
              : kind === 'same' ? 'obstacle_same'
              : 'obstacle';

    if (!scene.textures.exists(key)) {
      const g = scene.make.graphics({ x: 0, y: 0 });

      if (kind === 'oncoming') {
        // Rojo fuerte = en contra
        g.fillStyle(0xff1744, 1);
        g.fillRoundedRect(2, 2, 40, 40, 8);
        g.fillStyle(0xff8a80, 1);
        g.fillRoundedRect(10, 10, 24, 24, 5);
        g.lineStyle(2, 0xffffff, 0.7);
        g.lineBetween(8, 8, 36, 36);
        g.lineBetween(36, 8, 8, 36);
      } else if (kind === 'same') {
        // Azul = a favor
        g.fillStyle(0x2979ff, 1);
        g.fillRoundedRect(2, 2, 40, 40, 8);
        g.fillStyle(0x82b1ff, 1);
        g.fillRoundedRect(10, 10, 24, 24, 5);
      } else {
        g.fillStyle(0xff3b5c, 1);
        g.fillRoundedRect(2, 2, 40, 40, 8);
        g.fillStyle(0xff6b81, 1);
        g.fillRoundedRect(10, 10, 24, 24, 5);
        g.lineStyle(2, 0xffffff, 0.5);
        g.lineBetween(8, 8, 36, 36);
        g.lineBetween(36, 8, 8, 36);
      }

      g.generateTexture(key, 44, 44);
      g.destroy();
    }

    super(scene, x, y, key);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.kind = kind;
    this.setSize(36, 36);

    // En contra más rápido, a favor más lento
    const mult = kind === 'oncoming' ? 1.45 : kind === 'same' ? 0.55 : 1;
    this.setVelocityY(speed * mult);
  }

  preUpdate(time: number, delta: number) {
    super.preUpdate(time, delta);
    if (this.y > 720 || this.y < -80) this.destroy();
  }
}