// @ts-check
import { defineConfig } from 'astro/config';

// Static multi-page output (default). All page text is rendered into the
// served HTML so AI crawlers read everything without running JavaScript.
export default defineConfig({
  site: 'https://faamirali.com',
  build: {
    format: 'directory',
  },
  // The dev toolbar popup is a dev-only Astro UI affordance, not something
  // that ships to production — disabled per owner preference.
  devToolbar: {
    enabled: false,
  },
  // Honor an externally-assigned PORT (e.g. from dev tooling) instead of
  // Astro's own auto-increment-from-4321 behavior.
  server: {
    port: process.env.PORT ? Number(process.env.PORT) : 4321,
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
