// PDF de backup: uma página por fase, com todos os tópicos revelados.
// É o plano B se o computador ou o projetor der problema na hora (abre em qualquer leitor de PDF).
//
//   npm run pdf        (faz o build antes e gera natacao-master-backup.pdf na raiz do projeto)
//
// Usa o build REAL (dist/index.html) e os próprios atalhos do apresentador (N, R, E),
// então o PDF sempre corresponde ao que será apresentado.

import { chromium } from 'playwright';
import { pathToFileURL } from 'node:url';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';
import { SLIDES } from '../src/data/slides.js';

const dist = resolve('dist/index.html');
if (!existsSync(dist)) {
  console.error('dist/index.html não existe. Rode "npm run build" antes.');
  process.exit(1);
}
const outPdf = resolve('natacao-master-backup.pdf');

const launch = { args: [] };
if (process.platform === 'linux') launch.args.push('--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist');
if (process.env.CHROMIUM_PATH) launch.executablePath = process.env.CHROMIUM_PATH;

const browser = await chromium.launch(launch);
const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });

const POOL = "window.__game.scene.getScene('Pool')";
const waitFase = (i) => page.waitForFunction(
  (n) => { const s = window.__game.scene.getScene('Pool'); return s && s.sceneReady && s.idx === n && !s.transitioning; },
  i, { timeout: 20000 });

await page.goto(pathToFileURL(dist).href);
await page.waitForTimeout(1200);
await page.keyboard.press('Space');

const shots = [];
for (let i = 0; i < SLIDES.length; i++) {
  if (i > 0) await page.keyboard.press('n');
  await waitFase(i);
  await page.keyboard.press('r');
  const respostas = SLIDES[i].respostas?.length ?? 0;
  for (let k = 0; k < respostas; k++) await page.keyboard.press('e');
  await page.waitForFunction(`${POOL}.panel.bullets.every((t) => t.alpha === 1)`, null, { timeout: 5000 })
    .catch(() => {}); // se a animação mudar de nome, segue com a espera fixa abaixo
  await page.waitForTimeout(700);
  shots.push((await page.screenshot({ type: 'png' })).toString('base64'));
  console.log(`  fase ${i + 1}/${SLIDES.length}: ${SLIDES[i].fase}`);
}

const html = `<!doctype html><html><head><meta charset="utf-8"><style>
  @page { size: 1280px 720px; margin: 0; }
  html, body { margin: 0; padding: 0; background: #000; }
  img { display: block; width: 1280px; height: 720px; page-break-after: always; }
  img:last-child { page-break-after: auto; }
</style></head><body>${shots.map((b) => `<img src="data:image/png;base64,${b}">`).join('')}</body></html>`;

const pdfPage = await browser.newPage();
await pdfPage.setContent(html, { waitUntil: 'load' });
await pdfPage.pdf({ path: outPdf, width: '1280px', height: '720px', printBackground: true });
await browser.close();
console.log(`\nPDF gerado: ${outPdf} (${shots.length} páginas)`);
