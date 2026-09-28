import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import { extname, resolve } from 'node:path';

const [input, output, ...options] = process.argv.slice(2);
const extension = extname(output ?? '').toLowerCase();
const format = extension === '.jpeg' ? '.jpg' : extension;
const usage = 'Usage: node optimize.mjs <original-image> <new-output.jpg|.png|.webp> [--lossless] [--palette] [--quality 1-100]';

if (!input || !output || !['.jpg', '.png', '.webp'].includes(format)) {
  console.error(usage);
  process.exit(1);
}

let lossless = false;
let palette = false;
let quality;
for (let i = 0; i < options.length; i++) {
  if (options[i] === '--lossless') {
    lossless = true;
  } else if (options[i] === '--palette') {
    palette = true;
  } else if (options[i] === '--quality') {
    quality = Number(options[++i]);
  } else {
    console.error(usage);
    process.exit(1);
  }
}

if (
  (lossless && format !== '.webp') ||
  (palette && format !== '.png') ||
  (quality !== undefined && (!Number.isInteger(quality) || quality < 1 || quality > 100 || lossless || format === '.png'))
) {
  console.error(usage);
  process.exit(1);
}

const source = resolve(input);
const destination = resolve(output);
if (source === destination) {
  console.error('Input and output must be different files.');
  process.exit(1);
}

try {
  if (format === '.jpg') {
    const metadata = await sharp(source).metadata();
    if (metadata.hasAlpha && (await sharp(source).stats()).channels.at(-1).min < 255) {
      throw new Error('JPEG cannot preserve transparency. Choose PNG or WebP.');
    }
  }

  let pipeline = sharp(source)
    .rotate()
    .resize(1536, 896, { fit: 'inside', withoutEnlargement: true });

  if (format === '.jpg') {
    pipeline = pipeline.jpeg({ quality: quality ?? 80, mozjpeg: true });
  } else if (format === '.png') {
    pipeline = pipeline.png(palette ? { palette: true, quality: 100, effort: 10 } : { compressionLevel: 9 });
  } else {
    pipeline = pipeline.webp(
      lossless ? { lossless: true, effort: 6 } : { quality: quality ?? 86, alphaQuality: 100, effort: 6 },
    );
  }

  const { data, info } = await pipeline.toBuffer({ resolveWithObject: true });
  await writeFile(destination, data, { flag: 'wx' });
  console.log(`${destination}: ${info.width} × ${info.height}, ${data.length} bytes (${(data.length / 1024).toFixed(1)} KB)`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
