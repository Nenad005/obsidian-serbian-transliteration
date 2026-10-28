import { describe, expect, it } from 'vitest';
import { convertRange } from '../src/editor/convert-selection';
import { protectedRanges } from '../src/markdown/protected-ranges';

function convert(source: string): string {
  return convertRange(source, 0, source.length, 'cyrillic');
}

describe('Markdown protection', () => {
  it('converts headings, formatting, lists and table text', () => {
    expect(convert('# Naslov\n\n**Ljubav** i _njiva_\n- Džez\n\n| Dan | Noć |\n| --- | --- |'))
      .toBe('# Наслов\n\n**Љубав** и _њива_\n- Џез\n\n| Дан | Ноћ |\n| --- | --- |');
  });

  it.each([
    '---\ntitle: Ljubav\ntags: [njiva]\n---',
    '+++\ntitle = "Ljubav"\n+++',
    '```typescript\nconst ljubav = "njiva";\n```',
    '~~~\nLjubav\n~~~',
    '    const ljubav = "njiva";',
    '`Ljubav`',
    '<span title="Ljubav">',
    '<!-- Ljubav -->',
    '%% Ljubav\nNjiva %%',
    '![Ljubav](slike/ljubav.png "Naslov")',
    '![[Slike/Ljubav.png]]',
    '[[Ljubav#Naslov]]',
    '<https://primer.rs/ljubav>',
    '<ljubav@primer.rs>',
    'https://primer.rs/ljubav',
    'obsidian://open?vault=Ljubav&file=Njiva',
    'www.primer.rs/ljubav',
    'ljubav@primer.rs',
  ])('preserves %s', (source) => {
    expect(convert(source)).toBe(source);
  });

  it('converts Markdown labels without changing targets or titles', () => {
    expect(convert('[Ljubav **njiva**](beleške/ljubav.md "Naslov")'))
      .toBe('[Љубав **њива**](beleške/ljubav.md "Naslov")');
  });

  it('preserves definitions and converts explicit reference labels', () => {
    const source = '[Ljubav][njiva]\n\n[njiva]: putanja/ljubav.md "Naslov"';
    expect(convert(source)).toBe('[Љубав][njiva]\n\n[njiva]: putanja/ljubav.md "Naslov"');
  });

  it('preserves shortcut and collapsed references so they do not break', () => {
    const source = '[Ljubav] i [Ljubav][]\n\n[Ljubav]: ljubav.md';
    expect(convert(source)).toBe('[Ljubav] и [Ljubav][]\n\n[Ljubav]: ljubav.md');
  });

  it('converts wikilink aliases and preserves targets, anchors and embeds', () => {
    expect(convert('[[Ljubav#Naslov|Lepa ljubav]] ![[Njiva#^blok|Džez]]'))
      .toBe('[[Ljubav#Naslov|Лепа љубав]] ![[Njiva#^blok|Џез]]');
  });

  it('preserves callout type and block ID but converts the title and body', () => {
    expect(convert('> [!note]- Ljubav\n> Njiva\n\nDžez ^ljubav'))
      .toBe('> [!note]- Љубав\n> Њива\n\nЏез ^ljubav');
  });

  it('converts surrounding prose without touching protected text', () => {
    expect(convert('Ljubav `njiva` i [[Džez]] je [lepa](ljubav.md).'))
      .toBe('Љубав `njiva` и [[Džez]] је [лепа](ljubav.md).');
  });

  it('protects selections inside code using the full document context', () => {
    const source = 'Pre\n```\nLjubav\n```\nPosle';
    const from = source.indexOf('Ljubav');
    expect(convertRange(source, from, from + 6, 'cyrillic')).toBe('Ljubav');
  });

  it('protects selections inside frontmatter and link targets', () => {
    for (const source of ['---\ntitle: Ljubav\n---\nTekst', '[Tekst](Ljubav.md)']) {
      const from = source.indexOf('Ljubav');
      expect(convertRange(source, from, from + 6, 'cyrillic')).toBe('Ljubav');
    }
  });

  it('converts only the selected range and handles shorter digraph replacements', () => {
    expect(convertRange('Pre Ljubav posle', 4, 10, 'cyrillic')).toBe('Љубав');
  });

  it('supports conversion to Latin with protection', () => {
    const source = '# Љубав\n`Њива` [[Џез|Ћирилица]]';
    expect(convertRange(source, 0, source.length, 'latin'))
      .toBe('# Ljubav\n`Њива` [[Џез|Ćirilica]]');
  });

  it('allows protection to be disabled explicitly', () => {
    const source = '`Ljubav`';
    expect(convertRange(source, 0, source.length, 'cyrillic', false)).toBe('`Љубав`');
  });

  it('handles empty input and empty selections', () => {
    expect(convert('')).toBe('');
    expect(convertRange('Ljubav', 2, 2, 'cyrillic')).toBe('');
  });

  it('does not change line endings', () => {
    expect(convert('Ljubav\r\n\r\n`njiva`\r\n')).toBe('Љубав\r\n\r\n`njiva`\r\n');
  });

  it('merges overlapping protection into ordered, non-overlapping ranges', () => {
    const source = '```\n[[Ljubav]] https://primer.rs/ljubav\n```';
    expect(protectedRanges(source)).toEqual([{ start: 0, end: source.length }]);
  });
});
