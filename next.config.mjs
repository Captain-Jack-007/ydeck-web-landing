/** @type {import('next').NextConfig} */
const nextConfig = {
  async redirects() {
    return [
      {
        source: "/enterprise/:path*",
        destination: "/",
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
