import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Fija la raiz del workspace a demo-api/ para evitar el warning de lockfiles multiples
  outputFileTracingRoot: __dirname,
};

export default nextConfig;
