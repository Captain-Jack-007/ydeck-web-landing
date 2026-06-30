import type { Locale } from '../types';

export function detectInitialLocale(): Locale {
  if (typeof window === 'undefined') return 'ru';

  const requestedLocale = new URLSearchParams(window.location.search).get(
    'lang'
  );
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
  if (browserLanguage.startsWith('en')) return 'en';
  if (browserLanguage.startsWith('uz')) return 'uz';

  return 'ru';
}
