import Link from 'next/link';
import { notFound } from 'next/navigation';

import { confirmarReservaAction } from '@/actions/reservas';
import { esAdmin, requerirUsuario } from '@/lib/auth';
import { BRAND } from '@/lib/config';
import { ESTADOS_RESERVA, METODOS_PAGO, formatCLP, formatFechaHoraLarga } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { INCLUDE_RESERVA_DETALLE, puedeCancelar, puedeModificar } from '@/lib/reservas';

/** Detalle de una reserva (solo su dueño o un administrador). */
export default async function DetalleReservaPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const usuario = await requerirUsuario(`/reservas/${id}`);
  const admin = esAdmin(usuario);

  const reserva = await prisma.reserva.findUnique({
    where: { id },
    include: INCLUDE_RESERVA_DETALLE,
  });
  if (!reserva) notFound();

  if (!admin) {
    const cliente = await prisma.cliente.findFirst({ where: { usuarioId: usuario.id } });
    if (!cliente || reserva.clienteId !== cliente.id) notFound();
  }

  const puedeMod = puedeModificar(reserva);
  const puedeCanc = puedeCancelar(reserva);
  const estadoEtiqueta = ESTADOS_RESERVA[reserva.estado] ?? reserva.estado;
  const nombreCliente =
    `${reserva.cliente.nombre} ${reserva.cliente.apellido}`.trim() || reserva.cliente.email;
  const descuento = reserva.servicio.precio - reserva.precioFinal;
  const whatsapp = `https://wa.me/${BRAND.whatsapp}?text=${encodeURIComponent(
    `Hola Macarena, tengo una consulta sobre mi reserva #${reserva.id}`,
  )}`;

  return (
    <section className="py-5">
      <div className="container-custom">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb breadcrumb-custom mb-0">
            <li className="breadcrumb-item">
              <Link href="/">Inicio</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/reservas/mi-cuenta">Mis reservas</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Reserva #{reserva.id}
            </li>
          </ol>
        </nav>

        <div className="row g-4">
          <div className="col-12 col-lg-8">
            <div className="card-custom">
              <div className="d-flex flex-wrap justify-content-between align-items-start gap-3 mb-3">
                <div>
                  <span
                    className={`state-badge state-${reserva.estado.toLowerCase()} mb-2 d-inline-block`}
                  >
                    {estadoEtiqueta}
                  </span>
                  <h1 className="h2 font-serif mb-1">Reserva #{reserva.id}</h1>
                  <p className="text-subtle mb-0">{formatFechaHoraLarga(reserva.fechaHora)}</p>
                </div>
                {!admin ? (
                  <div className="d-flex flex-wrap gap-2">
                    {puedeMod && reserva.estado !== 'CONFIRMADA' && (
                      <form action={confirmarReservaAction}>
                        <input type="hidden" name="reservaId" value={reserva.id} />
                        <button type="submit" className="btn btn-primary">
                          Confirmar reserva
                        </button>
                      </form>
                    )}
                    {puedeMod && (
                      <Link className="btn btn-outline-light" href="#">
                        Reagendar
                      </Link>
                    )}
                    {puedeCanc && (
                      <Link className="btn btn-outline-danger" href={`/reservas/${reserva.id}/cancelar`}>
                        Cancelar
                      </Link>
                    )}
                  </div>
                ) : (
                  <Link href="/reservas/admin/agenda" className="btn btn-outline-light">
                    Ver en agenda
                  </Link>
                )}
              </div>

              <hr className="border-dark-subtle my-4" />

              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <h3 className="h6 text-uppercase small letter-spacing text-gold mb-2">Cliente</h3>
                  <p className="mb-1 fw-semibold">{nombreCliente}</p>
                  <p className="mb-0 small text-subtle">{reserva.cliente.email}</p>
                  {reserva.cliente.telefono && (
                    <p className="mb-0 small text-subtle">📞 {reserva.cliente.telefono}</p>
                  )}
                </div>
                <div className="col-12 col-sm-6">
                  <h3 className="h6 text-uppercase small letter-spacing text-gold mb-2">Servicio</h3>
                  <p className="mb-1 fw-semibold">{reserva.servicio.nombre}</p>
                  <p className="mb-0 small text-subtle">{reserva.servicio.categoria.nombre}</p>
                </div>
                <div className="col-12 col-sm-6">
                  <h3 className="h6 text-uppercase small letter-spacing text-gold mb-2">Fecha / Hora</h3>
                  <p className="mb-0">{formatFechaHoraLarga(reserva.fechaHora)}</p>
                  <p className="mb-0 small text-subtle">
                    Duración aprox. {reserva.duracion} minutos
                  </p>
                </div>
                <div className="col-12 col-sm-6">
                  <h3 className="h6 text-uppercase small letter-spacing text-gold mb-2">Precio final</h3>
                  <p className="mb-0 fs-4 font-serif text-gold">{formatCLP(reserva.precioFinal)}</p>
                  {reserva.promocion && (
                    <p className="mb-0 small text-subtle">🎁 {reserva.promocion.nombre}</p>
                  )}
                </div>
                {reserva.pagoRealizado && (
                  <div className="col-12 col-sm-6">
                    <h3 className="h6 text-uppercase small letter-spacing text-gold mb-2">Pago</h3>
                    <p className="mb-0">
                      <span className="badge-gold">Pagado</span>
                      {reserva.metodoPago && (
                        <small className="text-subtle ms-2">
                          {METODOS_PAGO[reserva.metodoPago] ?? reserva.metodoPago}
                        </small>
                      )}
                    </p>
                  </div>
                )}
                {reserva.notasCliente && (
                  <div className="col-12">
                    <h3 className="h6 text-uppercase small letter-spacing text-gold mb-2">
                      Notas del cliente
                    </h3>
                    <p className="mb-0">{reserva.notasCliente}</p>
                  </div>
                )}
                {reserva.notasInternas && admin && (
                  <div className="col-12">
                    <h3 className="h6 text-uppercase small letter-spacing text-gold mb-2">
                      Notas internas (privado)
                    </h3>
                    <p className="mb-0 small text-subtle">{reserva.notasInternas}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="col-12 col-lg-4">
            <div className="card-custom sticky-top-custom">
              <h2 className="h5 font-serif mb-3">Resumen</h2>
              <ul className="list-unstyled mb-4 small">
                <li className="d-flex justify-content-between py-2 border-bottom border-dark-subtle">
                  <span className="text-subtle">
                    {reserva.servicio.nombre} ({reserva.duracion} min)
                  </span>
                  <span className="fw-semibold">{formatCLP(reserva.servicio.precio)}</span>
                </li>
                {reserva.promocion && (
                  <li className="d-flex justify-content-between py-2 border-bottom border-dark-subtle text-success">
                    <span>🎁 {reserva.promocion.nombre}</span>
                    <span>- {formatCLP(descuento)}</span>
                  </li>
                )}
                <li className="d-flex justify-content-between py-2">
                  <span className="fw-semibold">Total</span>
                  <span className="fs-4 font-serif text-gold">{formatCLP(reserva.precioFinal)}</span>
                </li>
              </ul>
              <a
                className="btn btn-primary d-flex align-items-center justify-content-center gap-2 w-100"
                href={whatsapp}
                target="_blank"
                rel="noopener noreferrer"
              >
                💬 Consultar por WhatsApp
              </a>
            </div>
          </aside>
        </div>
      </div>
    </section>
  );
}
