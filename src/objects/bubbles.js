import Phaser from 'phaser';
import { WALL_X, FONT, SWIM_BOUNDS } from '../config.js';
import { state } from '../state.js';

/**
 * Cria uma bolha numerada para cada tópico ainda não revelado do slide.
 * Cada bolha é um Container com a propriedade `topicIdx`.
 * @param {Phaser.Scene} scene
 * @param {number} idx índice do slide
 * @param {number} count quantidade de tópicos
 * @param {(bubble: Phaser.GameObjects.Container) => void} onClick clique/toque na bolha
 */
export function createBubbles(scene, idx, count, onClick) {
  const bubbles = [];
  const minX = 260;
  const maxX = WALL_X - 170;
  const lowY = SWIM_BOUNDS.minY + 20;
  for (let i = 0; i < count; i++) {
    const x = minX + (count === 1 ? 0 : (i * (maxX - minX)) / (count - 1));
    const y = lowY + (i % 3) * 52;
    const c = scene.add.container(x, y).setDepth(20);
    const circ = scene.add.circle(0, 0, 28, 0xbff3ff, 0.35).setStrokeStyle(4, 0xffffff, 0.95);
    const shine = scene.add.circle(-9, -10, 6, 0xffffff, 0.9);
    const num = scene.add.text(0, 2, String(i + 1), { fontFamily: FONT, fontSize: '26px', color: '#05345a', fontStyle: 'bold' }).setOrigin(0.5);
    c.add([circ, shine, num]);
    c.topicIdx = i;
    scene.tweens.add({ targets: c, y: y - 12, duration: 1100 + i * 130, yoyo: true, repeat: -1, ease: 'Sine.inOut' });
    c.setSize(70, 70).setInteractive({ useHandCursor: true });
    c.on('pointerdown', () => onClick(c));
    if (state.revealed[idx][i]) c.setVisible(false);
    bubbles.push(c);
  }
  return bubbles;
}

/** Efeito de estouro quando a bolha é coletada. */
export function popBubble(scene, bubble) {
  bubble.setVisible(false);
  for (let k = 0; k < 10; k++) {
    const c = scene.add.circle(bubble.x, bubble.y, Phaser.Math.Between(3, 7), 0xffffff, 0.8).setDepth(25);
    scene.tweens.add({
      targets: c,
      x: bubble.x + Phaser.Math.Between(-60, 60),
      y: bubble.y + Phaser.Math.Between(-70, -10),
      alpha: 0,
      duration: 500,
      onComplete: () => c.destroy(),
    });
  }
}
