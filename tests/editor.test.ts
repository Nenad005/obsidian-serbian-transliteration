import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Editor, EditorPosition, EditorSelection } from 'obsidian';

const state = vi.hoisted(() => ({
  notices: [] as string[],
  modals: [] as unknown[],
}));

vi.mock('obsidian', () => ({
  Plugin: class {
    commands: Array<{ id: string; editorCallback: (editor: Editor) => void }> = [];
    app = { workspace: { getActiveFile: () => this.file } };
    file: object | null = {};
    loadData = async () => undefined;
    saveData = async () => {};
    addCommand(command: typeof this.commands[number]) { this.commands.push(command); }
    addSettingTab() {}
  },
  PluginSettingTab: class {},
  Modal: class {
    open() { state.modals.push(this); }
    close() {}
  },
  Notice: class {
    constructor(message: string) { state.notices.push(message); }
  },
  Setting: class {},
}));

import SerbianTransliterationPlugin from '../src/main';

// Minimal editor double: tests command wiring, changes and transaction boundaries.
class TestEditor {
  text: string;
  selections: EditorSelection[];
  transactions = 0;

  constructor(text: string, ranges: Array<[number, number]> = [[0, 0]]) {
    this.text = text;
    this.selections = ranges.map(([anchor, head]) => ({
      anchor: this.offsetToPos(anchor), head: this.offsetToPos(head),
    }));
  }

  getValue() { return this.text; }
  listSelections() { return this.selections; }
  posToOffset(position: EditorPosition) {
    const lines = this.text.split('\n');
    return lines.slice(0, position.line).reduce((sum, line) => sum + line.length + 1, 0) + position.ch;
  }
  offsetToPos(offset: number): EditorPosition {
    const lines = this.text.slice(0, offset).split('\n');
    return { line: lines.length - 1, ch: lines[lines.length - 1]!.length };
  }
  getRange(from: EditorPosition, to: EditorPosition) {
    return this.text.slice(this.posToOffset(from), this.posToOffset(to));
  }
  transaction({ changes }: { changes: Array<{ from: EditorPosition; to: EditorPosition; text: string }> }) {
    this.transactions++;
    const offsets = changes.map((change) => ({
      from: this.posToOffset(change.from), to: this.posToOffset(change.to), text: change.text,
    })).sort((a, b) => b.from - a.from);
    for (const { from, to, text } of offsets) {
      this.text = this.text.slice(0, from) + text + this.text.slice(to);
    }
  }
  focus() {}
}

async function setup() {
  // Obsidian supplies these constructor arguments in the actual app.
  const plugin = new SerbianTransliterationPlugin({} as never, {} as never);
  await plugin.onload();
  const host = plugin as unknown as {
    commands: Array<{ id: string; editorCallback: (editor: Editor) => void }>;
    file: object | null;
  };
  const run = (editor: TestEditor, direction = 'cyrillic') => {
    host.commands.find((command) => command.id === `convert-to-${direction}`)!
      .editorCallback(editor as unknown as Editor);
  };
  return { plugin, host, run };
}

describe('editor commands', () => {
  beforeEach(() => {
    state.notices.length = 0;
    state.modals.length = 0;
  });

  it('registers both commands and enables safe defaults', async () => {
    const { plugin, host } = await setup();
    expect(host.commands.map(({ id }) => id)).toEqual(['convert-to-latin', 'convert-to-cyrillic']);
    expect(plugin.settings).toEqual({ protectMarkdown: true, confirmWholeNote: true });
  });

  it('converts a selected range with a single transaction', async () => {
    const { run } = await setup();
    const editor = new TestEditor('Pre Ljubav posle', [[4, 10]]);
    run(editor);
    expect(editor.text).toBe('Pre Љубав posle');
    expect(editor.transactions).toBe(1);
    expect(state.modals).toHaveLength(0);
  });

  it('handles multiple reversed selections and ignores empty cursors', async () => {
    const { run } = await setup();
    const editor = new TestEditor('Ljubav i njiva', [[6, 0], [9, 14], [8, 8]]);
    run(editor);
    expect(editor.text).toBe('Љубав i њива');
    expect(editor.transactions).toBe(1);
  });

  it('merges overlapping selections before replacing', async () => {
    const { run } = await setup();
    const editor = new TestEditor('Ljubav i njiva', [[0, 9], [7, 14]]);
    run(editor);
    expect(editor.text).toBe('Љубав и њива');
    expect(editor.transactions).toBe(1);
  });

  it('converts multi-line selections to Latin', async () => {
    const { run } = await setup();
    const text = 'Љубав\nЊегош';
    const editor = new TestEditor(text, [[0, text.length]]);
    run(editor, 'latin');
    expect(editor.text).toBe('Ljubav\nNjegoš');
  });

  it('requires confirmation for the whole note', async () => {
    const { run } = await setup();
    const editor = new TestEditor('Ljubav');
    run(editor);
    expect(editor.text).toBe('Ljubav');
    expect(editor.transactions).toBe(0);
    expect(state.modals).toHaveLength(1);
    (state.modals[0] as { convert: () => void }).convert();
    expect(editor.text).toBe('Љубав');
    expect(editor.transactions).toBe(1);
  });

  it('does not apply a confirmed conversion to changed text', async () => {
    const { run } = await setup();
    const editor = new TestEditor('Ljubav');
    run(editor);
    editor.text = 'New text';
    (state.modals[0] as { convert: () => void }).convert();
    expect(editor.text).toBe('New text');
    expect(editor.transactions).toBe(0);
    expect(state.notices).toContain('The note changed. Run the conversion command again.');
  });

  it('does not apply after the active file changes', async () => {
    const { run, host } = await setup();
    const editor = new TestEditor('Ljubav');
    run(editor);
    host.file = {};
    (state.modals[0] as { convert: () => void }).convert();
    expect(editor.transactions).toBe(0);
  });

  it('can disable whole-note confirmation', async () => {
    const { plugin, run } = await setup();
    plugin.settings.confirmWholeNote = false;
    const editor = new TestEditor('Ljubav');
    run(editor);
    expect(editor.text).toBe('Љубав');
    expect(state.modals).toHaveLength(0);
  });

  it('closes pending confirmation and refuses edits after plugin unload', async () => {
    const { plugin, run } = await setup();
    const editor = new TestEditor('Ljubav');
    run(editor);
    const modal = state.modals[0] as { convert: () => void; close: () => void };
    const close = vi.spyOn(modal, 'close');
    plugin.onunload();
    expect(close).toHaveBeenCalledOnce();
    modal.convert();
    expect(editor.text).toBe('Ljubav');
    expect(editor.transactions).toBe(0);
  });

  it('does not create an empty transaction for protected selections', async () => {
    const { run } = await setup();
    const editor = new TestEditor('`Ljubav`', [[1, 7]]);
    run(editor);
    expect(editor.text).toBe('`Ljubav`');
    expect(editor.transactions).toBe(0);
    expect(state.notices).toContain('No text needs conversion in the chosen range.');
  });
});
