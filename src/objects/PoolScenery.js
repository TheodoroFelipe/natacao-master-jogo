import Phaser from 'phaser';
import { W, H, POOL_TOP, POOL_BOT, WALL_X, FONT } from '../config.js';

/**
 * Cenário da fase: água, raia, boias, parede e ondas.
 * As partes estáticas são "assadas" numa textura UMA vez (ótimo para fps em
 * projetor/notebook fraco); só as ondas e a luz são animadas.
 */
export class PoolScenery {
  constructor(scene) {
    this.scene = scene;
    this.waveT = 0;
    this.glowTween = null;
    this.buildBackground();
    this.buildWall();
  }

  buildBackground() {
    const scene = this.scene;
    if (!scene.textures.exists('poolbg')) {
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      // faixa acima da água (arquibancada / piso)
      g.fillStyle(0x0b2a43, 1); g.fillRect(0, 0, W, POOL_TOP);
      g.fillStyle(0x0e3a5c, 1); g.fillRect(0, POOL_TOP - 18, W, 18);
      // água em faixas (gradiente simples)
      const steps = 18;
      const stepH = (POOL_BOT - POOL_TOP) / steps;
      for (let i = 0; i < steps; i++) {
        const t = i / (steps - 1);
        const r = Math.round(20 + (4 - 20) * t);
        const gg = Math.round(150 + (60 - 150) * t);
        const b = Math.round(215 + (120 - 215) * t);
        g.fillStyle(Phaser.Display.Color.GetColor(r, gg, b), 1);
        g.fillRect(0, POOL_TOP + i * stepH, W, stepH + 1);
      }
      // marcação no fundo da piscina
      g.lineStyle(6, 0x0a2b4a, 0.55);
      g.lineBetween(0, POOL_BOT - 24, W, POOL_BOT - 24);
      for (let x = 60; x < W; x += 160) { g.fillStyle(0x0a2b4a, 0.5); g.fillRect(x, POOL_BOT - 32, 70, 8); }
      // boias da raia
      for (let x = 10; x < W; x += 40) {
        g.fillStyle(((x / 40) % 2) ? 0xff5a4d : 0xffffff, 1);
        g.fillRoundedRect(x, POOL_TOP - 6, 34, 12, 5);
      }
      // bloco de largada
      g.fillStyle(0x6c7a89, 1); g.fillRect(14, POOL_TOP - 52, 78, 46);
      g.fillStyle(0xcfd8dc, 1); g.fillRect(14, POOL_TOP - 58, 78, 8);
      g.generateTexture('poolbg', W, H);
      g.destroy();
    }
    scene.add.image(0, 0, 'poolbg').setOrigin(0, 0).setDepth(-10);

    // raios de luz (decoração animada)
    for (let i = 0; i < 5; i++) {
      const r = scene.add.rectangle(160 + i * 260, POOL_TOP + 130, 70, 380, 0xffffff, 0.04).setAngle(14).setDepth(-5);
      scene.tweens.add({ targets: r, alpha: 0.09, duration: 2200 + i * 300, yoyo: true, repeat: -1 });
    }
    // ondas na linha d'água
    this.waves = scene.add.graphics().setDepth(-4);
  }

  buildWall() {
    const scene = this.scene;
    const wallH = POOL_BOT - POOL_TOP + 10;
    if (!scene.textures.exists('wallbg')) {
      const g = scene.make.graphics({ x: 0, y: 0, add: false });
      g.fillStyle(0xe8f1f5, 1); g.fillRect(0, 0, W - WALL_X, wallH);
      g.lineStyle(4, 0x9fb3c1, 1);
      for (let y = 40; y < wallH; y += 90) g.lineBetween(0, y, W - WALL_X, y);
      g.generateTexture('wallbg', W - WALL_X, wallH);
      g.destroy();
    }
    scene.add.image(WALL_X, POOL_TOP - 10, 'wallbg').setOrigin(0, 0).setDepth(5);
    this.wallGlow = scene.add.rectangle(WALL_X - 4, (POOL_TOP + POOL_BOT) / 2, 10, POOL_BOT - POOL_TOP, 0xffd166, 0).setDepth(6);
    scene.add.text(WALL_X + (W - WALL_X) / 2, (POOL_TOP + POOL_BOT) / 2 + 40, 'PAREDE', {
      fontFamily: FONT, fontSize: '22px', color: '#5b6d7a', fontStyle: 'bold',
    }).setOrigin(0.5).setAngle(-90).setDepth(7);
  }

  /** A parede pisca quando o slide está completo e a virada está liberada. */
  setWallReady(ready) {
    if (ready && !this.glowTween) {
      this.glowTween = this.scene.tweens.add({ targets: this.wallGlow, alpha: { from: 0.35, to: 0.95 }, duration: 520, yoyo: true, repeat: -1 });
    } else if (!ready && this.glowTween) {
      this.glowTween.stop();
      this.glowTween = null;
      this.wallGlow.setAlpha(0);
    }
  }

  update(dt) {
    this.waveT += dt * 2;
    const g = this.waves;
    g.clear();
    g.lineStyle(4, 0xffffff, 0.55);
    g.beginPath();
    for (let x = 0; x <= W; x += 12) {
      const y = POOL_TOP + 3 + Math.sin(x * 0.03 + this.waveT) * 3;
      if (x === 0) g.moveTo(x, y); else g.lineTo(x, y);
    }
    g.strokePath();
  }
}
