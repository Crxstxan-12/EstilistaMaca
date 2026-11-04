import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';

import ReagendarForm from './ReagendarForm';
import { esAdmin, requerirUsuario } from '@/lib/auth';
import { fechaISOEnZona, horaEnZona } from '@/lib/datetime';
import { estadoHorariosDia } from '@/lib/agenda';
import { formatCLP, formatFechaHoraLarga } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import { INCLUDE_RESERVA_DETALLE, puedeModificar } from '@/lib/reservas';

export default async function ReagendarReservaPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const usuario = await requerirUsuario(`/reservas/${id}/reagendar`);
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

  if (!puedeModificar(reserva)) {
    redirect(`/reservas/${reserva.id}?error=Esta reserva ya no se puede reagendar.`);
  }

  const fechaInicial = fechaISOEnZona(reserva.fechaHora);
  const horaInicial = horaEnZona(reserva.fechaHora);
  const horasIniciales = await estadoHorariosDia(
    fechaInicial,
    reserva.duracion,
    undefined,
    reserva.id,
  );

  return (
    <section className="py-5">
      <div className="container-custom">
        <div className="row justify-content-center">
          <div className="col-12 col-xl-10">
            <div className="row g-4">
              <div className="col-12 col-lg-7">
                <div className="card-custom">
                  <h1 className="h2 font-serif mb-2">Reagendar reserva</h1>
                  <p className="text-subtle mb-4">
                    Elige una nueva fecha y hora. Las franjas marcadas con <strong>X</strong> ya
                    fueron tomadas por otras clientas o están bloqueadas.
                  </p>
                  <ReagendarForm
                    reservaId={reserva.id}
                    servicioSlug={reserva.servicio.slug}
                    fechaInicial={fechaInicial}
                    horaInicial={horaInicial}
                    horasIniciales={horasIniciales}
                  />
                </div>
              </div>

              <div className="col-12 col-lg-5">
                <div className="card-custom sticky-top-custom">
                  <p className="small text-gold mb-1">Reserva actual</p>
                  <h2 className="h4 font-serif mb-1">{reserva.servicio.nombre}</h2>
                  <p className="text-subtle mb-3">{formatFechaHoraLarga(reserva.fechaHora)}</p>
                  <ul className="list-unstyled small mb-4">
                    <li className="d-flex justify-content-between py-2 border-bottom border-dark-subtle">
                      <span className="text-subtle">Cliente</span>
                      <span>{`${reserva.cliente.nombre} ${reserva.cliente.apellido}`.trim()}</span>
                    </li>
                    <li className="d-flex justify-content-between py-2 border-bottom border-dark-subtle">
                      <span className="text-subtle">Duración</span>
                      <span>{reserva.duracion} min</span>
                    </li>
                    <li className="d-flex justify-content-between py-2">
                      <span className="text-subtle">Precio</span>
                      <span className="fw-semibold">{formatCLP(reserva.precioFinal)}</span>
                    </li>
                  </ul>
                  <Link href={`/reservas/${reserva.id}`} className="btn btn-outline-light w-100">
                    Volver al detalle
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
