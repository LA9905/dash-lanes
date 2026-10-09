import Phaser from 'phaser';
import { initAds } from '../ads';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {}

  create() {
    initAds();
    this.scene.start('HubScene');
  }
}