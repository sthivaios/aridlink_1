import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["alim_development_server.twinknet.uk"],
  /* yes im also hardcoding this, deal with it, read the comment in lib/auth.ts lmao */
};

export default nextConfig;
