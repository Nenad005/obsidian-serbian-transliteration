import { protectedRanges } from '../markdown/protected-ranges';
import { transliterate, type Direction } from '../transliteration/convert';

/** Parse the full note so a selection inside code/frontmatter remains protected. */
export function convertRange(
  source: string,
  from: number,
  to: number,
  direction: Direction,
  protectMarkdown = true,
): string {
  if (!protectMarkdown) return transliterate(source.slice(from, to), direction);
  let cursor = from;
  let result = '';
  for (const range of protectedRanges(source)) {
    if (range.end <= cursor) continue;
    if (range.start >= to) break;
    const start = Math.max(cursor, range.start);
    const end = Math.min(to, range.end);
    result += transliterate(source.slice(cursor, start), direction);
    result += source.slice(start, end);
    cursor = end;
  }
  return result + transliterate(source.slice(cursor, to), direction);
}
