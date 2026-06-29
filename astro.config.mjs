import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  site: 'https://l-yoon.github.io',
  // User site (root) — no `base` needed.
  vite: {
    plugins: [tailwindcss()],
  },
});
