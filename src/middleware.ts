// ======================================================================
// ARQUIVO: src/middleware.ts
// DESCRIÇÃO: Captura IP e ID do Usuário via JWT para rastreio em RAM.
// ======================================================================

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose'; // Biblioteca padrão para Edge Runtime

export async function middleware(request: NextRequest) {
  // 1. Identificação do IP
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0] || request.ip || '127.0.0.1';
  
  // 2. Extração do ID do Usuário via JWT (H5: Segurança)
  const token = request.cookies.get('token')?.value;
  let userId: number | null = null;

  if (token && process.env.JWT_SECRET) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      const { payload } = await jose.jwtVerify(token, secret);
      if (payload.userId) userId = Number(payload.userId);
    } catch (e) {
      // Token inválido ou expirado: usuário será tratado como Visitante
    }
  }

  // 3. Persistência em RAM via API Interna (Porta 3003 da VPS Debian)
  const logUrl = 'http://127.0.0.1:3003/api/internal/log';

  fetch(logUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ip, userId }), // Agora envia o ID real ou null
  }).catch(() => {});

  return NextResponse.next();
}

/**
 * Matcher: Monitora páginas, ignora estáticos e APIs de sistema.
 */
export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|logo1.png).*)'],
};