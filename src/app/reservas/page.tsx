import Link from 'next/link';

import IconoCategoria from '@/components/IconoCategoria';
import { requerirCliente } from '@/lib/auth';
import { precioServicio } from '@/lib/format';
import { prisma } from '@/lib/prisma';

/** Paso 1 del flujo de reserva: elección del servicio. */
export default async function SeleccionarServicioPage() {
  await requerirCliente('/reservas');

  const categorias = await prisma.categoria.findMany({
    where: { activo: true },
    include: {
      servicios: {
        where: { activo: true },
        orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
      },
    },
    orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
  });

  return (
    <section className="py-5">
      <div className="container-custom">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb breadcrumb-custom mb-0">
            <li className="breadcrumb-item">
              <Link href="/">Inicio</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Reservar hora
            </li>
          </ol>
        </nav>

        <div className="text-center mb-5">
          <h1 className="h1 font-serif mb-2 section-title">Reserva tu experiencia</h1>
          <p className="text-subtle">Paso 1 / 3: Elige el servicio que deseas reservar.</p>
          <div className="progress-steps mt-4">
            <div className="step active">1 · Servicio</div>
            <div className="step">2 · Fecha &amp; Hora</div>
            <div className="step">3 · Confirmación</div>
          </div>
        </div>

        {categorias.length > 0 ? (
          categorias.map((cat) => (
            <section className="mb-5" key={cat.id}>
              <div className="d-flex align-items-baseline justify-content-between mb-3 gap-3 flex-wrap">
                <h2 className="h3 font-serif mb-0">
                  <span className="text-gold">·</span> {cat.nombre}
                </h2>
                <small className="text-subtle">{cat.servicios.length} opciones</small>
              </div>
              {cat.descripcion && <p className="text-subtle mb-3">{cat.descripcion}</p>}
              <div className="row g-3">
                {cat.servicios.map((s) => (
                  <div className="col-12 col-md-6 col-lg-4" key={s.id}>
                    <Link
                      className="card-custom service-card h-100 d-flex flex-column text-decoration-none"
                      href={`/reservas/servicio/${s.slug}`}
                    >
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <div className="service-icon">
                          <IconoCategoria icono={cat.icono} />
                        </div>
                        <span className="badge-gold small">Reservar →</span>
                      </div>
                      <h3 className="h5 font-serif mb-1">{s.nombre}</h3>
                      {s.descripcionCorta && (
                        <p className="text-subtle small mb-2 flex-grow-1">{s.descripcionCorta}</p>
                      )}
                      <div className="d-flex align-items-end justify-content-between mt-auto pt-3">
                        <div>
                          <p className="mb-0 h4 font-serif text-gold">
                            {precioServicio(s.precio, s.precioDesde)}
                          </p>
                        </div>
                        <small className="text-subtle">⏱️ {s.duracion} min</small>
                      </div>
                    </Link>
                  </div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="card-custom empty-state">
            <div className="empty-icon mb-3">🛠️</div>
            <p className="mb-0 text-subtle">
              Estamos preparando el catálogo de servicios. ¡Vuelve pronto!
            </p>
          </div>
        )}
      </div>
    </section>
  );
}
