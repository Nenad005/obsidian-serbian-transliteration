import assert from 'node:assert/strict';
import { readFile, access } from 'node:fs/promises';

const json = async (path) => JSON.parse(await readFile(path, 'utf8'));
const manifest = await json('manifest.json');
const pkg = await json('package.json');
const versions = await json('versions.json');
const semver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
assert.match(manifest.id, /^[a-z]+(?:-[a-z]+)*$/);
assert(!manifest.id.includes('obsidian') && !manifest.id.endsWith('plugin'), 'Invalid plugin ID');
assert.match(manifest.name, /^[A-Za-z0-9 ()+-]+$/);
assert(!/obsidian|plugin/i.test(manifest.name), 'Invalid plugin name');
assert.match(manifest.version, semver);
assert.match(manifest.minAppVersion, semver);
assert.equal(pkg.version, manifest.version, 'package.json and manifest.json versions must match');
assert.equal(versions[manifest.version], manifest.minAppVersion, 'versions.json must record the current minimum app version');
assert(manifest.author?.trim(), 'Author is required');
assert.equal(typeof manifest.isDesktopOnly, 'boolean');
assert(manifest.description?.length > 0 && manifest.description.length <= 250, 'Description must be 1–250 characters');
assert.match(manifest.description, /\.$/);
assert.match(manifest.description, /^[\x20-\x7E]+$/);
assert.equal(pkg.license, 'MIT');
if (process.env.RELEASE_TAG) {
  assert.equal(process.env.RELEASE_TAG, manifest.version, 'Release tag must match manifest.version exactly (no v prefix)');
}
await Promise.all(['LICENSE', 'README.md', 'THIRD_PARTY_NOTICES.txt'].map((file) => access(file)));
const bundle = await readFile('main.js', 'utf8');
const bundledManifest = await json(`release/${manifest.id}/manifest.json`);
assert.deepEqual(bundledManifest, manifest, 'Installable manifest differs from the root manifest');
assert.equal(await readFile(`release/${manifest.id}/main.js`, 'utf8'), bundle, 'Installable bundle is out of date');
assert(bundle.includes('Third-party software bundled with Serbian Transliteration'), 'Dependency notices must be in the installed bundle');
console.log(`Release ${manifest.version} validated for ${manifest.id}.`);
