import { defineConfig, fontProviders } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
	site: 'https://blog.soards.me',
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Anton',
			cssVariable: '--font-anton',
			display: 'block',
			fallbacks: ['sans-serif'],
			options: {
				variants: [{ src: ['./src/assets/fonts/Anton-Regular.woff2'], weight: 400, style: 'normal' }],
			},
		},
		{
			provider: fontProviders.local(),
			name: 'Literata',
			cssVariable: '--font-literata',
			display: 'block',
			fallbacks: ['serif'],
			options: {
				variants: [
					{ src: ['./src/assets/fonts/Literata-400-700.woff2'], weight: '400 700', style: 'normal' },
					{ src: ['./src/assets/fonts/Literata-Italic-400.woff2'], weight: 400, style: 'italic' },
				],
			},
		},
	],
	integrations: [mdx(), sitemap()],
	vite: {
		plugins: [tailwindcss()],
	},
	markdown: {
		shikiConfig: {
			transformers: [{
				pre(node) {
					this.addClassToHast(node, 'dark-theme');
				},
			}],
		},
	},
});
