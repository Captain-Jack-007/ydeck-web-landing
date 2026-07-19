const DEVELOPMENT_PHASE = "phase-development-server";
const LOCAL_API_ORIGIN = "http://127.0.0.1:2026";
const PRODUCTION_API_ORIGIN = "https://api.ydeck.app";

export function resolveApiProxyTarget(phase, configuredTarget = process.env.YDECK_API_PROXY_TARGET) {
  const target = configuredTarget || (phase === DEVELOPMENT_PHASE ? LOCAL_API_ORIGIN : PRODUCTION_API_ORIGIN);
  const parsedTarget = new URL(target);

  if (!['http:', 'https:'].includes(parsedTarget.protocol)) {
    throw new Error("YDECK_API_PROXY_TARGET must use HTTP or HTTPS.");
  }

  return parsedTarget.origin;
}

/** @type {(phase: string) => import('next').NextConfig} */
const createNextConfig = (phase) => ({
  async redirects() {
    return [
      {
        source: "/enterprise/:path*",
        destination: "/",
        permanent: false,
      },
    ];
  },
  async rewrites() {
    const apiProxyTarget = resolveApiProxyTarget(phase);
    return [
      {
        source: "/api/v1/:path*",
        destination: `${apiProxyTarget}/api/v1/:path*`,
      },
    ];
  },
});

export default createNextConfig;
