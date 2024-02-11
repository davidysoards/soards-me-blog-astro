/** @type {import('tailwindcss').Config} */
export default {
	content: ['./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}'],
	darkMode: 'class',
	theme: {
		extend: {
			fontFamily: {
				cond: '"HelveticaNeue-CondensedBold", "Helvetica Neue", Helvetica, ui-sans-serif, system-ui, sans-serif',
				sans: '"Helvetica Neue", Helvetica, ui-sans-serif, system-ui, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol", "Noto Color Emoji"',
				serif: 'Charter, ui-serif, Georgia, Cambria, serif',
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
