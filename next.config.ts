import type { NextConfig } from "next";

const isDevelopment = process.env.NODE_ENV === "development";

const codespaceHost = process.env.CODESPACE_NAME
  ? `${process.env.CODESPACE_NAME}-3000.app.github.dev`
  : undefined;

const developmentOrigins = [
  codespaceHost,
  "localhost:3000",
  "127.0.0.1:3000",
].filter((origin): origin is string => Boolean(origin));

const nextConfig: NextConfig = {
  devIndicators: false,

  allowedDevOrigins: isDevelopment ? developmentOrigins : [],

  experimental: {
    serverActions: {
      allowedOrigins: isDevelopment ? developmentOrigins : [],
    },
  },
};

export default nextConfig;
