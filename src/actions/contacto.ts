'use server';

import { redirect } from 'next/navigation';

import { BRAND } from '@/lib/config';
import { esEmailValido, texto, type ActionState } from '@/lib/form';
import { enviarEmail } from '@/lib/mail';

/** Formulario de contacto: valida y reenvía el mensaje al correo del salón. */
export async function contactoAction(
  _estado: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const nombre = texto(formData, 'nombre');
  const email = texto(formData, 'email').toLowerCase();
  const telefono = texto(formData, 'telefono');
  const asunto = texto(formData, 'asunto') || 'Contacto desde el sitio web';
  const mensaje = texto(formData, 'mensaje');

  const errores: Record<string, string> = {};
  if (!nombre) errores.nombre = 'Ingresa tu nombre.';
  if (!esEmailValido(email)) errores.email = 'Ingresa un correo electrónico válido.';
  if (!mensaje) errores.mensaje = 'Cuéntanos en qué te podemos ayudar.';

  if (Object.keys(errores).length > 0) {
    return { ok: false, mensaje: 'Por favor completa nombre, correo y mensaje.', errores };
  }

  await enviarEmail({
    to: BRAND.emailContacto,
    subject: `[Contacto web] ${asunto}`,
    html: `
      <h2>Nuevo mensaje desde el sitio web</h2>
      <p><strong>Nombre:</strong> ${nombre}</p>
      <p><strong>Correo:</strong> ${email}</p>
      <p><strong>Teléfono:</strong> ${telefono || 'No indicado'}</p>
      <p><strong>Asunto:</strong> ${asunto}</p>
      <p><strong>Mensaje:</strong></p>
      <p>${mensaje.replace(/\n/g, '<br>')}</p>
    `,
    text: `Contacto web\nNombre: ${nombre}\nCorreo: ${email}\nTeléfono: ${telefono}\nAsunto: ${asunto}\n\n${mensaje}`,
  });

  redirect('/contacto?msg=contacto-ok');
}
