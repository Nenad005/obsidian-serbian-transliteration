import { Modal, Notice, Plugin, Setting, type App, type Editor } from 'obsidian';
import { convertRange } from './editor/convert-selection';
import { DEFAULT_SETTINGS, TransliterationSettingTab, type TransliterationSettings } from './settings';
import type { Direction } from './transliteration/convert';

class ConfirmConversionModal extends Modal {
  constructor(app: App, private direction: Direction, private convert: () => void) {
    super(app);
  }

  onOpen(): void {
    this.titleEl.setText('Convert the entire note?');
    this.contentEl.createEl('p', {
      text: `No text is selected. Convert this note to Serbian ${this.direction === 'latin' ? 'Latin' : 'Cyrillic'}? You can undo the change in the editor.`,
    });
    new Setting(this.contentEl)
      .addButton((button) => button.setButtonText('Cancel').onClick(() => this.close()))
      .addButton((button) => button.setButtonText('Convert').setCta().onClick(() => {
        this.close();
        this.convert();
      }));
  }

  onClose(): void {
    this.contentEl.empty();
  }
}

export default class SerbianTransliterationPlugin extends Plugin {
  settings: TransliterationSettings = { ...DEFAULT_SETTINGS };

  async onload(): Promise<void> {
    const saved = await this.loadData();
    this.settings = {
      protectMarkdown: typeof saved?.protectMarkdown === 'boolean' ? saved.protectMarkdown : DEFAULT_SETTINGS.protectMarkdown,
      confirmWholeNote: typeof saved?.confirmWholeNote === 'boolean' ? saved.confirmWholeNote : DEFAULT_SETTINGS.confirmWholeNote,
    };
    for (const direction of ['latin', 'cyrillic'] as const) {
      this.addCommand({
        id: `convert-to-${direction}`,
        name: `Convert to ${direction === 'latin' ? 'Latin' : 'Cyrillic'}`,
        editorCallback: (editor) => this.convert(editor, direction),
      });
    }
    this.addSettingTab(new TransliterationSettingTab(this));
  }

  async saveSettings(): Promise<void> {
    await this.saveData(this.settings);
  }

  private convert(editor: Editor, direction: Direction): void {
    const source = editor.getValue();
    const selections = editor.listSelections();
    const selected = selections.some(({ anchor, head }) => editor.posToOffset(anchor) !== editor.posToOffset(head));
    // Capture context before opening the modal and refuse stale edits.
    const file = this.app.workspace.getActiveFile();
    const apply = () => {
      if (editor.getValue() !== source || this.app.workspace.getActiveFile() !== file) {
        new Notice('The note changed. Run the conversion command again.');
        return;
      }
      try {
        const ranges = selected
          ? selections.map(({ anchor, head }) => {
            const a = editor.posToOffset(anchor);
            const b = editor.posToOffset(head);
            return { from: Math.min(a, b), to: Math.max(a, b) };
          }).filter(({ from, to }) => from !== to)
          : [{ from: 0, to: source.length }];
        // Merge overlapping selections before creating a single undoable transaction.
        ranges.sort((a, b) => a.from - b.from);
        const merged: typeof ranges = [];
        for (const range of ranges) {
          const last = merged[merged.length - 1];
          if (last && range.from <= last.to) last.to = Math.max(last.to, range.to);
          else merged.push({ ...range });
        }
        const changes = merged.map(({ from, to }) => ({
          from: editor.offsetToPos(from),
          to: editor.offsetToPos(to),
          text: convertRange(source, from, to, direction, this.settings.protectMarkdown),
        })).filter((change) => change.text !== editor.getRange(change.from, change.to));
        if (!changes.length) {
          new Notice('No text needs conversion in the chosen range.');
          return;
        }
        editor.transaction({ changes });
        editor.focus();
        new Notice(`Converted to Serbian ${direction === 'latin' ? 'Latin' : 'Cyrillic'}.`);
      } catch (error) {
        console.error('Serbian Transliteration:', error);
        new Notice('Conversion failed. Your note was not changed.');
      }
    };
    if (!selected && this.settings.confirmWholeNote) {
      new ConfirmConversionModal(this.app, direction, apply).open();
    } else apply();
  }
}
