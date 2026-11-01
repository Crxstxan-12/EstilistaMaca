/** Configuración de marca y límites (leída desde variables de entorno con fallback). */
export const BRAND = {
  nombre: process.env.NEXT_PUBLIC_NOMBRE_SALON ?? 'Macarena Estilista',
  subtitulo: process.env.NEXT_PUBLIC_SUBTITULO_SALON ?? 'Salón House',
  instagram: process.env.NEXT_PUBLIC_INSTAGRAM_SALON ?? '@_macarena.estilista_',
  instagramUrl: 'https://instagram.com/_macarena.estilista_',
  whatsapp: process.env.NEXT_PUBLIC_WHATSAPP ?? '56978033409',
  emailContacto: 'Macarena.escobar92@gmail.com',
  emailRemitente:
    process.env.EMAIL_FROM ?? 'Macarena Estilista <no-reply@macarenaestilista.cl>',
  direccion: 'El Nevado #1142, Chillán, Ñuble, Chile',
  ciudad: 'Chillán, Ñuble, Chile',
  telefonoVisible: '+56 9 7803 3409',
  telefonoLlamadas: '+56978033409',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=El+Nevado+1142,+Chillan,+Chile',
} as const;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000';

export const RATE_LIMITS = {
  loginMaxIntentos: Number(process.env.LOGIN_RATE_LIMIT_MAX_ATTEMPTS ?? 5),
  loginVentanaSegundos: Number(process.env.LOGIN_RATE_LIMIT_WINDOW_SECONDS ?? 300),
  apiHorasLimite: Number(process.env.API_HORAS_RATE_LIMIT ?? 60),
  apiHorasVentanaSegundos: Number(process.env.API_HORAS_RATE_WINDOW_SECONDS ?? 60),
} as const;

export const SESSION_COOKIE = 'me_session';
export const SESSION_DURACION_SEGUNDOS = 60 * 60 * 24 * 7; // 7 días
export const RESERVA_PASO_MINUTOS = 30;
export const RESERVA_DURACION_DEFAULT = 60;
