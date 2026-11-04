'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { esAdmin, requerirAdmin, requerirCliente, requerirUsuario } from '@/lib/auth';
import { estadoHorariosDia, horasDisponiblesTexto } from '@/lib/agenda';
import { parseFechaHoraLocal } from '@/lib/datetime';
import { texto, type ActionState } from '@/lib/form';
import { prisma } from '@/lib/prisma';
import {
  ReglaNegocioError,
  cancelarReserva,
  confirmarReserva,
  crearReserva,
  obtenerOCrearCliente,
  reagendarReserva,
} from '@/lib/reservas';
import type { EstadoReserva, MetodoPago } from '@prisma/client';

/** Crea una reserva para el cliente autenticado. */
export async function crearReservaAction(
  _estado: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const usuario = await requerirCliente('/reservas');
  const servicioSlug = texto(formData, 'servicioSlug');
  const fecha = texto(formData, 'fecha');
  const hora = texto(formData, 'hora');
  const notasCliente = texto(formData, 'notasCliente');

  const servicio = await prisma.servicio.findFirst({
    where: { slug: servicioSlug, activo: true },
  });
  if (!servicio) {
    return { ok: false, mensaje: 'El servicio seleccionado ya no está disponible.' };
  }

  const errores: Record<string, string> = {};
  if (!fecha) errores.fecha = 'Selecciona una fecha.';
  if (!hora) errores.hora = 'Selecciona una hora disponible.';
  if (Object.keys(errores).length > 0) {
    return { ok: false, mensaje: 'Revisa los campos marcados.', errores };
  }

  const cliente = await obtenerOCrearCliente(usuario);
  const fechaHora = parseFechaHoraLocal(fecha, hora);

  let reservaId: string;
  try {
    const reserva = await crearReserva({
      clienteId: cliente.id,
      servicioId: servicio.id,
      fechaHora,
      duracion: servicio.duracion,
      notasCliente,
      usuarioCreadorId: usuario.id,
    });
    reservaId = reserva.id;
  } catch (error) {
    const mensaje =
      error instanceof ReglaNegocioError
        ? error.message
        : 'Ocurrió un error al crear la reserva. Inténtalo nuevamente.';
    return { ok: false, mensaje, errores: { hora: mensaje } };
  }

  revalidatePath('/reservas/mi-cuenta');
  redirect(`/reservas/${reservaId}?msg=reserva-creada`);
}

/** Verifica que la reserva pertenezca al usuario (o que sea administrador). */
async function reservaAutorizada(reservaId: string) {
  const usuario = await requerirUsuario();
  const reserva = await prisma.reserva.findUnique({ where: { id: reservaId } });
  if (!reserva) redirect('/reservas/mi-cuenta?error=La reserva no existe.');

  if (esAdmin(usuario)) return reserva;

  const cliente = await obtenerOCrearCliente(usuario);
  if (reserva.clienteId !== cliente.id) {
    redirect('/reservas/mi-cuenta?error=No tienes acceso a esta reserva.');
  }
  return reserva;
}

export async function cancelarReservaAction(formData: FormData): Promise<void> {
  const reservaId = texto(formData, 'reservaId');
  const motivo = texto(formData, 'motivo');
  await reservaAutorizada(reservaId);

  try {
    await cancelarReserva(reservaId, motivo);
  } catch (error) {
    const mensaje =
      error instanceof ReglaNegocioError ? error.message : 'No se pudo cancelar la reserva.';
    redirect(`/reservas/${reservaId}?error=${encodeURIComponent(mensaje)}`);
  }

  revalidatePath('/reservas/mi-cuenta');
  revalidatePath('/admin/reservas');
  revalidatePath('/reservas/admin/agenda');
  revalidatePath(`/reservas/${reservaId}`);
  redirect(`/reservas/${reservaId}?msg=reserva-cancelada`);
}

export async function confirmarReservaAction(formData: FormData): Promise<void> {
  const reservaId = texto(formData, 'reservaId');
  await reservaAutorizada(reservaId);
  await confirmarReserva(reservaId);

  revalidatePath('/reservas/mi-cuenta');
  revalidatePath(`/reservas/${reservaId}`);
  revalidatePath('/reservas/admin/agenda');
  redirect(`/reservas/${reservaId}?msg=reserva-confirmada`);
}

/** Reagenda una reserva activa a un nuevo horario. */
export async function reagendarReservaAction(
  _estado: ActionState,
  formData: FormData,
): Promise<ActionState> {
  const reservaId = texto(formData, 'reservaId');
  const fecha = texto(formData, 'fecha');
  const hora = texto(formData, 'hora');
  const reserva = await reservaAutorizada(reservaId);

  if (!fecha || !hora) {
    return { ok: false, mensaje: 'Selecciona la nueva fecha y hora.' };
  }

  const nuevaFechaHora = parseFechaHoraLocal(fecha, hora);
  try {
    await reagendarReserva(reserva.id, nuevaFechaHora);
  } catch (error) {
    console.error('reagendarReservaAction fallo', {
      reservaId,
      fecha,
      hora,
      error,
    });
    const mensaje =
      error instanceof ReglaNegocioError ? error.message : 'No se pudo reagendar la reserva.';
    return { ok: false, mensaje, errores: { hora: mensaje } };
  }

  revalidatePath('/reservas/mi-cuenta');
  revalidatePath(`/reservas/${reservaId}`);
  revalidatePath(`/reservas/${reservaId}/reagendar`);
  redirect(`/reservas/${reservaId}?msg=datos-actualizados`);
}

/** Cambia el estado de una reserva desde el panel de administración. */
export async function cambiarEstadoReservaAction(formData: FormData): Promise<void> {
  const reservaId = texto(formData, 'reservaId');
  const estado = texto(formData, 'estado') as EstadoReserva;
  const volverA = texto(formData, 'volverA') || '/reservas/admin/agenda';
  await requerirAdmin(volverA);

  await prisma.reserva.update({ where: { id: reservaId }, data: { estado } });
  revalidatePath(volverA);
  revalidatePath('/admin/reservas');
  revalidatePath('/reservas/admin/agenda');
  revalidatePath('/reservas/mi-cuenta');
  revalidatePath(`/reservas/${reservaId}`);
  redirect(`${volverA}?msg=datos-actualizados`);
}

/** Registra el pago de una reserva (solo administración). */
export async function registrarPagoAction(formData: FormData): Promise<void> {
  const reservaId = texto(formData, 'reservaId');
  const metodoPago = (texto(formData, 'metodoPago') || null) as MetodoPago | null;
  const volverA = texto(formData, 'volverA') || '/reservas/admin/agenda';
  await requerirAdmin(volverA);

  await prisma.reserva.update({
    where: { id: reservaId },
    data: { pagoRealizado: true, metodoPago },
  });
  revalidatePath(volverA);
  redirect(`${volverA}?msg=datos-actualizados`);
}

/** Horas disponibles para un servicio y fecha (consumido por el selector de hora). */
export async function consultarHorasAction(
  servicioSlug: string,
  fecha: string,
): Promise<string[]> {
  const servicio = await prisma.servicio.findFirst({
    where: { slug: servicioSlug, activo: true },
    select: { duracion: true },
  });
  if (!servicio || !fecha) return [];
  return horasDisponiblesTexto(fecha, servicio.duracion);
}

export async function consultarEstadoHorasAction(
  servicioSlug: string,
  fecha: string,
  reservaId?: string,
): Promise<{ hora: string; disponible: boolean }[]> {
  const servicio = await prisma.servicio.findFirst({
    where: { slug: servicioSlug, activo: true },
    select: { duracion: true },
  });
  if (!servicio || !fecha) return [];
  return estadoHorariosDia(fecha, servicio.duracion, undefined, reservaId);
}
