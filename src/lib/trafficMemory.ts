/**
 * GERENCIADOR DE TRÁFEGO EM MEMÓRIA (RAM)
 * Substitui o SQLite para monitoramento em tempo real.
 */

// Tempo de persistência: 5 minutos
const TEMPO_LIMITE_MS = 5 * 60 * 1000;

interface AcessoMemoria {
  ip: string;
  userId: number | null;
  timestamp: number;
}

// Global para evitar limpeza em Hot Module Replacement (HMR)
const globalStore = global as unknown as { trafego: Map<string, AcessoMemoria> };
const trafego = globalStore.trafego || new Map<string, AcessoMemoria>();
globalStore.trafego = trafego;

export const memoriaTrafego = {
  /**
   * Registra ou atualiza um acesso
   */
  registrar(ip: string, userId: number | null = null) {
    trafego.set(ip, {
      ip,
      userId,
      timestamp: Date.now()
    });
    this.limparInativos();
  },

  /**
   * Remove registros mais velhos que 5 minutos
   */
  limparInativos() {
    const agora = Date.now();
    for (const [ip, dados] of trafego.entries()) {
      if (agora - dados.timestamp > TEMPO_LIMITE_MS) {
        trafego.delete(ip);
      }
    }
  },

  /**
   * Retorna a lista atual de quem está online
   */
  obterTodos(): AcessoMemoria[] {
    this.limparInativos();
    return Array.from(trafego.values()).sort((a, b) => b.timestamp - a.timestamp);
  }
};