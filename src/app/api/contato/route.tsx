// src/app/api/contact/route.ts
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { render } from '@react-email/render';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

// Importe o modelo de email - vamos criar isso a seguir
import { ContactEmail } from '@/emails/contact-email';

// Armazenamento de captchas em memória (em produção, use Redis ou DB)
const captchaStore = new Map<string, string>();

// Configuração do transportador de email
const transporter = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

// Função para validar o formulário
function validateForm(data: any): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  
  // Validação do nome
  if (!data.name || data.name.trim().length < 2) {
    errors.name = "Nome precisa ter pelo menos 2 caracteres";
  } else if (data.name.length > 100) {
    errors.name = "Nome não pode exceder 100 caracteres";
  }
  
  // Validação do email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!data.email || !emailRegex.test(data.email)) {
    errors.email = "Email inválido";
  }
  
  // Validação da mensagem
  if (!data.message || data.message.trim().length < 10) {
    errors.message = "Mensagem precisa ter pelo menos 10 caracteres";
  } else if (data.message.length > 1000) {
    errors.message = "Mensagem não pode exceder 1000 caracteres";
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

// Função para gerar IDs de captcha
function generateCaptchaId(): string {
  return crypto.randomBytes(16).toString('hex');
}

// Função para gerar resposta de captcha
function generateCaptchaAnswer(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Endpoint GET para gerar novo captcha
export async function GET() {
  try {
    const captchaId = generateCaptchaId();
    const captchaAnswer = generateCaptchaAnswer();
    
    // Armazena a resposta correta
    captchaStore.set(captchaId, captchaAnswer);
    
    // Gera a imagem do captcha (em produção, use uma biblioteca como canvas)
    // Para simplificar, retornaremos a resposta em texto
    return NextResponse.json({ 
      id: captchaId,
      answer: captchaAnswer, // Em produção, substitua por uma imagem gerada
      expiresAt: Date.now() + 300000 // Expira em 5 minutos
    });
    
  } catch (error) {
    console.error('Erro ao gerar CAPTCHA:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Endpoint POST para validar captcha
export async function POST(request: NextRequest) {
  try {
    const { id, answer } = await request.json();
    
    if (!id || !answer) {
      return NextResponse.json(
        { valid: false, error: 'Dados incompletos' },
        { status: 400 }
      );
    }
    
    const storedAnswer = captchaStore.get(id);
    const isValid = storedAnswer === answer.toUpperCase();
    
    // Remove o captcha após validação
    if (storedAnswer) captchaStore.delete(id);
    
    return NextResponse.json({ valid: isValid });
    
  } catch (error) {
    console.error('Erro ao validar CAPTCHA:', error);
    return NextResponse.json(
      { valid: false, error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Endpoint principal para envio do formulário de contato
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json();
    
    // 1. Verificação de honeypot
    if (data.website) {
      console.log('Tentativa de spam detectada (honeypot)');
      return NextResponse.json(
        { success: false, message: 'Requisição inválida' },
        { status: 400 }
      );
    }
    
    // 2. Verificação de tempo de preenchimento
    const elapsedTime = Date.now() - data.startTime;
    if (elapsedTime < 3000) {
      console.log('Preenchimento muito rápido (spam?)', elapsedTime);
      return NextResponse.json(
        { success: false, message: 'Por favor, preencha o formulário com cuidado' },
        { status: 400 }
      );
    }
    
    // 3. Validação do formulário
    const { isValid, errors } = validateForm(data);
    if (!isValid) {
      return NextResponse.json(
        { success: false, errors },
        { status: 400 }
      );
    }
    
    // 4. Validação do captcha
    const storedAnswer = captchaStore.get(data.captchaId);
    if (!storedAnswer || storedAnswer !== data.captchaAnswer.toUpperCase()) {
      return NextResponse.json(
        { success: false, message: 'CAPTCHA inválido ou expirado' },
        { status: 400 }
      );
    }
    
    // Remove o captcha após uso
    captchaStore.delete(data.captchaId);
    
    // 5. Envio do email
    const emailHtml = render(
      <ContactEmail 
        name={data.name}
        email={data.email}
        message={data.message}
      />
    );
    
    await transporter.sendMail({
      from: `"Formulário de Contato" <${process.env.EMAIL_USER}>`,
      to: process.env.CONTACT_EMAIL,
      subject: `Nova mensagem de ${data.name}`,
      html: emailHtml,
    });
    
    // 6. Resposta de sucesso
    return NextResponse.json({
      success: true,
      message: 'Mensagem enviada com sucesso!'
    });
    
  } catch (error) {
    console.error('Erro ao processar formulário:', error);
    return NextResponse.json(
      { success: false, message: 'Erro ao enviar mensagem' },
      { status: 500 }
    );
  }
}