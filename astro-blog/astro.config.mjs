import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://havenstudy.app',
  base: '/blog',
  outDir: '../dist/blog',
  integrations: [sitemap()],
  trailingSlash: 'always',
});
