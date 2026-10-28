import * as esbuild from 'esbuild';

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
  banner: { js: '/* Serbian Transliteration — bundled plugin */' },
};

if (process.argv.includes('--watch')) {
  const context = await esbuild.context(options);
  await context.watch();
} else {
  await esbuild.build(options);
}
