import type { NextConfig } from "next";

// Pastikan Next Server Actions punya kunci konsisten di lingkungan serverless (Netlify)
const serverActionsKey =
  process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY ??
  (process.env.BETTER_AUTH_SECRET?.slice(0, 32) || undefined);

if (!serverActionsKey) {
  throw new Error("NEXT_SERVER_ACTIONS_ENCRYPTION_KEY tidak diset");
}

process.env.NEXT_SERVER_ACTIONS_ENCRYPTION_KEY = serverActionsKey;

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
      allowedOrigins: [
        'restoran-nzan.netlify.app',
        'restoran-rz.netlify.app',
        'localhost:3000',
      ],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
};

export default nextConfig;
