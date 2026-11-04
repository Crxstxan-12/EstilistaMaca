import 'server-only';

import type { Prisma } from '@prisma/client';
import { prisma } from './prisma';
import {
  horaAMinutos,
  partesEnZona,
  fechaLocalAUtc,
  sumarMinutos,
  diaSemanaLocal,
  horaEnZona,
} from './datetime';
import { RESERVA_PASO_MINUTOS } from './config';
import type { EstadoReserva } from '@prisma/client';

const ESTADOS_ACTIVOS: EstadoReserva[] = ['PENDIENTE', 'CONFIRMADA', 'REAGENDADA'];
const DURACION_MAXIMA_MIN = 720;

type Contexto = {
  abierto: boolean;
  aperturaMin: number;
  cierreMin: number;
  bloqueos: { fechaInicio: Date; fechaFin: Date }[];
  reservas: { id: string; fechaHora: Date; duracion: number }[];
};

export type EstadoHorario = {
  hora: string;
  disponible: boolean;
};

type DbClient = typeof prisma | Prisma.TransactionClient;

export function obtenerHorarioDia(dia: number) {
  return prisma.horarioSemanal.findUnique({ where: { dia } });
}

/** Carga horario, bloqueos y reservas del día para evaluar disponibilidad con una sola tanda de queries. */
async function cargarContexto(fechaISO: string, db: DbClient = prisma): Promise<Contexto> {
  const [year, month, day] = fechaISO.split('-').map(Number);
  const inicioDia = fechaLocalAUtc(year, month, day, 0, 0);
  const finDia = fechaLocalAUtc(year, month, day, 23, 59);

  const horario = await db.horarioSemanal.findUnique({ where: { dia: diaSemanaLocal(inicioDia) } });

  const [bloqueos, reservas] = await Promise.all([
    db.bloqueoHorario.findMany({
      where: {
        mostrarAClientes: true,
        fechaInicio: { lt: finDia },
        fechaFin: { gt: inicioDia },
      },
      select: { fechaInicio: true, fechaFin: true },
    }),
    db.reserva.findMany({
      where: {
        estado: { in: ESTADOS_ACTIVOS },
        // Reservas de la madrugada del día siguiente también pueden solaparse con el cierre.
        fechaHora: {
          gte: new Date(inicioDia.getTime() - DURACION_MAXIMA_MIN * 60_000),
          lte: new Date(finDia.getTime() + DURACION_MAXIMA_MIN * 60_000),
        },
      },
      select: { id: true, fechaHora: true, duracion: true },
    }),
  ]);

  return {
    abierto: !!horario?.abierto && !!horario.horaApertura && !!horario.horaCierre,
    aperturaMin: horario?.horaApertura ? horaAMinutos(horario.horaApertura) : 0,
    cierreMin: horario?.horaCierre ? horaAMinutos(horario.horaCierre) : 0,
    bloqueos,
    reservas,
  };
}

function construirInstante(fecha: Date, minutos: number): Date {
  const p = partesEnZona(fecha);
  return fechaLocalAUtc(p.year, p.month, p.day, Math.floor(minutos / 60), minutos % 60);
}

/** Reglas de negocio: horario de atención, bloqueos y solapamiento con otras reservas. */
function franjaValida(
  ctx: Contexto,
  inicio: Date,
  fin: Date,
  excluirReservaId?: string,
): boolean {
  if (inicio >= fin) return false;
  if (inicio.getTime() < Date.now() - 60_000) return false;
  if (!ctx.abierto) return false;

  const apertura = construirInstante(inicio, ctx.aperturaMin);
  const cierre = construirInstante(inicio, ctx.cierreMin);
  if (inicio < apertura || fin > cierre) return false;

  for (const bloqueo of ctx.bloqueos) {
    if (bloqueo.fechaInicio < fin && bloqueo.fechaFin > inicio) return false;
  }

  for (const reserva of ctx.reservas) {
    if (reserva.id === excluirReservaId) continue;
    const finReserva = sumarMinutos(reserva.fechaHora, reserva.duracion);
    if (reserva.fechaHora < fin && finReserva > inicio) return false;
  }

  return true;
}

/** Verifica una franja puntual contra la base de datos (crear / reagendar reservas). */
export async function franjaDisponible(
  inicio: Date,
  fin: Date,
  excluirReservaId?: string,
): Promise<boolean> {
  const fechaISO = fechaLocalISO(inicio);
  const ctx = await cargarContexto(fechaISO);
  return franjaValida(ctx, inicio, fin, excluirReservaId);
}

export async function franjaDisponibleConCliente(
  db: DbClient,
  inicio: Date,
  fin: Date,
  excluirReservaId?: string,
): Promise<boolean> {
  const fechaISO = fechaLocalISO(inicio);
  const ctx = await cargarContexto(fechaISO, db);
  return franjaValida(ctx, inicio, fin, excluirReservaId);
}

function fechaLocalISO(fecha: Date): string {
  const p = partesEnZona(fecha);
  return `${p.year}-${String(p.month).padStart(2, '0')}-${String(p.day).padStart(2, '0')}`;
}

/**
 * Horas disponibles para una fecha y duración de servicio.
 * Respeta horario semanal, bloqueos visibles, reservas activas y duración real del servicio.
 */
export async function horasDisponibles(
  fechaISO: string,
  duracionMin = 60,
  pasoMin = RESERVA_PASO_MINUTOS,
): Promise<Date[]> {
  const ctx = await cargarContexto(fechaISO);
  if (!ctx.abierto) return [];

  const [year, month, day] = fechaISO.split('-').map(Number);
  const inicioDia = fechaLocalAUtc(year, month, day, Math.floor(ctx.aperturaMin / 60), ctx.aperturaMin % 60);
  const cierreDia = fechaLocalAUtc(year, month, day, Math.floor(ctx.cierreMin / 60), ctx.cierreMin % 60);

  const resultado: Date[] = [];
  let actual = inicioDia;
  while (sumarMinutos(actual, duracionMin) <= cierreDia) {
    if (franjaValida(ctx, actual, sumarMinutos(actual, duracionMin))) {
      resultado.push(actual);
    }
    actual = sumarMinutos(actual, pasoMin);
  }
  return resultado;
}

export async function estadoHorariosDia(
  fechaISO: string,
  duracionMin = 60,
  pasoMin = RESERVA_PASO_MINUTOS,
  excluirReservaId?: string,
): Promise<EstadoHorario[]> {
  const ctx = await cargarContexto(fechaISO);
  if (!ctx.abierto) return [];

  const [year, month, day] = fechaISO.split('-').map(Number);
  const inicioDia = fechaLocalAUtc(
    year,
    month,
    day,
    Math.floor(ctx.aperturaMin / 60),
    ctx.aperturaMin % 60,
  );
  const cierreDia = fechaLocalAUtc(
    year,
    month,
    day,
    Math.floor(ctx.cierreMin / 60),
    ctx.cierreMin % 60,
  );

  const resultado: EstadoHorario[] = [];
  let actual = inicioDia;
  while (sumarMinutos(actual, duracionMin) <= cierreDia) {
    const fin = sumarMinutos(actual, duracionMin);
    resultado.push({
      hora: horaEnZona(actual),
      disponible: franjaValida(ctx, actual, fin, excluirReservaId),
    });
    actual = sumarMinutos(actual, pasoMin);
  }
  return resultado;
}

/** Horas disponibles en formato "HH:MM" (hora local del salón). */
export async function horasDisponiblesTexto(
  fechaISO: string,
  duracionMin = 60,
): Promise<string[]> {
  const horas = await estadoHorariosDia(fechaISO, duracionMin);
  return horas.filter((hora) => hora.disponible).map((hora) => hora.hora);
}

export { DURACION_MAXIMA_MIN };
