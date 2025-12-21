// ======================================================================
// ARQUIVO: src/middleware.ts
// DESCRIÇÃO: Captura tráfego (IP/User) e despacha para logging assíncrono.
// ======================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose'; // Compatível com Edge Runtime

export async function middleware(request: NextRequest) {
  // 1. Captura de IP (Resiliência para Proxy/Cloudflare)
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.ip || '127.0.0.1';
  
  // 2. Extração de Identidade (H5: Segurança)
  const token = request.cookies.get('token')?.value;
  let userId: number | null = null;

  if (token && process.env.JWT_SECRET) {
    try {
      // No Middleware, a validação de segredo exige TextEncoder
      const segredo = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, segredo);
      
      if (payload.userId) {
        userId = Number(payload.userId);
      }
    } catch (erro) {
      // Falha silenciosa: Se o token for inválido, o utilizador é logado como Visitante
    }
  }

  // 3. Persistência de Tráfego (H5: Não-bloqueante)
  // Enviamos para uma rota interna que grava na tabela 'Traffic' do dev.db
  const urlInternaLog = 'http://127.0.0.1:3003/api/internal/log';

  fetch(urlInternaLog, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip, userId }),
  }).catch(() => {
    // Resiliência: Uma falha no log de tráfego nunca deve impedir o acesso do utilizador
  });

  return NextResponse.next();
}

/**
 * Configuração do Matcher: 
 * Monitoriza páginas e rotas principais, ignorando ficheiros estáticos e assets.
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo1.png).*)'],
};