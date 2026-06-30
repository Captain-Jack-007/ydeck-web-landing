import type { Locale } from './types';

export const ease = [0.16, 1, 0.3, 1] as const;

export const languageOptions: { locale: Locale; label: string }[] = [
  { locale: 'en', label: 'EN' },
  { locale: 'ru', label: 'RU' },
  { locale: 'uz', label: 'UZ' },
];
