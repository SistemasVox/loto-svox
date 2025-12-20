// src/app/api/resultados/route.ts - Versão otimizada para SQLite
import { NextResponse } from "next/server"
import { loteriaPrisma } from "@/lib/loteriaPrisma"

// Cache em memória com timestamp por tipo de query
interface CacheEntry {
  data: any;
  timestamp: number;
}

const cache = new Map<string, CacheEntry>();
const CACHE_DURATION = 1000 * 60 * 60; // 1 hora

function getCacheKey(searchParams: URLSearchParams): string {
  const params = Array.from(searchParams.entries()).sort();
  return params.length > 0 ? JSON.stringify(params) : 'all';
}

function isValidCache(entry: CacheEntry | undefined): boolean {
  if (!entry) return false;
  return (Date.now() - entry.timestamp) < CACHE_DURATION;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const cacheKey = getCacheKey(searchParams);
  
  // Verificar cache primeiro
  const cachedEntry = cache.get(cacheKey);
  if (isValidCache(cachedEntry)) {
    console.log(`>>> [API] Cache HIT para ${cacheKey}: ${cachedEntry!.data.length} registros`);
    return NextResponse.json(cachedEntry!.data);
  }

  const hasRangeParams = searchParams.has("start") && searchParams.has("end")
  const hasPaginationParams = searchParams.has("page") || searchParams.has("limit")

  // CASO 1: Todos os resultados
  if (!hasRangeParams && !hasPaginationParams) {
    try {
      console.log(">>> [API] Buscando todos os resultados (SQLite)...");
      const startTime = Date.now();
      
      // Query otimizada para SQLite
      const resultados = await loteriaPrisma.loto.findMany({
        orderBy: { concurso: "asc" },
        select: {
          data_concurso: true,
          concurso: true,
          dezenas: true
        }
      });
      
      const endTime = Date.now();
      console.log(`>>> [API] Total: ${resultados.length} em ${endTime - startTime}ms`);
      
      // Salvar no cache
      cache.set(cacheKey, {
        data: resultados,
        timestamp: Date.now()
      });
      
      return NextResponse.json(resultados);
    } catch (err) {
      console.error(">>> [API] ERRO ao buscar todos os resultados:", err);
      return NextResponse.json(
        { error: "Falha ao buscar todos os resultados." },
        { status: 500 }
      );
    }
  }

  // CASO 2: Intervalo
  if (hasRangeParams) {
    const start = parseInt(searchParams.get("start") || "", 10)
    const end = parseInt(searchParams.get("end") || "", 10)

    if (!isNaN(start) && !isNaN(end)) {
      try {
        console.log(`>>> [API] Buscando intervalo ${start}-${end}...`);
        const startTime = Date.now();
        
        const resultados = await loteriaPrisma.loto.findMany({
          where: { 
            concurso: { 
              gte: start, 
              lte: end 
            } 
          },
          orderBy: { concurso: "asc" },
          select: {
            data_concurso: true,
            concurso: true,
            dezenas: true
          }
        });
        
        const endTime = Date.now();
        console.log(`>>> [API] Intervalo ${start}-${end}: ${resultados.length} em ${endTime - startTime}ms`);
        
        // Salvar no cache
        cache.set(cacheKey, {
          data: resultados,
          timestamp: Date.now()
        });
        
        return NextResponse.json(resultados);
      } catch (err) {
        console.error(">>> [API] ERRO no intervalo:", err);
        return NextResponse.json(
          { error: "Falha ao buscar intervalo de resultados." },
          { status: 500 }
        );
      }
    }
  }

  // CASO 3: Paginação
  const page = parseInt(searchParams.get("page") || "1", 10)
  const limit = parseInt(searchParams.get("limit") || "20", 10)
  const skip = (page - 1) * limit

  try {
    console.log(`>>> [API] Página ${page}, limite ${limit}...`);
    const startTime = Date.now();
    
    const resultados = await loteriaPrisma.loto.findMany({
      orderBy: { concurso: "desc" },
      skip,
      take: limit,
      select: {
        data_concurso: true,
        concurso: true,
        dezenas: true
      }
    })
    
    const endTime = Date.now();
    console.log(`>>> [API] Página ${page}: ${resultados.length} em ${endTime - startTime}ms`);
    
    // Salvar no cache
    cache.set(cacheKey, {
      data: resultados,
      timestamp: Date.now()
    });
    
    return NextResponse.json(resultados)
  } catch (err) {
    console.error(">>> [API] ERRO na paginação:", err)
    return NextResponse.json(
      { error: "Erro ao buscar resultados." },
      { status: 500 }
    )
  }
}