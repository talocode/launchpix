import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typedRoutes: true,
  serverExternalPackages: ["@resvg/resvg-js"],
  eslint: {
    ignoreDuringBuilds: true
  },
  images: {
    remotePatterns: [{ protocol: "https", hostname: "**" }]
  },
  async redirects() {
    return [
      { source: "/dashboard/api-keys", destination: "/dashboard/api/keys", permanent: false },
      { source: "/dashboard/usage", destination: "/dashboard/api/usage", permanent: false },
      { source: "/api", destination: "/dashboard/api", permanent: false }
    ];
  }
};

export default nextConfig;
