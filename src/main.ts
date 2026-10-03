import Phaser from 'phaser';
import { BootScene } from './game/scenes/BootScene';
import { HubScene } from './game/scenes/HubScene';
import { MenuScene } from './game/scenes/MenuScene';
import { GameScene } from './game/scenes/GameScene';
import { GameOverScene } from './game/scenes/GameOverScene';
import { SpikeRunMenuScene } from './game/scenes/SpikeRunMenuScene';
import { SpikeRunScene } from './game/scenes/SpikeRunScene';
import { CoinDropMenuScene } from './game/scenes/CoinDropMenuScene';
import { CoinDropScene } from './game/scenes/CoinDropScene';
import { OrbitMenuScene } from './game/scenes/OrbitMenuScene';
import { OrbitScene } from './game/scenes/OrbitScene';
import { ClimbMenuScene } from './game/scenes/ClimbMenuScene';
import { ClimbScene } from './game/scenes/ClimbScene';
import { ReflexMenuScene } from './game/scenes/ReflexMenuScene';
import { ReflexScene } from './game/scenes/ReflexScene';

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 360,
  height: 640,
  parent: 'game-container',
  backgroundColor: '#0f0f1a',
  physics: {
    default: 'arcade',
    arcade: { gravity: { x: 0, y: 1100 }, debug: false }
  },
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [
    BootScene, HubScene,
    MenuScene, GameScene, GameOverScene,
    SpikeRunMenuScene, SpikeRunScene,
    CoinDropMenuScene, CoinDropScene,
    OrbitMenuScene, OrbitScene,
    ClimbMenuScene, ClimbScene,
    ReflexMenuScene, ReflexScene
  ]
};

new Phaser.Game(config);