const { withSentryConfig } = require("@sentry/nextjs");

const { i18n } = require("./next-i18next.config");
const SENTRY_ENVIRONMENT = process.env.SENTRY_ENVIRONMENT || process.env.NEXT_PUBLIC_SENTRY_ENVIRONMENT;

/** @type {import('next').NextConfig} */
const nextConfig = {
  distDir: process.env.BUILD_DIR || ".next",
  reactStrictMode: false,
  swcMinify: true,
  i18n,
  redirects: async () => {
    return [
      {
        source: "/auth/login",
        destination: "/login",
        permanent: true
      },
      {
        source: "/auth/register",
        destination: "/register",
        permanent: true
      },
      {
        source: "/auth/reset",
        destination: "/forgot-password",
        permanent: true
      },
      {
        source: "/auth/reset/:token",
        destination: "/forgot-password/:token",
        permanent: true
      },
      {
        source: "/auth/invitation/:token",
        destination: "/invitation/:token",
        permanent: true
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.msaaq.com",
        pathname: "/assets/**"
      },
      {
        protocol: "https",
        hostname: "www.flagpictures.com",
        pathname: "/static/**"
      },
      {
        protocol: "https",
        hostname: "msaaq-dev.s3.eu-central-1.amazonaws.com",
        pathname: "/announcementSteps/**"
      },
      {
        protocol: "https",
        hostname: "cdn.msaaq.com",
        pathname: "/announcementSteps/**"
      }
    ]
  }
};

const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  org: "msaaq",
  project: "dashboard",
  dryRun: SENTRY_ENVIRONMENT === "development"
};

const sentryOptions = {
  // Hides source maps from generated client bundles
  hideSourceMaps: true
};

module.exports = withSentryConfig(nextConfig, sentryWebpackPluginOptions, sentryOptions);
