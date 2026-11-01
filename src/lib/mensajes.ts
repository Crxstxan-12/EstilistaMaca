/** Mensajes de aviso mostrados tras una redirección (equivalente a django.contrib.messages). */
export type TipoMensaje = 'success' | 'error' | 'warning' | 'info';

export const MENSAJES: Record<string, { tipo: TipoMensaje; texto: string }> = {
  'registro-ok': {
    tipo: 'success',
    texto: '¡Registro exitoso! Bienvenida a Macarena Estilista.',
  },
  'sesion-cerrada': {
    tipo: 'info',
    texto: 'Has cerrado sesión correctamente.',
  },
  'sesion-iniciada': {
    tipo: 'success',
    texto: '¡Bienvenida de vuelta!',
  },
  'datos-actualizados': {
    tipo: 'success',
    texto: 'Tus datos se actualizaron correctamente.',
  },
  'reserva-creada': {
    tipo: 'success',
    texto: '¡Tu reserva fue creada exitosamente! 🎉',
  },
  'reserva-confirmada': {
    tipo: 'success',
    texto: '¡Reserva confirmada!',
  },
  'reserva-cancelada': {
    tipo: 'success',
    texto: 'Reserva cancelada correctamente.',
  },
  'contacto-ok': {
    tipo: 'success',
    texto: '¡Tu mensaje fue recibido! Te responderemos a la brevedad.',
  },
  'password-actualizada': {
    tipo: 'success',
    texto: 'Tu contraseña fue actualizada. Ya puedes iniciar sesión.',
  },
};

export function resolverMensaje(codigo?: string | null) {
  if (!codigo) return null;
  return MENSAJES[codigo] ?? null;
}
