import { prisma } from './prisma';

/**
 * Rate limiting respaldado en base de datos (compatible con entornos serverless,
 * donde la memoria del proceso no persiste entre invocaciones).
 */
export async function intentosActuales(clave: string): Promise<number> {
  const registro = await prisma.loginAttempt.findUnique({ where: { clave } });
  if (!registro) return 0;
  if (registro.expiraEn.getTime() < Date.now()) return 0;
  return registro.intentos;
}

/** ¿La clave superó el máximo de intentos permitidos en la ventana actual? */
export async function estaBloqueado(clave: string, limite: number): Promise<boolean> {
  return (await intentosActuales(clave)) >= limite;
}

/** Registra un intento y devuelve el total acumulado en la ventana. */
export async function registrarIntento(
  clave: string,
  ventanaSegundos: number,
): Promise<number> {
  const ahora = Date.now();
  const registro = await prisma.loginAttempt.findUnique({ where: { clave } });

  if (!registro || registro.expiraEn.getTime() < ahora) {
    const expiraEn = new Date(ahora + ventanaSegundos * 1000);
    await prisma.loginAttempt.upsert({
      where: { clave },
      create: { clave, intentos: 1, expiraEn },
      update: { intentos: 1, expiraEn },
    });
    return 1;
  }

  const actualizado = await prisma.loginAttempt.update({
    where: { clave },
    data: { intentos: { increment: 1 } },
  });
  return actualizado.intentos;
}

/** Limpia el contador de intentos (login exitoso). */
export async function resetearIntentos(clave: string): Promise<void> {
  await prisma.loginAttempt.deleteMany({ where: { clave } });
}

/** Elimina registros vencidos (mantenimiento perezoso). */
export async function limpiarIntentosExpirados(): Promise<void> {
  await prisma.loginAttempt.deleteMany({ where: { expiraEn: { lt: new Date() } } });
}

/** Obtiene la IP del cliente a partir de los headers de la petición. */
export function obtenerIP(headers: Headers): string {
  const forwarded = headers.get('x-forwarded-for');
  if (forwarded) return forwarded.split(',')[0].trim();
  return headers.get('x-real-ip') ?? '0.0.0.0';
}
