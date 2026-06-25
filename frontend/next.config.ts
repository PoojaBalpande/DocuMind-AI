import type { NextConfig } from "next";

const apiBase = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
let parsedOrigin = '';
try {
  parsedOrigin = new URL(apiBase).origin;
} catch {
  // If apiBase is just a path or invalid URL, fallback to default dev backend port
  parsedOrigin = 'http://localhost:8000';
}

const isDev = process.env.NODE_ENV === 'development';

// Development: allow all common localhost ports for API access
// Production: only allow the configured API origin (via NEXT_PUBLIC_API_URL)
const connectSrc = isDev
  ? `connect-src 'self' blob: ${parsedOrigin} http://localhost:8000 http://localhost:8001 http://127.0.0.1:8000 http://127.0.0.1:8001`
  : `connect-src 'self' blob: ${parsedOrigin}`;

const cspDirectives = [
  "default-src 'self'",
  "img-src 'self' data: blob: https://lh3.googleusercontent.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  isDev ? "script-src 'self' 'unsafe-inline' 'unsafe-eval'" : "script-src 'self' 'unsafe-inline'",
  connectSrc,
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "worker-src 'self' blob:",
  "child-src 'self' blob:",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: cspDirectives,
          },
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

