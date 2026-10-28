// Explicit word families, not general prefix rules: "nj" is otherwise ambiguous.
// These are intentionally small and do not claim to be a Serbian dictionary.
const separateNjFamilies = [
  /^injek(?:c|t)/u,
  /^konjug/u,
  /^konjunk/u,
];

const separateDzFamilies = [
  /^nadživ/u,
  /^nadžanj/u,
  /^podžanr/u,
];

/** Digraph start positions which represent two separate letters in this word. */
export function exceptionBoundaries(word: string): Set<number> {
  const lower = word.toLowerCase();
  const result = new Set<number>();
  if (separateNjFamilies.some((pattern) => pattern.test(lower))) {
    result.add(lower.indexOf('nj'));
  }
  if (separateDzFamilies.some((pattern) => pattern.test(lower))) {
    result.add(lower.indexOf('dž'));
  }
  return result;
}
