/* =============================================================================
 * ARQUIVO: ecosystem.config.js
 * DESCRIÇÃO: Configuração mínima viável (MV) - Foco em DB e Sessão.
 * ============================================================================= */
require('dotenv').config();

module.exports = {
  apps: [{
    name: "loto-frontend",
    script: "npm",
    args: "start -- -p 3003",
    cwd: "/var/www/loto",
    max_memory_restart: "300M",
    env: {
      NODE_ENV: "production",
      // Essencial para o Prisma localizar o banco de dados
      DATABASE_URL: process.env.DATABASE_URL,
      LOTERIA_DATABASE_URL: process.env.LOTERIA_DATABASE_URL,
      // Essencial para o Next-Auth manter sessões ativas [cite: 2025-12-14]
      JWT_SECRET: process.env.JWT_SECRET,
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET,
      NEXTAUTH_URL: process.env.NEXTAUTH_URL
    }
  }]
};