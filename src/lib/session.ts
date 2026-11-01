import { SignJWT, jwtVerify } from 'jose';
import { SESSION_DURACION_SEGUNDOS } from './config';

/** Payload mínimo que viaja firmado en la cookie de sesión. */
export type SesionPayload = {
  sub: string; // id del usuario
  email: string;
  rol: 'CLIENTE' | 'ADMINISTRADOR';
  nombre: string;
};

function clave(): Uint8Array {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      'Falta la variable de entorno AUTH_SECRET. Genera una con: openssl rand -base64 32',
    );
  }
  return new TextEncoder().encode(secret);
}

/** Firma un JWT de sesión (compatible con Edge Runtime). */
export async function firmarSesion(payload: SesionPayload): Promise<string> {
  return new SignJWT({ ...payload })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURACION_SEGUNDOS}s`)
    .sign(clave());
}

/** Verifica y decodifica un JWT de sesión. Devuelve null si es inválido o expiró. */
export async function verificarSesion(
  token: string | undefined,
): Promise<SesionPayload | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, clave(), { algorithms: ['HS256'] });
    if (!payload.sub || typeof payload.email !== 'string') return null;
    return {
      sub: payload.sub,
      email: payload.email,
      rol: payload.rol === 'ADMINISTRADOR' ? 'ADMINISTRADOR' : 'CLIENTE',
      nombre: typeof payload.nombre === 'string' ? payload.nombre : '',
    };
  } catch {
    return null;
  }
}
