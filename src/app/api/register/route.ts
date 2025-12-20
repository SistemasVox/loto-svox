// ===========================================
// src/app/api/register/route.ts (Versão Refinada)
// ===========================================
import { NextResponse, NextRequest } from "next/server";
import bcryptjs from "bcryptjs";
import { prisma } from "@/lib/prisma";

// Reutilizando a função auxiliar para padronizar as respostas de erro
const createErrorResponse = (message: string, code: string, status: number) => {
  return NextResponse.json({ error: { code, message } }, { status });
};

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { fullName, email, password } = body;

    // MELHORIA: Validações granulares com mensagens específicas para cada campo.
    if (!fullName || fullName.trim().length < 2) {
      return createErrorResponse("Por favor, informe um nome completo válido (mínimo 2 caracteres).", "INVALID_FULLNAME", 400);
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return createErrorResponse("Por favor, informe um endereço de e-mail válido.", "INVALID_EMAIL", 400);
    }
    if (!password) {
        return createErrorResponse("O campo 'senha' é obrigatório.", "MISSING_PASSWORD", 400);
    }
    if (password.length < 6) {
      return createErrorResponse("A senha deve conter no mínimo 6 caracteres.", "PASSWORD_TOO_SHORT", 400);
    }

    const userExists = await prisma.user.findUnique({
      where: { email: email },
    });

    if (userExists) {
      return createErrorResponse("Este e-mail já está em uso. Por favor, tente outro.", "EMAIL_ALREADY_EXISTS", 409);
    }

    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const newUser = await prisma.user.create({
      data: {
        email: email,
        hashedPassword: hashedPassword,
        name: fullName,
      },
    });

    return NextResponse.json(
      { message: "Usuário criado com sucesso!", userId: newUser.id },
      { status: 201 }
    );

  } catch (error: any) {
    // MELHORIA: Tratamento de erro mais robusto.
    console.error("❌ Erro inesperado em /api/register:", error);
    
    if (error instanceof SyntaxError) {
      return createErrorResponse('O corpo da requisição não é um JSON válido.', 'INVALID_JSON', 400);
    }
    
    return createErrorResponse("Não foi possível processar seu cadastro. Tente novamente mais tarde.", "INTERNAL_SERVER_ERROR", 500);
  }
}