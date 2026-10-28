import { cyrillicToLatin, latinToCyrillic } from './mappings';
import { exceptionBoundaries } from './exceptions';

export type Direction = 'latin' | 'cyrillic';

function toLatin(word: string): string {
  const uppercaseWord = word === word.toUpperCase() && word !== word.toLowerCase();
  return Array.from(word, (letter) => {
    const mapped = cyrillicToLatin[letter.toLowerCase()];
    if (!mapped) return letter;
    if (letter === letter.toLowerCase()) return mapped;
    if (uppercaseWord) return mapped.toUpperCase();
    return mapped.charAt(0).toUpperCase() + mapped.slice(1);
  }).join('');
}

function toCyrillic(word: string): string {
  const boundaries = exceptionBoundaries(word);
  let result = '';
  for (let i = 0; i < word.length; i++) {
    const letter = word.charAt(i);
    const pair = word.slice(i, i + 2).toLowerCase();
    const digraph = pair.length === 2 && latinToCyrillic[pair] && !boundaries.has(i);
    const mapped = latinToCyrillic[digraph ? pair : letter.toLowerCase()];
    result += mapped
      ? letter === letter.toLowerCase() ? mapped : mapped.toUpperCase()
      : letter;
    if (digraph) i++;
  }
  return result;
}

/** Transliterate Serbian letters only. Unknown scripts and punctuation remain intact. */
export function transliterate(text: string, direction: Direction): string {
  return text.normalize('NFC').replace(/[\p{L}\p{M}]+/gu,
    direction === 'latin' ? toLatin : toCyrillic);
}
