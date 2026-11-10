import Phaser from 'phaser';
import { W, H } from './config.js';
import { TitleScene } from './scenes/TitleScene.js';
import { PoolScene } from './scenes/PoolScene.js';
import { MapScene } from './scenes/MapScene.js';

const K = Phaser.Input.Keyboard.KeyCodes;

// window.__game é usado pelo teste de fumaça (scripts/smoke-test.mjs) e para depurar no console.
window.__game = new Phaser.Game({
  type: Phaser.AUTO,
  parent: 'game',
  width: W,
  height: H,
  backgroundColor: '#04121f',
  scale: { mode: Phaser.Scale.FIT, autoCenter: Phaser.Scale.CENTER_BOTH },
  scene: [TitleScene, PoolScene, MapScene],
  // impede a página de rolar com setas, espaço e PageUp/PageDown
  input: { keyboard: { capture: [K.SPACE, K.UP, K.DOWN, K.LEFT, K.RIGHT, K.PAGE_UP, K.PAGE_DOWN] } },
});
