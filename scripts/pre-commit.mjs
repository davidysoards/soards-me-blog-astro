import { execFileSync } from 'node:child_process';
import { readFile, writeFile } from 'node:fs/promises';
import * as prettier from 'prettier';

const gitFiles = (...args) =>
	execFileSync('git', ['diff', '--name-only', '-z', ...args], { encoding: 'utf8' })
		.split('\0')
		.filter(Boolean);

const staged = gitFiles('--cached', '--diff-filter=ACMR');
const unstaged = new Set(gitFiles());
const partial = staged.filter((file) => unstaged.has(file));

if (partial.length) {
	console.error(
		`Prettier: these staged files also have unstaged edits:\n${partial.join('\n')}\nStage or stash those edits, then commit again.`,
	);
	process.exit(1);
}

for (const file of staged) {
	const config = (await prettier.resolveConfig(file)) ?? {};
	const info = await prettier.getFileInfo(file, {
		ignorePath: '.prettierignore',
		plugins: config.plugins,
	});
	if (info.ignored || !info.inferredParser) continue;

	const source = await readFile(file, 'utf8');
	const formatted = await prettier.format(source, { ...config, filepath: file });
	if (formatted === source) continue;

	await writeFile(file, formatted);
	execFileSync('git', ['add', '--', file]);
	console.log(`Prettier: formatted ${file}`);
}
