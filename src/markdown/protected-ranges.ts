import { fromMarkdown } from 'mdast-util-from-markdown';
import { frontmatterFromMarkdown } from 'mdast-util-frontmatter';
import { frontmatter } from 'micromark-extension-frontmatter';

export interface Range {
  start: number;
  end: number;
}

interface Node {
  type: string;
  position?: { start: { offset?: number }; end: { offset?: number } };
  children?: Node[];
}

export function protectedRanges(source: string): Range[] {
  const ranges: Range[] = [];
  const add = (start: number, end: number) => {
    if (end > start) ranges.push({ start, end });
  };
  const tree = fromMarkdown(source, {
    extensions: [frontmatter(['yaml', 'toml'])],
    mdastExtensions: [frontmatterFromMarkdown(['yaml', 'toml'])],
  });

  function visit(node: Node): void {
    const start = node.position?.start.offset;
    const end = node.position?.end.offset;
    if (start !== undefined && end !== undefined) {
      if (['yaml', 'toml', 'code', 'inlineCode', 'html', 'definition', 'image', 'imageReference'].includes(node.type)) {
        add(start, end);
        return;
      }
      if (node.type === 'link' || node.type === 'linkReference') {
        if (source.charAt(start) === '<') {
          add(start, end);
          return;
        }
        // Preserve destinations, reference IDs, titles and delimiters; convert labels only.
        const first = node.children?.[0]?.position?.start.offset;
        const last = node.children?.[node.children.length - 1]?.position?.end.offset;
        if (first === undefined || last === undefined) add(start, end);
        else {
          add(start, first);
          add(last, end);
          // A shortcut/collapsed reference uses its label as its identifier.
          if (node.type === 'linkReference' && !/\]\s*\[[^\]]+\]$/.test(source.slice(start, end))) {
            add(start, end);
            return;
          }
        }
      }
    }
    node.children?.forEach(visit);
  }
  visit(tree);

  // Obsidian-specific syntax is not part of CommonMark's syntax tree.
  for (const match of source.matchAll(/!?\[\[[^\]\r\n]*\]\]/g)) {
    const start = match.index;
    const alias = match[0].indexOf('|');
    if (alias < 0) add(start, start + match[0].length);
    else {
      add(start, start + alias + 1);
      add(start + match[0].length - 2, start + match[0].length);
    }
  }
  for (const match of source.matchAll(/%%[\s\S]*?(?:%%|$)/g)) {
    add(match.index, match.index + match[0].length);
  }
  // Preserve callout types and block identifiers used as Obsidian link targets.
  for (const match of source.matchAll(/\[![\w-]+\][+-]?|(?:^|\s)\^[\p{L}\p{N}-]+(?=\s*$)/gmu)) {
    add(match.index, match.index + match[0].length);
  }
  // Bare URLs/email are text in CommonMark; keep them usable as well.
  for (const match of source.matchAll(/(?:https?:\/\/|obsidian:\/\/|www\.)[^\s<>[\]`]+|[\p{L}\p{N}._%+-]+@[\p{L}\p{N}.-]+\.[\p{L}]{2,}/gu)) {
    add(match.index, match.index + match[0].length);
  }

  ranges.sort((a, b) => a.start - b.start || a.end - b.end);
  const merged: Range[] = [];
  for (const range of ranges) {
    const previous = merged[merged.length - 1];
    if (previous && range.start <= previous.end) previous.end = Math.max(previous.end, range.end);
    else merged.push({ ...range });
  }
  return merged;
}
