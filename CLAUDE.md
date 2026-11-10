# Natação Master — apresentação jogável

Jogo 2D de piscina (visão lateral) que funciona como uma apresentação de trabalho:
**cada fase é um slide**. O nadador pega bolhas numeradas (cada bolha revela um
tópico do slide) e, ao tocar a parede com o slide completo, faz a virada e avança.

Stack: **Phaser 3.90** (não migrar para Phaser 4 sem pedir) + **Vite**, JavaScript com
módulos ES (tipos via JSDoc). O build final é **um único HTML** (`dist/index.html`).

## Contexto da apresentação (decide as prioridades)

- Tema: natação master — história e o Master de Foz do Iguaçu (equipe AcquaMaster Foz).
- Tempo: **30 min no total**, ~22 min de fala + perguntas. Hoje são **14 fases** (máximo planejado: 14).
- Público: estudantes de Educação Física (faculdade) e alunos de ensino médio. Conteúdo
  técnico só na fase de saúde; o resto leve, visual e curto.
- O apresentador é atleta Master da AcquaMaster Foz e pode usar experiência própria no conteúdo.
- Se o nome do apresentador aparecer em algum texto, escrever o sobrenome **Guimaraes sem acento**.

## Regras inegociáveis (segurança do apresentador)

O jogo existe para ajudar a apresentação, nunca para atrapalhá-la. Toda mudança deve respeitar:

1. **Os atalhos do apresentador funcionam sempre**, em qualquer fase, mesmo com o slide incompleto:
   `N`/`PageDown` avança, `B`/`PageUp` volta, `M` mapa, `R` revela tudo, número + `Enter` pula de fase.
2. **Nada trava o apresentador.** Sem game over, inimigos, vidas, tempo-limite que force repetir,
   puzzle obrigatório sem saída. Toda mecânica nova precisa ter uma saída via atalho.
3. **Fase curta**: de 3 a 8 segundos de nado até a parede. Interações extras são opcionais.
4. **Texto legível no projetor**: fonte efetiva ≥ 18 px (ideal 28–30 px), alto contraste, e o
   nadador/bolhas nunca cobrem a placa do slide (zona `PANEL` em `src/config.js`).
5. **Offline e arquivo único**: sem CDN, sem fontes web, sem `fetch`/XHR de rede em runtime.
   O build tem que abrir por duplo clique (`file://`).
6. **Som mudo por padrão** (hoje não há áudio).
7. **Navegação livre** para a hora das perguntas (voltar/pular para qualquer fase).
8. **Desempenho**: alvo ≥ 30 fps em notebook fraco com projetor. Desenhe cenário estático uma vez
   com `generateTexture` (padrão em `PoolScenery` e `Panel`); evite `Graphics` redesenhado a cada quadro.
9. Movimento usa **dt em tempo real** (`performance.now()`), nunca "pixels por quadro".

### Mapa de teclas (não colidir)

| Tecla | Função |
|---|---|
| Setas / `W A S D` | nadar |
| `N` / `PageDown`, `B` / `PageUp` | próxima / fase anterior |
| `M` | mapa de fases |
| `R` | revelar todos os tópicos da fase |
| `H` | notas do apresentador (visíveis para a plateia!) |
| `F` / `Esc` | tela cheia |
| `0–9` + `Enter` | pular para a fase N |
| `E` | quiz: mostrar a próxima resposta (só em fases com `respostas`) |
| `O` | liga/desliga os obstáculos (vale para todas as fases) |
| `I` | amplia/fecha a foto do slide (só em fases com `foto`); clicar na foto também amplia |
| Clique | nadar até o ponto / coletar bolha |

`W A S D` e dígitos já estão ocupados: ao criar teclas novas, use outras (ex.: `S`, `E`, `O` e `I` não, `Q`/`T`/`C` sim).

## Comandos

```bash
npm install                 # uma vez
npx playwright install chromium   # uma vez (para o teste de fumaça)
npm run dev                 # servidor de desenvolvimento em http://localhost:5173
npm run build               # gera dist/index.html (arquivo único, é o que se apresenta)
npm run preview             # serve o build
npm run test:smoke          # teste de fumaça no build (precisa de npm run build antes)
npm run check               # build + teste de fumaça
npm run pdf                 # build + PDF de backup (natacao-master-backup.pdf, 1 página por fase)
```

Se o Chromium do Playwright não existir, use `CHROMIUM_PATH=/caminho/do/chrome npm run test:smoke`.

## Estrutura

```
index.html               entrada (só um <div id="game"> e o script)
vite.config.js           build em arquivo único (vite-plugin-singlefile)
src/
  main.js                cria o Phaser.Game (1280x720, Scale.FIT)
  config.js              constantes de layout (W, H, PANEL, SWIM_BOUNDS...) e CONFIG da apresentação
  state.js               estado que sobrevive à troca de fase (tópicos revelados, cronômetro, ritmo)
  data/slides.js         ← CONTEÚDO dos 14 slides (título, tópicos, nota, minutos previstos, foto)
  data/fotos.js          carrega src/assets/fotos/* (campo `foto` = nome do arquivo sem extensão)
  assets/fotos/          fotos já recortadas e comprimidas (JPG, 640 px de altura)
  scenes/
    TitleScene.js        abertura
    PoolScene.js         UMA fase = um slide; é reiniciada (scene.restart) a cada troca
    MapScene.js          mapa de fases, sobreposto à PoolScene (a PoolScene fica pausada)
  objects/
    PoolScenery.js       água, raia, boias, parede, ondas (estático "assado" em textura)
    Swimmer.js           nadador articulado (crawl, texturas geradas uma vez; cores em SWIMMER_COLORS)
    obstacles.js         obstáculos (prancha, pull buoy, patinho...): empurrão + lentidão, nunca bloqueiam
    bubbles.js           bolhas coletáveis + efeito de estouro
  ui/
    Panel.js             placa com título e tópicos (encolhe a fonte se quebrar linha)
    Hud.js               fase, barra de progresso, cronômetro, ritmo, dica, notas
  systems/
    presenterKeys.js     atalhos do apresentador (ver regras acima)
scripts/smoke-test.mjs   teste de fumaça em Chromium headless
scripts/backup-pdf.mjs   PDF de backup (plano B), todas as fases com tópicos revelados
ROADMAP.md               backlog priorizado de melhorias
```

## Como o jogo funciona

- `Title` → `Pool` (reiniciada a cada fase) ↔ `Map` (overlay). Dados da fase chegam por
  `scene.restart({ idx, dir })`; `dir = -1` quando se volta (nadador nasce do lado da parede).
- **Tudo que precisa sobreviver à troca de fase fica em `src/state.js`**, não na cena.
  `scene.restart` destrói objetos, tweens, timers e listeners de teclado: registre-os em `create()`.
- Obstáculos: a partir da fase 2, entre as bolhas, sobem e descem na zona de nado. Batida = empurrão de
  0,3 s + lentidão de 0,5 s e o obstáculo fica sem colisão por 1,2 s (nunca prende o nadador). `O` desliga.
- A parede só libera a virada quando `isReady(idx)` (todas as bolhas coletadas ou `R`).
- `PoolScene` expõe `sceneReady`, `idx`, `transitioning`, `bubbles`, `panel`, `swimmer`, e
  `window.__game` existe para o teste de fumaça e para depurar no console.

## Convenções

- Comentários e textos da interface em **português do Brasil**. Identificadores de código em
  inglês, exceto os campos dos dados dos slides (`fase`, `titulo`, `topicos`, `nota`, `alvo`).
- Evite emojis nos textos do jogo (podem virar quadradinhos em outro computador). `→` e `▶`
  funcionam nas fontes comuns, mas confira no computador da apresentação.
- Imagens/áudios entram por `import` ou `public/` e o build os embute no HTML
  (`assetsInlineLimit`). Mantenha o HTML final abaixo de ~30 MB.
- Não adicione dependências sem necessidade: cada uma entra no arquivo final.

## Como verificar uma mudança

1. `npm run check` (build + teste de fumaça). Ele cobre: parede bloqueada sem bolhas, coleta,
   virada, `N`/`B`/`M`/número+`Enter`, **texto cabendo na placa nas 14 fases** e ausência de erros no console.
2. Olhe as capturas em `.test-output/*.png` (uma por fase). Para mudança visual, abra pelo menos duas.
3. Mecânica nova → estenda `scripts/smoke-test.mjs` com a checagem correspondente.
4. Antes de apresentar de verdade: abrir `dist/index.html` por duplo clique **no computador e
   projetor reais**, apertar `F` e passar as 14 fases com `N`.

## Conteúdo

- Fases com texto entre `[colchetes]` são **placeholders**. Não invente dados sobre a equipe,
  resultados ou história de Foz do Iguaçu; peça ao apresentador.
- **Conferido em fonte** (ok citar): 1º campeonato Masters em 2–3/05/1970, Amarillo (Texas),
  ~52 nadadores, idade mínima 25, proposta de Ransom Arthur em 1968 — USMS
  (https://www.usms.org/fitness-and-training/articles-and-videos/articles/usmss-50th-anniversary-a-movement-is-born-in-amarillo).
  1º Mundial Masters 1986 Tóquio, 1988 Brisbane, 1990 Rio — World Aquatics Masters Championships
  (https://en.wikipedia.org/wiki/World_Aquatics_Masters_Championships).
  Brasil: 1º torneio 21/06/1980 (Flamengo, FARJ), ABMN fundada em 08/12/1984, assembleia em 04/05/1985,
  1º Sul-Americano em 1992 (Belo Horizonte) — história da ABMN
  (https://www.abmn.org.br/arquivos/historia_da_abmn_fabiano_pries_devide.pdf).
  Saúde (fase 12): queda de ~0,6%/ano até 70–75 anos em campeões Master, natação de baixo impacto e
  sem carga de peso — Rubin et al., 2013, Open Access J Sports Med, doi:10.2147/oajsm.s37718.
  Nadadores com risco de morte 53% menor que sedentários (40.547 homens, observacional) — Chase, Sui
  e Blair, 2008, Int J Aquatic Res Educ, doi:10.25035/ijare.02.03.03.
  Maria Lenk: 1ª sul-americana nos Jogos (1932), recorde mundial 200 m peito (1939), recordes
  mundiais Master na faixa 90–94 — Olympedia (https://www.olympedia.org/athletes/45590) e Wikipedia.
  Tetsuo Okamoto: bronze nos 1500 m livre em Helsinque 1952, 1ª medalha olímpica da natação brasileira.
  Atenas 1896: 4 provas em 11/04/1896, Baía de Zea (Pireu), água a 12–14 °C — Olympedia
  (https://www.olympedia.org/editions/1/sports/SWM). Borboleta separada do peito em 1952 ou 1953
  (fontes divergem), estreia olímpica em 1956. Ditado grego "não sabe ler nem nadar" — Platão, Leis 689d.
  Vegécio (De Re Militari): todo recruta romano deve aprender a nadar. USMS: 46 ou ~52 nadadores em
  1970 (páginas da USMS divergem; use "cerca de 50"), 325 no Nacional de 1972 (San Mateo).
- **Não citar número**: idade da Caverna dos Nadadores (Gilf Kebir, Neolítico; estimativas de 6 a 9 mil
  anos variam muito entre fontes).

## Backlog

Veja `ROADMAP.md` (priorizado, com riscos para a apresentação).
