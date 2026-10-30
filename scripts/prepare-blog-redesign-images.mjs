import fs from 'node:fs/promises';
import { createHash } from 'node:crypto';
import sharp from 'sharp';

// Full-size sources are curated separately; never recompress them here.
// Photos use quality-90 previews; screenshots retain lossless text and edges.
const directory = new URL('../src/content/posts/blog-redesign/images/', import.meta.url);
const photos = new Set([
	'rolling-stone-u2',
	'from-russia-with-blood',
	'rolling-stone-geeks',
	'rage-against-the-machine',
	'rolling-stone-correspondence',
	'rolling-stone-reviews',
]);
const names = [
	...photos,
	'direction-a-quiet',
	'direction-b-editorial',
	'direction-c-loud',
	'reduced-masthead-mockup',
	'restored-homepage',
	'old-homepage',
	'redesigned-homepage-full',
];
const previews = new URL('previews/', directory);
const manifestFile = new URL('../_images.json', directory);
const cacheFile = new URL('.cache.json', previews);
const files = new Set(await fs.readdir(directory));
// Hash inputs rather than timestamps so restored checkouts and changed encoder
// settings invalidate the cache, while unchanged starts avoid any encoding.
const hash = createHash('sha256')
	.update(await fs.readFile(new URL(import.meta.url)))
	.update(JSON.stringify(sharp.versions));
const sources = [];
for (const name of names) {
	for (const theme of ['light', 'dark']) {
		const file = `${name}${theme === 'dark' ? '-dark' : ''}.webp`;
		if (theme === 'dark' && !files.has(file)) continue;
		const buffer = await fs.readFile(new URL(file, directory));
		hash.update(file).update(buffer);
		sources.push({ name, theme, file, buffer });
	}
}
const fingerprint = hash.digest('hex');
try {
	const cache = JSON.parse(await fs.readFile(cacheFile, 'utf8'));
	if (
		cache?.fingerprint === fingerprint &&
		Array.isArray(cache.outputs) &&
		cache.outputs.every((file) => typeof file === 'string')
	) {
		await fs.access(manifestFile);
		await Promise.all(cache.outputs.map((file) => fs.access(new URL(file, directory))));
		console.log('Gallery previews are up to date; skipped image generation.');
		process.exit(0);
	}
} catch (error) {
	if (error.code !== 'ENOENT' && !(error instanceof SyntaxError)) throw error;
}
// This directory is generated; remove obsolete variants before rebuilding.
await fs.rm(previews, { recursive: true, force: true });
await fs.mkdir(previews, { recursive: true });
const manifest = {};
const outputs = [];
for (const { name, theme, file, buffer } of sources) {
	manifest[name] ??= {};
	const { width, height } = await sharp(buffer).metadata();
	const variants = [];
	// Reference photos render at up to 240 CSS pixels; 480 covers 2× displays.
	const widths = photos.has(name) ? [240, 480] : [240, 480, 800];
	for (const size of widths.filter((size) => size < width)) {
		const output = `previews/${file.replace('.webp', '')}-${size}.webp`;
		const preview = await sharp(buffer)
			.resize({ width: size })
			.webp(
				photos.has(name)
					? { quality: 90, effort: 6, smartSubsample: true }
					: { lossless: true, effort: 6 },
			)
			.toBuffer();
		if (preview.length >= buffer.length) continue;
		await fs.writeFile(new URL(output, directory), preview);
		outputs.push(output);
		variants.push({ file: output, width: size });
	}
	manifest[name][theme] = { file, width, height, variants };
}
await fs.writeFile(manifestFile, `${JSON.stringify(manifest, null, 2)}\n`);
await fs.writeFile(cacheFile, `${JSON.stringify({ fingerprint, outputs }, null, 2)}\n`);
console.log(`Prepared responsive previews for ${names.length} gallery images.`);
