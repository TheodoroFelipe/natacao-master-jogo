// Estado global da apresentação (vive enquanto a página estiver aberta).
// Fica fora das cenas porque o Phaser recria a cena a cada troca de fase.

import { SLIDES } from './data/slides.js';
import { OBSTACLES } from './config.js';

export const state = {
  idx: 0,
  revealed: SLIDES.map((s) => s.topicos.map(() => false)), // por slide, um booleano por tópico
  startTime: null,   // performance.now() do primeiro movimento
  elapsedMs: 0,
  showNotes: false,
  obstaclesOn: OBSTACLES.enabledByDefault, // tecla O liga/desliga (vale para todas as fases)
  answered: SLIDES.map((s) => (s.respostas || []).map(() => false)), // respostas do quiz já mostradas
  // minutos previstos acumulados ao CHEGAR em cada fase (pace[i] = soma dos alvos até a fase i)
  pace: SLIDES.reduce((acc, s) => {
    acc.push((acc.length ? acc[acc.length - 1] : 0) + (s.alvo || 1));
    return acc;
  }, []),
};

export function fmt(ms) {
  const s = Math.max(0, Math.floor(ms / 1000));
  return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
}

export function startClock() {
  if (!state.startTime) state.startTime = performance.now();
}

export function tickClock() {
  if (state.startTime) state.elapsedMs = performance.now() - state.startTime;
  return state.elapsedMs;
}

export function isReady(idx) {
  return state.revealed[idx].every(Boolean);
}

export function revealedCount(idx) {
  return state.revealed[idx].filter(Boolean).length;
}

export function markRevealed(idx, topicIdx) {
  state.revealed[idx][topicIdx] = true;
}

export function revealAll(idx) {
  state.revealed[idx] = state.revealed[idx].map(() => true);
}

/** Índice da próxima pergunta revelada cuja resposta ainda não apareceu (-1 se nenhuma). */
export function nextAnswerIdx(idx) {
  return state.answered[idx].findIndex((a, i) => !a && state.revealed[idx][i]);
}

/** Minutos previstos ao chegar na fase idx (0 para a primeira). */
export function plannedMinutes(idx) {
  return idx > 0 ? state.pace[idx - 1] : 0;
}
