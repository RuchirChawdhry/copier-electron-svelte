import { defineConfig } from 'electron-vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'node:path';

export default defineConfig({
  main: {},
  preload: {},
  renderer: {
    resolve: { alias: { $lib: resolve('src/renderer/src/lib') } },
    plugins: [svelte(), tailwindcss()],
  },
});
