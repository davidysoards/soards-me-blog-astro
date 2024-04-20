import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';

// https://astro.build/config
export default defineConfig({
	site: 'https://blog.soards.me',
	integrations: [mdx(), sitemap(), tailwind({ applyBaseStyles: false })],
	vite: {
		plugins: [],
	},
	// markdown: {
	// 	shikiConfig: {
	// 		theme: 'material-theme-palenight',
	// 	},
	// },
});
