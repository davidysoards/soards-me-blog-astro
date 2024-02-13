/** @type {import('tailwindcss').Config} */
import defaultTheme from 'tailwindcss/defaultTheme';
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				cond: ['HelveticaNeue-CondensedBold', 'Helvetica Neue', ...defaultTheme.fontFamily.sans],
				sans: ['Helvetica Neue', ...defaultTheme.fontFamily.sans],
				serif: ['Charter', ...defaultTheme.fontFamily.serif],
			},
			colors: {
				accent: getColorScale('red'),
				gray: getColorScale('mauve'),
			},
		},
	},
	plugins: [],
};

function getColorScale(name) {
	let scale = {};
	for (let i = 1; i <= 12; i++) {
		scale[i] = `var(--${name}-${i})`;
		// to generate alpha values
		// scale[`a${i}`] = `var(--${name}-a${i})`;
	}

	return scale;
}
