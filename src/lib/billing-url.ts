const DEFAULT_ALLOWED_BILLING_HOST_SUFFIXES = [
  "stripe.com",
  "stripe.network",
];

function getConfiguredHosts() {
  const raw = process.env.NEXT_PUBLIC_YDECK_ALLOWED_BILLING_HOSTS;
  if (!raw) {
    return [];
  }
  return raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function isAllowedBillingUrl(input: string) {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return false;
  }

  if (url.protocol !== "https:") {
    return false;
  }

  const hostname = url.hostname.toLowerCase();
  const configuredHosts = getConfiguredHosts();

  if (
    configuredHosts.some((allowed) =>
      allowed.startsWith("*.") ? hostname.endsWith(allowed.slice(1)) : hostname === allowed,
    )
  ) {
    return true;
  }

  return DEFAULT_ALLOWED_BILLING_HOST_SUFFIXES.some(
    (suffix) => hostname === suffix || hostname.endsWith(`.${suffix}`),
  );
}

export function validateBillingRedirectUrl(input: string) {
  if (!isAllowedBillingUrl(input)) {
    throw new Error("The billing redirect URL is not allowed.");
  }
  return input;
}
