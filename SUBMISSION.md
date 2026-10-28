# Community submission checklist

## Official sources

Reviewed against the official developer documentation on 2026-10-28:

- [Submit your plugin](https://docs.obsidian.md/plugins/releasing/submit-plugin)
- [Developer policies](https://docs.obsidian.md/community-directory/developer-policies)
- [Submission requirements](https://docs.obsidian.md/community-directory/submission-requirements-for-plugins)
- [Plugin guidelines](https://docs.obsidian.md/Plugins/Releasing/Plugin+guidelines)
- [Manifest](https://docs.obsidian.md/Reference/Manifest)
- [Release automation](https://docs.obsidian.md/Plugins/Releasing/Release+your+plugin+with+GitHub+Actions)
- [Community account and submission](https://docs.obsidian.md/community-directory/set-up-and-claim)

**Important:** the current docs direct new submissions to
**https://community.obsidian.md**, not a pull request adding an entry to the
legacy `obsidianmd/obsidian-releases/community-plugins.json` registry.

## Repository preparation

- [x] Public source: `Nenad005/obsidian-serbian-transliteration`.
- [x] MIT license, author identity, usage documentation and limitations.
- [x] Valid plugin name and ID without the word "Obsidian" or "plugin".
- [x] Version `1.0.0` in manifest, package metadata and compatibility map.
- [x] Concise, action-oriented description ending in a period.
- [x] Editor API for edits; no vault-wide writes or file renames.
- [x] No default hotkeys; settings and commands use Obsidian UI APIs.
- [x] No network, telemetry, ads, account requirements or self-updating.
- [x] Bundled runtime dependency notices, including attribution in the README.
- [x] Build checks reject external modules other than the host `obsidian` API.
- [x] Obsidian-specific lint rules, TypeScript checking and automated tests.
- [x] CI and tag-triggered draft-release workflow with build attestations.

The declared minimum app version is **1.5.0**. The Obsidian lint rules check API
availability against it, but this is not a substitute for running the plugin on
that version. Mobile compatibility is based on browser-only runtime APIs; actual
device testing is still required. If compatibility cannot be verified, raise
`minAppVersion` to a tested version in both `manifest.json` and `versions.json`.

## Manual release gate — maintainer must complete

These checks have **not** been performed by the coding agent. Do not mark them
complete based only on automated tests.

- [ ] Install the built plugin in a disposable vault on the minimum supported app.
- [ ] Verify Source mode and Live Preview on the current stable desktop app.
- [ ] Test on an actual iOS/Android device, including enabling and disabling.
- [ ] Convert `Љубав, Његош, Џез, Ђак, Ћирилица` to Latin and back.
- [ ] Check uppercase words, NFC accents and documented digraph exceptions.
- [ ] Check selections, reversed/multiple selections and whole-note confirmation.
- [ ] Confirm a single undo restores the exact note; check cursor and scroll behavior.
- [ ] Check frontmatter, code, links, aliases, comments, callouts and block IDs.
- [ ] Check settings persistence after reload and both settings toggles.
- [ ] Cancel confirmation; change the note while confirmation is open; disable
      the plugin while confirmation is open. None should apply a stale edit.
- [ ] Enable/disable/reload the plugin without console errors or leftover modals.
- [ ] Test a large note and review multilingual prose and math/templating caveats.

## Create the GitHub release

1. Run `npm ci` and `npm run check` on a clean checkout.
2. Ensure `package.json` and `manifest.json` have the same `x.y.z` version,
   `versions.json` maps that version to `minAppVersion`, and `RELEASE_NOTES.md`
   describes the release.
3. Commit and push the changes, then tag the exact version, **without `v`**:

   ```sh
   git tag -a 1.0.0 -m "Release 1.0.0"
   git push origin 1.0.0
   ```

4. Wait for **Prepare plugin release** to pass. It validates the version/tag,
   runs all checks, generates attestations, and creates a **draft** release with
   `main.js` and `manifest.json` attached individually. No `styles.css` is needed.
5. Complete the manual release gate above, review the assets and release notes,
   and **publish** the draft. Drafts do not satisfy directory submission or permit
   public installation. Do not move a published tag; use a new version for fixes.

An optional local check before tagging is
`RELEASE_TAG=1.0.0 npm run validate:release` (after building).
Build attestations can be verified using `gh attestation verify main.js --repo
Nenad005/obsidian-serbian-transliteration` against a downloaded release asset.

## Submit — requires the maintainer's Obsidian account

1. Sign in at **https://community.obsidian.md** with your Obsidian account.
2. Connect the GitHub account **Nenad005** so repository ownership can be verified.
3. Open **Plugins → New plugin**.
4. Supply `https://github.com/Nenad005/obsidian-serbian-transliteration` and choose
   yourself as owner. Confirm the name and ID are available; the directory is
   authoritative for uniqueness.
5. Read and agree to the developer policies and continued-maintenance commitment,
   then submit. These agreements must be made by you, not an automated agent.
6. Address automated review feedback. Commit corrections and publish an incremented
   version with a matching GitHub release tag and assets when required.
7. Select **Publish** in the directory when appropriate; the plugin is not
   installable from within Obsidian until review errors are resolved.

The directory reads `manifest.json` from the default branch, then installers use
the GitHub release with the matching tag. Keep that branch and release aligned.
