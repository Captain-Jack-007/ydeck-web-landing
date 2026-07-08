import type { Locale } from '../types';

export function isYDeckLocale(value: string | null | undefined): value is Locale {
  return value === 'en' || value === 'ru' || value === 'uz';
}

export function localeFromParam(value: string | null | undefined): Locale {
  if (isYDeckLocale(value)) return value;
  return 'ru';
}
