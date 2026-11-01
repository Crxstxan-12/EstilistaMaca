import Link from 'next/link';

import { requerirAdmin } from '@/lib/auth';
import {
  diaSemanaLocal,
  fechaLocalAUtc,
  hoyISO,
  partesEnZona,
} from '@/lib/datetime';
import { ESTADOS_RESERVA, formatCLP, formatFechaHoraCorta, precioServicio } from '@/lib/format';
import { prisma } from '@/lib/prisma';

/** Descompone "YYYY-MM-DD" en { year, month, day }. */
function partesDeISO(fechaISO: string) {
  const [year, month, day] = fechaISO.split('-').map(Number);
  return { year, month, day };
}

export default async function AdminEscritorioPage() {
  const usuario = await requerirAdmin('/admin');

  const hoy = hoyISO();
  const { year, month, day } = partesDeISO(hoy);

  const ahora = new Date();
  const inicioHoy = fechaLocalAUtc(year, month, day, 0, 0);
  const finHoy = fechaLocalAUtc(year, month, day + 1, 0, 0);

  const diaActual = diaSemanaLocal(ahora);
  const inicioSemana = fechaLocalAUtc(year, month, day - diaActual, 0, 0);
  const finSemana = fechaLocalAUtc(year, month, day - diaActual + 7, 0, 0);

  const mesActual = partesEnZona(ahora);
  const inicioMes = fechaLocalAUtc(mesActual.year, mesActual.month, 1, 0, 0);
  const finMes = fechaLocalAUtc(mesActual.year, mesActual.month + 1, 1, 0, 0);

  const [
    reservasHoy,
    reservasPendientes,
    reservasSemana,
    totalClientes,
    serviciosActivos,
    ingresosMes,
    sinLeer,
    proximas,
  ] = await Promise.all([
    prisma.reserva.count({ where: { fechaHora: { gte: inicioHoy, lt: finHoy } } }),
    prisma.reserva.count({ where: { estado: 'PENDIENTE' } }),
    prisma.reserva.count({ where: { fechaHora: { gte: inicioSemana, lt: finSemana } } }),
    prisma.cliente.count(),
    prisma.servicio.count({ where: { activo: true } }),
    prisma.reserva.aggregate({
      _sum: { precioFinal: true },
      where: {
        estado: { in: ['REALIZADA', 'CONFIRMADA'] },
        fechaHora: { gte: inicioMes, lt: finMes },
      },
    }),
    prisma.notificacion.count({ where: { usuarioId: usuario.id, leida: false } }),
    prisma.reserva.findMany({
      where: { fechaHora: { gte: ahora }, estado: { not: 'CANCELADA' } },
      orderBy: { fechaHora: 'asc' },
      take: 5,
      include: { cliente: true, servicio: true },
    }),
  ]);

  const metricas = [
    { etiqueta: 'Reservas de hoy', valor: reservasHoy, clase: 'text-gold' },
    { etiqueta: 'Pendientes', valor: reservasPendientes, clase: 'text-warning' },
    { etiqueta: 'Reservas de la semana', valor: reservasSemana, clase: 'text-gold' },
    { etiqueta: 'Clientes totales', valor: totalClientes, clase: 'text-gold' },
    { etiqueta: 'Servicios activos', valor: serviciosActivos, clase: 'text-gold' },
    { etiqueta: 'Ingresos del mes', valor: formatCLP(ingresosMes._sum.precioFinal), clase: 'text-gold' },
    { etiqueta: 'Notificaciones sin leer', valor: sinLeer, clase: 'text-warning' },
  ];

  return (
    <>
      <div className="row g-3 mb-4">
        {metricas.map((metrica) => (
          <div className="col-6 col-md-4" key={metrica.etiqueta}>
            <div className="card-custom h-100">
              <small className="text-subtle d-block">{metrica.etiqueta}</small>
              <div className={`fs-3 font-serif ${metrica.clase}`}>{metrica.valor}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="card-custom p-0 overflow-hidden">
        <div className="d-flex justify-content-between align-items-center p-3 border-bottom border-secondary-subtle">
          <h2 className="h5 font-serif mb-0">Próximas reservas</h2>
          <Link className="text-gold text-decoration-none small" href="/admin/reservas">
            Ver todas →
          </Link>
        </div>

        {proximas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon mb-3">📭</div>
            <p className="text-subtle mb-0">No hay reservas próximas.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table-custom align-middle mb-0">
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {proximas.map((reserva) => (
                  <tr key={reserva.id}>
                    <td>{formatFechaHoraCorta(reserva.fechaHora)}</td>
                    <td>
                      {reserva.cliente.nombre} {reserva.cliente.apellido}
                    </td>
                    <td>{reserva.servicio.nombre}</td>
                    <td>{precioServicio(reserva.precioFinal, false)}</td>
                    <td>
                      <span className={`state-badge state-${reserva.estado.toLowerCase()}`}>
                        {ESTADOS_RESERVA[reserva.estado]}
                      </span>
                    </td>
                    <td>
                      <Link
                        className="text-gold text-decoration-none small"
                        href={`/reservas/${reserva.id}`}
                      >
                        Ver →
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
