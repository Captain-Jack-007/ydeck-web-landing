import type { Locale } from '../types';

export function localizedPath(path: string, locale: Locale) {
  const separator = path.includes('?') ? '&' : '?';
  return `${path}${separator}lang=${locale}`;
}
