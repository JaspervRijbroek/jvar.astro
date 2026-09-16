// @ts-check
import { defineConfig } from 'astro/config';
import fetchHeroImages from './integrations/fetch-hero-images.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://jvar.eu',
  integrations: [fetchHeroImages()],
});
