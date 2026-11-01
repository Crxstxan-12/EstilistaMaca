import 'server-only';

import { prisma } from './prisma';
import { formatCLP, formatFechaHoraLarga } from './format';
import type { TipoNotificacion } from '@prisma/client';

type DatosNotificacion = {
  usuarioId?: string | null;
  clienteId?: string | null;
  tipo: TipoNotificacion;
  titulo: string;
  mensaje: string;
  enlace?: string;
};

export async function crearNotificacion(datos: DatosNotificacion) {
  return prisma.notificacion.create({
    data: {
      usuarioId: datos.usuarioId ?? null,
      clienteId: datos.clienteId ?? null,
      tipo: datos.tipo,
      titulo: datos.titulo,
      mensaje: datos.mensaje,
      enlace: datos.enlace ?? '',
    },
  });
}

/**
 * Crea la notificación correspondiente al último cambio de una reserva.
 * Equivale a la señal post_save del proyecto Django original.
 */
export async function notificarCambioReserva(
  reservaId: string,
  tipo: Extract<
    TipoNotificacion,
    'RESERVA_CREADA' | 'RESERVA_CONFIRMADA' | 'RESERVA_CANCELADA'
  >,
) {
  const reserva = await prisma.reserva.findUnique({
    where: { id: reservaId },
    include: {
      servicio: { select: { nombre: true } },
      cliente: { select: { id: true, usuarioId: true, nombre: true, apellido: true } },
    },
  });
  if (!reserva) return;

  const fecha = formatFechaHoraLarga(reserva.fechaHora);
  const enlace = `/reservas/${reserva.id}`;

  const contenidos: Record<typeof tipo, { titulo: string; mensaje: string }> = {
    RESERVA_CREADA: {
      titulo: 'Reserva creada',
      mensaje: `Se ha creado tu reserva para ${reserva.servicio.nombre} el ${fecha}. Total ${formatCLP(reserva.precioFinal)}`,
    },
    RESERVA_CONFIRMADA: {
      titulo: 'Reserva confirmada',
      mensaje: `Tu reserva #${reserva.id.slice(-6)} para ${reserva.servicio.nombre} el ${fecha} ha sido confirmada.`,
    },
    RESERVA_CANCELADA: {
      titulo: 'Reserva cancelada',
      mensaje: `Tu reserva #${reserva.id.slice(-6)} para ${reserva.servicio.nombre} el ${fecha} ha sido cancelada.`,
    },
  };

  const { titulo, mensaje } = contenidos[tipo];

  return crearNotificacion({
    usuarioId: reserva.cliente.usuarioId,
    clienteId: reserva.cliente.id,
    tipo,
    titulo,
    mensaje,
    enlace,
  });
}
