import Link from 'next/link';

import { cambiarEstadoReservaAction, registrarPagoAction } from '@/actions/reservas';
import { requerirAdmin } from '@/lib/auth';
import { fechaLocalAUtc } from '@/lib/datetime';
import { ESTADOS_RESERVA, METODOS_PAGO, formatCLP, formatFechaHoraCorta } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import type { EstadoReserva, Prisma } from '@prisma/client';

type ParametrosBusqueda = {
  estado?: string;
  desde?: string;
  hasta?: string;
};

function esFechaISO(valor?: string): valor is string {
  return !!valor && /^\d{4}-\d{2}-\d{2}$/.test(valor);
}

export default async function AdminReservasPage({
  searchParams,
}: {
  searchParams: Promise<ParametrosBusqueda>;
}) {
  const parametros = await searchParams;
  await requerirAdmin('/admin/reservas');

  const estado = parametros.estado && ESTADOS_RESERVA[parametros.estado] ? parametros.estado : '';
  const desde = esFechaISO(parametros.desde) ? parametros.desde : '';
  const hasta = esFechaISO(parametros.hasta) ? parametros.hasta : '';

  const where: Prisma.ReservaWhereInput = {};
  if (estado) where.estado = estado as EstadoReserva;
  if (desde || hasta) {
    const rango: Prisma.DateTimeFilter = {};
    if (desde) {
      const [y, m, d] = desde.split('-').map(Number);
      rango.gte = fechaLocalAUtc(y, m, d, 0, 0);
    }
    if (hasta) {
      const [y, m, d] = hasta.split('-').map(Number);
      rango.lte = fechaLocalAUtc(y, m, d, 23, 59);
    }
    where.fechaHora = rango;
  }

  const reservas = await prisma.reserva.findMany({
    where,
    orderBy: { fechaHora: 'desc' },
    include: { cliente: true, servicio: true, promocion: true },
  });

  const partesVolver = new URLSearchParams();
  if (estado) partesVolver.set('estado', estado);
  if (desde) partesVolver.set('desde', desde);
  if (hasta) partesVolver.set('hasta', hasta);
  const volverA = `/admin/reservas${partesVolver.toString() ? `?${partesVolver.toString()}` : ''}`;

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <h2 className="h4 font-serif mb-0">Reservas</h2>
        <span className="text-subtle small">{reservas.length} resultado(s)</span>
      </div>

      <form method="get" className="card-custom mb-4">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md-3">
            <label className="form-label" htmlFor="filtro-estado">Estado</label>
            <select id="filtro-estado" name="estado" defaultValue={estado} className="form-select shadow-none">
              <option value="">Todos</option>
              {Object.entries(ESTADOS_RESERVA).map(([valor, etiqueta]) => (
                <option key={valor} value={valor}>{etiqueta}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label" htmlFor="filtro-desde">Desde</label>
            <input id="filtro-desde" type="date" name="desde" defaultValue={desde} className="form-control shadow-none" />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label" htmlFor="filtro-hasta">Hasta</label>
            <input id="filtro-hasta" type="date" name="hasta" defaultValue={hasta} className="form-control shadow-none" />
          </div>
          <div className="col-12 col-md-3">
            <button type="submit" className="btn btn-primary w-100">Filtrar</button>
          </div>
        </div>
      </form>

      {reservas.length === 0 ? (
        <div className="card-custom empty-state">
          <div className="empty-icon mb-3">📭</div>
          <p className="text-subtle mb-0">No hay reservas con los filtros seleccionados.</p>
        </div>
      ) : (
        <div className="card-custom p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table-custom align-middle mb-0">
              <thead>
                <tr>
                  <th>Cliente</th>
                  <th>Servicio</th>
                  <th>Fecha y hora</th>
                  <th>Duración</th>
                  <th>Precio</th>
                  <th>Estado</th>
                  <th>Pago</th>
                </tr>
              </thead>
              <tbody>
                {reservas.map((reserva) => (
                  <tr key={reserva.id}>
                    <td>
                      <Link className="text-gold text-decoration-none" href={`/reservas/${reserva.id}`}>
                        {reserva.cliente.nombre} {reserva.cliente.apellido}
                      </Link>
                      <br />
                      <small className="text-subtle">{reserva.cliente.email}</small>
                    </td>
                    <td>
                      {reserva.servicio.nombre}
                      {reserva.promocion && (
                        <>
                          <br />
                          <small className="text-subtle">🏷️ {reserva.promocion.nombre}</small>
                        </>
                      )}
                    </td>
                    <td>{formatFechaHoraCorta(reserva.fechaHora)}</td>
                    <td>{reserva.duracion} min</td>
                    <td>{formatCLP(reserva.precioFinal)}</td>
                    <td>
                      <form action={cambiarEstadoReservaAction} className="d-flex gap-2">
                        <input type="hidden" name="reservaId" value={reserva.id} />
                        <input type="hidden" name="volverA" value={volverA} />
                        <select name="estado" defaultValue={reserva.estado} className="form-select form-select-sm shadow-none">
                          {Object.entries(ESTADOS_RESERVA).map(([valor, etiqueta]) => (
                            <option key={valor} value={valor}>{etiqueta}</option>
                          ))}
                        </select>
                        <button type="submit" className="btn btn-outline-light btn-sm">Guardar</button>
                      </form>
                    </td>
                    <td>
                      {reserva.pagoRealizado ? (
                        <span className="badge-gold">
                          Pagado{reserva.metodoPago ? ` · ${METODOS_PAGO[reserva.metodoPago]}` : ''}
                        </span>
                      ) : (
                        <form action={registrarPagoAction} className="d-flex gap-2">
                          <input type="hidden" name="reservaId" value={reserva.id} />
                          <input type="hidden" name="volverA" value={volverA} />
                          <select name="metodoPago" defaultValue="EFECTIVO" className="form-select form-select-sm shadow-none">
                            {Object.entries(METODOS_PAGO).map(([valor, etiqueta]) => (
                              <option key={valor} value={valor}>{etiqueta}</option>
                            ))}
                          </select>
                          <button type="submit" className="btn btn-outline-light btn-sm">Registrar</button>
                        </form>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
