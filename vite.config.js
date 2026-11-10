import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

// O build final é UM ÚNICO arquivo HTML (dist/index.html) com JS, CSS e imagens
// embutidos. Ele abre com duplo clique, sem internet e sem servidor, que é o
// que queremos no computador da apresentação.
export default defineConfig({
  base: './',
  plugins: [viteSingleFile()],
  build: {
    target: 'es2020',
    outDir: 'dist',
    assetsInlineLimit: 100_000_000, // embute imagens e áudios de public/ e src/ no HTML
    chunkSizeWarningLimit: 5000,    // o Phaser sozinho passa de 1 MB
  },
  server: { port: 5173 },
});
