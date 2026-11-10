// Fotos dos slides. Coloque o arquivo em src/assets/fotos/ e use o nome (sem extensão)
// no campo `foto` do slide em slides.js. O build embute as fotos no HTML final.
// Prepare as fotos antes (JPG, ~640 px de altura) para o arquivo final ficar leve.

const files = import.meta.glob('../assets/fotos/*.{jpg,jpeg,png,webp}', { eager: true, import: 'default' });

/** nome do arquivo sem extensão → URL (data URI no build) */
export const FOTOS = Object.fromEntries(
  Object.entries(files).map(([path, url]) => [path.split('/').pop().replace(/\.[^.]+$/, ''), url]),
);

/** Chave da textura no Phaser para a foto de um slide. */
export const fotoKey = (nome) => `foto_${nome}`;
