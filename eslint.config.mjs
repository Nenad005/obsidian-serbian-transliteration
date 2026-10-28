import { defineConfig } from 'eslint/config';
import obsidianmd from 'eslint-plugin-obsidianmd';

export default defineConfig([
  { ignores: ['node_modules/**', 'release/**', 'main.js', 'scripts/**', 'tests/**', '*.config.mjs'] },
  ...obsidianmd.configs.recommended,
  {
    files: ['src/**/*.ts'],
    languageOptions: { parserOptions: { projectService: true } },
    rules: {
      // Retain Obsidian 1.5 compatibility; declarative settings require 1.13+.
      'obsidianmd/settings-tab/prefer-setting-definitions': 'off',
    },
  },
]);
