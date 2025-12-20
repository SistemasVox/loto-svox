// ===========================================
// src/lib/mailer.ts
// ===========================================
import nodemailer from "nodemailer";

const host = process.env.MAIL_HOST;
const port = process.env.MAIL_PORT ? parseInt(process.env.MAIL_PORT) : undefined;
const user = process.env.MAIL_USER;
const pass = process.env.MAIL_PASS;
const fromEmail = process.env.MAIL_FROM; // e.g., "noreply@seudominio.com"

if (!host || !port || !user || !pass || !fromEmail) {
  console.warn("Mailer não está totalmente configurado. E-mails de reset serão logados no console.");
}

export async function sendResetPasswordEmail(to: string, resetUrl: string) {
  if (host && port && user && pass && fromEmail) {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure: port === 465, // true para 465, false para outros
      auth: { user, pass },
    });

    const info = await transporter.sendMail({
      from: fromEmail,
      to,
      subject: "Redefinição de senha - VOXStrategies",
      html: `
        <p>Você solicitou redefinir sua senha. Clique no link abaixo para criar uma nova senha:</p>
        <p><a href="${resetUrl}">Redefinir senha</a></p>
        <p>Se não foi você, ignore este e-mail.</p>
      `,
    });
    console.log("Reset password email sent:", info.messageId);
  } else {
    console.log(`[DEV] Reset password link para ${to}: ${resetUrl}`);
  }
}
// ===========================================
// FIM de src/lib/mailer.ts
// ===========================================
