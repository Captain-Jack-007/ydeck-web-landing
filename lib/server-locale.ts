import { headers } from "next/headers";
import { isLocale, resolveRegionLocale, type Locale } from "@/lib/i18n";

export async function detectServerLocale(explicitLocale?: string | null): Promise<Locale> {
  const requestedLocale = explicitLocale ?? null;

  if (isLocale(requestedLocale)) {
    return requestedLocale;
  }

  const requestHeaders = await headers();
  const countryCode =
    requestHeaders.get("x-vercel-ip-country") ??
    requestHeaders.get("cf-ipcountry") ??
    requestHeaders.get("x-country-code");
  const timeZone =
    requestHeaders.get("x-vercel-ip-timezone") ??
    requestHeaders.get("cf-timezone");

  return resolveRegionLocale({ countryCode, timeZone });
}
