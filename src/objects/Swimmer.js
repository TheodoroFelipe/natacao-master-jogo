import Phaser from 'phaser';
import { SWIM, POOL_BOT, SWIMMER_COLORS as C } from '../config.js';

const OUT = 0x06223a; // contorno escuro (destaca o nadador na água azul)

// Braços giram dentro de um "envelope" achatado na vertical: a mão desenha uma elipse
// (braçada de crawl) sem subir até a placa do slide.
const ARM_FLATTEN = 0.5;
const TILT = 5; // inclinação (graus) ao nadar para cima/baixo

/** Desenha uma textura UMA vez (sobrevive ao scene.restart). */
function tex(scene, key, w, h, draw) {
  if (scene.textures.exists(key)) return;
  const g = scene.make.graphics({ x: 0, y: 0, add: false });
  draw(g);
  g.generateTexture(key, w, h);
  g.destroy();
}

/** Membro arredondado (braço/perna) com contorno, apontando para a direita. */
function limb(g, len, thick, color) {
  g.fillStyle(OUT, 1); g.fillRoundedRect(1, 1, len, thick, thick / 2);
  g.fillStyle(color, 1); g.fillRoundedRect(3, 3, len - 4, thick - 4, (thick - 4) / 2);
}

function buildTextures(scene) {
  // tronco: cabeça fica à direita, quadril à esquerda; barriga para baixo (nado de crawl)
  tex(scene, 'sw_torso', 90, 30, (g) => {
    g.fillStyle(OUT, 1); g.fillRoundedRect(1, 2, 88, 26, 13);
    g.fillStyle(C.skin, 1); g.fillRoundedRect(3.5, 4.5, 83, 21, 10.5);
    g.fillStyle(C.skinShade, 1); g.fillRoundedRect(10, 17, 72, 7, 3.5);
    // bermuda de competição (jammer) com faixa
    g.fillStyle(C.suit, 1); g.fillRoundedRect(3.5, 4.5, 36, 21, { tl: 10.5, bl: 10.5, tr: 2, br: 2 });
    g.fillStyle(C.suitStripe, 1); g.fillRect(31, 4.5, 4, 21);
    g.fillStyle(0xffffff, 0.25); g.fillRoundedRect(12, 7, 60, 4, 2); // brilho nas costas
  });

  // cabeça com touca, óculos e alça
  tex(scene, 'sw_head', 40, 38, (g) => {
    const cx = 19, cy = 20, r = 15;
    g.fillStyle(OUT, 1); g.fillCircle(cx, cy, r + 2);
    g.fillStyle(C.skin, 1); g.fillCircle(cx, cy, r);
    g.fillStyle(C.skin, 1); g.fillCircle(cx + 14, cy + 3, 3.5); // nariz
    g.fillStyle(C.cap, 1);
    g.slice(cx, cy, r + 1, Phaser.Math.DegToRad(150), Phaser.Math.DegToRad(345), false);
    g.fillPath();
    g.fillStyle(0xffffff, 0.45); g.fillEllipse(cx - 3, cy - 10, 12, 4); // brilho da touca
    g.fillStyle(OUT, 1); g.fillRect(cx - r, cy - 3, r + 6, 3); // alça do óculos
    g.fillStyle(OUT, 1); g.fillRoundedRect(cx + 5, cy - 6, 11, 9, 3);
    g.fillStyle(C.goggle, 1); g.fillRoundedRect(cx + 7, cy - 4, 7, 5, 2);
    g.fillStyle(0xffffff, 0.9); g.fillRect(cx + 8, cy - 4, 2, 2);
  });

  tex(scene, 'sw_upper', 34, 13, (g) => limb(g, 32, 11, C.skin));
  tex(scene, 'sw_fore', 31, 12, (g) => limb(g, 29, 10, C.skin));
  tex(scene, 'sw_hand', 14, 12, (g) => {
    g.fillStyle(OUT, 1); g.fillEllipse(7, 6, 13, 11);
    g.fillStyle(C.skin, 1); g.fillEllipse(7, 6, 9, 7);
  });
  tex(scene, 'sw_thigh', 38, 17, (g) => limb(g, 36, 15, C.skin));
  tex(scene, 'sw_shin', 34, 14, (g) => limb(g, 32, 12, C.skin));
  tex(scene, 'sw_foot', 20, 11, (g) => {
    g.fillStyle(OUT, 1); g.fillEllipse(10, 5.5, 19, 10);
    g.fillStyle(C.skin, 1); g.fillEllipse(10, 5.5, 15, 6);
  });
}

/**
 * Braço articulado: ombro → antebraço (cotovelo) → mão. O ângulo do braço gira 360°
 * (crawl) e o cotovelo dobra na recuperação.
 */
function makeArm(scene, far) {
  const tint = far ? 0xb8b8b8 : 0xffffff;
  const arm = scene.add.container(0, 0);
  const upper = scene.add.image(0, 0, 'sw_upper').setOrigin(6 / 34, 0.5).setTint(tint);
  const elbow = scene.add.container(25, 0);
  const fore = scene.add.image(0, 0, 'sw_fore').setOrigin(5 / 31, 0.5).setTint(tint);
  const hand = scene.add.image(23, 0, 'sw_hand').setOrigin(0.2, 0.5).setTint(tint);
  elbow.add([fore, hand]);
  arm.add([upper, elbow]);
  arm.elbow = elbow;
  return arm;
}

/** Perna articulada: quadril → joelho → pé. Aponta para trás (180°) e faz a pernada. */
function makeLeg(scene, far) {
  const tint = far ? 0xb8b8b8 : 0xffffff;
  const leg = scene.add.container(0, 0);
  const thigh = scene.add.image(0, 0, 'sw_thigh').setOrigin(7 / 38, 0.5).setTint(tint);
  const knee = scene.add.container(28, 0);
  const shin = scene.add.image(0, 0, 'sw_shin').setOrigin(6 / 34, 0.5).setTint(tint);
  const foot = scene.add.image(25, 0, 'sw_foot').setOrigin(0.15, 0.5).setAngle(-12).setTint(tint);
  knee.add([shin, foot]);
  leg.add([thigh, knee]);
  leg.knee = knee;
  return leg;
}

/**
 * O nadador (visão lateral, nado crawl). As partes são texturas geradas uma vez e
 * animadas por ângulo — barato para o fps. Mantém a interface swim()/turn()/bump().
 */
export class Swimmer extends Phaser.GameObjects.Container {
  constructor(scene, x, y, facing = 1) {
    super(scene, x, y);
    buildTextures(scene);

    // envelopes achatados (sem rotação) para os braços
    const wrap = (sx, sy) => scene.add.container(sx, sy).setScale(1, ARM_FLATTEN);
    this.armFar = makeArm(scene, true);
    this.armNear = makeArm(scene, false);
    const armFarWrap = wrap(30, -4).add(this.armFar);
    const armNearWrap = wrap(30, -4).add(this.armNear);
    this.legFar = makeLeg(scene, true).setPosition(-36, 1);
    this.legNear = makeLeg(scene, false).setPosition(-36, 3);
    const torso = scene.add.image(0, 0, 'sw_torso');
    this.head = scene.add.image(52, -3, 'sw_head').setOrigin(0.35, 0.55);
    this.add([armFarWrap, this.legFar, torso, this.legNear, this.head, armNearWrap]);

    // sombra no fundo da piscina (objeto separado, acompanha o x)
    this.shadow = scene.add.ellipse(x, POOL_BOT - 28, 150, 14, 0x021526, 0.22).setDepth(1);

    this.facing = facing;
    this.setScale(facing, 1);
    this.strokeT = 0;
    this.slowT = 0;      // tempo restante de "lentidão" após bater num obstáculo
    this.knockT = 0;     // tempo restante do empurrão
    this.kvx = 0; this.kvy = 0;
    this.bumps = 0;      // quantas vezes bateu (usado no teste de fumaça)
    this.setDepth(30);
    scene.add.existing(this);
    this.pose(0, false);
  }

  /** Posiciona braços, pernas e cabeça para a fase t da braçada. */
  pose(t, moving) {
    const a = Phaser.Math.RadToDeg(t) % 360;
    const setArm = (arm, ang) => {
      const deg = ((ang % 360) + 360) % 360;
      arm.setAngle(deg);
      // recuperação (braço por cima, 180°–360°): cotovelo alto, antebraço dobrado
      const bend = deg > 180 ? 75 * Math.sin(Math.PI * (deg - 180) / 180) : 12 * Math.sin(Math.PI * deg / 180);
      arm.elbow.setAngle(bend);
    };
    setArm(this.armNear, a);
    setArm(this.armFar, a + 180);

    // pernada de crawl: 3 batidas por braçada, joelho dobra um pouco atrás da coxa
    const k = t * 3;
    const amp = moving ? 7 : 3;
    this.legNear.setAngle(180 + amp * Math.sin(k));
    this.legNear.knee.setAngle(4 + 14 * Math.max(0, Math.sin(k - 0.9)));
    this.legFar.setAngle(180 + amp * Math.sin(k + Math.PI));
    this.legFar.knee.setAngle(4 + 14 * Math.max(0, Math.sin(k + Math.PI - 0.9)));

    // respiração: a cabeça gira para cima a cada 2 braçadas
    const breath = moving ? Math.pow(Math.max(0, Math.sin(t / 2)), 6) : 0;
    this.head.setAngle(-22 * breath);
  }

  /**
   * Move o nadador e anima a braçada.
   * @param {number} dt segundos desde o último quadro
   * @param {number} vx componente horizontal da direção (já normalizada, de -1 a 1)
   * @param {number} vy componente vertical da direção (já normalizada, de -1 a 1)
   * @param {{minX:number,maxX:number,minY:number,maxY:number}} bounds
   */
  swim(dt, vx, vy, bounds) {
    const slow = this.slowT > 0 ? 0.55 : 1;
    this.slowT = Math.max(0, this.slowT - dt);
    let kx = 0, ky = 0;
    if (this.knockT > 0) {
      const f = this.knockT / 0.3;
      kx = this.kvx * f; ky = this.kvy * f;
      this.knockT = Math.max(0, this.knockT - dt);
    }
    this.x = Phaser.Math.Clamp(this.x + (vx * SWIM.speed * slow + kx) * dt, bounds.minX, bounds.maxX);
    this.y = Phaser.Math.Clamp(this.y + (vy * SWIM.speed * slow + ky) * dt, bounds.minY, bounds.maxY);
    if (vx !== 0) {
      this.facing = vx > 0 ? 1 : -1;
      this.setScale(this.facing, 1);
    }
    this.setAngle(vy * TILT * this.facing);
    this.shadow.setPosition(this.x, this.shadow.y).setScale(0.7 + 0.3 * (this.y - bounds.minY) / (bounds.maxY - bounds.minY), 1);

    const moving = vx !== 0 || vy !== 0;
    this.strokeT += dt * (moving ? 7 : 1.6);
    this.pose(this.strokeT, moving);

    // bolhinhas da pernada (independe da taxa de quadros)
    if (moving && Math.random() < dt * 18) {
      const c = this.scene.add.circle(this.x - this.facing * Phaser.Math.Between(80, 105), this.y + Phaser.Math.Between(-8, 8), Phaser.Math.Between(2, 5), 0xffffff, 0.7).setDepth(18);
      this.scene.tweens.add({ targets: c, y: c.y - 35, alpha: 0, duration: 700, onComplete: () => c.destroy() });
    }
  }

  /**
   * Batida num obstáculo: pequeno empurrão para longe e lentidão curta.
   * Nunca bloqueia: o nadador continua indo para onde estava indo.
   */
  bump(fromX, fromY) {
    this.bumps++;
    this.kvx = Math.sign(this.x - fromX || -this.facing) * 260;
    this.kvy = Math.sign(this.y - fromY || 1) * 90;
    this.knockT = 0.3;
    this.slowT = 0.5;
  }

  /** Hitbox aproximada (tronco + cabeça), em coordenadas do mundo. */
  hitbox() {
    return { cx: this.x + this.facing * 10, cy: this.y, hw: 56, hh: 13 };
  }

  /** Giro de virada na parede. Chama onDone quando termina. */
  turn(onDone) {
    this.scene.tweens.add({ targets: this, angle: 360, duration: 380, ease: 'Cubic.inOut', onComplete: onDone });
  }
}
