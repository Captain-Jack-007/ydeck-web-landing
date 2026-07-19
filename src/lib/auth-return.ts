const DEFAULT_AUTH_RETURN_TO = "/";

export function safeAuthReturnTo(value: string | null | undefined): string {
  if (!value) return DEFAULT_AUTH_RETURN_TO;
  try {
    const parsed = new URL(value, "http://ydeck.local");
    if (parsed.origin !== "http://ydeck.local") return DEFAULT_AUTH_RETURN_TO;
    if (!parsed.pathname.startsWith("/") || parsed.pathname.startsWith("//")) return DEFAULT_AUTH_RETURN_TO;
    if (parsed.pathname.startsWith("/auth/")) return DEFAULT_AUTH_RETURN_TO;
    return `${parsed.pathname}${parsed.search}`;
  } catch {
    return DEFAULT_AUTH_RETURN_TO;
  }
}

export function authReturnToParam(value: string): string {
  const safe = safeAuthReturnTo(value);
  return safe === DEFAULT_AUTH_RETURN_TO ? "" : `?returnTo=${encodeURIComponent(safe)}`;
}
