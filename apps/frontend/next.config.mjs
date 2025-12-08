/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  // Enable standalone output for Docker
  output: 'standalone',
  // Expose environment variables to the client
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_MOCK_MODE: process.env.NEXT_PUBLIC_MOCK_MODE,
    NEXT_PUBLIC_WS_URL: process.env.NEXT_PUBLIC_WS_URL,
    NEXT_PUBLIC_ENABLE_ARCADE: process.env.NEXT_PUBLIC_ENABLE_ARCADE,
    NEXT_PUBLIC_ENABLE_KNOWLEDGE: process.env.NEXT_PUBLIC_ENABLE_KNOWLEDGE,
    NEXT_PUBLIC_ENABLE_HITL: process.env.NEXT_PUBLIC_ENABLE_HITL,
  },
}

export default nextConfig