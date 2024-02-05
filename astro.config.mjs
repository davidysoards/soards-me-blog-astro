import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import Icons from 'unplugin-icons/vite';

import alpinejs from "@astrojs/alpinejs";

// https://astro.build/config
export default defineConfig({
  site: 'https://example.com',
  integrations: [mdx(), sitemap(), tailwind({
    applyBaseStyles: false
  }), alpinejs()],
  vite: {
    plugins: [Icons({
      compiler: 'astro'
    })]
  }
});