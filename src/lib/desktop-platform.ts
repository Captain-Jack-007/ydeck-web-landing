export type DesktopPlatform = "macos" | "windows" | "unknown";

export function detectDesktopPlatform(platformHint?: string | null): DesktopPlatform {
  const normalized = platformHint?.trim().toLowerCase() ?? "";

  if (normalized.includes("mac")) {
    return "macos";
  }

  if (normalized.includes("win")) {
    return "windows";
  }

  return "unknown";
}

export function getBrowserPlatform(): DesktopPlatform {
  if (typeof navigator === "undefined") {
    return "unknown";
  }

  const userAgentData = navigator as Navigator & {
    userAgentData?: { platform?: string };
  };

  return detectDesktopPlatform(userAgentData.userAgentData?.platform ?? navigator.platform);
}
