import Link from 'next/link';

import { cambiarEstadoReservaAction } from '@/actions/reservas';
import { requerirAdmin } from '@/lib/auth';
import { fechaISOEnZona, fechaLocalAUtc, hoyISO } from '@/lib/datetime';
import { ESTADOS_RESERVA, formatCLP, formatFechaLarga, formatHora } from '@/lib/format';
import { prisma } from '@/lib/prisma';

function esFechaISO(valor?: string): valor is string {
  return !!valor && /^\d{4}-\d{2}-\d{2}$/.test(valor);
}

/** Suma días a una fecha ISO (YYYY-MM-DD). */
function sumarDiasISO(fechaISO: string, dias: number): string {
  const [year, month, day] = fechaISO.split('-').map(Number);
  return new Date(Date.UTC(year, month - 1, day + dias)).toISOString().slice(0, 10);
}

export default async function AgendaAdminPage({
  searchParams,
}: {
  searchParams: Promise<{ desde?: string; hasta?: string }>;
}) {
  const parametros = await searchParams;
  await requerirAdmin('/reservas/admin/agenda');

  const hoy = hoyISO();
  const desde = esFechaISO(parametros.desde) ? parametros.desde : hoy;
  const hasta = esFechaISO(parametros.hasta) ? parametros.hasta : sumarDiasISO(hoy, 6);

  const [yd, md, dd] = desde.split('-').map(Number);
  const [yh, mh, dh] = hasta.split('-').map(Number);

  const reservas = await prisma.reserva.findMany({
    where: {
      fechaHora: {
        gte: fechaLocalAUtc(yd, md, dd, 0, 0),
        lte: fechaLocalAUtc(yh, mh, dh, 23, 59),
      },
    },
    orderBy: { fechaHora: 'asc' },
    include: { cliente: true, servicio: { include: { categoria: true } }, promocion: true },
  });

  const porDia = new Map<string, typeof reservas>();
  for (const reserva of reservas) {
    const clave = fechaISOEnZona(reserva.fechaHora);
    const lista = porDia.get(clave);
    if (lista) lista.push(reserva);
    else porDia.set(clave, [reserva]);
  }

  const confirmadas = reservas.filter((r) => r.estado === 'CONFIRMADA').length;
  const pendientes = reservas.filter((r) => r.estado === 'PENDIENTE').length;
  const canceladas = reservas.filter((r) => r.estado === 'CANCELADA').length;

  const volverA = `/reservas/admin/agenda?desde=${desde}&hasta=${hasta}`;

  return (
    <section className="py-5">
      <div className="container-custom">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <h1 className="h2 font-serif mb-1">📅 Agenda del Salón</h1>
            <p className="text-subtle mb-0 small">Vista general de reservas por día.</p>
          </div>
          <div className="d-flex gap-2">
            <Link href="/admin/reservas" className="btn btn-outline-light">📋 Reservas</Link>
            <Link href="/admin" className="btn btn-outline-light">Panel</Link>
          </div>
        </div>

        <form method="get" className="card-custom mb-4">
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="ag-desde">Desde</label>
              <input id="ag-desde" type="date" name="desde" defaultValue={desde} className="form-control shadow-none" />
            </div>
            <div className="col-12 col-md-4">
              <label className="form-label" htmlFor="ag-hasta">Hasta</label>
              <input id="ag-hasta" type="date" name="hasta" defaultValue={hasta} className="form-control shadow-none" />
            </div>
            <div className="col-12 col-md-4">
              <button type="submit" className="btn btn-primary w-100">Filtrar</button>
            </div>
          </div>
        </form>

        {reservas.length === 0 ? (
          <div className="card-custom empty-state">
            <div className="empty-icon mb-3">📭</div>
            <h3 className="h5 font-serif mb-2">No hay reservas en este rango</h3>
            <p className="text-subtle mb-0">Prueba ajustando las fechas o comparte el enlace de reservas con tus clientas.</p>
          </div>
        ) : (
          <>
            <div className="row g-3 mb-4">
              <div className="col-6 col-md-3">
                <div className="card-custom">
                  <small className="text-subtle d-block">Total reservas</small>
                  <div className="fs-3 font-serif">{reservas.length}</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card-custom">
                  <small className="text-subtle d-block">Confirmadas</small>
                  <div className="fs-3 font-serif text-gold">{confirmadas}</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card-custom">
                  <small className="text-subtle d-block">Pendientes</small>
                  <div className="fs-3 font-serif text-warning">{pendientes}</div>
                </div>
              </div>
              <div className="col-6 col-md-3">
                <div className="card-custom">
                  <small className="text-subtle d-block">Canceladas</small>
                  <div className="fs-3 font-serif text-danger">{canceladas}</div>
                </div>
              </div>
            </div>

            {[...porDia.entries()].map(([diaISO, lista]) => {
              const [y, m, d] = diaISO.split('-').map(Number);
              return (
                <section className="mb-4" key={diaISO}>
                  <h2 className="h4 font-serif mb-3 text-gold">
                    {formatFechaLarga(fechaLocalAUtc(y, m, d, 12, 0))}
                  </h2>
                  <div className="card-custom p-0 overflow-hidden">
                    <div className="table-responsive">
                      <table className="table-custom align-middle mb-0">
                        <thead>
                          <tr>
                            <th>Hora</th>
                            <th>Cliente</th>
                            <th>Servicio</th>
                            <th>Precio</th>
                            <th>Estado</th>
                            <th></th>
                          </tr>
                        </thead>
                        <tbody>
                          {lista.map((reserva) => (
                            <tr key={reserva.id}>
                              <td>
                                <strong>{formatHora(reserva.fechaHora)}</strong>
                                <br />
                                <small className="text-subtle">{reserva.duracion} min</small>
                              </td>
                              <td>
                                <strong>{reserva.cliente.nombre} {reserva.cliente.apellido}</strong>
                                <br />
                                <small className="text-subtle">
                                  {reserva.cliente.email}
                                  {reserva.cliente.telefono ? ` · ${reserva.cliente.telefono}` : ''}
                                </small>
                              </td>
                              <td>
                                {reserva.servicio.nombre}
                                <br />
                                <small className="text-subtle">{reserva.servicio.categoria.nombre}</small>
                              </td>
                              <td>
                                {formatCLP(reserva.precioFinal)}
                                {reserva.pagoRealizado && (
                                  <>
                                    <br />
                                    <span className="badge-gold">Pagado</span>
                                  </>
                                )}
                              </td>
                              <td>
                                <form action={cambiarEstadoReservaAction} className="d-flex flex-column gap-2">
                                  <input type="hidden" name="reservaId" value={reserva.id} />
                                  <input type="hidden" name="volverA" value={volverA} />
                                  <span className={`state-badge state-${reserva.estado.toLowerCase()}`}>
                                    {ESTADOS_RESERVA[reserva.estado]}
                                  </span>
                                  <select name="estado" defaultValue={reserva.estado} className="form-select form-select-sm shadow-none">
                                    {Object.entries(ESTADOS_RESERVA).map(([valor, etiqueta]) => (
                                      <option key={valor} value={valor}>{etiqueta}</option>
                                    ))}
                                  </select>
                                  <button type="submit" className="btn btn-outline-light btn-sm">Cambiar estado</button>
                                </form>
                              </td>
                              <td>
                                <Link className="text-gold text-decoration-none small" href={`/reservas/${reserva.id}`}>
                                  Ver →
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>
              );
            })}
          </>
        )}
      </div>
    </section>
  );
}
