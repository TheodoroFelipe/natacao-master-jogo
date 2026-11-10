import { W, H, POOL_TOP, POOL_BOT, FONT, MONO, CONFIG } from '../config.js';
import { SLIDES } from '../data/slides.js';
import { state, fmt, tickClock, plannedMinutes } from '../state.js';

/** Faixa superior (fase, progresso, cronômetro, ritmo, dica) e notas do apresentador. */
export class Hud {
  /**
   * @param {Phaser.Scene} scene
   * @param {number} idx fase atual
   * @param {(i:number)=>void} onJump chamado ao clicar numa célula da barra de progresso
   */
  constructor(scene, idx, onJump) {
    this.idx = idx;
    const slide = SLIDES[idx];

    scene.add.rectangle(0, 0, W, POOL_TOP - 60, 0x020b14, 0.92).setOrigin(0, 0).setDepth(50);
    scene.add.text(24, 14, `FASE ${idx + 1}/${SLIDES.length} · ${slide.fase.toUpperCase()}`, {
      fontFamily: FONT, fontSize: '24px', color: '#7fe3ff', fontStyle: 'bold',
    }).setDepth(51);

    // barra de progresso: uma célula por fase, clicável
    const barX = 24, barY = 52, barW = W - 48;
    const cell = barW / SLIDES.length;
    for (let i = 0; i < SLIDES.length; i++) {
      const color = i === idx ? 0xffd166 : (i < idx ? 0x2ec4b6 : 0x1b4965);
      scene.add.rectangle(barX + i * cell + cell / 2, barY, cell - 6, 16, color)
        .setDepth(51)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => onJump(i));
    }

    this.clock = scene.add.text(W - 24, 14, '00:00', { fontFamily: MONO, fontSize: '30px', color: '#ffffff', fontStyle: 'bold' })
      .setOrigin(1, 0).setDepth(51);
    this.paceText = scene.add.text(W - 170, 18, '', { fontFamily: FONT, fontSize: '20px', color: '#a8dadc' })
      .setOrigin(1, 0).setDepth(51);
    // dica de status (bolhas coletadas, "toque a parede", buffer de número)
    this.hint = scene.add.text(W / 2, 76, '', { fontFamily: FONT, fontSize: '21px', color: '#ffd166', fontStyle: 'bold' })
      .setOrigin(0.5).setDepth(52);
    scene.add.text(24, H - 12, 'Setas/WASD: nadar · Clique: ir até lá · N: avançar · B: voltar · M: mapa · R: revelar · O: obstáculos · I: foto · H: notas · F: tela cheia', {
      fontFamily: FONT, fontSize: '16px', color: '#cfe8f5',
    }).setOrigin(0, 1).setDepth(51).setAlpha(0.8);

    this.notes = scene.add.text(W / 2, POOL_BOT - 60, '', {
      fontFamily: FONT, fontSize: '22px', color: '#111', backgroundColor: '#ffe29a',
      padding: { x: 14, y: 10 }, wordWrap: { width: W - 200 }, align: 'center',
    }).setOrigin(0.5, 1).setDepth(60).setVisible(false);
    this.slide = slide;
    if (state.showNotes) this.notes.setText('Nota: ' + slide.nota).setVisible(true); // notas ficam ligadas entre fases
  }

  setHint(text) { this.hint.setText(text); }

  toggleNotes() {
    state.showNotes = !state.showNotes;
    this.notes.setText('Nota: ' + this.slide.nota).setVisible(state.showNotes);
  }

  /** Atualiza cronômetro e ritmo. Chamar a cada quadro. */
  update() {
    const elapsed = tickClock();
    this.clock.setText(fmt(elapsed));
    const mins = elapsed / 60000;
    this.clock.setColor(mins >= CONFIG.tempoTotalMin ? '#ff4d4d' : (mins >= CONFIG.tempoApresentacaoMin ? '#ffd166' : '#ffffff'));
    if (!state.startTime) {
      this.paceText.setText('Cronômetro inicia no primeiro movimento');
      return;
    }
    const diff = mins - plannedMinutes(this.idx);
    this.paceText.setText('Ritmo: ' + (Math.abs(diff) < 0.5
      ? 'no tempo'
      : (diff < 0 ? 'adiantado ' : 'atrasado ') + Math.abs(diff).toFixed(1).replace('.', ',') + ' min'));
  }
}
