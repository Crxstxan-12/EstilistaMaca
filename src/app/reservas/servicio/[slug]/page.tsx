import Link from 'next/link';
import { notFound } from 'next/navigation';

import SelectorFechaHora from './SelectorFechaHora';
import { horasDisponiblesTexto } from '@/lib/agenda';
import { requerirCliente } from '@/lib/auth';
import { precioServicio } from '@/lib/format';
import { prisma } from '@/lib/prisma';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ fecha?: string | string[] }>;
};

/** Paso 2 del flujo de reserva: elección de fecha y hora para un servicio. */
export default async function SeleccionarFechaHoraPage({ params, searchParams }: Props) {
  const { slug } = await params;
  await requerirCliente(`/reservas/servicio/${slug}`);

  const servicio = await prisma.servicio.findFirst({
    where: { slug, activo: true },
    include: { categoria: true },
  });
  if (!servicio) notFound();

  const { fecha } = await searchParams;
  const fechaISO =
    typeof fecha === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(fecha) ? fecha : '';
  const horas = fechaISO ? await horasDisponiblesTexto(fechaISO, servicio.duracion) : [];

  return (
    <section className="py-5">
      <div className="container-custom">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb breadcrumb-custom mb-0">
            <li className="breadcrumb-item">
              <Link href="/">Inicio</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/reservas">Servicios</Link>
            </li>
            <li className="breadcrumb-item">
              <Link href="/servicios">{servicio.categoria.nombre}</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              {servicio.nombre}
            </li>
          </ol>
        </nav>

        <div className="text-center mb-5">
          <h1 className="h1 font-serif mb-2 section-title">{servicio.nombre}</h1>
          <p className="text-subtle">Paso 2 / 3: Escoge la fecha y la hora que te acomode mejor.</p>
          <div className="progress-steps mt-4">
            <div className="step done">1 · Servicio</div>
            <div className="step active">2 · Fecha &amp; Hora</div>
            <div className="step">3 · Confirmación</div>
          </div>
        </div>

        <SelectorFechaHora
          servicioSlug={servicio.slug}
          servicioNombre={servicio.nombre}
          duracion={servicio.duracion}
          precioFormateado={precioServicio(servicio.precio, servicio.precioDesde)}
          fechaInicial={fechaISO}
          horasIniciales={horas}
        />
      </div>
    </section>
  );
}
