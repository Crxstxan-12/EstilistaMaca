'use server';

import { createHash, randomBytes } from 'node:crypto';

import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import {
  cerrarSesion,
  crearSesion,
  hashearPassword,
  nombreCompleto,
  obtenerUsuarioActual,
  verificarPassword,
} from '@/lib/auth';
import { BRAND, RATE_LIMITS, SITE_URL } from '@/lib/config';
import {
  esEmailValido,
  texto,
  validarPassword,
  type ActionState,
} from '@/lib/form';
import { enviarEmail } from '@/lib/mail';
import { prisma } from '@/lib/prisma';
import {
  estaBloqueado,
  obtenerIP,
  registrarIntento,
  resetearIntentos,
} from '@/lib/rate-limit';
import { eliminarImagen, subirImagen } from '@/lib/upload';

const DIAS_VIGENCIA_TOKEN_RESET = 1;

function minutosBloqueo(): number {
  return Math.floor(RATE_LIMITS.loginVentanaSegundos / 60);
}

function destinoSeguro(next: string): string {
  return next.startsWith('/') && !next.startsWith('//') ? next : '/';
}

/** Crea la sesión (cookie firmada) tras validar credenciales. */
export async function loginAction(
  _estado: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = texto(formData, 'email').toLowerCase();
  const password = String(formData.get('password') ?? '');
  const next = texto(formData, 'next');

  if (!email || !password) {
    return { ok: false, mensaje: 'Ingresa tu correo y tu contraseña.' };
  }

  const ip = obtenerIP(await headers());
  const clave = `login:${ip}`;

  if (await estaBloqueado(clave, RATE_LIMITS.loginMaxIntentos)) {
    return {
      ok: false,
      mensaje: `Demasiados intentos fallidos. Tu acceso está bloqueado por ${minutosBloqueo()} minutos. Inténtalo más tarde o recupera tu contraseña.`,
    };
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  const credencialValida =
    usuario && usuario.isActive
      ? await verificarPassword(password, usuario.passwordHash)
      : false;

  if (!usuario || !credencialValida) {
    const intentos = await registrarIntento(clave, RATE_LIMITS.loginVentanaSegundos);
    const restantes = Math.max(0, RATE_LIMITS.loginMaxIntentos - intentos);
    if (restantes <= 0) {
      return {
        ok: false,
        mensaje: `Demasiados intentos fallidos. Tu acceso está bloqueado por ${minutosBloqueo()} minutos. Inténtalo más tarde o recupera tu contraseña.`,
      };
    }
    return {
      ok: false,
      mensaje: `Correo o contraseña incorrectos. Te quedan ${restantes} intentos antes de bloquear el acceso.`,
    };
  }

  await resetearIntentos(clave);
  await prisma.usuario.update({
    where: { id: usuario.id },
    data: { lastLogin: new Date() },
  });

  await crearSesion(usuario);

  redirect(destinoSeguro(next));
}

export async function registroAction(
  _estado: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const firstName = texto(formData, 'firstName');
  const lastName = texto(formData, 'lastName');
  const email = texto(formData, 'email').toLowerCase();
  const telefono = texto(formData, 'telefono');
  const password = String(formData.get('password') ?? '');
  const password2 = String(formData.get('password2') ?? '');

  const errores: Record<string, string> = {};
  if (!firstName) errores.firstName = 'Ingresa tu nombre.';
  if (!lastName) errores.lastName = 'Ingresa tu apellido.';
  if (!esEmailValido(email)) errores.email = 'Ingresa un correo electrónico válido.';
  const errorPassword = validarPassword(password);
  if (errorPassword) errores.password = errorPassword;
  if (password !== password2) errores.password2 = 'Las contraseñas no coinciden.';

  if (Object.keys(errores).length > 0) {
    return { ok: false, mensaje: 'Revisa los campos marcados.', errores };
  }

  const existente = await prisma.usuario.findUnique({ where: { email } });
  if (existente) {
    return {
      ok: false,
      mensaje: 'No pudimos crear la cuenta.',
      errores: { email: 'Este correo ya se encuentra registrado.' },
    };
  }

  const usuario = await prisma.usuario.create({
    data: {
      email,
      passwordHash: await hashearPassword(password),
      firstName,
      lastName,
      telefono,
      rol: 'CLIENTE',
      cliente: {
        create: { nombre: firstName, apellido: lastName, email, telefono },
      },
    },
  });

  await crearSesion(usuario);
  redirect('/?msg=registro-ok');
}

export async function cerrarSesionAction(): Promise<void> {
  await cerrarSesion();
  redirect('/?msg=sesion-cerrada');
}

export async function actualizarPerfilAction(
  _estado: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) redirect('/usuarios/login?next=/usuarios/perfil');

  const firstName = texto(formData, 'firstName');
  const lastName = texto(formData, 'lastName');
  const telefono = texto(formData, 'telefono');
  const fechaNacimientoTexto = texto(formData, 'fechaNacimiento');
  const foto = formData.get('fotoPerfil');

  const errores: Record<string, string> = {};
  if (!firstName) errores.firstName = 'Ingresa tu nombre.';
  if (!lastName) errores.lastName = 'Ingresa tu apellido.';

  let fechaNacimiento: Date | null = null;
  if (fechaNacimientoTexto) {
    const [anio, mes, dia] = fechaNacimientoTexto.split('-').map(Number);
    if (!anio || !mes || !dia) {
      errores.fechaNacimiento = 'Ingresa una fecha válida.';
    } else {
      fechaNacimiento = new Date(Date.UTC(anio, mes - 1, dia));
    }
  }

  if (Object.keys(errores).length > 0) {
    return { ok: false, mensaje: 'Revisa los campos marcados.', errores };
  }

  const nuevaFoto = await subirImagen(foto, 'perfiles');
  if (nuevaFoto && usuario.fotoPerfil) {
    await eliminarImagen(usuario.fotoPerfil);
  }

  await prisma.usuario.update({
    where: { id: usuario.id },
    data: {
      firstName,
      lastName,
      telefono,
      fechaNacimiento,
      ...(nuevaFoto ? { fotoPerfil: nuevaFoto } : {}),
    },
  });

  await prisma.cliente.updateMany({
    where: { usuarioId: usuario.id },
    data: { nombre: firstName, apellido: lastName, telefono },
  });

  redirect('/usuarios/perfil?msg=datos-actualizados');
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}

/**
 * Solicita el restablecimiento de contraseña.
 * Siempre responde igual para no revelar si el correo existe.
 */
export async function solicitarResetAction(
  _estado: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const email = texto(formData, 'email').toLowerCase();
  if (!esEmailValido(email)) {
    return {
      ok: false,
      mensaje: 'Ingresa un correo válido.',
      errores: { email: 'Ingresa un correo electrónico válido.' },
    };
  }

  const usuario = await prisma.usuario.findUnique({ where: { email } });
  if (usuario && usuario.isActive) {
    const token = randomBytes(32).toString('hex');
    const expiraEn = new Date(Date.now() + DIAS_VIGENCIA_TOKEN_RESET * 24 * 60 * 60 * 1000);

    await prisma.passwordResetToken.create({
      data: { usuarioId: usuario.id, tokenHash: hashToken(token), expiraEn },
    });

    const enlace = `${SITE_URL}/usuarios/reset/${token}`;
    await enviarEmail({
      to: usuario.email,
      subject: `Restablece tu contraseña · ${BRAND.nombre}`,
      html: `
        <p>Hola ${nombreCompleto(usuario)},</p>
        <p>Recibimos una solicitud para restablecer la contraseña de tu cuenta en ${BRAND.nombre}.</p>
        <p><a href="${enlace}">Haz clic aquí para crear una nueva contraseña</a></p>
        <p>Si el enlace no funciona, cópialo en tu navegador:<br>${enlace}</p>
        <p>Si no solicitaste este cambio, ignora este mensaje.</p>
        <p>Saludos,<br>${BRAND.nombre} · ${BRAND.subtitulo}</p>
      `,
      text: `Restablece tu contraseña: ${enlace}`,
    });
  }

  redirect('/usuarios/password-reset/done');
}

export async function confirmarResetAction(
  _estado: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const token = texto(formData, 'token');
  const password = String(formData.get('password') ?? '');
  const password2 = String(formData.get('password2') ?? '');

  const errorPassword = validarPassword(password);
  if (errorPassword) {
    return { ok: false, mensaje: errorPassword, errores: { password: errorPassword } };
  }
  if (password !== password2) {
    return {
      ok: false,
      mensaje: 'Las contraseñas no coinciden.',
      errores: { password2: 'Las contraseñas no coinciden.' },
    };
  }

  const registro = await prisma.passwordResetToken.findUnique({
    where: { tokenHash: hashToken(token) },
  });

  if (!registro || registro.usadoEn || registro.expiraEn.getTime() < Date.now()) {
    redirect('/usuarios/reset/done?error=El enlace no es válido o ya expiró. Solicita uno nuevo.');
  }

  await prisma.$transaction([
    prisma.usuario.update({
      where: { id: registro.usuarioId },
      data: { passwordHash: await hashearPassword(password) },
    }),
    prisma.passwordResetToken.update({
      where: { id: registro.id },
      data: { usadoEn: new Date() },
    }),
  ]);

  redirect('/usuarios/reset/done?msg=password-actualizada');
}


