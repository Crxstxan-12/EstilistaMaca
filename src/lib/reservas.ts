import 'server-only';

import { prisma } from './prisma';
import { franjaDisponible } from './agenda';
import { notificarCambioReserva } from './notificaciones';
import { sumarMinutos } from './datetime';
import type { EstadoReserva, Prisma, Promocion } from '@prisma/client';

export class ReglaNegocioError extends Error {}

type UsuarioRef = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  telefono: string;
};

/** Devuelve el cliente asociado al usuario; lo crea si aún no existe. */
export async function obtenerOCrearCliente(usuario: UsuarioRef) {
  const existente = await prisma.cliente.findFirst({ where: { usuarioId: usuario.id } });
  if (existente) return existente;

  const porEmail = await prisma.cliente.findUnique({ where: { email: usuario.email } });
  if (porEmail) {
    return prisma.cliente.update({
      where: { id: porEmail.id },
      data: { usuarioId: usuario.id },
    });
  }

  return prisma.cliente.create({
    data: {
      usuarioId: usuario.id,
      nombre: usuario.firstName || usuario.email.split('@')[0],
      apellido: usuario.lastName || '',
      email: usuario.email,
      telefono: usuario.telefono || '',
    },
  });
}

/** Aplica el descuento de una promoción vigente al precio del servicio. */
export function calcularPrecioConPromocion(
  precioBase: number,
  promocion: Promocion | null,
  servicioId: string,
  serviciosAplicables: string[] = [],
): number {
  if (!promocion || !estaVigente(promocion)) return precioBase;
  if (serviciosAplicables.length > 0 && !serviciosAplicables.includes(servicioId)) {
    return precioBase;
  }
  if (promocion.tipoDescuento === 'PORCENTAJE') {
    return Math.max(0, Math.round(precioBase * (1 - promocion.valorDescuento / 100)));
  }
  if (promocion.tipoDescuento === 'MONTO') {
    return Math.max(0, precioBase - promocion.valorDescuento);
  }
  return precioBase; // 2x1: el precio unitario no cambia
}

export function estaVigente(promocion: Promocion, referencia = new Date()): boolean {
  if (!promocion.activo) return false;
  if (referencia < promocion.validoDesde) return false;
  if (promocion.validoHasta && referencia > promocion.validoHasta) return false;
  if (promocion.stockUsos !== null && promocion.usosActuales >= promocion.stockUsos) return false;
  return true;
}

export function puedeCancelar(reserva: { estado: EstadoReserva; fechaHora: Date }): boolean {
  const estadosPermitidos: EstadoReserva[] = ['PENDIENTE', 'CONFIRMADA'];
  return estadosPermitidos.includes(reserva.estado) && reserva.fechaHora > new Date();
}

export function puedeModificar(reserva: { estado: EstadoReserva; fechaHora: Date }): boolean {
  return puedeCancelar(reserva);
}

type CrearReservaInput = {
  clienteId: string;
  servicioId: string;
  fechaHora: Date;
  duracion?: number;
  promocionId?: string | null;
  notasCliente?: string;
  usuarioCreadorId?: string | null;
  omitirValidacionHorario?: boolean;
};

/** Crea una reserva validando disponibilidad real de la franja y aplicando promociones. */
export async function crearReserva(input: CrearReservaInput) {
  const servicio = await prisma.servicio.findUnique({ where: { id: input.servicioId } });
  if (!servicio) throw new ReglaNegocioError('El servicio seleccionado no existe.');

  const duracion = input.duracion ?? servicio.duracion;
  const fin = sumarMinutos(input.fechaHora, duracion);

  if (!input.omitirValidacionHorario) {
    const disponible = await franjaDisponible(input.fechaHora, fin);
    if (!disponible) {
      throw new ReglaNegocioError(
        'El horario seleccionado ya no está disponible. Por favor, escoge otro.',
      );
    }
  }

  let promocion: Promocion | null = null;
  let serviciosAplicables: string[] = [];
  if (input.promocionId) {
    const encontrada = await prisma.promocion.findUnique({
      where: { id: input.promocionId },
      include: { serviciosAplicables: { select: { id: true } } },
    });
    if (encontrada) {
      const { serviciosAplicables: aplicables, ...datos } = encontrada;
      promocion = datos;
      serviciosAplicables = aplicables.map((servicio) => servicio.id);
    }
  }

  const precioFinal = calcularPrecioConPromocion(
    servicio.precio,
    promocion,
    servicio.id,
    serviciosAplicables,
  );

  const reserva = await prisma.$transaction(async (tx) => {
    const creada = await tx.reserva.create({
      data: {
        clienteId: input.clienteId,
        servicioId: servicio.id,
        promocionId: promocion?.id ?? null,
        usuarioCreadorId: input.usuarioCreadorId ?? null,
        fechaHora: input.fechaHora,
        duracion,
        precioFinal,
        estado: 'PENDIENTE',
        notasCliente: input.notasCliente ?? '',
      },
    });
    if (promocion && estaVigente(promocion)) {
      await tx.promocion.update({
        where: { id: promocion.id },
        data: { usosActuales: { increment: 1 } },
      });
    }
    return creada;
  });

  await notificarCambioReserva(reserva.id, 'RESERVA_CREADA');
  return reserva;
}

export async function confirmarReserva(reservaId: string) {
  const reserva = await prisma.reserva.findUnique({ where: { id: reservaId } });
  if (!reserva) throw new ReglaNegocioError('La reserva no existe.');
  if (reserva.fechaConfirmacion) return reserva;

  const actualizada = await prisma.reserva.update({
    where: { id: reservaId },
    data: { estado: 'CONFIRMADA', fechaConfirmacion: new Date() },
  });
  await notificarCambioReserva(actualizada.id, 'RESERVA_CONFIRMADA');
  return actualizada;
}

export async function cancelarReserva(reservaId: string, motivo = '') {
  const reserva = await prisma.reserva.findUnique({ where: { id: reservaId } });
  if (!reserva) throw new ReglaNegocioError('La reserva no existe.');
  if (!puedeCancelar(reserva)) {
    throw new ReglaNegocioError('Esta reserva no se puede cancelar.');
  }

  const notasInternas = motivo
    ? `${reserva.notasInternas ? `${reserva.notasInternas}\n` : ''}Cancelación: ${motivo}`
    : reserva.notasInternas;

  const actualizada = await prisma.reserva.update({
    where: { id: reservaId },
    data: {
      estado: 'CANCELADA',
      fechaCancelacion: new Date(),
      notasInternas,
    },
  });
  await notificarCambioReserva(actualizada.id, 'RESERVA_CANCELADA');
  return actualizada;
}

export async function reagendarReserva(reservaId: string, nuevaFechaHora: Date) {
  const reserva = await prisma.reserva.findUnique({ where: { id: reservaId } });
  if (!reserva) throw new ReglaNegocioError('La reserva no existe.');
  if (!puedeModificar(reserva)) {
    throw new ReglaNegocioError('Esta reserva no se puede modificar.');
  }

  const fin = sumarMinutos(nuevaFechaHora, reserva.duracion);
  const disponible = await franjaDisponible(nuevaFechaHora, fin, reserva.id);
  if (!disponible) throw new ReglaNegocioError('El nuevo horario no está disponible.');

  return prisma.reserva.update({
    where: { id: reservaId },
    data: { fechaHora: nuevaFechaHora, estado: 'REAGENDADA' },
  });
}

/** Filtros reutilizables para listados de reservas. */
export const INCLUDE_RESERVA_DETALLE = {
  cliente: true,
  servicio: { include: { categoria: true } },
  promocion: true,
} satisfies Prisma.ReservaInclude;

export type ReservaDetalle = Prisma.ReservaGetPayload<{
  include: typeof INCLUDE_RESERVA_DETALLE;
}>;
