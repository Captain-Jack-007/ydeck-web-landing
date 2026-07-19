export type AuthInvalidationReason =
  | "logout"
  | "logout_all"
  | "password_reset"
  | "session_revoked"
  | "account_deleted";

const CHANNEL_NAME = "ydeck-auth";

type AuthChannelMessage = {
  type: "AUTH_INVALIDATED";
  reason: AuthInvalidationReason;
};

export function broadcastAuthInvalidation(reason: AuthInvalidationReason) {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return;
  }
  const channel = new BroadcastChannel(CHANNEL_NAME);
  const message: AuthChannelMessage = { type: "AUTH_INVALIDATED", reason };
  channel.postMessage(message);
  channel.close();
}

export function subscribeAuthInvalidation(onInvalidate: (message: AuthChannelMessage) => void) {
  if (typeof window === "undefined" || typeof BroadcastChannel === "undefined") {
    return () => {};
  }
  const channel = new BroadcastChannel(CHANNEL_NAME);
  const handler = (event: MessageEvent<AuthChannelMessage>) => {
    if (event.data?.type === "AUTH_INVALIDATED") {
      onInvalidate(event.data);
    }
  };
  channel.addEventListener("message", handler);
  return () => {
    channel.removeEventListener("message", handler);
    channel.close();
  };
}
