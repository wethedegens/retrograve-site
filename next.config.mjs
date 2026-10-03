/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  async headers() {
    const securityHeaders = [
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "X-Frame-Options",
        value: "DENY",
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=()",
      },
    ];

    const privateStudioHeaders = [
      ...securityHeaders,
      {
        key: "Cache-Control",
        value: "no-store, no-cache, must-revalidate, private",
      },
      {
        key: "Pragma",
        value: "no-cache",
      },
      {
        key: "X-Robots-Tag",
        value: "noindex, nofollow, noarchive",
      },
    ];

    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      {
        source: "/studio/:path*",
        headers: privateStudioHeaders,
      },
      {
        source: "/api/studio/:path*",
        headers: privateStudioHeaders,
      },
    ];
  },
};

export default nextConfig;
