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

  // A STATIC EXPORT — plain files, no Node server.
  //
  // The console is entirely client-rendered: every page is a client component, every byte of
  // data arrives in the browser with the user's Firebase token, and the whole thing sits behind
  // a login so there is no SEO to serve. There is nothing for a server to render, and paying a
  // host to run one would buy a cold start and a bill.
  //
  // The consequence to remember: no dynamic route segments, because Next would need every id at
  // build time and project ids do not exist yet. The project page takes ?id= instead.
  output: "export",

  // Static export cannot run the image optimiser, which is a server. Nothing here uses
  // next/image today; this keeps the build honest if something does.
  images: { unoptimized: true },

  // /project rather than /project.html in the address bar.
  trailingSlash: false,
  // Fail the build on a type error rather than shipping one. Next lets these through by
  // default, which turns `strict` into a suggestion.
  typescript: { ignoreBuildErrors: false },
  eslint: { ignoreDuringBuilds: false },
};

export default nextConfig;
