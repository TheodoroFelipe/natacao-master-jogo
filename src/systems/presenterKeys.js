// Atalhos do apresentador. REGRA DO PROJETO: estes atalhos precisam funcionar
// em qualquer fase, a qualquer momento, mesmo que o jogo trave ou a fase
// ainda não esteja completa. Eles são o "seguro" contra qualquer imprevisto.

export function toggleFullscreen(scene) {
  if (scene.scale.isFullscreen) scene.scale.stopFullscreen();
  else scene.scale.startFullscreen();
}

/**
 * @param {Phaser.Scene} scene
 * @param {{
 *   next: ()=>void, prev: ()=>void, openMap: ()=>void, revealAll: ()=>void,
 *   toggleNotes: ()=>void, jump: (n:number)=>void,
 *   onBuffer: (text:string)=>void, onBufferClear: ()=>void
 * }} a
 */
export function bindPresenterKeys(scene, a) {
  const kb = scene.input.keyboard;
  kb.on('keydown-N', a.next);
  kb.on('keydown-PAGEDOWN', a.next);
  kb.on('keydown-B', a.prev);
  kb.on('keydown-PAGEUP', a.prev);
  kb.on('keydown-M', a.openMap);
  kb.on('keydown-R', a.revealAll);
  kb.on('keydown-H', a.toggleNotes);
  kb.on('keydown-F', () => toggleFullscreen(scene));
  kb.on('keydown-ESC', () => { if (scene.scale.isFullscreen) scene.scale.stopFullscreen(); });

  // Pulo direto: digite o número da fase (1 a 2 dígitos) e Enter.
  let buf = '';
  kb.on('keydown', (e) => {
    if (/^[0-9]$/.test(e.key)) {
      buf = (buf + e.key).slice(-2);
      a.onBuffer(`Ir para a fase: ${buf} (Enter)`);
      scene.time.delayedCall(2500, () => { buf = ''; a.onBufferClear(); });
    } else if (e.key === 'Enter' && buf) {
      const n = parseInt(buf, 10) - 1;
      buf = '';
      a.onBufferClear();
      a.jump(n);
    }
  });
}
