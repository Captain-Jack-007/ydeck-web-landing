import type { SalesChannelConnection } from "@/src/api/sales-operator";
import type { DesktopConnectionSummary } from "@/src/lib/desktop-portal";

/**
 * Items that genuinely need the user to do something.
 *
 * Every item is derived from real API state — a channel error code, an expiring
 * authorization, a blocked device. Nothing here is invented, and an empty list
 * is a valid, common result.
 *
 * Tone is "info" by default. Routine setup work must not be dressed up as a
 * failure: only a real fault gets "warning".
 */

export type AttentionTone = "warning" | "info";

export type AttentionItem = {
  id: string;
  tone: AttentionTone;
  title: string;
  description: string;
  actionLabel: string;
  href: string;
};

const EXPIRY_WARNING_WINDOW_MS = 7 * 24 * 60 * 60 * 1000;

export function resolveAttentionItems(input: {
  channels: SalesChannelConnection[];
  channelsStatus: string;
  channelsError: { message: string } | null;
  desktop: DesktopConnectionSummary;
  instagramEnabled: boolean;
  now: number;
}): AttentionItem[] {
  const items: AttentionItem[] = [];

  if (input.channelsStatus === "error") {
    items.push({
      id: "channels-unavailable",
      tone: "warning",
      title: "We couldn't load your connected channels",
      description: "There was a problem reaching YDeck Cloud. Your existing connections haven't been changed.",
      actionLabel: "Open channels",
      href: "/sales-operator/channels",
    });
  }

  for (const channel of input.channels) {
    if (channel.safeErrorCode) {
      items.push({
        id: `channel-error-${channel.id}`,
        tone: "warning",
        title: `${channel.accountName || channel.provider} needs a check`,
        description: channel.safeErrorMessage ?? "This channel reported a problem and may not be handling messages.",
        actionLabel: "Review channel",
        href: "/sales-operator/channels",
      });
      continue;
    }

    if (channel.status !== "connected") {
      continue;
    }

    const expiresAt = channel.authorizationExpiresAt ? Date.parse(channel.authorizationExpiresAt) : NaN;
    if (Number.isFinite(expiresAt) && expiresAt - input.now < EXPIRY_WARNING_WINDOW_MS) {
      items.push({
        id: `channel-expiry-${channel.id}`,
        tone: "info",
        title: `Authorization for ${channel.accountName || channel.provider} expires soon`,
        description: "Refresh the authorization so message handling continues without interruption.",
        actionLabel: "Refresh authorization",
        href: "/sales-operator/channels",
      });
    }
  }

  const hasConnectedChannel = input.channels.some((channel) => channel.status === "connected");
  if (input.channelsStatus === "ready" && !hasConnectedChannel) {
    items.push({
      id: "no-channels",
      tone: "info",
      title: "No customer channels connected",
      description: "Sales Operator needs a connected business account before it can handle conversations.",
      actionLabel: "Connect a channel",
      href: "/sales-operator/channels",
    });
  }

  if (!input.instagramEnabled) {
    items.push({
      id: "instagram-not-entitled",
      tone: "info",
      title: "Instagram isn't included in the current plan",
      description: "Review your plan to enable Instagram business messaging for this workspace.",
      actionLabel: "View plans",
      href: "/settings/plans",
    });
  }

  if (input.desktop.state === "attention") {
    items.push({
      id: "desktop-attention",
      tone: "warning",
      title: "A Desktop device needs review",
      description: input.desktop.detail,
      actionLabel: "Manage devices",
      href: "/settings/devices",
    });
  }

  return items;
}
