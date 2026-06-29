import {
  defaultLocale,
  isLocale,
  localeFromTimeZone,
  localePreferenceKey,
  type Locale,
} from "@/lib/i18n";

const legacyLocalePreferenceKey = "ydeck-locale";

export function detectClientLocale(): Locale {
  if (typeof window === "undefined") {
    return defaultLocale;
  }

  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return localeFromTimeZone(timeZone) ?? defaultLocale;
}

export function readStoredLocalePreference(): Locale | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedLocale =
    window.localStorage.getItem(localePreferenceKey) ??
    window.localStorage.getItem(legacyLocalePreferenceKey);
  return isLocale(storedLocale) ? storedLocale : null;
}

export function writeStoredLocalePreference(locale: Locale) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(localePreferenceKey, locale);
  window.localStorage.setItem(legacyLocalePreferenceKey, locale);
}
