import { PluginSettingTab, Setting } from 'obsidian';
import type SerbianTransliterationPlugin from './main';

export interface TransliterationSettings {
  protectMarkdown: boolean;
  confirmWholeNote: boolean;
}

export const DEFAULT_SETTINGS: TransliterationSettings = {
  protectMarkdown: true,
  confirmWholeNote: true,
};

export class TransliterationSettingTab extends PluginSettingTab {
  constructor(private plugin: SerbianTransliterationPlugin) {
    super(plugin.app, plugin);
  }

  display(): void {
    this.containerEl.empty();
    new Setting(this.containerEl)
      .setName('Protect Markdown and links')
      .setDesc('Leave frontmatter, code, HTML, comments, URLs and link targets unchanged. Turning this off converts everything in the chosen range.')
      .addToggle((toggle) => toggle.setValue(this.plugin.settings.protectMarkdown).onChange(async (value) => {
        this.plugin.settings.protectMarkdown = value;
        await this.plugin.saveSettings();
      }));
    new Setting(this.containerEl)
      .setName('Confirm whole-note conversion')
      .setDesc('Ask before converting a note when no text is selected.')
      .addToggle((toggle) => toggle.setValue(this.plugin.settings.confirmWholeNote).onChange(async (value) => {
        this.plugin.settings.confirmWholeNote = value;
        await this.plugin.saveSettings();
      }));
  }
}
