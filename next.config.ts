import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */

  // Avatar images come from outside our site, so Next/Image must be
  // told which hosts are allowed:
  //   - i.ibb.co / i.ibb.com     -> photos uploaded on the sign-up page (ImgBB
  //                                 returns i.ibb.co URLs; i.ibb.com kept as backup)
  //   - *.googleusercontent.com  -> Google profile pictures
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "i.ibb.co" },
      { protocol: "https", hostname: "i.ibb.com" },
      { protocol: "https", hostname: "*.googleusercontent.com" },
    ],
  },

  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
