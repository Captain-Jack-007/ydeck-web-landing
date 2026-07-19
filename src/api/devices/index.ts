import { apiRequest } from "@/src/api/client";
import type { AccountDesktopDevice, PairingApprovalResponse, PairingDenialResponse } from "@/src/api/types";

const pairingPlatforms = ["macos", "windows", "linux", "unknown"] as const;
const pairingArchitectures = ["arm64", "x64", "unknown"] as const;
const pairingReleaseChannels = ["stable", "beta", "alpha", "nightly", "internal"] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : null;
}

function optionalString(value: unknown) {
  return typeof value === "string" ? value : undefined;
}

function nullableString(value: unknown) {
  return typeof value === "string" ? value : value === null ? null : undefined;
}

function requiredEnum<const Values extends readonly string[]>(value: unknown, values: Values): Values[number] | null {
  return typeof value === "string" && values.includes(value) ? value as Values[number] : null;
}

function parseDesktopDevice(value: unknown): AccountDesktopDevice {
  const device = asRecord(value);
  if (!device || typeof device.id !== "string") {
    throw new Error("Invalid Desktop device response.");
  }

  return {
    id: device.id,
    publicId: nullableString(device.publicId),
    name: nullableString(device.name),
    platform: optionalString(device.platform),
    architecture: optionalString(device.architecture),
    appVersion: nullableString(device.appVersion),
    appBuild: nullableString(device.appBuild),
    releaseChannel: optionalString(device.releaseChannel),
    status: optionalString(device.status),
    trustLevel: optionalString(device.trustLevel),
    current: typeof device.current === "boolean" ? device.current : undefined,
    firstSeenAt: nullableString(device.firstSeenAt),
    lastSeenAt: nullableString(device.lastSeenAt),
    approvedAt: nullableString(device.approvedAt),
    revokedAt: nullableString(device.revokedAt),
    revokeReason: nullableString(device.revokeReason),
  };
}

function parsePairingApproval(value: unknown): PairingApprovalResponse {
  const response = asRecord(value);
  const device = asRecord(response?.device);
  const platform = requiredEnum(device?.platform, pairingPlatforms);
  const architecture = requiredEnum(device?.architecture, pairingArchitectures);
  const releaseChannel = requiredEnum(device?.releaseChannel, pairingReleaseChannels);
  if (
    response?.status !== "approved" ||
    !device ||
    !platform ||
    !architecture ||
    typeof device.appVersion !== "string" ||
    !releaseChannel
  ) {
    throw new Error("Invalid Desktop pairing approval response.");
  }
  return {
    status: "approved",
    device: {
      name: typeof device.name === "string" ? device.name : undefined,
      platform,
      architecture,
      appVersion: device.appVersion,
      appBuild: typeof device.appBuild === "string" ? device.appBuild : undefined,
      releaseChannel,
    },
  };
}

function parsePairingDenial(value: unknown): PairingDenialResponse {
  const response = asRecord(value);
  if (response?.status !== "denied") {
    throw new Error("Invalid Desktop pairing denial response.");
  }
  return { status: "denied" };
}

export async function approvePairing(userCode: string) {
  const response = await apiRequest<unknown>("/api/v1/desktop/pairing/approve", {
    method: "POST",
    headers: { "x-ydeck-api-version": "v1" },
    body: { userCode: userCode.trim() },
  });
  return parsePairingApproval(response);
}

export async function denyPairing(userCode: string) {
  const response = await apiRequest<unknown>("/api/v1/desktop/pairing/deny", {
    method: "POST",
    headers: { "x-ydeck-api-version": "v1" },
    body: { userCode: userCode.trim() },
  });
  return parsePairingDenial(response);
}

export async function listDesktopDevices() {
  const response = asRecord(await apiRequest<unknown>("/api/v1/account/devices"));
  if (!response || !Array.isArray(response.devices)) {
    throw new Error("Invalid Desktop device list response.");
  }
  return response.devices.map(parseDesktopDevice);
}

export async function revokeDesktopDevice(deviceId: string) {
  return apiRequest<null>(`/api/v1/account/devices/${encodeURIComponent(deviceId)}`, {
    method: "DELETE",
  });
}

export async function revokeAllDesktopDevices(input: { reason?: string }) {
  const response = asRecord(await apiRequest<unknown>(
    "/api/v1/account/devices/revoke-all",
    {
      method: "POST",
      body: {
        preserveCurrentDevice: false,
        ...input,
      },
    },
  ));
  if (!response || typeof response.revokedDevices !== "number" || typeof response.revokedSessions !== "number") {
    throw new Error("Invalid Desktop revoke-all response.");
  }
  return {
    revokedDevices: response.revokedDevices,
    revokedSessions: response.revokedSessions,
  };
}
