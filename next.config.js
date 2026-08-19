/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export for Cloudflare Pages — API routes/getServerSideProps
  // are replaced by Cloudflare Pages Functions under functions/api/**
  output: 'export',

  // Security: Remove X-Powered-By header
  poweredByHeader: false,

  images: {
    // Next's image optimizer needs a server; not available in a static export
    unoptimized: true,
  },
};

module.exports = nextConfig;
