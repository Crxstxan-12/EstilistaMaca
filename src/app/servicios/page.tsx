import type { Metadata } from 'next';
import Link from 'next/link';

import IconoCategoria from '@/components/IconoCategoria';
import { TIPOS_DESCUENTO, precioServicio } from '@/lib/format';
import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Servicios',
};

/** Mezcla aleatoria: equivale a `order_by('?')` de Django. */
function mezclar<T>(elementos: T[]): T[] {
  const copia = [...elementos];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export default async function ServiciosPage() {
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

  const promociones = mezclar(
    await prisma.promocion.findMany({ where: { activo: true } }),
  ).slice(0, 3);

  return (
    <>
      <section className="page-head">
        <div className="container-custom">
          <div className="text-center py-5">
            <p className="section-eyebrow mb-2">✦ CATÁLOGO COMPLETO</p>
            <h1 className="h1 font-serif mb-2 section-title">
              Todos los <span className="text-gradient-gold">servicios</span>
            </h1>
            <p className="text-subtle">Selecciona el servicio y reserva tu hora con un clic.</p>
          </div>
        </div>
      </section>

      {promociones.length > 0 && (
        <section className="py-5">
          <div className="container-custom">
            <div className="section-head text-center mb-4">
              <h2 className="h3 font-serif mb-2">🎁 Promociones vigentes</h2>
            </div>
            <div className="row g-3">
              {promociones.map((promo) => (
                <div className="col-12 col-md-4" key={promo.id}>
                  <div className="card-custom promo-card h-100">
                    <div className="promo-tag mb-3">
                      {TIPOS_DESCUENTO[promo.tipoDescuento] ?? promo.tipoDescuento}
                    </div>
                    <h3 className="h4 font-serif mb-2">{promo.nombre}</h3>
                    {promo.codigo && (
                      <div className="promo-code mb-3">
                        Código: <strong>{promo.codigo}</strong>
                      </div>
                    )}
                    <Link href="/reservas" className="btn btn-outline-light w-100 mt-auto">
                      Reservar con esta promo
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="py-5">
        <div className="container-custom">
          {categorias.length > 0 ? (
            categorias
              .filter((cat) => cat.servicios.length > 0)
              .map((cat) => (
                <section id={`cat-${cat.slug}`} className="mb-6" key={cat.id}>
                  <div className="mb-4">
                    <h2 className="h3 font-serif mb-1">
                      <span className="text-gold">·</span> {cat.nombre}
                    </h2>
                    {cat.descripcion && <p className="text-subtle mb-0">{cat.descripcion}</p>}
                  </div>
                  <div className="row g-3">
                    {cat.servicios.map((servicio) => (
                      <div className="col-12 col-md-6 col-lg-4" key={servicio.id}>
                        <div className="card-custom service-card h-100 d-flex flex-column">
                          <div className="d-flex justify-content-between align-items-start mb-2">
                            <div className="service-icon">
                              <IconoCategoria icono={cat.icono} />
                            </div>
                            {servicio.destacado && (
                              <span className="badge-gold small">⭐ Destacado</span>
                            )}
                          </div>
                          <h3 className="h5 font-serif mb-1">{servicio.nombre}</h3>
                          {servicio.descripcionCorta && (
                            <p className="text-subtle small mb-2 flex-grow-1">
                              {servicio.descripcionCorta}
                            </p>
                          )}
                          <div className="d-flex align-items-end justify-content-between mt-auto pt-3">
                            <div>
                              <p className="mb-0 h5 font-serif text-gold">
                                {precioServicio(servicio.precio, servicio.precioDesde)}
                              </p>
                              <small className="text-subtle">⏱️ {servicio.duracion} min</small>
                            </div>
                            <Link
                              className="btn btn-primary btn-sm"
                              href={`/reservas/servicio/${servicio.slug}`}
                            >
                              Reservar
                            </Link>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </section>
              ))
          ) : (
            <div className="card-custom empty-state">
              <p className="mb-0 text-subtle">
                Estamos cargando los servicios. Por favor recarga en unos segundos.
              </p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
