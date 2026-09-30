import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactCompiler: true,
  // Paquetes que Next.js NO debe empaquetar en el bundle del servidor.
  // Los de OpenTelemetry porque parchean módulos en runtime; los de AWS SDK
  // porque @opentelemetry/instrumentation-aws-sdk solo puede instrumentarlos
  // si se cargan como módulos externos (así los spans de DynamoDB salen con
  // nombre de operación y db.system en vez de "POST /" genéricos).
  serverExternalPackages: [
    "@opentelemetry/sdk-node",
    "@opentelemetry/auto-instrumentations-node",
    "@opentelemetry/exporter-trace-otlp-http",
    "@opentelemetry/exporter-metrics-otlp-http",
    "@opentelemetry/exporter-logs-otlp-http",
    "@aws-sdk/client-dynamodb",
    "@aws-sdk/lib-dynamodb",
  ],
};

export default nextConfig;
