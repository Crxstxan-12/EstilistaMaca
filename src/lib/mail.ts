import 'server-only';

import nodemailer, { type Transporter } from 'nodemailer';

import { BRAND } from './config';

let transporter: Transporter | null = null;

function obtenerTransporter(): Transporter | null {
  const host = process.env.EMAIL_SERVER_HOST;
  if (!host) return null;
  if (!transporter) {
    transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.EMAIL_SERVER_PORT ?? 587),
      secure: Number(process.env.EMAIL_SERVER_PORT ?? 587) === 465,
      auth: process.env.EMAIL_SERVER_USER
        ? {
            user: process.env.EMAIL_SERVER_USER,
            pass: process.env.EMAIL_SERVER_PASSWORD ?? '',
          }
        : undefined,
    });
  }
  return transporter;
}

export type EmailPayload = {
  to: string;
  subject: string;
  html: string;
  text?: string;
};

/**
 * Envía un correo transaccional.
 * Si no hay servidor SMTP configurado, imprime el contenido en consola (modo desarrollo).
 */
export async function enviarEmail({ to, subject, html, text }: EmailPayload): Promise<boolean> {
  const transporte = obtenerTransporter();
  if (!transporte) {
    console.info(
      `[email:consola] Para: ${to} | Asunto: ${subject}\n${text ?? html.replace(/<[^>]+>/g, ' ')}`,
    );
    return false;
  }
  await transporte.sendMail({
    from: BRAND.emailRemitente,
    to,
    subject,
    html,
    text: text ?? html.replace(/<[^>]+>/g, ' '),
  });
  return true;
}
