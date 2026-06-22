/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Asegura que el system prompt (leído con fs en runtime) se incluya en el
    // bundle serverless de la route de generación.
    outputFileTracingIncludes: {
      "/api/admin/generate": ["./src/prompts/**"],
    },
  },
};

export default nextConfig;
