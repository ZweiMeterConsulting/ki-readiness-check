/** @type {import('next').NextConfig} */
const nextConfig = {
  // Schlanker Standalone-Server für den Docker-/Coolify-Build:
  // .next/standalone enthält server.js + nur die wirklich genutzten Deps.
  output: "standalone",

  // Chromium-Binärpaket (@sparticuz/chromium) mit ins Function-Tracing der
  // PDF-Route nehmen, damit es im standalone-Output landet.
  outputFileTracingIncludes: {
    "/api/report": [
      "./node_modules/@sparticuz/chromium/bin/**/*",
      "./node_modules/@sparticuz/chromium/**",
    ],
  },

  // Diese Pakete NICHT bundlen – sie werden zur Laufzeit als echte
  // node_modules geladen (puppeteer-core startet die Chromium-Binary).
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
};

export default nextConfig;
