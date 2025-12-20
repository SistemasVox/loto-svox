import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Ignora erros do ESLint no build */
  eslint: {
    ignoreDuringBuilds: true,
  },
  /* Ignora erros de tipagem do TypeScript no build */
  typescript: {
    ignoreBuildErrors: true,
  },
  /* Configuração para Next.js 15+ 
     Garante que o Prisma seja tratado como pacote externo (não empacotado)
  */
  serverExternalPackages: ['@prisma/client', '@prisma/client-lotofacil'],
};

export default nextConfig;