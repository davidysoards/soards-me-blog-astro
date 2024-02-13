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
				accent: generateScale('red'),
				gray: generateScale('mauve'),
			},
		},
	},
	plugins: [],
};

function generateScale(name) {
	let scale = Array.from({ length: 12 }, (_, i) => {
		let id = i + 1;
		return [id, `var(--${name}-${id})`];
	});
	// to generate alpha and solid values
	// return [
	// [id, `var(--${name}-${id})`],
	// [`a${id}`, `var(--${name}-a${id})`],
	// ];
	// }).flat();

	return Object.fromEntries(scale);
}
