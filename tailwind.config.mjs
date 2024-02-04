/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	theme: {
		extend: {
			fontFamily: {
				cond: '"HelveticaNeue-CondensedBold", "HelveticaNeueBoldCondensed", "HelveticaNeue-Bold-Condensed", "Helvetica Neue Bold Condensed", "HelveticaNeueBold", "HelveticaNeue-Bold", "Helvetica Neue Bold", "HelveticaNeue", "Helvetica Neue", "Helvetica", "Arial Narrow", "Arial", sans-serif',
				sans: '"HelveticaNeue", "Helvetica Neue", "Helvetica", "Arial", sans-serif',
				serif: 'Charter, Georgia, serif',
			},
		},
	},
	plugins: [],
};
