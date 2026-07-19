import type { AccountDesktopDevice } from "@/src/api/types";

export type PortalDataStatus = "idle" | "loading" | "ready" | "error";
export type DesktopConnectionState = "loading" | "unavailable" | "not_connected" | "connected" | "attention";

export type DesktopConnectionSummary = {
  state: DesktopConnectionState;
  title: string;
  detail: string;
  activeCount: number;
  latestDevice: AccountDesktopDevice | null;
};

function deviceTimestamp(device: AccountDesktopDevice) {
  const timestamp = device.lastSeenAt ?? device.approvedAt ?? device.firstSeenAt;
  const parsed = timestamp ? Date.parse(timestamp) : 0;
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getDesktopConnectionSummary(
  devices: AccountDesktopDevice[],
  status: PortalDataStatus,
): DesktopConnectionSummary {
  if (status === "loading" || status === "idle") {
    return {
      state: "loading",
      title: "Checking Desktop connection",
      detail: "Loading registered devices.",
      activeCount: 0,
      latestDevice: null,
    };
  }

  if (status === "error") {
    return {
      state: "unavailable",
      title: "Desktop status unavailable",
      detail: "Device information could not be loaded.",
      activeCount: 0,
      latestDevice: null,
    };
  }

  const activeDevices = devices
    .filter((device) => device.status === "active")
    .sort((first, second) => deviceTimestamp(second) - deviceTimestamp(first));

  if (activeDevices.length > 0) {
    return {
      state: "connected",
      title: activeDevices.length === 1 ? "Desktop connected" : `${activeDevices.length} Desktop devices connected`,
      detail: activeDevices[0].name?.trim() || "An authorized Desktop device is active.",
      activeCount: activeDevices.length,
      latestDevice: activeDevices[0],
    };
  }

  const attentionDevice = devices.find((device) =>
    device.status === "blocked" || device.status === "revoked" || device.status === "disabled" || device.trustLevel === "blocked",
  );

  if (attentionDevice) {
    return {
      state: "attention",
      title: "Desktop access needs attention",
      detail: attentionDevice.status === "revoked"
        ? "The most recent Desktop authorization was revoked."
        : "A registered Desktop device cannot currently connect.",
      activeCount: 0,
      latestDevice: attentionDevice,
    };
  }

  return {
    state: "not_connected",
    title: "Desktop not connected",
    detail: "Install YDeck Desktop, then pair it with this account.",
    activeCount: 0,
    latestDevice: null,
  };
}

export function normalizePortalMediaUrl(candidate: string | undefined, appOrigin: string) {
  if (!candidate) {
    return null;
  }

  try {
    const url = new URL(candidate, appOrigin);
    const isLocalHttp = url.protocol === "http:" && (url.hostname === "localhost" || url.hostname === "127.0.0.1");
    if (url.protocol !== "https:" && !isLocalHttp) {
      return null;
    }
    return url.toString();
  } catch {
    return null;
  }
}
