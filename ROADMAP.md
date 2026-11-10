# Roadmap — deixar o jogo mais elaborado

Regra de ouro (veja `CLAUDE.md`): **cada melhoria precisa manter os atalhos do apresentador e a
fase curta**. Marque `[x]` ao concluir e rode `npm run check`.

Legenda: valor para a plateia ★ (1–3) · risco para a apresentação ▲ (1–3).

## A. Ganhos rápidos

- [x] **PDF de backup automático** (★★★ ▲1) — script `npm run pdf` que gera um PDF com uma página por
      fase (todos os tópicos revelados), reaproveitando as capturas do teste de fumaça. É o plano B
      se o computador/projetor der problema.
      Feito: `npm run pdf` gera `natacao-master-backup.pdf` (capturas próprias do build, não do teste).
- [ ] **Retomar de onde parou** (★★ ▲1) — salvar `state` (fase, tópicos revelados, cronômetro) em
      `localStorage` (dentro de try/catch; pode não existir em `file://`). Recarregar a página não perde o ponto.
- [ ] **Modo ensaio / relatório de tempo** (★★ ▲1) — ao final (ou com `T`), tela com tempo gasto por
      fase vs. previsto (`alvo` em `slides.js`) para treinar os ~22 min.
- [ ] **Alto contraste e tamanho de fonte** (★★ ▲1) — `C` alterna alto contraste; `+`/`-` ajusta a fonte
      da placa. Projetor de sala costuma lavar as cores.

## B. Visual e arte

- [x] **Nadador melhorado** (★★★ ▲1) — feito sem spritesheet: corpo articulado (braçada de crawl 360°,
      pernada, respiração, sombra no fundo), texturas geradas uma vez. Cores em `SWIMMER_COLORS`.
      Futuro: spritesheet desenhada à mão, se houver arte.
- [x] **Obstáculos para desviar** (★★ ▲1) — prancha, pull buoy, patinho, macarrão e boia; batida só
      empurra e deixa lento por 0,5 s; `O` liga/desliga.
- [ ] **Cenário por tema de fase** (★★★ ▲1) — campo `cenario` em cada slide: rio/caverna (origens),
      piscina olímpica (esporte moderno), arquibancada e bandeiras (Masters), **Cataratas do Iguaçu ao fundo
      na fase de Foz**. Implementar como variações de `PoolScenery`, sempre com a placa legível por cima.
- [x] **Imagens nos slides** (★★★ ▲2) — campo `imagem` (foto da equipe, pódio, mapa) exibido como uma
      "tela" na água ao lado do texto; layout `texto+foto`. O build embute as imagens; comprimir antes
      (JPG/WebP, ~1280 px de largura). Precisa de fotos reais do apresentador (autorização para atletas).
      Feito: campo `foto` (fases 1, 10 e 11), moldura à direita da placa, `I`/clique amplia.
- [ ] **Transições melhores** (★★ ▲1) — virada com splash/ondas e câmera, substituindo o fade simples.
- [ ] **Partículas e bolhas com mais vida** (★ ▲1) — respeitando o alvo de 30 fps.

## C. Interação pedagógica (sempre opcional, nunca bloqueante)

- [ ] **Fase de Foz: "escolha a raia"** (★★★ ▲2) — 3–4 raias; a plateia escolhe e cada raia abre um
      subtópico (história, atletas, resultados). Definir: a virada libera com 1 raia aberta (não exigir todas).
- [ ] **Quiz interativo** (★★★ ▲2) — respostas clicáveis (A/B/C) com feedback e placar da turma.
      Atenção ao mapa de teclas: `A`/`D` são de nado e dígitos são de pulo de fase; use clique ou `Q`.
      Feito: respostas na tela (campo `respostas` + `E`/clique na pergunta). Falta: alternativas A/B/C e placar.
- [ ] **Linha do tempo nadável** (★★ ▲2) — uma única fase longa passando por 1970, 1980, 1984, 1986, 1990;
      alternativa para condensar 3 slides se faltar tempo.
- [ ] **Desafio "50 m"** (★ ▲3) — mini-prova cronometrada, só como bônus se sobrar tempo; nunca obrigatória.

## D. Ferramentas do apresentador

- [ ] **Áudio** (★★ ▲2) — sons de bolha, virada e splash; música opcional; **mudo por padrão**, com `Q`
      para ligar/desligar (`S` já é nado). Navegadores só liberam áudio após um clique (a abertura já tem um).
- [ ] **Notas só para o apresentador** (★★★ ▲3) — hoje `H` mostra as notas na tela da plateia. Ideia:
      janela secundária com notas e cronômetro (`window.open` + `postMessage` ou `BroadcastChannel`).
      **Risco**: pode não funcionar em `file://`; testar antes de investir.
- [ ] **Toque/tablet** (★ ▲2) — joystick virtual; hoje já funciona clicando na água.
- [ ] **Controle remoto** (★★ ▲1) — `PageUp`/`PageDown` (clicker de apresentação) já estão mapeados;
      validar com o clicker real.

## E. Qualidade e código

- [ ] **Migrar para TypeScript** (★ ▲1) — opcional; hoje tipos via JSDoc.
- [ ] **Ampliar o teste de fumaça** (★★ ▲1) — checar fps mínimo, tamanho do HTML final, fullscreen, e toda mecânica nova.
- [ ] **CI** (★ ▲1) — GitHub Actions rodando `npm run check`.
- [ ] **Texto do slide a partir de um arquivo simples** (★ ▲1) — ler `slides.md`/`slides.json` no build
      para editar conteúdo sem mexer em JS.

## Decisões em aberto (perguntar ao apresentador)

1. Haverá fotos/vídeos da equipe para usar? → **Sim, há algumas fotos liberadas para uso** (resposta de 09/11/2026).
2. Qual projetor/resolução e que computador? → **O computador do próprio apresentador**; projetor ainda não informado.
3. Vai usar clicker de apresentação, mouse ou só teclado? → **Mouse e teclado** (sem clicker).
4. O quiz é só falado ou a plateia deve ver respostas na tela? → **A plateia deve ver as respostas na tela.**
5. Quais fases podem ser cortadas se o tempo apertar? → **O quiz.**
