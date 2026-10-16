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
      // Software-studio repositioning (2026-10-16): /what-we-do → /services,
      // /case-studies → /work. Retired marketing services fold into Launch & Grow.
      { source: "/what-we-do", destination: "/services", permanent: true },
      {
        source: "/what-we-do/website-development",
        destination: "/services/websites",
        permanent: true,
      },
      {
        source: "/what-we-do/:path(seo|digital-marketing-training|graphic-design)",
        destination: "/services/launch-and-grow",
        permanent: true,
      },
      { source: "/case-studies", destination: "/work", permanent: true },
    ];
  },
};

export default nextConfig;
