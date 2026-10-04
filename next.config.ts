import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      // The estimator moved from /estimate to /quotation (2026-10-04).
      { source: "/estimate", destination: "/quotation", permanent: true },
      {
        source: "/estimate/order/:token",
        destination: "/quotation/order/:token",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
