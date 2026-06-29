import type { Locale } from '../types';

export function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'en';

  const requestedLocale = new URLSearchParams(window.location.search).get('lang');
  if (
    requestedLocale === 'en' ||
    requestedLocale === 'ru' ||
    requestedLocale === 'uz'
  ) {
    return requestedLocale;
  }

  const savedLocale = window.localStorage.getItem('ydeck-locale');
  if (savedLocale === 'en' || savedLocale === 'ru' || savedLocale === 'uz') {
    return savedLocale;
  }

  const browserLanguage = window.navigator.language.toLowerCase();
  if (browserLanguage.startsWith('ru')) return 'ru';
  if (browserLanguage.startsWith('uz')) return 'uz';

  return 'en';
}
