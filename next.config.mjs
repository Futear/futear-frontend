import bundleAnalyzer from "@next/bundle-analyzer";

const withBundleAnalyzer = bundleAnalyzer({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    optimizePackageImports: ["lucide-react", "react-icons"],
  },

  compress: true,
  poweredByHeader: false,

  productionBrowserSourceMaps: false,
};

export default withBundleAnalyzer(nextConfig);
