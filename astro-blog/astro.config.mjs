import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://havenstudy.app',
  base: '/blog',
  outDir: '../dist/blog',
  trailingSlash: 'always',
});
