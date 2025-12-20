/* ============================================================= */
/*  PATH: src/services/gameGenerator/generateGameFromMultipleColumns.ts */
/* ============================================================= */

// Constantes globais
const GAME_SIZE = 15;
const COLUMNS_PER_GAME = 5;
const NUMBER_MIN = 1;
const NUMBER_MAX = 25;
const DEBUG = false;
const MAX_COLUMNS_FOR_SELECTION = 30; // Nova constante para limite de colunas

// Tipos
interface ColunaSource {
  jogoIndex: number;
  colunaIndex: number;
  numeros: number[];
}

interface GenerateGameFromMultipleColumnsParams {
  historicoConcursos: number[][];
  intervaloJogos?: [number, number];
  maxColunasPerGame?: number;
  maxTentativas?: number;
}

// Interface e variável de cache
interface StatCache {
  timestamp: number;
  topGaps: number[];
  topStds: number[];
}

let statCache: StatCache | null = null;

// Função para extrair uma coluna de um jogo
function extrairColuna(jogo: number[], idxCol: number): number[] {
  if (idxCol < 0 || idxCol >= COLUMNS_PER_GAME || !jogo || jogo.length !== GAME_SIZE) {
    return [];
  }
  return [
    jogo[idxCol],        // Linha 1
    jogo[idxCol + 5],    // Linha 2
    jogo[idxCol + 10]    // Linha 3
  ].filter(n => n >= NUMBER_MIN && n <= NUMBER_MAX);
}

// Função para remover colunas duplicadas (mesmo conjunto de números)
function removeDuplicateColumns(columns: ColunaSource[]): ColunaSource[] {
  const uniqueMap = new Map<string, ColunaSource>();
  
  for (const col of columns) {
    const sortedNumbers = [...col.numeros].sort((a, b) => a - b);
    const key = sortedNumbers.join(',');
    
    if (!uniqueMap.has(key)) {
      uniqueMap.set(key, col);
    }
  }
  
  return Array.from(uniqueMap.values());
}

// Função para selecionar aleatoriamente até N colunas
function selectRandomColumns(columns: ColunaSource[], max: number): ColunaSource[] {
  const shuffled = [...columns];
  
  // Embaralhamento Fisher-Yates
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  
  return shuffled.slice(0, Math.min(max, shuffled.length));
}

// Função para extrair todas as colunas válidas do histórico
function extractAllColumns(historicoConcursos: number[][], jogoMin: number, jogoMax: number): ColunaSource[] {
  const colunasDisponiveis: ColunaSource[] = [];
  for (let i = jogoMin; i < jogoMax; i++) {
    const jogo = historicoConcursos[i];
    if (!jogo || jogo.length !== GAME_SIZE) continue;
    for (let c = 0; c < COLUMNS_PER_GAME; c++) {
      const coluna = extrairColuna(jogo, c);
      if (coluna.length === 3) {
        colunasDisponiveis.push({
          jogoIndex: i,
          colunaIndex: c,
          numeros: coluna
        });
      }
    }
  }
  return colunasDisponiveis;
}

// Função para selecionar colunas aleatoriamente com restrições
function selectColumns(colunasDisponiveis: ColunaSource[], maxColunasPerGame: number): ColunaSource[] | null {
  const numerosUsados = new Set<number>();
  const jogosUsados = new Map<number, number>();
  const colunasEscolhidas: ColunaSource[] = [];
  
  for (let c = 0; c < COLUMNS_PER_GAME; c++) {
    const colunasValidas = colunasDisponiveis.filter(coluna => {
      const colunasDoJogo = jogosUsados.get(coluna.jogoIndex) || 0;
      return colunasDoJogo < maxColunasPerGame &&
             coluna.numeros.every(num => !numerosUsados.has(num));
    });
    
    if (colunasValidas.length === 0) {
      return null;
    }
    
    const randomIndex = Math.floor(Math.random() * colunasValidas.length);
    const colunaEscolhida = colunasValidas[randomIndex];
    
    colunasEscolhidas.push(colunaEscolhida);
    colunaEscolhida.numeros.forEach(num => numerosUsados.add(num));
    
    const colunasDoJogo = jogosUsados.get(colunaEscolhida.jogoIndex) || 0;
    jogosUsados.set(colunaEscolhida.jogoIndex, colunasDoJogo + 1);
  }
  
  return colunasEscolhidas;
}

// Funções para análise de distribuição
function calculateAvgGap(jogo: number[]): number {
  const sorted = [...jogo].sort((a, b) => a - b);
  let sum = 0;
  for (let i = 1; i < sorted.length; i++) {
    sum += sorted[i] - sorted[i - 1];
  }
  return sum / (sorted.length - 1);
}

function calculateStd(jogo: number[]): number {
  const n = jogo.length;
  const mean = jogo.reduce((sum, num) => sum + num, 0) / n;
  const sumSq = jogo.reduce((sum, num) => sum + Math.pow(num - mean, 2), 0);
  return Math.sqrt(sumSq / n);
}

// Função principal para gerar o jogo
export function generateGameFromMultipleColumns({
  historicoConcursos,
  intervaloJogos = [0, 100],
  maxColunasPerGame = 2,
  maxTentativas = 1000
}: GenerateGameFromMultipleColumnsParams): number[] | null {
  // Validações iniciais
  if (!historicoConcursos || historicoConcursos.length === 0) {
    if (DEBUG) console.warn('[DEBUG] Histórico vazio');
    return null;
  }

  if (maxColunasPerGame < 1 || maxColunasPerGame > COLUMNS_PER_GAME) {
    if (DEBUG) console.warn(`[DEBUG] maxColunasPerGame deve estar entre 1 e ${COLUMNS_PER_GAME}`);
    return null;
  }

  const jogoMin = Math.max(0, intervaloJogos[0]);
  const jogoMax = Math.min(historicoConcursos.length, intervaloJogos[1]);

  if (jogoMax <= jogoMin) {
    if (DEBUG) console.warn('[DEBUG] Intervalo inválido');
    return null;
  }

  let colunasDisponiveis = extractAllColumns(historicoConcursos, jogoMin, jogoMax);

  if (colunasDisponiveis.length === 0) {
    if (DEBUG) console.warn('[DEBUG] Nenhuma coluna válida encontrada');
    return null;
  }

  // ETAPA NOVA: Remover colunas duplicadas e selecionar aleatoriamente
  colunasDisponiveis = removeDuplicateColumns(colunasDisponiveis);
  colunasDisponiveis = selectRandomColumns(
    colunasDisponiveis,
    MAX_COLUMNS_FOR_SELECTION
  );

  if (DEBUG) {
    console.log(`[DEBUG] Colunas após processamento: ${colunasDisponiveis.length}`);
  }

  // Etapa 1: Calcular/recuperar estatísticas do histórico com cache
  let topGaps: number[] = [];
  let topStds: number[] = [];
  const now = Date.now();
  
  if (statCache && (now - statCache.timestamp < 3600000)) { // 1 hora em ms
    // Usar cache existente
    topGaps = statCache.topGaps;
    topStds = statCache.topStds;
    if (DEBUG) console.log('[DEBUG] Usando estatísticas em cache');
  } else {
    // Calcular novas estatísticas
    const avgGaps: number[] = [];
    const stdDevs: number[] = [];
    
    for (let i = jogoMin; i < jogoMax; i++) {
      const jogo = historicoConcursos[i];
      if (jogo.length === GAME_SIZE) {
        avgGaps.push(calculateAvgGap(jogo));
        stdDevs.push(calculateStd(jogo));
      }
    }

    // Identificar top 3 de gaps médios
    const gapFrequencies: Record<string, number> = {};
    avgGaps.forEach(gap => {
      const rounded = gap.toFixed(1);
      gapFrequencies[rounded] = (gapFrequencies[rounded] || 0) + 1;
    });
    topGaps = Object.entries(gapFrequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => parseFloat(entry[0]));

    // Identificar top 3 de desvios padrão
    const stdFrequencies: Record<string, number> = {};
    stdDevs.forEach(std => {
      const rounded = std.toFixed(1);
      stdFrequencies[rounded] = (stdFrequencies[rounded] || 0) + 1;
    });
    topStds = Object.entries(stdFrequencies)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(entry => parseFloat(entry[0]));
    
    // Atualizar cache
    statCache = {
      timestamp: now,
      topGaps,
      topStds
    };
    if (DEBUG) {
      console.log('[DEBUG] Estatísticas calculadas e armazenadas em cache');
      console.log(`[DEBUG] Top 3 gaps: [${topGaps.join(', ')}]`);
      console.log(`[DEBUG] Top 3 stds: [${topStds.join(', ')}]`);
    }
  }

  for (let tentativa = 0; tentativa < maxTentativas; tentativa++) {
    const colunasEscolhidas = selectColumns(colunasDisponiveis, maxColunasPerGame);
    if (colunasEscolhidas) {
      const jogoFinal: number[] = [];
      for (let linha = 0; linha < 3; linha++) {
        for (let coluna = 0; coluna < COLUMNS_PER_GAME; coluna++) {
          jogoFinal.push(colunasEscolhidas[coluna].numeros[linha]);
        }
      }
      const jogoFinalOrdenado = [...jogoFinal].sort((a, b) => a - b);
      if (jogoFinalOrdenado.length === GAME_SIZE && new Set(jogoFinalOrdenado).size === GAME_SIZE) {
        // Etapa 2: Validar distribuição com cache
        const avgGap = calculateAvgGap(jogoFinalOrdenado);
        const stdDev = calculateStd(jogoFinalOrdenado);
        const roundedGap = parseFloat(avgGap.toFixed(1));
        const roundedStd = parseFloat(stdDev.toFixed(1));

        const gapValid = topGaps.includes(roundedGap);
        const stdValid = topStds.includes(roundedStd);

        if (gapValid && stdValid) {
          if (DEBUG) {
            console.log(`[DEBUG] SUCESSO na tentativa ${tentativa + 1}`);
            const jogosDoadores = Array.from(new Set(colunasEscolhidas.map(c => c.jogoIndex + 1)));
            console.log(`[DEBUG] Jogos doadores utilizados: ${jogosDoadores.join(', ')}`);
            colunasEscolhidas.forEach((coluna, index) => {
              console.log(`[DEBUG] Coluna ${index + 1} extraída do jogo #${coluna.jogoIndex + 1}, coluna ${coluna.colunaIndex + 1}: [${coluna.numeros.map(n => n.toString().padStart(2, '0')).join(', ')}]`);
            });
            colunasEscolhidas.forEach((coluna, index) => {
              const jogoDoador = historicoConcursos[coluna.jogoIndex];
              const colunaOriginal = extrairColuna(jogoDoador, coluna.colunaIndex);
              if (colunaOriginal.join(',') !== coluna.numeros.join(',')) {
                console.warn(`[DEBUG] AVISO: Coluna extraída não corresponde ao jogo #${coluna.jogoIndex + 1}`);
              }
            });
            console.log(`[DEBUG] Jogo Final Ordenado: [${jogoFinalOrdenado.map(n => n.toString().padStart(2, '0')).join(', ')}]`);
            console.log(`[DEBUG] Gap médio: ${roundedGap} (Top 3: ${topGaps.join(', ')})`);
            console.log(`[DEBUG] Desvio padrão: ${roundedStd} (Top 3: ${topStds.join(', ')})`);
          }
          return jogoFinalOrdenado;
        } else {
          if (DEBUG && tentativa % 100 === 0) {
            console.log(`[DEBUG] Tentativa ${tentativa}: Jogo gerado não atendeu aos critérios estatísticos. Gap: ${roundedGap}, Std: ${roundedStd}`);
          }
        }
      }
    }
  }

  if (DEBUG) console.warn(`[DEBUG] Falha após ${maxTentativas} tentativas`);
  return null;
}