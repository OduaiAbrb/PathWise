/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: 'standalone',
  generateBuildId: async () => {
    return `build-${Date.now()}`;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
    ],
  },
  async rewrites() {
    return [
      {
        source: '/api/v1/:path*',
        destination: process.env.NEXT_PUBLIC_API_URL ? `${process.env.NEXT_PUBLIC_API_URL}/api/v1/:path*` : 'http://localhost:8000/api/v1/:path*',
      },
    ];
  },
};

// Only use Sentry in production, skip during Railway builds to avoid issues
let config = nextConfig;

if (process.env.SENTRY_AUTH_TOKEN && !process.env.RAILWAY_ENVIRONMENT) {
  const { withSentryConfig } = await import("@sentry/nextjs");
  config = withSentryConfig(nextConfig, {
    org: "oduai-aburubs-projects",
    project: "javascript-nextjs",
    silent: true,
    hideSourceMaps: true,
  });
}

export default config;
