import manifest from './_images.json';

const files = import.meta.glob<string>('./images/**/*.webp', {
	eager: true,
	query: '?url',
	import: 'default',
});
type Source = {
	file: string;
	width: number;
	height: number;
	variants: { file: string; width: number }[];
};
function source(image: Source) {
	const url = (file: string) => files[`./images/${file}`];
	return {
		full: url(image.file),
		width: image.width,
		height: image.height,
		srcset: [...image.variants, { file: image.file, width: image.width }]
			.map((variant) => `${url(variant.file)} ${variant.width}w`)
			.join(', '),
	};
}
export function imageSet(name: keyof typeof manifest) {
	const image: { light: Source; dark?: Source } = manifest[name];
	return { light: source(image.light), dark: image.dark ? source(image.dark) : undefined };
}
