import * as esbuild from 'esbuild';
import { readFile } from 'node:fs/promises';

const notices = await readFile(new URL('./THIRD_PARTY_NOTICES.txt', import.meta.url), 'utf8');
const license = await readFile(new URL('./LICENSE', import.meta.url), 'utf8');

const options = {
  entryPoints: ['src/main.ts'],
  bundle: true,
  external: ['obsidian'],
  format: 'cjs',
  platform: 'browser',
  target: 'es2020',
  outfile: 'main.js',
  logLevel: 'info',
  sourcemap: false,
  metafile: true,
  banner: { js: '/* Serbian Transliteration — bundled plugin */' },
  // Obsidian installs main.js, not supplementary license assets. Keep the full
  // dependency notices in the bundle, too, so every installation receives them.
  footer: { js: `/*\n${license}\n${notices.replaceAll('*/', '* /')}\n*/` },
};

if (process.argv.includes('--watch')) {
  const context = await esbuild.context(options);
  await context.watch();
} else {
  const result = await esbuild.build(options);
  const imports = Object.values(result.metafile.outputs).flatMap((output) => output.imports);
  if (imports.some((item) => item.external && item.path !== 'obsidian')) {
    throw new Error('The mobile-compatible bundle must not import external runtime modules other than obsidian.');
  }
}
