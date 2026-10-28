## Serbian Transliteration 1.0.0

- Convert selected Serbian text or the current note between Cyrillic and Latin.
- Preserve capitalization and handle `lj`, `nj`, `dž` and accented Serbian letters.
- Keep code, frontmatter, URLs and link targets intact by default.
- Support multiple selections through a single editor transaction.
- Ask before whole-note conversion and refuse edits if the note changed during confirmation.
- Work offline without accounts, API keys, network requests or telemetry.

Latin digraphs can be ambiguous; review uncommon compounds and foreign words.
See the README for installation, usage, protection rules and language limitations.

### Manual installation

Download **main.js** and **manifest.json** from this release (not the source-code
archives). Place both files in your vault's
`.obsidian/plugins/serbian-transliteration/` directory, restart Obsidian, and
enable **Serbian Transliteration** under **Settings → Community plugins**.
