import Phaser from 'phaser';
import { W, H, FONT, CONFIG } from '../config.js';
import { toggleFullscreen } from '../systems/presenterKeys.js';
import { SLIDES } from '../data/slides.js';
import { FOTOS, fotoKey } from '../data/fotos.js';

/** Tela de abertura. A apresentação só começa quando você clicar ou apertar ESPAÇO. */
export class TitleScene extends Phaser.Scene {
  constructor() { super('Title'); }

  /** Carrega as fotos dos slides (já embutidas no HTML; sem rede). */
  preload() {
    for (const s of SLIDES) {
      if (!s.foto) continue;
      if (FOTOS[s.foto]) this.load.image(fotoKey(s.foto), FOTOS[s.foto]);
      else console.warn(`Foto não encontrada em src/assets/fotos/: ${s.foto}`);
    }
  }

  create() {
    this.add.rectangle(W / 2, H / 2, W, H, 0x04121f);
    for (let i = 0; i < 30; i++) {
      const c = this.add.circle(Phaser.Math.Between(0, W), Phaser.Math.Between(0, H), Phaser.Math.Between(3, 12), 0x7fe3ff, 0.25);
      this.tweens.add({ targets: c, y: c.y - Phaser.Math.Between(120, 300), alpha: 0, duration: Phaser.Math.Between(2500, 5000), repeat: -1 });
    }
    this.add.text(W / 2, 230, CONFIG.tituloGeral, { fontFamily: FONT, fontSize: '96px', color: '#ffffff', fontStyle: 'bold' }).setOrigin(0.5);
    this.add.text(W / 2, 330, CONFIG.subtitulo, { fontFamily: FONT, fontSize: '36px', color: '#7fe3ff' }).setOrigin(0.5);
    this.add.text(W / 2, 395, CONFIG.autor, { fontFamily: FONT, fontSize: '26px', color: '#cfe8f5' }).setOrigin(0.5);

    const start = this.add.text(W / 2, 520, '▶  Clique ou pressione ESPAÇO para começar', {
      fontFamily: FONT, fontSize: '32px', color: '#10202a', backgroundColor: '#ffd166', padding: { x: 22, y: 12 }, fontStyle: 'bold',
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });
    this.tweens.add({ targets: start, scale: 1.05, duration: 700, yoyo: true, repeat: -1 });
    this.add.text(W / 2, 640, 'Dica: F = tela cheia · M = mapa · N/B = avançar/voltar · R = revelar tudo', {
      fontFamily: FONT, fontSize: '20px', color: '#9fb3c1',
    }).setOrigin(0.5);

    const go = () => this.scene.start('Pool', { idx: 0, dir: 1 });
    start.on('pointerdown', go);
    this.input.keyboard.on('keydown-SPACE', go);
    this.input.keyboard.on('keydown-ENTER', go);
    this.input.keyboard.on('keydown-F', () => toggleFullscreen(this));
  }
}
