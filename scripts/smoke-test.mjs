// Teste de fumaça: abre o build REAL (dist/index.html, via file://) num Chromium
// headless e confere o que não pode falhar na hora da apresentação.
//
//   npm run build && npm run test:smoke
//
// Requer o navegador do Playwright:  npx playwright install chromium
// (ou aponte para um Chrome/Chromium já instalado com CHROMIUM_PATH=/caminho/do/chrome)
// Screenshots de cada fase ficam em .test-output/ para você olhar.

import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { existsSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { PANEL, WALL_X, SWIM_BOUNDS } from '../src/config.js';
import { SLIDES } from '../src/data/slides.js';

const dist = resolve('dist/index.html');
if (!existsSync(dist)) {
  console.error('dist/index.html não existe. Rode "npm run build" antes.');
  process.exit(1);
}
const outDir = resolve('.test-output');
mkdirSync(outDir, { recursive: true });

const launch = { args: [] };
if (process.platform === 'linux') launch.args.push('--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist');
if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;

const failures = [];
const ok = (cond, msg) => { console.log(`${cond ? '  ok ' : ' FALHA'}  ${msg}`); if (!cond) failures.push(msg); };

const browser = await chromium.launch(launch);
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
const errors = [];
page.on('pageerror', (e) => errors.push(String(e)));
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });

const POOL = "window.__game.scene.getScene('Pool')";
const waitFase = (i) => page.waitForFunction(
  (n) => { const s = window.__game.scene.getScene('Pool'); return s && s.sceneReady && s.idx === n && !s.transitioning; },
  i, { timeout: 20000 });
const fase = () => page.evaluate(`${POOL}.idx`);
await page.goto(pathToFileURL(dist).href);
await page.waitForTimeout(1200);
await page.keyboard.press('Space');
await waitFase(0);
const N = await page.evaluate(`${POOL}.bubbles.length`);

console.log('\n[1] Parede só libera com todas as bolhas');
await page.keyboard.down('ArrowRight');
await page.waitForTimeout(4500);
await page.keyboard.up('ArrowRight');
ok((await fase()) === 0, 'sem coletar bolhas, a parede NÃO avança a fase');
ok((await page.evaluate(`${POOL}.swimmer.x`)) < WALL_X - 40, 'nadador fica antes da parede');

console.log('\n[2] Coletar bolhas clicando');
for (let i = 0; i < N; i++) {
  const [x, y] = await page.evaluate(`(() => { const b = ${POOL}.bubbles[${i}]; return [b.x, b.y]; })()`);
  await page.mouse.click(x, y);
  await page.waitForFunction(`${POOL}.bubbles[${i}].visible === false`, null, { timeout: 15000 });
}
ok(await page.evaluate(`${POOL}.bubbles.every(b => !b.visible)`), 'todas as bolhas coletadas');
await page.screenshot({ path: `${outDir}/01-bolhas-coletadas.png` });

console.log('\n[3] Virada avança a fase');
await page.keyboard.down('ArrowRight');
await waitFase(1);
await page.keyboard.up('ArrowRight');
ok((await fase()) === 1, 'tocar a parede com o slide completo leva à fase 2');

console.log('\n[4] Atalhos do apresentador');
await page.keyboard.press('n'); await waitFase(2);
ok((await fase()) === 2, 'N avança');
await page.keyboard.press('b'); await waitFase(1);
ok((await fase()) === 1, 'B volta');
await page.keyboard.press('m'); await page.waitForTimeout(500);
ok(await page.evaluate("window.__game.scene.isActive('Map')"), 'M abre o mapa');
await page.screenshot({ path: `${outDir}/02-mapa.png` });
await page.keyboard.type('10'); await page.keyboard.press('Enter');
await waitFase(9);
ok((await fase()) === 9, 'número + Enter pula para a fase 10 pelo mapa');
await page.keyboard.type('3'); await page.keyboard.press('Enter');
await waitFase(2);
ok((await fase()) === 2, 'número + Enter pula direto (sem mapa)');

console.log('\n[4b] Obstáculos atrapalham, mas nunca travam');
await page.evaluate(`${POOL}.goTo(4)`);
await waitFase(4);
const obs = await page.evaluate(`${POOL}.obstacles.items.map((o) => ({ top: o.y - o.height / 2, bot: o.y + o.height / 2 }))`);
ok(obs.length >= 2, `fase 5 tem ${obs.length} obstáculos`);
ok(obs.every((o) => o.top >= PANEL.y + PANEL.h && o.bot <= SWIM_BOUNDS.maxY + 40), 'obstáculos ficam na zona de nado (abaixo da placa)');
// força uma batida: coloca o nadador colado no primeiro obstáculo
await page.evaluate(`(() => { const s = ${POOL}; const o = s.obstacles.items[0]; s.swimmer.x = o.x - 70; s.swimmer.y = Math.min(Math.max(o.y, ${SWIM_BOUNDS.minY}), ${SWIM_BOUNDS.maxY}); })()`);
await page.waitForFunction(`${POOL}.swimmer.bumps > 0`, null, { timeout: 3000 }).catch(() => {});
ok((await page.evaluate(`${POOL}.swimmer.bumps`)) > 0, 'encostar num obstáculo gera batida (empurrão + "Ops!")');
// completa a fase só clicando nas bolhas e nadando até a parede, com obstáculos ligados
const t0 = Date.now();
const nb = await page.evaluate(`${POOL}.bubbles.length`);
for (let i = 0; i < nb; i++) {
  if (!(await page.evaluate(`${POOL}.bubbles[${i}].visible`))) continue;
  const [x, y] = await page.evaluate(`(() => { const b = ${POOL}.bubbles[${i}]; return [b.x, b.y]; })()`);
  await page.mouse.click(x, y);
  await page.waitForFunction(`${POOL}.bubbles[${i}].visible === false`, null, { timeout: 15000 });
}
await page.keyboard.down('ArrowRight');
await waitFase(5);
await page.keyboard.up('ArrowRight');
const secs = (Date.now() - t0) / 1000;
ok((await fase()) === 5, `fase com obstáculos completada em ${secs.toFixed(1)} s (clicando nas bolhas)`);
await page.keyboard.press('o'); await page.waitForTimeout(200);
ok(await page.evaluate(`${POOL}.obstacles.items.every((o) => !o.visible) && !${POOL}.obstacles.enabled`), 'O desliga os obstáculos');
await page.keyboard.press('o'); await page.waitForTimeout(200);
ok(await page.evaluate(`${POOL}.obstacles.items.every((o) => o.visible)`), 'O liga de novo');
// nadador no topo da zona de nado não cobre a placa em nenhum momento da braçada
await page.evaluate(`${POOL}.swimmer.y = ${SWIM_BOUNDS.minY}`);
await page.keyboard.down('ArrowUp');
let minTop = Infinity;
for (let k = 0; k < 12; k++) {
  minTop = Math.min(minTop, await page.evaluate(`${POOL}.swimmer.getBounds().top`));
  await page.waitForTimeout(90);
}
await page.keyboard.up('ArrowUp');
ok(minTop >= PANEL.y + PANEL.h - 4, `nadador não cobre a placa (topo ${Math.round(minTop)} ≥ ${PANEL.y + PANEL.h - 4})`);
await page.screenshot({ path: `${outDir}/03-obstaculos.png` });

console.log('\n[5] Todas as fases: texto cabe na placa');
let zoomTested = false;
for (let i = 0; i < SLIDES.length; i++) {
  await page.evaluate(`${POOL}.goTo(${i})`);
  await waitFase(i);
  await page.keyboard.press('r');
  await page.waitForTimeout(450);
  const r = await page.evaluate(`(() => {
    const s = ${POOL};
    return { n: s.slide.topicos.length, fase: s.slide.fase,
      textRight: s.panel.textRight, foto: s.slide.foto || null,
      photo: s.panel.photo ? { visible: s.panel.photo.visible, w: s.panel.photo.displayWidth } : null,
      bullets: s.panel.bullets.map((t) => ({ bottom: t.y + t.height, right: t.x + t.width })) };
  })()`);
  const bottom = Math.max(...r.bullets.map((b) => b.bottom));
  const right = Math.max(...r.bullets.map((b) => b.right));
  const fits = bottom <= PANEL.y + PANEL.h - 6 && right <= Math.min(PANEL.x + PANEL.w - 10, r.textRight + 2);
  ok(fits, `fase ${i + 1} "${r.fase}": ${r.n} tópicos cabem na placa (base ${Math.round(bottom)} de ${PANEL.y + PANEL.h})`);
  if (r.foto) {
    ok(!!r.photo && r.photo.visible && r.photo.w > 100, `fase ${i + 1}: foto "${r.foto}" aparece ao lado do texto`);
    if (!zoomTested && r.photo) {
      zoomTested = true;
      await page.keyboard.press('i'); await page.waitForTimeout(300);
      ok(await page.evaluate(`!!${POOL}.panel.zoom`), `fase ${i + 1}: I amplia a foto`);
      await page.screenshot({ path: `${outDir}/04-foto-ampliada.png` });
      await page.keyboard.press('i'); await page.waitForTimeout(200);
      ok(await page.evaluate(`!${POOL}.panel.zoom`), `fase ${i + 1}: I fecha a foto`);
    }
  }
  if (await page.evaluate(`${POOL}.panel.answers.length`)) {
    const n = await page.evaluate(`${POOL}.slide.respostas.length`);
    for (let k = 0; k < n; k++) await page.keyboard.press('e');
    await page.waitForTimeout(400);
    const a = await page.evaluate(`(() => {
      const s = ${POOL};
      return s.panel.answers.map((t, k) => ({ alpha: t.alpha, left: t.x - t.width, right: t.x,
        qRight: s.panel.bullets[k].x + s.panel.bullets[k].width }));
    })()`);
    ok(a.every((x) => x.alpha === 1), `fase ${i + 1}: E mostra todas as respostas do quiz`);
    ok(a.every((x) => x.qRight + 10 <= x.left && x.right <= PANEL.x + PANEL.w - 10), `fase ${i + 1}: respostas não encostam nas perguntas`);
  }
  await page.screenshot({ path: `${outDir}/fase-${String(i + 1).padStart(2, '0')}.png` });
}

console.log('\n[6] Última fase comemora uma vez');
await page.keyboard.down('ArrowRight');
await page.waitForFunction(`${POOL}.celebrated === true`, null, { timeout: 15000 });
await page.keyboard.up('ArrowRight');
ok(true, 'tocar a parede na última fase dispara o final');
await page.screenshot({ path: `${outDir}/99-final.png` });

console.log('\n[7] Erros no console');
ok(errors.length === 0, errors.length ? `erros: ${errors.slice(0, 3).join(' | ')}` : 'nenhum erro de JavaScript');

await browser.close();
console.log(failures.length ? `\n${failures.length} FALHA(S)` : '\nTudo certo.');
process.exit(failures.length ? 1 : 0);
