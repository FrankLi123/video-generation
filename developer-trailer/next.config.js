// next.config.js

/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      'umscinacmhcpuavnviog.supabase.co', // Supabase storage domain
      'via.placeholder.com', // <-- add this line
    ],
  },
};

module.exports = nextConfig; 