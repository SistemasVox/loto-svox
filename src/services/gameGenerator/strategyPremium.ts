// ====================================================================
// PATH: src/services/gameGenerator/strategyPremium.ts
// ====================================================================

import { PREMIUM_QUADS, PREMIUM_MAX_SUBS } from './config';

export function strategyPremium(
  qtdeNecessaria: number,
  disponiveis: number[],
  atrasados: number[]
): number[] {
  let numerosGerados: number[] = [];
  const selecionar = (pool: number[], qtde: number) => {
    const misturado = [...pool].sort(() => Math.random() - 0.5);
    return misturado.slice(0, Math.min(qtde, misturado.length));
  };

  for (const quad of PREMIUM_QUADS) {
    const numsQuad = Array.from(
      { length: quad.max - quad.min + 1 },
      (_, i) => i + quad.min
    ).filter(num => disponiveis.includes(num));

    const sel = selecionar(numsQuad, quad.qtde);
    numerosGerados = [...numerosGerados, ...sel];
  }

  // Completar se necessário
  if (numerosGerados.length < qtdeNecessaria) {
    const falta = qtdeNecessaria - numerosGerados.length;
    const adicionais = selecionar(disponiveis, falta);
    numerosGerados = [...numerosGerados, ...adicionais];
  }

  // Substituições por atrasados
  const atrasosDisp = atrasados.filter(num => disponiveis.includes(num) && !numerosGerados.includes(num));
  const maxSubst = Math.min(PREMIUM_MAX_SUBS, atrasosDisp.length);
  for (let i = 0; i < maxSubst; i++) {
    const idx = Math.floor(Math.random() * numerosGerados.length);
    numerosGerados[idx] = atrasosDisp[i];
  }
  return numerosGerados;
}
