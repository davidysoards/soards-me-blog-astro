import sharp from 'sharp';
import { writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const [input, output] = process.argv.slice(2);
if (!input || !output || !/\.jpe?g$/i.test(output)) {
  console.error('Usage: node optimize.mjs <original-image> <new-output.jpg>');
  process.exit(1);
}

const source = resolve(input);
const destination = resolve(output);
if (source === destination) {
  console.error('Input and output must be different files.');
  process.exit(1);
}

try {
  const { data, info } = await sharp(source)
    .rotate()
    .resize(1536, 896, { fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toBuffer({ resolveWithObject: true });
  await writeFile(destination, data, { flag: 'wx' });
  console.log(`${destination}: ${info.width} × ${info.height}, ${data.length} bytes (${(data.length / 1024).toFixed(1)} KB)`);
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
