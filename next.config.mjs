/** @type {import('next').NextConfig} */
const nextConfig = {
  // @react-pdf/renderer wird serverseitig als externes Node-Paket geladen (nicht gebündelt).
  serverExternalPackages: ["@react-pdf/renderer"],
  // Logo für den PDF-Report muss im Serverless-Bundle der API-Route liegen.
  outputFileTracingIncludes: {
    "/api/report": ["./public/logo.png"],
  },
};

export default nextConfig;
