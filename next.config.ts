import type { NextConfig } from "next";

// Baseline security headers on every response. (No full CSP yet: Next's inline
// bootstrap scripts and framer-motion styles would need nonces — tracked in REVIEW.md.)
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), payment=(), usb=(), geolocation=(self)" },
  { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
];

const nextConfig: NextConfig = {
  // Silence Turbopack/webpack conflict warning
  turbopack: {},
  // Disable strict mode for React Three Fiber compatibility
  reactStrictMode: false,
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
