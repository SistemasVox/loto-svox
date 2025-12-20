// src/app/api/captcha/route.ts
import { NextResponse } from "next/server";
import { createCanvas } from "canvas";
import { createHmac, randomBytes } from "crypto";

// =============================================
// CONFIGURAÇÃO SECRETA (defina em env var)
// =============================================
const SECRET = process.env.CAPTCHA_SECRET || "sua_chave_secreta_aqui";

// =============================================
// GERADOR DE STRINGS E CORES
// =============================================
function randomString(len = 5) {
  // Caracteres que não causam confusão (removidos: I, l, 1, O, 0, etc.)
  const chars = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let s = "";
  for (let i = 0; i < len; i++) {
    s += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return s;
}

function randomColor() {
  const hex = "0123456789ABCDEF";
  let c = "#";
  for (let i = 0; i < 6; i++) {
    c += hex[Math.floor(Math.random() * 16)];
  }
  return c;
}

// =============================================
// GERA TOKEN HMAC E TEXTO (CORRIGIDO)
// =============================================
function generateToken(text: string, timestamp: number) {
  const payload = `${text}:${timestamp}`;
  const sig = createHmac("sha256", SECRET).update(payload).digest("hex");
  return Buffer.from(`${payload}:${sig}`).toString("base64");
}

function verifyToken(token: string) {
  try {
    const decoded = Buffer.from(token, "base64").toString();
    const parts = decoded.split(":");
    if (parts.length < 3) {
      return { valid: false, text: null };
    }
    
    // As primeiras partes são o payload (texto e timestamp)
    const text = parts[0];
    const ts = parts[1];
    // A assinatura é a última parte
    const sig = parts.slice(2).join(":");
    
    const payload = `${text}:${ts}`;
    const expectedSig = createHmac("sha256", SECRET)
      .update(payload)
      .digest("hex");
    
    // Valida timestamp
    const age = Date.now() - Number(ts);
    if (isNaN(age)) {
      return { valid: false, text: null };
    }

    if (sig !== expectedSig || age > 5 * 60 * 1000) { // expira em 5 minutos
      return { valid: false, text: null };
    }
    return { valid: true, text };
  } catch {
    return { valid: false, text: null };
  }
}

// =============================================
// GET → gera imagem + token
// =============================================
export async function GET() {
  // 1) texto + token
  const text = randomString(5);
  const timestamp = Date.now();
  const token = generateToken(text, timestamp);

  // 2) cria canvas
  const width = 160;
  const height = 60;
  const fontSize = 32;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // fundo degradê
  const grad = ctx.createLinearGradient(0, 0, width, 0);
  grad.addColorStop(0, randomColor());
  grad.addColorStop(1, randomColor());
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // ruído de linhas
  for (let i = 0; i < 5; i++) {
    ctx.strokeStyle = randomColor();
    ctx.beginPath();
    ctx.moveTo(Math.random() * width, Math.random() * height);
    ctx.lineTo(Math.random() * width, Math.random() * height);
    ctx.stroke();
  }

  // desenha caracteres
  ctx.font = `${fontSize}px Arial`;
  const charWidth = width / text.length;
  text.split("").forEach((ch, i) => {
    const x = i * charWidth + charWidth * 0.2;
    const y = height / 2 + fontSize / 3;
    ctx.fillStyle = randomColor();
    const angle = (Math.random() - 0.5) * 0.4;
    ctx.save();
    ctx.translate(x + fontSize / 2, y);
    ctx.rotate(angle);
    ctx.fillText(ch, -fontSize / 2, 0);
    ctx.restore();
  });

  const buffer = canvas.toBuffer("image/png");
  const image = "data:image/png;base64," + buffer.toString("base64");

  return NextResponse.json({ image, token });
}

// =============================================
// POST → valida token e texto (CORRIGIDO)
// =============================================
export async function POST(req: Request) {
  const { token, answer } = await req.json();
  
  // DEBUG: Log para ajudar no diagnóstico
  console.log("Token recebido:", token);
  console.log("Resposta recebida:", answer);
  
  const { valid, text } = verifyToken(token);
  
  // DEBUG: Log do resultado da verificação
  console.log("Resultado da verificação:", valid ? "válido" : "inválido", "Texto:", text);

  if (!valid || !text) {
    return NextResponse.json(
      { valid: false, message: "Captcha expirado ou inválido." },
      { status: 400 }
    );
  }

  // Comparação case-insensitive
  const normalizedText = text.toLowerCase();
  const normalizedAnswer = (answer || "").trim().toLowerCase();
  const isCorrect = normalizedText === normalizedAnswer;
  
  // DEBUG: Log da comparação
  console.log("Comparação CAPTCHA:", 
    `"${normalizedText}" vs "${normalizedAnswer}" => ${isCorrect}`);
  
  return NextResponse.json({ valid: isCorrect });
}