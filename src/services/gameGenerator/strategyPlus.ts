// ====================================================================
// PATH: src/services/gameGenerator/strategyPlus.ts - VERSÃO CORRIGIDA
// ====================================================================

import {
  PLUS_LOW_FREQ, PLUS_HIGH_FREQ, PLUS_MID_FREQ,
  PLUS_DELAYED, PLUS_LOW_PICK, PLUS_HIGH_PICK, PLUS_MID_PICK,
  GAME_SIZE, NUMBER_MIN, NUMBER_MAX
} from './config';
import { generateGameFromMultipleColumns } from './generateGameFromMultipleColumns';

// Limite de tentativas para geração de jogos relevantes
const MAX_ATTEMPTS = 3000;

export function strategyPlus(
  qtdeNecessaria: number,
  disponiveis: number[],
  atrasados: number[],
  frequencias: Record<number, number>,
  historicoConcursos: number[][]
): number[] {
  // Validações iniciais
  if (qtdeNecessaria !== GAME_SIZE) {
    console.warn(`Ajustando quantidade necessária de ${qtdeNecessaria} para ${GAME_SIZE}`);
    qtdeNecessaria = GAME_SIZE;
  }
  
  // Filtrar apenas números válidos (1-25 para Lotofácil)
  const numerosValidos = disponiveis.filter(n => 
    Number.isInteger(n) && n >= NUMBER_MIN && n <= NUMBER_MAX
  );
  
  if (numerosValidos.length < qtdeNecessaria) {
    throw new Error(`Não há números válidos suficientes. Disponíveis: ${numerosValidos.length}, Necessários: ${qtdeNecessaria}`);
  }

  // Filtrar atrasados válidos
  const atrasadosValidos = atrasados.filter(n => 
    Number.isInteger(n) && n >= NUMBER_MIN && n <= NUMBER_MAX && numerosValidos.includes(n)
  );

  // 0. Criar subconjunto com os 1000 concursos mais recentes
  const historicoRecente = historicoConcursos.length > 1000 
    ? historicoConcursos.slice(0, 1000) 
    : historicoConcursos;

  // 1. Preparar pools de frequências - com validação rigorosa
  const entradasFrequencia = Object.entries(frequencias)
    .filter(([numStr, freq]) => {
      const numero = parseInt(numStr);
      return (
        !isNaN(numero) &&
        Number.isInteger(numero) &&
        numero >= NUMBER_MIN && 
        numero <= NUMBER_MAX && 
        numerosValidos.includes(numero) && 
        typeof freq === 'number' &&
        !isNaN(freq)
      );
    })
    .sort((a, b) => a[1] - b[1]) // Ordenar por frequência (menor para maior)
    .map(([numStr]) => parseInt(numStr));

  if (entradasFrequencia.length === 0) {
    console.warn('Nenhuma frequência válida encontrada, usando fallback direto');
    return gerarFallbackSeguro(qtdeNecessaria, numerosValidos, atrasadosValidos);
  }

  // Criar pools com tamanhos seguros
  const tamanhoTotal = entradasFrequencia.length;
  const baixaFreq = entradasFrequencia.slice(0, Math.min(PLUS_LOW_FREQ, Math.floor(tamanhoTotal / 3)));
  const altaFreq = entradasFrequencia.slice(-Math.min(PLUS_HIGH_FREQ, Math.floor(tamanhoTotal / 3)));
  const mediaFreq = entradasFrequencia.slice(
    Math.floor(tamanhoTotal / 3), 
    Math.floor(tamanhoTotal * 2 / 3)
  ).slice(0, PLUS_MID_FREQ);
  
  // 2. Função para verificar relevância do jogo
  const isRelevant = (jogo: number[]): boolean => {
    if (!jogo || !Array.isArray(jogo) || jogo.length !== qtdeNecessaria) {
      return false;
    }

    // Verificar se todos os números são válidos
    if (!jogo.every(n => Number.isInteger(n) && n >= NUMBER_MIN && n <= NUMBER_MAX)) {
      return false;
    }

    // Verificar se não há duplicatas
    if (new Set(jogo).size !== jogo.length) {
      return false;
    }
    
    // Verificar critérios de relevância (com tolerância para pools pequenos)
    const temAtrasados = atrasadosValidos.length === 0 || 
      jogo.filter(n => atrasadosValidos.includes(n)).length >= Math.min(PLUS_DELAYED, atrasadosValidos.length, 3);
    
    const temBaixa = baixaFreq.length === 0 || 
      jogo.filter(n => baixaFreq.includes(n)).length >= Math.min(PLUS_LOW_PICK, baixaFreq.length, 2);
    
    const temAlta = altaFreq.length === 0 || 
      jogo.filter(n => altaFreq.includes(n)).length >= Math.min(PLUS_HIGH_PICK, altaFreq.length, 2);
    
    const temMedia = mediaFreq.length === 0 || 
      jogo.filter(n => mediaFreq.includes(n)).length >= Math.min(PLUS_MID_PICK, mediaFreq.length, 2);
    
    return temAtrasados && temBaixa && temAlta && temMedia;
  };

  // 3. Gerar jogos usando histórico recente
  if (historicoRecente.length > 0) {
    for (let i = 0; i < MAX_ATTEMPTS; i++) {
      try {
        const jogo = generateGameFromMultipleColumns({
          historicoConcursos: historicoRecente,
          intervaloBase: [0, historicoRecente.length],
          intervaloCol: [0, historicoRecente.length]
        });

        if (jogo && isRelevant(jogo)) {
          // Validação final de segurança
          const jogoLimpo = validarELimparJogo(jogo);
          if (jogoLimpo && jogoLimpo.length === qtdeNecessaria) {
            return jogoLimpo;
          }
        }
      } catch (error) {
        console.warn(`Erro na tentativa ${i + 1} de generateGameFromMultipleColumns:`, error);
        continue;
      }
    }
  }

  // 4. Fallback seguro
  console.warn(`Usando fallback após ${MAX_ATTEMPTS} tentativas`);
  return gerarFallbackSeguro(qtdeNecessaria, numerosValidos, atrasadosValidos, baixaFreq, altaFreq, mediaFreq);
}

// Função para validar e limpar jogo
function validarELimparJogo(jogo: number[]): number[] | null {
  if (!jogo || !Array.isArray(jogo)) return null;
  
  // Filtrar apenas números válidos
  const jogolimpo = jogo
    .filter(n => Number.isInteger(n) && n >= NUMBER_MIN && n <= NUMBER_MAX)
    .filter((n, index, arr) => arr.indexOf(n) === index) // Remove duplicatas
    .sort((a, b) => a - b);
  
  return jogolimpo.length === GAME_SIZE ? jogolimpo : null;
}

// Função auxiliar para gerar fallback seguro
function gerarFallbackSeguro(
  qtdeNecessaria: number,
  numerosValidos: number[],
  atrasadosValidos: number[],
  baixaFreq: number[] = [],
  altaFreq: number[] = [],
  mediaFreq: number[] = []
): number[] {
  const selecionar = (pool: number[], qtde: number): number[] => {
    if (pool.length === 0) return [];
    const poolFiltrado = pool.filter(n => 
      Number.isInteger(n) && n >= NUMBER_MIN && n <= NUMBER_MAX && numerosValidos.includes(n)
    );
    const misturado = [...poolFiltrado].sort(() => Math.random() - 0.5);
    return misturado.slice(0, Math.min(qtde, misturado.length));
  };

  let jogoFinal: number[] = [];
  
  // Estratégia progressiva: tentar usar pools específicos, mas garantir resultado
  const candidatos = [
    ...selecionar(atrasadosValidos, PLUS_DELAYED),
    ...selecionar(baixaFreq, PLUS_LOW_PICK),
    ...selecionar(altaFreq, PLUS_HIGH_PICK),
    ...selecionar(mediaFreq, PLUS_MID_PICK)
  ];

  // Remover duplicatas
  jogoFinal = Array.from(new Set(candidatos));

  // Completar com números aleatórios válidos se necessário
  let tentativasCompleta = 0;
  while (jogoFinal.length < qtdeNecessaria && tentativasCompleta < 1000) {
    const numerosRestantes = numerosValidos.filter(n => !jogoFinal.includes(n));
    if (numerosRestantes.length === 0) {
      console.error('Não há números suficientes para completar o jogo');
      break;
    }
    
    const numeroAleatorio = numerosRestantes[Math.floor(Math.random() * numerosRestantes.length)];
    if (!jogoFinal.includes(numeroAleatorio)) {
      jogoFinal.push(numeroAleatorio);
    }
    tentativasCompleta++;
  }

  // Garantir que temos exatamente a quantidade necessária
  jogoFinal = jogoFinal.slice(0, qtdeNecessaria);
  
  // Validação final rigorosa
  if (jogoFinal.length !== qtdeNecessaria) {
    throw new Error(`Falha crítica: gerados ${jogoFinal.length} números, esperados ${qtdeNecessaria}`);
  }

  if (!jogoFinal.every(n => Number.isInteger(n) && n >= NUMBER_MIN && n <= NUMBER_MAX)) {
    console.error('Números inválidos detectados:', jogoFinal);
    throw new Error('Números inválidos no jogo final');
  }

  if (new Set(jogoFinal).size !== jogoFinal.length) {
    console.error('Duplicatas detectadas:', jogoFinal);
    throw new Error('Duplicatas encontradas no jogo final');
  }

  return jogoFinal.sort((a, b) => a - b);
}