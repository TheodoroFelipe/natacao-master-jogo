import Phaser from 'phaser';
import { POOL_BOT, WALL_X, START_X, SWIM_BOUNDS } from '../config.js';
import { SLIDES } from '../data/slides.js';
import { state, startClock, isReady, revealedCount, markRevealed, revealAll, nextAnswerIdx } from '../state.js';
import { PoolScenery } from '../objects/PoolScenery.js';
import { Swimmer } from '../objects/Swimmer.js';
import { createBubbles, popBubble } from '../objects/bubbles.js';
import { Obstacles } from '../objects/obstacles.js';
import { Panel } from '../ui/Panel.js';
import { Hud } from '../ui/Hud.js';
import { bindPresenterKeys } from '../systems/presenterKeys.js';

/**
 * Uma fase = um slide. A MESMA cena é reiniciada (scene.restart) a cada troca
 * de fase com { idx, dir }; o que precisa sobreviver fica em state.js.
 */
export class PoolScene extends Phaser.Scene {
  constructor() { super('Pool'); }

  init(data) {
    this.idx = data.idx;
    this.fromLeft = data.dir !== -1; // dir = -1: veio "de trás" (voltando), nada na direita
    this.sceneReady = false;         // útil para testes: true quando create() terminou
  }

  create() {
    this.slide = SLIDES[this.idx];
    this.transitioning = false;
    this.celebrated = false;
    this.target = null;   // destino do clique/toque
    this._lastMs = 0;

    this.scenery = new PoolScenery(this);
    this.panel = new Panel(this, this.slide);
    this.hud = new Hud(this, this.idx, (i) => this.goTo(i, i < this.idx ? -1 : 1));
    this.bubbles = createBubbles(this, this.idx, this.slide.topicos.length, (b) => { this.target = { x: b.x, y: b.y }; });
    this.obstacles = new Obstacles(this, this.idx, this.slide.topicos.length);
    this.swimmer = new Swimmer(this, this.fromLeft ? START_X : WALL_X - 130, POOL_BOT - 70, this.fromLeft ? 1 : -1);

    this.setupInput();
    this.cameras.main.fadeIn(350, 4, 18, 31);
    this.panel.sync(state.revealed[this.idx]);
    this.panel.syncAnswers(state.answered[this.idx]);
    this.refreshReady();
    this.sceneReady = true;
  }

  setupInput() {
    const kb = this.input.keyboard;
    this.cursors = kb.createCursorKeys();
    this.wasd = kb.addKeys('W,A,S,D');

    bindPresenterKeys(this, {
      next: () => this.goTo(this.idx + 1),
      prev: () => this.goTo(this.idx - 1, -1),
      openMap: () => { this.scene.pause(); this.scene.launch('Map', { from: this.idx }); },
      revealAll: () => this.revealAllTopics(),
      toggleNotes: () => this.hud.toggleNotes(),
      jump: (n) => { if (n >= 0 && n < SLIDES.length) this.goTo(n, n < this.idx ? -1 : 1); },
      onBuffer: (t) => this.hud.setHint(t),
      onBufferClear: () => this.refreshReady(),
    });

    // I: amplia/fecha a foto do slide (se houver)
    kb.on('keydown-I', () => this.panel.toggleZoom());

    // O: liga/desliga os obstáculos (se atrapalharem na hora, desligue)
    kb.on('keydown-O', () => {
      this.obstacles.setEnabled(!state.obstaclesOn);
      this.hud.setHint(state.obstaclesOn ? 'Obstáculos ligados (O desliga)' : 'Obstáculos desligados (O liga)');
      this._hintTimer?.remove();
      this._hintTimer = this.time.delayedCall(1800, () => this.refreshReady());
    });

    // quiz: E ou clique na pergunta mostra a resposta (nunca bloqueia a virada)
    if (this.slide.respostas) {
      kb.on('keydown-E', () => this.showAnswer(nextAnswerIdx(this.idx)));
      this.panel.bullets.forEach((tx, i) => {
        tx.setInteractive({ useHandCursor: true }).on('pointerdown', () => {
          if (state.revealed[this.idx][i]) this.showAnswer(i);
        });
      });
    }

    // clicar na água manda o nadador para lá (útil com mouse/touch/apresentador remoto)
    this.input.on('pointerdown', (p, over) => {
      if (over.length === 0 && p.y > SWIM_BOUNDS.minY - 60) this.target = { x: p.x, y: p.y };
    });
  }

  /** Atualiza a dica e a parede conforme o progresso do slide. */
  refreshReady() {
    const ready = isReady(this.idx);
    const last = this.idx === SLIDES.length - 1;
    const answerHint = nextAnswerIdx(this.idx) >= 0 ? ' · E ou clique na pergunta: resposta' : '';
    this.hud.setHint((ready
      ? (last ? 'Toque a parede: fim!' : 'Toque a parede e faça a virada →')
      : `Bolhas: ${revealedCount(this.idx)}/${this.slide.topicos.length}`) + answerHint);
    this.scenery.setWallReady(ready);
  }

  showAnswer(i) {
    if (i < 0 || !this.panel.answers[i] || state.answered[this.idx][i]) return;
    state.answered[this.idx][i] = true;
    this.panel.revealAnswer(i);
    this.refreshReady();
  }

  collect(bubble) {
    if (!bubble.visible) return;
    markRevealed(this.idx, bubble.topicIdx);
    popBubble(this, bubble);
    this.panel.reveal(bubble.topicIdx);
    this.refreshReady();
  }

  /** R: libera todos os tópicos da fase (plano B do apresentador). */
  revealAllTopics() {
    revealAll(this.idx);
    this.bubbles.forEach((b) => b.setVisible(false));
    this.panel.sync(state.revealed[this.idx]);
    this.refreshReady();
  }

  goTo(n, dir = 1) {
    if (this.transitioning) return;
    if (n < 0 || n >= SLIDES.length) return;
    this.transitioning = true;
    startClock();
    this.cameras.main.fadeOut(280, 4, 18, 31);
    this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart({ idx: n, dir }));
  }

  /** O nadador tocou a parede com o slide completo. */
  finishTurn() {
    if (this.transitioning) return;
    const last = this.idx === SLIDES.length - 1;
    if (last) {
      if (this.celebrated) return; // comemora uma única vez
      this.celebrated = true;
      this.hud.setHint('Obrigado!');
      for (let i = 0; i < 40; i++) {
        const c = this.add.circle(Phaser.Math.Between(WALL_X - 200, WALL_X), POOL_BOT - 40, Phaser.Math.Between(4, 10), 0xffffff, 0.8).setDepth(40);
        this.tweens.add({ targets: c, y: SWIM_BOUNDS.minY - 300, alpha: 0, duration: Phaser.Math.Between(700, 1500), delay: i * 20 });
      }
      return;
    }
    this.transitioning = true;
    startClock();
    this.swimmer.turn(() => {
      this.cameras.main.fadeOut(250, 4, 18, 31);
      this.cameras.main.once('camerafadeoutcomplete', () => this.scene.restart({ idx: this.idx + 1, dir: 1 }));
    });
  }

  update() {
    if (!this.sceneReady) return;
    // dt em tempo real: o nadador anda na mesma velocidade em qualquer computador
    const now = performance.now();
    const dt = Math.min((now - (this._lastMs || now)) / 1000, 0.1);
    this._lastMs = now;
    if (this.transitioning) return;

    const c = this.cursors, k = this.wasd;
    let vx = 0, vy = 0;
    if (c.left.isDown || k.A.isDown) vx = -1;
    if (c.right.isDown || k.D.isDown) vx = 1;
    if (c.up.isDown || k.W.isDown) vy = -1;
    if (c.down.isDown || k.S.isDown) vy = 1;

    if (vx || vy) {
      this.target = null;
      startClock(); // o cronômetro começa no primeiro movimento
      if (vx && vy) { vx *= 0.707; vy *= 0.707; }
    } else if (this.target) {
      const dx = this.target.x - this.swimmer.x;
      const dy = this.target.y - this.swimmer.y;
      const d = Math.hypot(dx, dy);
      if (d < 10) this.target = null; else { vx = dx / d; vy = dy / d; }
    }

    this.swimmer.swim(dt, vx, vy, SWIM_BOUNDS);
    this.obstacles.update(dt, this.swimmer);
    this.hud.update();
    this.scenery.update(dt);

    for (const b of this.bubbles) {
      if (b.visible && Phaser.Math.Distance.Between(this.swimmer.x, this.swimmer.y, b.x, b.y) < 62) this.collect(b);
    }

    // parede = virada. Só libera com todas as bolhas (ou com R).
    if (this.swimmer.x >= WALL_X - 46 && vx >= 0) {
      if (isReady(this.idx)) {
        this.finishTurn();
      } else {
        this.hud.setHint('Pegue todas as bolhas antes da virada (R libera tudo)');
        this.swimmer.x = WALL_X - 50;
        this._hintTimer?.remove();
        this._hintTimer = this.time.delayedCall(2200, () => this.refreshReady());
      }
    }
  }
}
