# Serbian Transliteration for Obsidian

Convert Serbian Cyrillic ↔ Latin directly in the editor. All processing happens
locally: no network requests, API keys, accounts or external services.

## Install

The plugin is not yet listed in the Obsidian Community directory. Until approval,
install it manually using a published GitHub release:

1. Open [Releases](https://github.com/Nenad005/obsidian-serbian-transliteration/releases/latest)
   and download the **main.js** and **manifest.json** assets, not the source archives.
2. Put both files in `YourVault/.obsidian/plugins/serbian-transliteration/`.
3. Restart Obsidian and enable **Serbian Transliteration** under **Settings →
   Community plugins**. Turn off Restricted mode if needed.

If no published release is available yet, use the source build below. A draft
release is visible only to repository maintainers until it is published.

### Install a local build

1. Find your Obsidian vault folder. In Obsidian, open **Settings → Community
   plugins** and turn off Restricted mode if necessary.
2. Copy the entire `release/serbian-transliteration` folder from this project into
   your vault's `.obsidian/plugins/` folder. Create `plugins` if it does not exist.
   If your vault uses a custom configuration folder, use that instead of `.obsidian`.
3. Check that these files exist directly inside the plugin folder:

   ```text
   YourVault/.obsidian/plugins/serbian-transliteration/
     main.js
     manifest.json
   ```

4. Restart Obsidian, then enable **Serbian Transliteration** under
   **Settings → Community plugins**.

This is a manually installed plugin, not a published Community Plugins listing.
The plugin uses cross-platform Obsidian APIs and is marked mobile-compatible;
mobile installation requires copying/syncing the same plugin files to that vault.
It has not yet been manually tested in the desktop or mobile app.

## Use

1. Open a Markdown note in **Editing view** (Source mode or Live Preview).
2. Select the text to convert. Multiple selections are supported.
3. Open the command palette with **Cmd+P** on macOS or **Ctrl+P** on Windows/Linux.
4. Run either:
   - **Serbian Transliteration: Convert to Latin**
   - **Serbian Transliteration: Convert to Cyrillic**

With no selection, the plugin asks before converting the entire current note.
Use **Cmd+Z / Ctrl+Z** to undo the conversion. For shortcuts, search for
“Serbian Transliteration” under **Settings → Hotkeys**.

Examples:

| Original | Direction | Result |
| --- | --- | --- |
| Ћирилица | Latin | Ćirilica |
| Љубав | Latin | Ljubav |
| ЉУБАВ | Latin | LJUBAV |
| Njegoš i džez | Cyrillic | Његош и џез |
| injekcija | Cyrillic | инјекција |

## What stays unchanged

With **Protect Markdown and links** enabled (the default):

- YAML/TOML frontmatter; fenced, indented and inline code.
- HTML nodes, Obsidian `%% comments %%`, callout types and block IDs.
- Markdown link destinations, titles and reference definitions.
- Wikilink/embed targets, including heading/block anchors.
- Images, bare HTTP(S)/Obsidian/www URLs, and email addresses.

Normal prose, headings, lists, table text, explicit Markdown link labels and
wikilink aliases are converted. Unaliased wikilinks and shortcut/collapsed
reference links stay unchanged because their display text is also their target.
HTML blocks are preserved as a whole, including their text content.
Files are never renamed and other notes are never modified.

Selections are checked against the entire note, so selecting only part of a code
block or link target will still leave it protected. In settings you can turn
protection off to deliberately convert literal text, including syntax/targets.

## Language limitations

- All 30 Serbian letters are supported, including `lj`, `nj`, `dž` and `đ`.
- Capitalization is preserved. A standalone uppercase digraph letter such as `Љ`
  becomes `LJ`; a title-case word such as `Љубав` becomes `Ljubav`.
- `dj` is **not** guessed to mean `đ`: `dj → дј`, while `đ → ђ`.
- Latin-to-Cyrillic digraphs are ambiguous. A small built-in exception list covers
  word families such as `injekcija`, `injektirati`, `konjugacija`, `konjunkcija`,
  `nadživeti`, `nadžanj…` and `podžanr`. It is not a full dictionary; review the
  output, especially names, foreign words and uncommon compounds.
- The selected direction applies to all eligible letters, not just Serbian words.
  English/foreign prose will also be transliterated. Select Serbian passages only
  in multilingual notes.
- Do not split a word/digraph across selection boundaries if you want word-aware
  capitalization and exception handling.
- Convertible text is normalized to Unicode NFC. Protected text is byte-for-byte
  unchanged. Mathematical notation, plugin-specific syntax and templating are not
  specially protected; review those notes or select only ordinary prose.

## Settings

**Settings → Serbian Transliteration**:

- **Protect Markdown and links** — on by default.
- **Confirm whole-note conversion** — on by default.

## Development

Use Node.js 22.12 or newer.

```sh
npm ci
npm run check
```

The build produces `main.js` and an installable folder at
`release/serbian-transliteration/`. Dependencies are bundled; Obsidian itself is
provided by the host app. `npm run dev` watches source files and rebuilds the root
`main.js` (it does not refresh the release folder). Reload the plugin after copying
an updated build into your vault.

### Manual smoke test

In a throwaway note, test both directions on a selection and on the whole note.
Check code/frontmatter/link protection, capitalized digraphs, multiple selections,
and a single undo. Try Source mode and Live Preview on desktop and mobile before
publishing to the Obsidian community directory.

## Privacy and security

This plugin is free and fully functional offline. It makes no network requests,
collects no telemetry, displays no ads, requires no account or payment, and does
not access files outside your vault. Settings are stored using Obsidian's plugin
storage. It changes only eligible text in the active editor when you explicitly
run a conversion command. It never installs or updates itself or dependencies.

Report bugs through [GitHub issues](https://github.com/Nenad005/obsidian-serbian-transliteration/issues).
For security-sensitive reports, see [SECURITY.md](SECURITY.md).

## License

[MIT](LICENSE), copyright 2026 Nenad005. This is an independent community plugin,
not an official Obsidian product.

The Markdown parser and its runtime dependencies retain their original licenses.
Full notices are in [THIRD_PARTY_NOTICES.txt](THIRD_PARTY_NOTICES.txt) and embedded
in the distributed `main.js` so installations retain the required attribution.

## Releasing and community submission

See [SUBMISSION.md](SUBMISSION.md) for the review checklist, manual smoke test,
GitHub release process and current official submission steps.
