// ======================================================================
// ARQUIVO: src/lib/subscriptionUtils.ts
// DESCRIÇÃO: Funções utilitárias para cálculo de validade e tempo.
// ======================================================================

/**
 * Constantes de Conversão (Zero Magic Numbers)
 * 1 dia = 24h * 60m * 60s * 1000ms
 */
const MS_POR_DIA = 1000 * 60 * 60 * 24;

/**
 * Calcula a diferença em dias entre a data atual e a data de expiração.
 * @param dataExpiracao Data vinda do banco de dados (Subscription.expiresAt)
 * @returns Número inteiro de dias restantes (mínimo 0)
 */
export function calcularDiasRestantes(dataExpiracao: string | Date | null | undefined): number {
  if (!dataExpiracao) return 0;

  const agora = new Date();
  const expira = new Date(dataExpiracao);

  // Diferença em milissegundos
  const diferencaMs = expira.getTime() - agora.getTime();

  // Se a diferença for negativa, o plano já expirou
  if (diferencaMs <= 0) return 0;

  // Converte para dias arredondando para cima (H8: Visibilidade do status)
  //
  const diasRestantes = Math.ceil(diferencaMs / MS_POR_DIA);

  return diasRestantes;
}

/**
 * Verifica se uma assinatura ainda é válida.
 * @param dataExpiracao Data vinda do banco de dados
 */
export function estaAtiva(dataExpiracao: string | Date | null | undefined): boolean {
  if (!dataExpiracao) return false;
  return new Date(dataExpiracao) > new Date();
}