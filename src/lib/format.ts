import { DIAS_SEMANA, MESES, TIMEZONE, partesEnZona } from './datetime';

/** Formatea un monto en pesos chilenos: 25000 -> "$25.000" */
export function formatCLP(valor: number | null | undefined): string {
  if (valor === null || valor === undefined) return '$0';
  return `$${Math.round(valor).toLocaleString('es-CL')}`;
}

/** Precio de un servicio respetando la marca "Desde". */
export function precioServicio(precio: number, precioDesde: boolean): string {
  return `${precioDesde ? 'Desde ' : ''}${formatCLP(precio)}`;
}

/** "Lunes 12 de mayo, 15:00" */
export function formatFechaHoraLarga(fecha: Date): string {
  const p = partesEnZona(fecha, TIMEZONE);
  const dia = DIAS_SEMANA[(new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay() + 6) % 7];
  return `${dia} ${p.day} de ${MESES[p.month - 1]}, ${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
}

/** "12/05/2026 · 15:00" */
export function formatFechaHoraCorta(fecha: Date): string {
  const p = partesEnZona(fecha, TIMEZONE);
  return `${String(p.day).padStart(2, '0')}/${String(p.month).padStart(2, '0')}/${p.year} · ${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
}

/** "12/05/2026" */
export function formatFechaCorta(fecha: Date): string {
  const p = partesEnZona(fecha, TIMEZONE);
  return `${String(p.day).padStart(2, '0')}/${String(p.month).padStart(2, '0')}/${p.year}`;
}

/** "Lunes 12 de mayo de 2026" */
export function formatFechaLarga(fecha: Date): string {
  const p = partesEnZona(fecha, TIMEZONE);
  const dia = DIAS_SEMANA[(new Date(Date.UTC(p.year, p.month - 1, p.day)).getUTCDay() + 6) % 7];
  return `${dia} ${p.day} de ${MESES[p.month - 1]} de ${p.year}`;
}

/** "15:00" */
export function formatHora(fecha: Date): string {
  const p = partesEnZona(fecha, TIMEZONE);
  return `${String(p.hour).padStart(2, '0')}:${String(p.minute).padStart(2, '0')}`;
}

/** Etiquetas legibles de estados de reserva. */
export const ESTADOS_RESERVA: Record<string, string> = {
  PENDIENTE: 'Pendiente',
  CONFIRMADA: 'Confirmada',
  REALIZADA: 'Realizada',
  CANCELADA: 'Cancelada',
  NO_ASISTIO: 'No asistió',
  REAGENDADA: 'Reagendada',
};

export const TIPOS_DESCUENTO: Record<string, string> = {
  PORCENTAJE: 'Porcentaje %',
  MONTO: 'Monto fijo $',
  DOS_POR_UNO: '2x1 / Regalo',
};

export const METODOS_PAGO: Record<string, string> = {
  EFECTIVO: 'Efectivo',
  TRANSFERENCIA: 'Transferencia',
  TARJETA: 'Tarjeta',
  WEBPAY: 'WebPay',
  OTRO: 'Otro',
};

export const MOTIVOS_BLOQUEO: Record<string, string> = {
  VACACIONES: 'Vacaciones',
  CAPACITACION: 'Capacitación',
  PERSONAL: 'Motivo personal',
  INVENTARIO: 'Inventario',
  MANTENCION: 'Mantención',
  OTRO: 'Otro',
};

export const TIPOS_NOTIFICACION: Record<string, string> = {
  RESERVA_CREADA: 'Reserva creada',
  RESERVA_CONFIRMADA: 'Reserva confirmada',
  RESERVA_CANCELADA: 'Reserva cancelada',
  RESERVA_RECORDATORIO: 'Recordatorio de reserva',
  PROMOCION: 'Promoción / Oferta',
  GENERAL: 'Aviso general',
};
