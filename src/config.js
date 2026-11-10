// Constantes do jogo. Tudo que é "número mágico" de layout mora aqui.

// Tela lógica 16:9. O Phaser escala (Scale.FIT) para qualquer projetor/monitor.
export const W = 1280;
export const H = 720;

// Piscina (visão lateral)
export const POOL_TOP = 150;   // linha d'água
export const POOL_BOT = 690;   // fundo
export const WALL_X = W - 70;  // parede onde o nadador faz a virada
export const START_X = 130;    // posição inicial do nadador

// Placa onde o slide aparece, "flutuando" na água
export const PANEL = { x: 90, y: POOL_TOP + 22, w: W - 180, h: 300 };

// Zona onde o nadador pode se mover (abaixo da placa, para nunca cobrir o texto)
export const SWIM_BOUNDS = {
  minX: 60,
  maxX: WALL_X - 40,
  minY: PANEL.y + PANEL.h + 42, // folga para a braçada não encostar na placa
  maxY: POOL_BOT - 35,
};

export const SWIM = { speed: 330 }; // px/s

// Cores do nadador (troque pelas cores da equipe: touca e bermuda)
export const SWIMMER_COLORS = {
  cap: 0xe63946,        // touca
  suit: 0x1d3557,       // bermuda (jammer)
  suitStripe: 0xffd166, // faixa da bermuda
  skin: 0xf1c27d,
  skinShade: 0xd9a566,
  goggle: 0x7fe3ff,     // lente do óculos
};

// Obstáculos (prancha, pull buoy, patinho...): só atrapalham um pouco, nunca travam.
// A tecla O liga/desliga durante a apresentação.
export const OBSTACLES = {
  enabledByDefault: true,
  firstPhase: 1,     // índice da 1ª fase com obstáculos (a abertura fica livre)
  maxPerPhase: 3,
  cooldownS: 1.2,    // depois de uma batida, o obstáculo fica "fantasma" por esse tempo
};

export const FONT = 'Trebuchet MS, Verdana, sans-serif';
export const MONO = 'Consolas, monospace';

// Textos e tempos gerais da apresentação
export const CONFIG = {
  tituloGeral: 'NATAÇÃO MASTER',
  subtitulo: 'Da história ao Master de Foz do Iguaçu',
  autor: 'Felipe Theodoro Guimaraes · Associação Acquamaster de Foz do Iguaçu',
  tempoTotalMin: 30,        // duração total reservada (apresentação + perguntas)
  tempoApresentacaoMin: 22, // o relógio fica amarelo a partir daqui e vermelho em tempoTotalMin
};
