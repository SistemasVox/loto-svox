// Carrega o .env explicitamente para evitar falhas de injeção no PM2
require('dotenv').config();

module.exports = {
  apps: [{
    name: "loto-frontend",
    script: "npm",
    args: "start -- -p 3003",
    cwd: "/var/www/loto",
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: "100M",
    env: {
      NODE_ENV: "production",
      // Mapeia explicitamente as variáveis críticas do .env
      ADMIN_EMAILS: process.env.ADMIN_EMAILS,
      JWT_SECRET: process.env.JWT_SECRET,
      DATABASE_URL: process.env.DATABASE_URL,
      LOTERIA_DATABASE_URL: process.env.LOTERIA_DATABASE_URL
    }
  }]
};