import { PANEL, FONT, W, H } from '../config.js';
import { fotoKey } from '../data/fotos.js';

/** A "placa" dentro d'água onde o título e os tópicos do slide aparecem. */
export class Panel {
  /**
   * @param {Phaser.Scene} scene
   * @param {import('../data/slides.js').Slide} slide
   */
  constructor(scene, slide) {
    this.scene = scene;
    const { x, y, w, h } = PANEL;

    if (!scene.textures.exists('panel_frame')) {
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0x03223a, 0.86); g.fillRoundedRect(4, 4, w, h, 18);
      g.lineStyle(4, 0x7fe3ff, 0.9); g.strokeRoundedRect(4, 4, w, h, 18);
      g.generateTexture('panel_frame', w + 8, h + 8);
      g.destroy();
    }
    scene.add.image(x - 4, y - 4, 'panel_frame').setOrigin(0, 0);

    // Foto (opcional): moldura branca à direita; o texto ocupa o resto da placa.
    this.textRight = x + w - 28; // limite direito do texto
    this.photo = null;
    this.zoom = null;
    const key = slide.foto && fotoKey(slide.foto);
    if (key && scene.textures.exists(key)) {
      const src = scene.textures.get(key).getSourceImage();
      const ph = h - 40;
      const pw = Math.round((ph * src.width) / src.height);
      const px = x + w - 22 - pw / 2;
      const py = y + h / 2;
      const frame = scene.add.rectangle(px, py, pw + 12, ph + 12, 0xffffff).setStrokeStyle(2, 0x06223a).setAngle(1.2);
      this.photo = scene.add.image(px, py, key).setDisplaySize(pw, ph).setAngle(1.2)
        .setInteractive({ useHandCursor: true });
      this.photo.on('pointerdown', () => this.toggleZoom());
      this.photo.frame_ = frame;
      this.textRight = px - pw / 2 - 30;
    }

    const title = scene.add.text(x + 28, y + 16, slide.titulo, {
      fontFamily: FONT, fontSize: '38px', fontStyle: 'bold', color: '#ffffff',
    });
    for (let fs = 38; title.x + title.width > this.textRight && fs > 26; fs -= 2) title.setFontSize(fs - 2);

    // Cada tópico começa invisível e é revelado ao coletar a bolha correspondente.
    // Se o texto quebra em 2 linhas, a fonte encolhe até caber (mínimo 18px).
    // Com `respostas` (quiz), a resposta fica na mesma linha, alinhada à direita.
    const n = slide.topicos.length;
    const lineH = Math.min(52, (h - 86) / Math.max(n, 1));
    const answers = slide.respostas || [];
    const wrapW = this.textRight - (x + 34);
    this.answers = [];
    this.bullets = slide.topicos.map((t, i) => {
      const tx = scene.add.text(x + 34, y + 78 + i * lineH, '• ' + t, {
        fontFamily: FONT, fontSize: '30px', color: '#dff7ff', wordWrap: { width: wrapW },
      }).setAlpha(0);
      const ans = answers[i] && scene.add.text(this.textRight, tx.y, answers[i], {
        fontFamily: FONT, fontSize: '30px', color: '#ffd166', fontStyle: 'bold',
      }).setOrigin(1, 0).setAlpha(0);
      const tooWide = () => ans && tx.x + tx.width + 24 > ans.x - ans.width;
      let fs = 30;
      while ((tx.height > lineH - 6 || tooWide()) && fs > 18) {
        fs -= 2; tx.setFontSize(fs); ans?.setFontSize(fs);
      }
      if (ans) this.answers[i] = ans;
      return tx;
    });
  }

  /** Amplia a foto na tela inteira (clique na foto ou I); clique em qualquer lugar ou I fecha. */
  toggleZoom() {
    if (!this.photo) return false;
    if (this.zoom) {
      this.zoom.forEach((o) => o.destroy());
      this.zoom = null;
      return false;
    }
    const scene = this.scene;
    const key = this.photo.texture.key;
    const src = scene.textures.get(key).getSourceImage();
    const scale = Math.min((H * 0.86) / src.height, (W * 0.9) / src.width);
    const dim = scene.add.rectangle(W / 2, H / 2, W, H, 0x020b14, 0.88).setDepth(70).setInteractive();
    const frame = scene.add.rectangle(W / 2, H / 2 - 10, src.width * scale + 16, src.height * scale + 16, 0xffffff).setDepth(71);
    const img = scene.add.image(W / 2, H / 2 - 10, key).setScale(scale).setDepth(72);
    const tip = scene.add.text(W / 2, H - 18, 'Clique ou I para fechar', {
      fontFamily: FONT, fontSize: '20px', color: '#cfe8f5',
    }).setOrigin(0.5, 1).setDepth(72);
    dim.on('pointerdown', () => this.toggleZoom());
    img.setAlpha(0);
    scene.tweens.add({ targets: img, alpha: 1, duration: 200 });
    this.zoom = [dim, frame, img, tip];
    return true;
  }

  /** Mostra as respostas já reveladas (sem animação). */
  syncAnswers(answered) {
    answered.forEach((v, i) => this.answers[i]?.setAlpha(v ? 1 : 0));
  }

  /** Revela uma resposta com animação. */
  revealAnswer(i) {
    const a = this.answers[i];
    if (!a) return;
    a.setAlpha(0).setScale(0.6);
    this.scene.tweens.add({ targets: a, alpha: 1, scale: 1, duration: 300, ease: 'Back.out' });
  }

  /** Mostra os tópicos já revelados (sem animação), ex.: ao voltar para a fase. */
  sync(revealed) {
    revealed.forEach((v, i) => this.bullets[i].setAlpha(v ? 1 : 0));
  }

  /** Revela um tópico com animação. */
  reveal(i) {
    const tx = this.bullets[i];
    const x0 = tx.x;
    tx.setAlpha(0).setX(x0 + 30);
    this.scene.tweens.add({ targets: tx, alpha: 1, x: x0, duration: 350, ease: 'Back.out' });
  }
}
