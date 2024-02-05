/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				cond: '"HelveticaNeue-CondensedBold", "HelveticaNeueBoldCondensed", "HelveticaNeue-Bold-Condensed", "Helvetica Neue Bold Condensed", "HelveticaNeueBold", "HelveticaNeue-Bold", "Helvetica Neue Bold", "HelveticaNeue", "Helvetica Neue", "Helvetica", "Arial Narrow", "Arial", sans-serif',
				sans: '"HelveticaNeue", "Helvetica Neue", "Helvetica", "Arial", sans-serif',
				serif: 'Charter, Georgia, serif',
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
