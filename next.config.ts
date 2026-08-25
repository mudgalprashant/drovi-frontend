import type { NextConfig } from "next";

/**
 * Deliberately close to empty.
 *
 * The console is a browser client that talks to one backend over HTTPS. It proxies nothing,
 * rewrites nothing and renders nothing on the server that needs a secret — which is what keeps
 * it deployable to Render or Cloudflare rather than tying it to one host's edge runtime
 * (ADR-0005).
 */
const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Fail the build on a type error rather than shipping one. Next lets these through by
  // default, which turns `strict` into a suggestion.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
};

export default nextConfig;
