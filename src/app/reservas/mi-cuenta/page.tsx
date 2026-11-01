import Link from 'next/link';

import { requerirCliente } from '@/lib/auth';
import { fechaISOEnZona, hoyISO } from '@/lib/datetime';
import { ESTADOS_RESERVA, formatCLP, formatFechaHoraCorta, formatFechaHoraLarga } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import {
  INCLUDE_RESERVA_DETALLE,
  obtenerOCrearCliente,
  puedeCancelar,
  puedeModificar,
  type ReservaDetalle,
} from '@/lib/reservas';

/** Listado de reservas del cliente autenticado, separadas en próximas e historial. */
export default async function MisReservasPage() {
  const usuario = await requerirCliente('/reservas/mi-cuenta');
  const cliente = await obtenerOCrearCliente(usuario);

  const reservas = await prisma.reserva.findMany({
    where: { clienteId: cliente.id },
    include: INCLUDE_RESERVA_DETALLE,
    orderBy: { fechaHora: 'desc' },
  });

  const hoy = hoyISO();
  const proximas: ReservaDetalle[] = [];
  const historial: ReservaDetalle[] = [];
  for (const reserva of reservas) {
    if (fechaISOEnZona(reserva.fechaHora) >= hoy && reserva.estado !== 'CANCELADA') {
      proximas.push(reserva);
    } else {
      historial.push(reserva);
    }
  }
  const proximasLimitadas = proximas.slice(0, 10);

  return (
    <section className="py-5">
      <div className="container-custom">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb breadcrumb-custom mb-0">
            <li className="breadcrumb-item">
              <Link href="/">Inicio</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Mis reservas
            </li>
          </ol>
        </nav>

        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <h1 className="h2 font-serif mb-0">Mis reservas</h1>
          <Link className="btn btn-primary" href="/reservas">
            + Nueva reserva
          </Link>
        </div>

        <h2 className="h4 font-serif mb-3">Próximas</h2>
        {proximasLimitadas.length > 0 ? (
          <div className="row g-3 mb-5">
            {proximasLimitadas.map((r) => (
              <div className="col-12 col-md-6 col-xl-4" key={r.id}>
                <div className="card-custom h-100 d-flex flex-column">
                  <div className="d-flex justify-content-between align-items-start mb-2">
                    <span className={`state-badge state-${r.estado.toLowerCase()}`}>
                      {ESTADOS_RESERVA[r.estado] ?? r.estado}
                    </span>
                    <small className="text-subtle">#{r.id}</small>
                  </div>
                  <h3 className="h5 font-serif mb-1">{r.servicio.nombre}</h3>
                  <p className="text-subtle small mb-2">📂 {r.servicio.categoria.nombre}</p>
                  <ul className="list-unstyled text-light mb-3 small">
                    <li className="mb-1">
                      📅 <strong>{formatFechaHoraLarga(r.fechaHora)}</strong>
                    </li>
                    <li className="mb-1">⏱️ Duración aprox. {r.duracion} min</li>
                    <li className="mb-1">
                      💲 Precio final <strong>{formatCLP(r.precioFinal)}</strong>
                    </li>
                    {r.promocion && <li className="mb-1">🎁 Promoción: {r.promocion.nombre}</li>}
                  </ul>
                  <div className="mt-auto d-flex flex-wrap gap-2">
                    <Link
                      href={`/reservas/${r.id}`}
                      className="btn btn-outline-primary flex-grow-1"
                    >
                      Ver detalle
                    </Link>
                    {puedeModificar(r) && (
                      <Link href={`/reservas/${r.id}`} className="btn btn-outline-light">
                        Reagendar
                      </Link>
                    )}
                    {puedeCancelar(r) && (
                      <Link href={`/reservas/${r.id}/cancelar`} className="btn btn-outline-danger">
                        Cancelar
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="card-custom empty-state mb-5">
            <div className="empty-icon mb-3">📅</div>
            <h3 className="h5 font-serif mb-2">Aún no tienes reservas próximas</h3>
            <p className="text-subtle mb-4">Reserva tu primera hora en segundos.</p>
            <Link href="/reservas" className="btn btn-primary">
              Reservar ahora
            </Link>
          </div>
        )}

        <h2 className="h4 font-serif mb-3">Historial</h2>
        {historial.length > 0 ? (
          <div className="card-custom p-0 overflow-hidden">
            <div className="table-responsive">
              <table className="table-custom mb-0">
                <thead>
                  <tr>
                    <th>N°</th>
                    <th>Fecha / Hora</th>
                    <th>Servicio</th>
                    <th>Duración</th>
                    <th>Precio</th>
                    <th>Estado</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {historial.map((r) => (
                    <tr key={r.id}>
                      <td>#{r.id}</td>
                      <td>{formatFechaHoraCorta(r.fechaHora)}</td>
                      <td>{r.servicio.nombre}</td>
                      <td>{r.duracion} min</td>
                      <td>{formatCLP(r.precioFinal)}</td>
                      <td>
                        <span className={`state-badge state-${r.estado.toLowerCase()}`}>
                          {ESTADOS_RESERVA[r.estado] ?? r.estado}
                        </span>
                      </td>
                      <td>
                        <Link
                          href={`/reservas/${r.id}`}
                          className="text-gold text-decoration-none small"
                        >
                          Detalle →
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="card-custom empty-state">
            <p className="mb-0 text-subtle">No hay historial de reservas aún.</p>
          </div>
        )}
      </div>
    </section>
  );
}
