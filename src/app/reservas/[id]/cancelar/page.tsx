import Link from 'next/link';
import { notFound } from 'next/navigation';

import BotonCancelar from './BotonCancelar';
import { cancelarReservaAction } from '@/actions/reservas';
import { esAdmin, requerirUsuario } from '@/lib/auth';
import { formatCLP, formatFechaHoraLarga } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { INCLUDE_RESERVA_DETALLE } from '@/lib/reservas';

/** Confirmación de cancelación de una reserva (solo su dueño o un administrador). */
export default async function CancelarReservaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await requerirUsuario(`/reservas/${id}/cancelar`);
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

  return (
    <section className="py-5">
      <div className="container-custom">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6">
            <div className="card-custom">
              <h1 className="h2 font-serif mb-2">¿Cancelar la reserva?</h1>
              <p className="text-subtle mb-4">
                Esta acción no se puede deshacer. Te recomendamos reagendar si solo necesitas cambiar el
                horario.
              </p>

              <div className="card-custom bg-dark border border-danger-subtle p-4 mb-4">
                <p className="mb-1 small text-gold">Reserva #{reserva.id}</p>
                <h3 className="h5 font-serif mb-1">{reserva.servicio.nombre}</h3>
                <p className="mb-0">📅 {formatFechaHoraLarga(reserva.fechaHora)}</p>
                <p className="mb-0 small text-subtle">💲 {formatCLP(reserva.precioFinal)}</p>
              </div>

              <form action={cancelarReservaAction} noValidate>
                <input type="hidden" name="reservaId" value={reserva.id} />
                <div className="mb-3">
                  <label className="form-label">Motivo (opcional)</label>
                  <textarea
                    name="motivo"
                    rows={3}
                    className="form-control shadow-none"
                    placeholder="Cuéntanos por qué cancelas (nos ayuda a mejorar)"
                  />
                </div>
                <div className="d-flex flex-wrap gap-2 justify-content-end">
                  <Link className="btn btn-outline-light" href={`/reservas/${reserva.id}`}>
                    No, volver atrás
                  </Link>
                  <BotonCancelar />
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
