// src/app/api/login/route.ts

// ======================================================================
// IMPORTS
// ======================================================================
import { NextResponse, NextRequest } from 'next/server';
import { compare } from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '@/lib/prisma';

// ======================================================================
// FUNÇÕES AUXILIARES
// ======================================================================

// Criar respostas de erro padronizadas
const createErrorResponse = (message: string, code: string, status: number) => {
  return NextResponse.json({ error: { code, message } }, { status });
};

// ======================================================================
// HANDLER DA ROTA (POST)
// ======================================================================
export async function POST(req: NextRequest) {
  try {
    // Processamento do corpo da requisição
    const body = await req.json();
    const email = body.email?.trim().toLowerCase() || '';
    const password = body.password || '';

    // ==================================================================
    // VALIDAÇÃO DE ENTRADA
    // ==================================================================
    if (!email) {
      return createErrorResponse("O campo 'email' é obrigatório.", 'MISSING_EMAIL', 400);
    }
    if (!password) {
      return createErrorResponse("O campo 'senha' é obrigatório.", 'MISSING_PASSWORD', 400);
    }

    // ==================================================================
    // BUSCA DE USUÁRIO
    // ==================================================================
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, hashedPassword: true, name: true },
    });

    // Mensagem genérica por segurança
    if (!user) {
      return createErrorResponse('E-mail ou senha inválidos.', 'INVALID_CREDENTIALS', 401);
    }

    // ==================================================================
    // VERIFICAÇÃO DE SENHA
    // ==================================================================
    const isMatch = await compare(password, user.hashedPassword);
    if (!isMatch) {
      return createErrorResponse('E-mail ou senha inválidos.', 'INVALID_CREDENTIALS', 401);
    }

    // ==================================================================
    // GERAÇÃO DE TOKEN
    // ==================================================================
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      console.error('⚠️ [Erro Crítico] JWT_SECRET não definida');
      return createErrorResponse('Erro de configuração no servidor.', 'JWT_SECRET_NOT_FOUND', 500);
    }

    const token = jwt.sign(
      { userId: user.id }, // Payload padronizado
      jwtSecret,
      { expiresIn: '7d' }
    );

    // ==================================================================
    // CONFIGURAÇÃO DE COOKIE
    // ==================================================================
    const isProduction = process.env.NODE_ENV === 'production';
    const res = NextResponse.json({ 
      message: 'Login bem-sucedido!', 
      success: true,
      user: { id: user.id, email: user.email, name: user.name } 
    });

    res.cookies.set({
      name: 'token',
      value: token,
      httpOnly: true,
      secure: isProduction,
      path: '/',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;

  } catch (err: any) {
    // ==================================================================
    // TRATAMENTO DE ERROS
    // ==================================================================
    console.error('❌ Erro inesperado em /api/login:', err);
    
    if (err instanceof SyntaxError) {
      return createErrorResponse('Corpo da requisição inválido.', 'INVALID_JSON', 400);
    }

    return createErrorResponse('Erro interno no servidor.', 'INTERNAL_SERVER_ERROR', 500);
  }
}