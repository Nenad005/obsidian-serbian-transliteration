import { execFileSync } from 'node:child_process';
import { readFile, readdir, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

// Only runtime dependencies are distributed in main.js, not build/test tooling.
const directories = execFileSync(process.platform === 'win32' ? 'npm.cmd' : 'npm',
  ['ls', '--omit=dev', '--all', '--parseable'], { encoding: 'utf8' })
  .trim().split(/\r?\n/).slice(1);
const entries = [];
for (const directory of new Set(directories)) {
  const pkg = JSON.parse(await readFile(join(directory, 'package.json'), 'utf8'));
  const files = (await readdir(directory)).filter((file) => /^(?:licen[cs]e|copying|notice)(?:\.|$)/i.test(file)).sort();
  // format 0.2.2's npm archive omits License.md; retain its README attribution
  // together with the full license obtained from the upstream repository.
  const fallback = pkg.name === 'format' && pkg.version === '0.2.2'
    ? await readFile('third-party/format-LICENSE.txt', 'utf8') : null;
  if (!files.length && !fallback) throw new Error(`Missing license text for ${pkg.name}`);
  const texts = files.length
    ? await Promise.all(files.map(async (file) => `${file}\n${await readFile(join(directory, file), 'utf8')}`))
    : [fallback];
  entries.push({ name: `${pkg.name}@${pkg.version}`, text: texts.join('\n') });
}
entries.sort((a, b) => a.name < b.name ? -1 : a.name > b.name ? 1 : 0);
const output = 'Third-party software bundled with Serbian Transliteration\n'
  + 'The following notices apply to the corresponding dependencies.\n\n'
  + entries.map(({ name, text }) => `${name}\n${'='.repeat(name.length)}\n${text.trim()}\n`).join('\n');
await writeFile('THIRD_PARTY_NOTICES.txt', output);
console.log(`Collected license notices for ${entries.length} runtime dependencies.`);
