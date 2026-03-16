import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    images: {
        remotePatterns: [
            { protocol: "https", hostname: "static.finnhub.io" },
            { protocol: "https", hostname: "logo.clearbit.com" },
            { protocol: "https", hostname: "static2.finnhub.io" },
        ],
    },
    experimental: {
        serverComponentsExternalPackages: ["mongoose"],
    },
};

export default nextConfig;