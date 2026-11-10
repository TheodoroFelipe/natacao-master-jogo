import Phaser from 'phaser';
import { WALL_X, SWIM_BOUNDS, FONT, OBSTACLES } from '../config.js';
import { state } from '../state.js';

const OUT = 0x06223a;

/**
 * Tipos de obstáculo (materiais de treino de piscina). Cada um vira uma textura
 * desenhada UMA vez. `w`/`h` = tamanho da textura; a hitbox usa 80% disso.
 */
const TYPES = {
  prancha: { w: 76, h: 40, draw(g) {
    g.fillStyle(OUT, 1); g.fillRoundedRect(1, 1, 74, 38, 14);
    g.fillStyle(0xffd166, 1); g.fillRoundedRect(3.5, 3.5, 69, 33, 12);
    g.fillStyle(0x3a86ff, 1); g.fillRoundedRect(3.5, 24, 69, 12.5, { tl: 0, tr: 0, bl: 12, br: 12 });
    g.fillStyle(OUT, 0.85); g.fillEllipse(22, 14, 14, 7); g.fillEllipse(54, 14, 14, 7);
  } },
  pullbuoy: { w: 64, h: 36, draw(g) {
    g.fillStyle(OUT, 1); g.fillEllipse(17, 18, 32, 34); g.fillEllipse(47, 18, 32, 34); g.fillRect(17, 8, 30, 20);
    g.fillStyle(0xff5a4d, 1); g.fillEllipse(17, 18, 27, 29);
    g.fillStyle(0x4cc9f0, 1); g.fillEllipse(47, 18, 27, 29);
    g.fillStyle(0xffffff, 1); g.fillRect(24, 11, 16, 14);
    g.fillStyle(0xffffff, 0.4); g.fillEllipse(13, 10, 10, 5); g.fillEllipse(43, 10, 10, 5);
  } },
  patinho: { w: 52, h: 46, draw(g) {
    g.fillStyle(OUT, 1); g.fillEllipse(22, 30, 42, 28); g.fillCircle(35, 14, 12);
    g.fillStyle(0xffd60a, 1); g.fillEllipse(22, 30, 37, 23); g.fillCircle(35, 14, 9.5);
    g.fillStyle(0xf77f00, 1); g.fillTriangle(42, 13, 51, 16, 42, 19);
    g.fillStyle(OUT, 1); g.fillCircle(37, 11, 2.2);
    g.fillStyle(0xe0b100, 1); g.fillEllipse(17, 29, 18, 9); // asa
  } },
  macarrao: { w: 88, h: 22, draw(g) {
    g.fillStyle(OUT, 1); g.fillRoundedRect(1, 1, 86, 20, 10);
    g.fillStyle(0x80ed99, 1); g.fillRoundedRect(3.5, 3.5, 81, 15, 7.5);
    g.lineStyle(2, 0x2d9d5a, 1);
    for (let x = 14; x < 80; x += 12) g.lineBetween(x, 4, x, 18);
    g.fillStyle(0xffffff, 0.35); g.fillRoundedRect(8, 5, 70, 3, 1.5);
  } },
  boia: { w: 50, h: 50, draw(g) {
    const c = 25;
    g.fillStyle(OUT, 1); g.fillCircle(c, c, 24);
    for (let i = 0; i < 8; i++) {
      g.fillStyle(i % 2 ? 0xffffff : 0xff5a4d, 1);
      g.slice(c, c, 21.5, (i * Math.PI) / 4, ((i + 1) * Math.PI) / 4, false);
      g.fillPath();
    }
    g.fillStyle(OUT, 1); g.fillCircle(c, c, 11);
    g.fillStyle(0x0d4f80, 1); g.fillCircle(c, c, 8.5); // "furo" mostra a água
  } },
};
const ORDER = ['prancha', 'pullbuoy', 'patinho', 'macarrao', 'boia'];

function ensureTextures(scene) {
  for (const k of ORDER) {
    const key = `ob_${k}`;
    if (scene.textures.exists(key)) continue;
    const t = TYPES[k];
    const g = scene.make.graphics({ x: 0, y: 0, add: false });
    t.draw(g);
    g.generateTexture(key, t.w, t.h);
    g.destroy();
  }
}

/** X das bolhas (mesma fórmula de bubbles.js) para encaixar obstáculos ENTRE elas. */
function bubbleXs(count) {
  const minX = 260, maxX = WALL_X - 170;
  return Array.from({ length: count }, (_, i) => minX + (count === 1 ? 0 : (i * (maxX - minX)) / (count - 1)));
}

/**
 * Obstáculos da fase. Sobem e descem devagar na zona de nado; ao bater, o nadador
 * leva um empurrãozinho e fica lento por meio segundo. NUNCA bloqueiam: depois de
 * uma batida o obstáculo vira "fantasma" (sem colisão) por OBSTACLES.cooldownS.
 * Posições e tipos são fixos por fase (dá para ensaiar).
 */
export class Obstacles {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} idx índice da fase
   * @param {number} topicCount quantidade de bolhas da fase
   */
  constructor(scene, idx, topicCount) {
    this.scene = scene;
    this.items = [];
    this.t = 0;
    if (idx < OBSTACLES.firstPhase) return;
    ensureTextures(scene);

    const xs = bubbleXs(topicCount);
    const mids = xs.slice(1).map((x, i) => (x + xs[i]) / 2);
    const n = Math.min(OBSTACLES.maxPerPhase, idx < 4 ? 2 : 3, mids.length);
    const picks = n === mids.length ? mids
      : Array.from({ length: n }, (_, j) => mids[Math.round(((j + 0.5) * mids.length) / n - 0.5)]);

    picks.forEach((x, j) => {
      const type = ORDER[(idx * 2 + j) % ORDER.length];
      const t = TYPES[type];
      const img = scene.add.image(x, 0, `ob_${type}`).setDepth(19); // atrás das bolhas
      const top = SWIM_BOUNDS.minY + t.h / 2;
      const bot = SWIM_BOUNDS.maxY + 10 - t.h / 2;
      img.cy = (top + bot) / 2;
      img.amp = (bot - top) / 2;
      img.w = 2 * Math.PI / (2.8 + ((idx + j) % 3) * 0.6); // período de 2,8 a 4 s
      img.phi = idx * 1.7 + j * 2.1;
      img.hw = t.w * 0.4; img.hh = t.h * 0.4;
      img.cool = 0;
      img.type = type;
      img.y = img.cy + img.amp * Math.sin(img.phi);
      this.items.push(img);
    });
    this.setEnabled(state.obstaclesOn);
  }

  get enabled() { return state.obstaclesOn; }

  setEnabled(on) {
    state.obstaclesOn = on;
    for (const o of this.items) o.setVisible(on);
  }

  /**
   * Move os obstáculos (dt em tempo real) e trata batidas com o nadador.
   * @param {number} dt
   * @param {import('./Swimmer.js').Swimmer} swimmer
   */
  update(dt, swimmer) {
    if (!this.items.length) return;
    this.t += dt;
    const hb = swimmer.hitbox();
    for (const o of this.items) {
      o.y = o.cy + o.amp * Math.sin(this.t * o.w + o.phi);
      o.setAngle(6 * Math.sin(this.t * 1.7 + o.phi));
      if (o.cool > 0) {
        o.cool -= dt;
        if (o.cool <= 0) o.setAlpha(1);
        continue;
      }
      if (!this.enabled) continue;
      if (Math.abs(o.x - hb.cx) < o.hw + hb.hw && Math.abs(o.y - hb.cy) < o.hh + hb.hh) this.hit(o, swimmer);
    }
  }

  hit(o, swimmer) {
    swimmer.bump(o.x, o.y);
    o.cool = OBSTACLES.cooldownS;
    o.setAlpha(0.45);
    const scene = this.scene;
    scene.tweens.add({ targets: o, scale: { from: 1.25, to: 1 }, duration: 260, ease: 'Back.out' });
    const mx = (o.x + swimmer.x) / 2, my = (o.y + swimmer.y) / 2;
    for (let k = 0; k < 7; k++) {
      const c = scene.add.circle(mx, my, Phaser.Math.Between(3, 6), 0xffffff, 0.85).setDepth(26);
      scene.tweens.add({ targets: c, x: mx + Phaser.Math.Between(-45, 45), y: my + Phaser.Math.Between(-30, 15), alpha: 0, duration: 450, onComplete: () => c.destroy() });
    }
    // o texto nunca sobe até a placa do slide
    const txt = scene.add.text(mx, Math.max(my - 30, SWIM_BOUNDS.minY + 10), 'Ops!', { fontFamily: FONT, fontSize: '24px', fontStyle: 'bold', color: '#ffffff', stroke: '#06223a', strokeThickness: 5 })
      .setOrigin(0.5).setDepth(27);
    scene.tweens.add({ targets: txt, y: txt.y - 20, alpha: 0, duration: 700, onComplete: () => txt.destroy() });
  }
}
