// src/app/actions.ts
'use server';

import { redirect } from 'next/navigation';
import { createAuthToken } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { compare } from 'bcryptjs';
import { cookies } from 'next/headers';

export async function login(prevState: any, formData: FormData) {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user || !(await compare(password, user.password))) {
    return { error: 'Email ou senha inválidos' };
  }

  // Criar token JWT
  const token = createAuthToken(user.id);
  
  // Definir cookie
  cookies().set("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 dias
  });

  // Disparar evento para atualizar componentes
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('authChange'));
  }

  redirect('/dashboard');
}

export async function logout() {
  // Limpar cookie
  cookies().delete("token");

  // Disparar evento para atualizar componentes
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('authChange'));
  }

  redirect('/');
}