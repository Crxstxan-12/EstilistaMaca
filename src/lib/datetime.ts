/**
 * Utilidades de fecha/hora con zona horaria del salón (America/Santiago).
 * La base de datos guarda todo en UTC; la lógica de negocio opera en hora local.
 */

export const TIMEZONE = 'America/Santiago';

export const DIAS_SEMANA = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo',
] as const;

export const MESES = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
] as const;

type PartesFecha = {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
};

/** Extrae las partes de una fecha ya expresadas en la zona horaria indicada. */
export function partesEnZona(fecha: Date, timeZone: string = TIMEZONE): PartesFecha {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hour12: false,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const mapa: Record<string, string> = {};
  for (const parte of formatter.formatToParts(fecha)) {
    if (parte.type !== 'literal') mapa[parte.type] = parte.value;
  }
  return {
    year: Number(mapa.year),
    month: Number(mapa.month),
    day: Number(mapa.day),
    hour: Number(mapa.hour === '24' ? '00' : mapa.hour),
    minute: Number(mapa.minute),
    second: Number(mapa.second),
  };
}

/** Offset (ms) entre la zona horaria dada y UTC para el instante indicado. */
function offsetZona(fecha: Date, timeZone: string): number {
  const p = partesEnZona(fecha, timeZone);
  const comoUtc = Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute, p.second);
  return comoUtc - fecha.getTime();
}

/** Convierte una fecha/hora local ("hora de pared") al instante UTC correspondiente. */
export function fechaLocalAUtc(
  year: number,
  month: number,
  day: number,
  hour = 0,
  minute = 0,
  timeZone: string = TIMEZONE,
): Date {
  const estimado = Date.UTC(year, month - 1, day, hour, minute, 0);
  const offset = offsetZona(new Date(estimado), timeZone);
  return new Date(estimado - offset);
}

/** Fecha (YYYY-MM-DD) en hora local. */
export function fechaISOEnZona(fecha: Date, timeZone: string = TIMEZONE): string {
  const p = partesEnZona(fecha, timeZone);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

/** Hora (HH:MM) en hora local. */
export function horaEnZona(fecha: Date, timeZone: string = TIMEZONE): string {
  const p = partesEnZona(fecha, timeZone);
  return `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
}

/** "Ahora" en hora local del salón. */
export function ahoraLocal(): Date {
  return new Date();
}

/** Fecha de hoy (00:00 hora local) como string YYYY-MM-DD. */
export function hoyISO(): string {
  return fechaISOEnZona(new Date());
}

/** Día de la semana 0 (Lunes) a 6 (Domingo) en hora local. */
export function diaSemanaLocal(fecha: Date): number {
  const p = partesEnZona(fecha);
  const dia = new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay(); // 0 = Domingo
  return (dia + 6) % 7;
}

/** Construye un Date UTC a partir de "YYYY-MM-DD" + "HH:MM" en hora local. */
export function parseFechaHoraLocal(fechaISO: string, hora: string): Date {
  const [y, m, d] = fechaISO.split('-').map(Number);
  const [hh, mm] = hora.split(':').map(Number);
  return fechaLocalAUtc(y, m, d, hh, mm);
}

/** Suma minutos a una fecha. */
export function sumarMinutos(fecha: Date, minutos: number): Date {
  return new Date(fecha.getTime() + minutos * 60_000);
}

/** Convierte "HH:MM" a minutos desde medianoche. */
export function horaAMinutos(hora: string): number {
  const [hh, mm] = hora.split(':').map(Number);
  return hh * 60 + mm;
}

/** Convierte minutos desde medianoche a "HH:MM". */
export function minutosAHora(minutos: number): string {
  const hh = Math.floor(minutos / 60);
  const mm = minutos % 60;
  return `${String(hh).padStart(2, '0')}:${String(mm).padStart(2, '0')}`;
}
