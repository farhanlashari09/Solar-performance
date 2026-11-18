import { en } from './en';
import { ur } from './ur';
import { urRoman } from './urRoman';
import { Language } from '../types';

export const translations = {
  en,
  ur,
  'ur-roman': urRoman,
};

export function getTranslation(lang: Language) {
  return translations[lang] || translations.en;
}

export function isRTL(lang: Language): boolean {
  return lang === 'ur';
}
