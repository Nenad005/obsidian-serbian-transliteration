import { copyFile, mkdir } from 'node:fs/promises';

const directory = new URL('../release/serbian-transliteration/', import.meta.url);
await mkdir(directory, { recursive: true });
for (const file of ['main.js', 'manifest.json', 'README.md', 'LICENSE', 'THIRD_PARTY_NOTICES.txt']) {
  await copyFile(new URL(`../${file}`, import.meta.url), new URL(file, directory));
}
console.log('Installable plugin: release/serbian-transliteration/');
