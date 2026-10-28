import { describe, expect, it } from 'vitest';
import { transliterate } from '../src/transliteration/convert';

const cyrillic = ['а', 'б', 'в', 'г', 'д', 'ђ', 'е', 'ж', 'з', 'и', 'ј', 'к', 'л', 'љ', 'м', 'н', 'њ', 'о', 'п', 'р', 'с', 'т', 'ћ', 'у', 'ф', 'х', 'ц', 'ч', 'џ', 'ш'];
const latin = ['a', 'b', 'v', 'g', 'd', 'đ', 'e', 'ž', 'z', 'i', 'j', 'k', 'l', 'lj', 'm', 'n', 'nj', 'o', 'p', 'r', 's', 't', 'ć', 'u', 'f', 'h', 'c', 'č', 'dž', 'š'];

describe('Serbian alphabet', () => {
  for (let i = 0; i < cyrillic.length; i++) {
    const c = cyrillic[i]!;
    const l = latin[i]!;
    it(`converts ${c} ↔ ${l} in both cases`, () => {
      expect(transliterate(c, 'latin')).toBe(l);
      expect(transliterate(l, 'cyrillic')).toBe(c);
      expect(transliterate(c.toUpperCase(), 'latin')).toBe(l.toUpperCase());
      expect(transliterate(l.toUpperCase(), 'cyrillic')).toBe(c.toUpperCase());
    });
  }
});

describe('word handling', () => {
  it.each([
    ['Љубав, Његош и Џез.', 'Ljubav, Njegoš i Džez.'],
    ['ЉУБАВ ЊЕГОШ ЏЕЗ', 'LJUBAV NJEGOŠ DŽEZ'],
    ['Ћирилица → ćirilica', 'Ćirilica → ćirilica'],
    ['љ Љ љубав Љубав', 'lj LJ ljubav Ljubav'],
  ])('converts %s', (input, expected) => {
    expect(transliterate(input, 'latin')).toBe(expected);
  });

  it.each([
    ['Ljiljana i Njegoš slušaju džez.', 'Љиљана и Његош слушају џез.'],
    ['LJILJANA NJEGOŠ DŽEZ', 'ЉИЉАНА ЊЕГОШ ЏЕЗ'],
    ['Ljubav Љубав', 'Љубав Љубав'],
    ['dj đ Đ', 'дј ђ Ђ'],
    ['c\u0301 c\u030C s\u030C z\u030C', 'ћ ч ш ж'],
    ['injekcija INJEKCIJA injektirati', 'инјекција ИНЈЕКЦИЈА инјектирати'],
    ['konjugacija konjunkcija', 'конјугација конјункција'],
    ['nadživeti Nadživeti NADŽIVETI podžanr', 'надживети Надживети НАДЖИВЕТИ поджанр'],
    ['njiva džep', 'њива џеп'],
  ])('converts %s', (input, expected) => {
    expect(transliterate(input, 'cyrillic')).toBe(expected);
  });

  it('preserves whitespace, punctuation, unsupported letters and emoji', () => {
    const input = '  123\t🙂 中文 Ω qwx!\r\n';
    expect(transliterate(input, 'latin')).toBe(input);
    expect(transliterate(input, 'cyrillic')).toBe(input);
  });

  it('round trips unambiguous prose', () => {
    const text = 'Љубав је лепа. Ђак чита књигу и слуша џез.';
    expect(transliterate(transliterate(text, 'latin'), 'cyrillic')).toBe(text);
  });
});
