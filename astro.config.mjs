// @ts-check
import { defineConfig } from 'astro/config';

// Static multi-page output (default). All page text is rendered into the
// served HTML so AI crawlers read everything without running JavaScript.
export default defineConfig({
  site: 'https://faamirali.com',
  build: {
    format: 'directory',
  },
  vite: {
    server: {
      // The dev server may be launched via the folder's 8.3 short path
      // (e.g. tooling that can't handle the space in "faamirali website").
      // Explicitly allow the real project root so Vite's fs-serving check
      // doesn't reject /@vite/client and other dev-only assets.
      fs: { allow: ['C:/Claude/Code/faamirali website'] },
    },
  },
});
