import { de } from './de.js';
import { en } from './en.js';
import { defaultLang } from './ui.js';

const dictionaries = { de, en };

// Liefert das Textpaket für eine Sprache (Fallback: Deutsch)
export function useTranslations(lang) {
  return dictionaries[lang] ?? dictionaries[defaultLang];
}

export * from './ui.js';
