// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  images: {
    domains: [
      'umscinacmhcpuavnviog.supabase.co', // Supabase storage domain
      'via.placeholder.com', // <-- add this line
    ],
  },
  // Allow ngrok and other development origins
  allowedDevOrigins: [
    '*.ngrok-free.app',
    '*.ngrok.io',
    '*.ngrok.app',
  ],
};


module.exports = nextConfig;