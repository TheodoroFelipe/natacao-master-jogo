import Phaser from 'phaser';
import { W, H, FONT } from '../config.js';
import { SLIDES } from '../data/slides.js';
import { state, startClock, isReady } from '../state.js';

/** Mapa da prova: sobrepõe a fase atual e permite pular para qualquer fase. */
export class MapScene extends Phaser.Scene {
  constructor() { super('Map'); }

  init(data) { this.fromIdx = data.from; }

  create() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x020b14, 0.98);
    this.add.text(W / 2, 50, 'MAPA DA PROVA · escolha a fase (clique ou número + Enter)', {
      fontFamily: FONT, fontSize: '30px', color: '#7fe3ff', fontStyle: 'bold',
    }).setOrigin(0.5);

    const cols = 2;
    const rows = Math.ceil(SLIDES.length / cols);
    const cw = 560, ch = 72, gx = 40;
    const startX = W / 2 - cw - gx / 2, startY = 100;
    SLIDES.forEach((s, i) => {
      const col = Math.floor(i / rows), row = i % rows;
      const x = startX + col * (cw + gx), y = startY + row * (ch - 8);
      const current = i === this.fromIdx;
      const box = this.add.rectangle(x, y, cw, ch - 14, current ? 0xffd166 : 0x0e3a5c, 1)
        .setOrigin(0, 0).setInteractive({ useHandCursor: true });
      box.setStrokeStyle(2, 0x7fe3ff, 0.8);
      this.add.text(x + 14, y + (ch - 14) / 2, `${String(i + 1).padStart(2, '0')}  ${s.fase}`, {
        fontFamily: FONT, fontSize: '26px', color: current ? '#10202a' : '#ffffff', fontStyle: 'bold',
      }).setOrigin(0, 0.5);
      this.add.text(x + cw - 14, y + (ch - 14) / 2, isReady(i) ? 'OK' : '', {
        fontFamily: FONT, fontSize: '24px', color: '#2ec4b6', fontStyle: 'bold',
      }).setOrigin(1, 0.5);
      box.on('pointerdown', () => this.pick(i));
    });
    this.add.text(W / 2, H - 24, 'M ou ESC: fechar', { fontFamily: FONT, fontSize: '20px', color: '#cfe8f5' }).setOrigin(0.5);

    const kb = this.input.keyboard;
    kb.on('keydown-M', () => this.close());
    kb.on('keydown-ESC', () => this.close());
    let buf = '';
    kb.on('keydown', (e) => {
      if (/^[0-9]$/.test(e.key)) {
        buf = (buf + e.key).slice(-2);
      } else if (e.key === 'Enter' && buf) {
        const n = parseInt(buf, 10) - 1;
        buf = '';
        if (n >= 0 && n < SLIDES.length) this.pick(n);
      }
    });
  }

  close() {
    this.scene.stop();
    this.scene.resume('Pool');
  }

  pick(i) {
    startClock();
    const dir = i < this.fromIdx ? -1 : 1;
    const gm = this.game;
    gm.scene.stop('Map');
    gm.scene.stop('Pool');
    gm.scene.start('Pool', { idx: i, dir });
  }
}
