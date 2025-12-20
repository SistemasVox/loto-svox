# Loto-SVOX - Inteligência Lotérica 🛡️

Sistema de alta performance para análise de dados e gestão de membros, otimizado para VPS Debian.

## 🏗️ Arquitetura de Sistema

### 1. Persistência de Dados (Prisma + SQLite)
O sistema utiliza **Isolamento de Clients** para suportar múltiplos bancos de dados sem conflitos de binários:
- **Banco Principal (`schema.prisma`)**: Usuários, Assinaturas e Segurança.
- **Banco Lotofácil (`lotofacil.schema.prisma`)**: Resultados históricos com saída isolada em `node_modules/@prisma/client-lotofacil`.

### 2. Monitoramento em Tempo Real (RAM Engine)
Para eliminar gargalos de I/O de disco, o rastreio de tráfego é feito inteiramente em **Memória RAM**:
- **Resiliência:** O `TrafficMemory` limpa registros inativos automaticamente a cada 5 minutos.
- **Segurança:** O Middleware decodifica o JWT para identificar membros ativos via IP e E-mail.

## 🚀 Guia de Configuração

### Requisitos
- Node.js 20+ / NPM
- PM2 (Gerenciador de Processos)
- SQLite3

### Variáveis de Ambiente (`.env`)
O arquivo `.env` deve ser criado manualmente na VPS (não versionado):
- `DATABASE_URL`: Conexão banco principal.
- `LOTERIA_DATABASE_URL`: Conexão banco de sorteios.
- `JWT_SECRET`: Chave para criptografia de sessões.
- `ADMIN_EMAILS`: Lista separada por vírgula para permissão no Dashboard.

## 🛠️ Comandos de Manutenção

- **Deploy Completo:** `./deploy.sh`.
- **Verificar Logs:** `pm2 logs loto-frontend`.
- **Consultar Tráfego (Manual):** Verifique o Dashboard Admin para dados em tempo real vindos da RAM.

---
**Status do Projeto:** Versionado e Estabilizado no GitHub. 🛡️