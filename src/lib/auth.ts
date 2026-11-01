import 'server-only';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';

import { prisma } from './prisma';
import { SESSION_COOKIE, SESSION_DURACION_SEGUNDOS } from './config';
import { firmarSesion, verificarSesion, type SesionPayload } from './session';
import type { Usuario } from '@prisma/client';

export type UsuarioSesion = Omit<Usuario, 'passwordHash'>;

/** Nombre completo del usuario (o su correo si no registró nombre). */
export function nombreCompleto(usuario: {
  firstName?: string | null;
  lastName?: string | null;
  email: string;
}): string {
  const partes = [usuario.firstName, usuario.lastName].filter(Boolean).join(' ').trim();
  return partes || usuario.email;
}

export function esAdmin(usuario: {
  rol: string;
  isStaff?: boolean;
  isSuperuser?: boolean;
} | null): boolean {
  if (!usuario) return false;
  return usuario.rol === 'ADMINISTRADOR' || !!usuario.isStaff || !!usuario.isSuperuser;
}

/** Hash de contraseña con bcrypt (12 rondas). */
export async function hashearPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verificarPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/** Datos mínimos necesarios para emitir la cookie de sesión. */
export type DatosSesion = Pick<
  Usuario,
  'id' | 'email' | 'firstName' | 'lastName' | 'rol'
>;

/** Escribe la cookie de sesión firmada. */
export async function crearSesion(usuario: DatosSesion): Promise<void> {
  const payload: SesionPayload = {
    sub: usuario.id,
    email: usuario.email,
    rol: usuario.rol,
    nombre: nombreCompleto(usuario),
  };
  const token = await firmarSesion(payload);
  const store = await cookies();
  store.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_DURACION_SEGUNDOS,
  });
}

export async function cerrarSesion(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** Lee el token de la cookie (sin tocar la base de datos). */
export async function leerPayloadSesion(): Promise<SesionPayload | null> {
  const store = await cookies();
  return verificarSesion(store.get(SESSION_COOKIE)?.value);
}

/** Usuario autenticado actual (o null). */
export async function obtenerUsuarioActual(): Promise<UsuarioSesion | null> {
  const payload = await leerPayloadSesion();
  if (!payload) return null;
  const usuario = await prisma.usuario.findUnique({
    where: { id: payload.sub },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      rol: true,
      telefono: true,
      fechaNacimiento: true,
      fotoPerfil: true,
      isActive: true,
      isStaff: true,
      isSuperuser: true,
      lastLogin: true,
      createdAt: true,
      updatedAt: true,
    },
  });
  if (!usuario || !usuario.isActive) return null;
  return usuario;
}

/** Exige sesión activa; redirige al login conservando el destino. */
export async function requerirUsuario(destino?: string): Promise<UsuarioSesion> {
  const usuario = await obtenerUsuarioActual();
  if (!usuario) {
    const next = destino ? `?next=${encodeURIComponent(destino)}` : '';
    redirect(`/usuarios/login${next}`);
  }
  return usuario;
}

/** Exige permisos de administración. */
export async function requerirAdmin(destino?: string): Promise<UsuarioSesion> {
  const usuario = await requerirUsuario(destino);
  if (!esAdmin(usuario)) redirect('/');
  return usuario;
}

/** Exige perfil de cliente o administrador (los admin también pueden reservar). */
export async function requerirCliente(destino?: string): Promise<UsuarioSesion> {
  const usuario = await requerirUsuario(destino);
  if (!esAdmin(usuario) && usuario.rol !== 'CLIENTE') redirect('/');
  return usuario;
}
