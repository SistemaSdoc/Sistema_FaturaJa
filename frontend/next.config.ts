/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // -------- REWRITES --------
  async rewrites() {
    return [
      {
        // Qualquer chamada para /api/* será relativa ao próprio Next.js
        source: "/api/:path*",
        destination: "/api/:path*",
      },
    ];
  },

  // -------- HEADERS --------
  async headers() {
    return [
      {
        // Adiciona X-App-Domain a todas as requisições
        source: "/:path*",
        headers: [
          {
            key: "X-App-Domain",
            value: process.env.NEXT_PUBLIC_APP_DOMAIN || "app.faturaja.sdoca",
          },
        ],
      },
    ];
  },

  // -------- OUTRAS CONFIGS ÚTEIS --------
  compiler: {
    styledComponents: true, // se usar styled-components
  },

  experimental: {
    appDir: true, // se estiver usando a app directory do Next.js 13/14+
  },
};

module.exports = nextConfig;
