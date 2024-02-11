import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwind from '@astrojs/tailwind';
import Icons from 'unplugin-icons/vite';

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	integrations: [mdx(), sitemap(), tailwind({ applyBaseStyles: false })],
	vite: {
		plugins: [
			Icons({
				compiler: 'astro',
			}),
		],
	},
	// markdown: {
	// 	shikiConfig: {
	// 		theme: 'material-theme-palenight',
	// 	},
	// },
});
