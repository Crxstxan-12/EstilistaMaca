import Link from 'next/link';

import IconoCategoria from '@/components/IconoCategoria';
import { BRAND } from '@/lib/config';
import { DIAS_SEMANA } from '@/lib/datetime';
import { TIPOS_DESCUENTO, precioServicio } from '@/lib/format';
import { prisma } from '@/lib/prisma';

const IMAGEN_GALERIA = (titulo: string) =>
  `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    `${titulo} macarena estilista salon`,
  )}&image_size=square`;

const IMAGEN_GALERIA_VACIA =
  'https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=peluqueria%20macarena%20estilista%20corte%20mujer%20color%20balayage%20elegante&image_size=square';

function mezclar<T>(elementos: T[]): T[] {
  const copia = [...elementos];
  for (let i = copia.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia;
}

export default async function HomePage() {
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

  let destacados = await prisma.servicio.findMany({
    where: { activo: true, destacado: true },
    include: { categoria: true },
    orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
    take: 6,
  });
  if (destacados.length === 0) {
    destacados = await prisma.servicio.findMany({
      where: { activo: true },
      include: { categoria: true },
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
      take: 6,
    });
  }

  const promociones = mezclar(
    await prisma.promocion.findMany({ where: { activo: true } }),
  ).slice(0, 3);

  const galeria = await prisma.galeriaTrabajo.findMany({
    where: { activo: true, destacado: true },
    include: { categoria: true },
    take: 8,
  });

  const horarios = await prisma.horarioSemanal.findMany({ orderBy: { dia: 'asc' } });
  const categoriasConServicios = categorias.filter((cat) => cat.servicios.length > 0);

  return (
    <>
      <section className="hero-section">
        <div className="container-custom">
          <div className="row align-items-center gy-5">
            <div className="col-12 col-lg-7 hero-text">
              <div className="hero-eyebrow mb-3">
                <span className="hero-badge">
                  <span className="dot-pulse" /> Agenda abierta · {horarios.length || 7} horarios
                </span>
              </div>
              <h1 className="font-serif hero-title mb-4">
                El arte de verte <span className="text-gradient-gold">espectacular</span>.
              </h1>
              <p className="hero-sub mb-4">
                Estética boutique de la mano de <strong>{BRAND.nombre}</strong>. Coloración, alisados,
                cortes y técnicas exclusivas en un ambiente cálido, privado y premium. Reserva tu hora en
                segundos.
              </p>
              <div className="hero-cta d-flex flex-wrap gap-3 mb-5">
                <Link href="/reservas" className="btn btn-primary btn-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  Reservar hora
                </Link>
                <a href="#servicios" className="btn btn-outline-light btn-lg">
                  Ver servicios
                </a>
              </div>
              <div className="hero-stats row">
                <div className="col-4">
                  <div className="stat-value font-serif">{destacados.length || 25}+</div>
                  <div className="stat-label">Servicios premium</div>
                </div>
                <div className="col-4">
                  <div className="stat-value font-serif">{categorias.length || 6}</div>
                  <div className="stat-label">Categorías</div>
                </div>
                <div className="col-4">
                  <div className="stat-value font-serif">100%</div>
                  <div className="stat-label">Clientas felices</div>
                </div>
              </div>
            </div>
            <div className="col-12 col-lg-5 hero-visual text-center">
              <div className="hero-badge-stack">
                <div className="hero-card-top">
                  <div className="logo-circle mb-3 mx-auto" style={{ width: 96, height: 96 }}>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="42" height="42">
                      <circle cx="6" cy="6" r="3" />
                      <circle cx="6" cy="18" r="3" />
                      <line x1="20" y1="4" x2="8.12" y2="15.88" />
                      <line x1="14.47" y1="14.48" x2="20" y2="20" />
                      <line x1="8.12" y1="8.12" x2="12" y2="12" />
                    </svg>
                  </div>
                  <div className="h5 font-serif mb-1">{BRAND.nombre}</div>
                  <p className="mb-0 text-subtle">
                    {BRAND.subtitulo} · {BRAND.instagram}
                  </p>
                </div>
                <div className="hero-card-bottom">
                  <div className="row g-2">
                    <div className="col-6"><span className="mini-pill">✨ Balayage premium</span></div>
                    <div className="col-6"><span className="mini-pill">💅 Manicure spa</span></div>
                    <div className="col-6"><span className="mini-pill">🧴 Alisado orgánico</span></div>
                    <div className="col-6"><span className="mini-pill">🌀 Rizos permanentes</span></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="hero-scrolldown">
          <a href="#servicios" aria-label="Ir a servicios">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <polyline points="19 12 12 19 5 12" />
            </svg>
          </a>
        </div>
      </section>

      <section id="servicios" className="py-section">
        <div className="container-custom">
          <div className="section-head text-center mb-5">
            <p className="section-eyebrow mb-2">✦ NUESTROS SERVICIOS</p>
            <h2 className="section-title font-serif mb-3">
              Experiencias pensadas para <span className="text-gradient-gold">resaltar tu belleza</span>
            </h2>
            <p className="section-sub text-subtle">
              Categorías destacadas con los servicios más solicitados.
            </p>
          </div>

          {categoriasConServicios.length > 0 ? (
            categoriasConServicios.map((cat) => (
              <section className="mb-6" key={cat.id}>
                <div className="d-flex align-items-end justify-content-between mb-4 flex-wrap gap-3">
                  <div>
                    <h3 className="h3 font-serif mb-1">
                      <span className="text-gold">·</span> {cat.nombre}
                    </h3>
                    {cat.descripcion && <p className="text-subtle mb-0">{cat.descripcion}</p>}
                  </div>
                  <Link
                    href={`/servicios#cat-${cat.slug}`}
                    className="text-gold text-decoration-none small fw-semibold"
                  >
                    Ver todos →
                  </Link>
                </div>
                <div className="row g-3">
                  {cat.servicios.map((servicio) => (
                    <div className="col-12 col-md-6 col-lg-3" key={servicio.id}>
                      <Link
                        className="card-custom service-card h-100 d-flex flex-column text-decoration-none"
                        href={`/reservas/servicio/${servicio.slug}`}
                      >
                        <div className="d-flex justify-content-between align-items-start mb-2">
                          <div className="service-icon">
                            <IconoCategoria icono={cat.icono} />
                          </div>
                          {servicio.destacado && <span className="badge-gold small">Destacado</span>}
                        </div>
                        <h4 className="h5 font-serif mb-1">{servicio.nombre}</h4>
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
                          </div>
                          <small className="text-subtle">⏱️ {servicio.duracion} min</small>
                        </div>
                      </Link>
                    </div>
                  ))}
                </div>
              </section>
            ))
          ) : (
            <div className="card-custom empty-state">
              <div className="empty-icon mb-3">✨</div>
              <h3 className="h5 font-serif mb-2">Catálogo en preparación</h3>
              <p className="text-subtle mb-0">Nuestros servicios aparecerán aquí muy pronto.</p>
            </div>
          )}
        </div>
      </section>

      <section className="py-section bg-soft-dark">
        <div className="container-custom">
          <div className="section-head text-center mb-5">
            <p className="section-eyebrow mb-2">🎁 PROMOCIONES</p>
            <h2 className="section-title font-serif mb-3">
              Ofertas <span className="text-gradient-gold">exclusivas</span>
            </h2>
            <p className="section-sub text-subtle">Descuentos especiales para nuestras clientas.</p>
          </div>

          {promociones.length > 0 ? (
            <div className="row g-3">
              {promociones.map((promo) => (
                <div className="col-12 col-md-4" key={promo.id}>
                  <div className="card-custom promo-card h-100">
                    <div className="promo-tag mb-3">
                      {TIPOS_DESCUENTO[promo.tipoDescuento] ?? promo.tipoDescuento}
                    </div>
                    <h3 className="h4 font-serif mb-2">{promo.nombre}</h3>
                    {promo.descripcion && (
                      <p className="text-subtle small mb-3">{promo.descripcion}</p>
                    )}
                    {promo.codigo && (
                      <div className="promo-code mb-3">
                        Código: <strong>{promo.codigo}</strong>
                      </div>
                    )}
                    <div className="mt-auto">
                      <Link href="/reservas" className="btn btn-outline-light w-100">
                        Aplicar promo
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="card-custom empty-state">
              <div className="empty-icon mb-3">🎁</div>
              <p className="mb-0 text-subtle">
                Actualmente sin promociones vigentes. ¡Sigue nuestras redes para novedades!
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="py-section">
        <div className="container-custom">
          <div className="row justify-content-between align-items-center gap-4 flex-wrap gy-5">
            <div className="col-12 col-lg-6">
              <p className="section-eyebrow mb-2">📍 UBICACIÓN &amp; HORARIO</p>
              <h2 className="section-title font-serif mb-4">
                Tu momento de belleza <span className="text-gradient-gold">en un solo lugar</span>
              </h2>
              <p className="text-subtle mb-4">
                Encuéntranos en un espacio boutique privado, acogedor y diseñado para que disfrutes cada
                minuto.
              </p>
              <ul className="list-unstyled mb-4">
                <li className="mb-3">
                  <div className="d-flex gap-3 align-items-start">
                    <div className="icon-circle">📍</div>
                    <div>
                      <strong>Dirección</strong>
                      <br />
                      <span className="text-subtle">{BRAND.direccion}</span>
                    </div>
                  </div>
                </li>
                <li className="mb-3">
                  <div className="d-flex gap-3 align-items-start">
                    <div className="icon-circle">📞</div>
                    <div>
                      <strong>WhatsApp / Teléfono</strong>
                      <br />
                      <span className="text-subtle">{BRAND.telefonoVisible}</span>
                    </div>
                  </div>
                </li>
                <li className="mb-3">
                  <div className="d-flex gap-3 align-items-start">
                    <div className="icon-circle">✉️</div>
                    <div>
                      <strong>Contacto</strong>
                      <br />
                      <span className="text-subtle">{BRAND.emailContacto}</span>
                    </div>
                  </div>
                </li>
              </ul>
              <Link href="/contacto" className="btn btn-primary">
                Ir a contacto
              </Link>
            </div>
            <div className="col-12 col-lg-5">
              <div className="card-custom hours-card">
                <h3 className="h4 font-serif mb-4 text-center">Horarios de atención</h3>
                <ul className="list-unstyled hours-list mb-0">
                  {horarios.length > 0 ? (
                    horarios.map((horario) => (
                      <li className={horario.abierto ? '' : 'closed'} key={horario.dia}>
                        <span className="day">{DIAS_SEMANA[horario.dia] ?? '—'}</span>
                        <span className="time">
                          {horario.abierto
                            ? `${horario.horaApertura} a ${horario.horaCierre}`
                            : 'Cerrado'}
                        </span>
                      </li>
                    ))
                  ) : (
                    <li>
                      <span className="day">Próximamente</span>
                      <span className="time">Pronto publicaremos nuestros horarios</span>
                    </li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-section">
        <div className="container-custom">
          <div className="section-head text-center mb-5">
            <p className="section-eyebrow mb-2">🖼️ GALERÍA</p>
            <h2 className="section-title font-serif mb-3">
              Resultados que <span className="text-gradient-gold">hablan por sí solos</span>
            </h2>
            <p className="section-sub text-subtle">Algunos de nuestros trabajos más recientes.</p>
          </div>

          {galeria.length > 0 ? (
            <>
              <div className="gallery-grid">
                {galeria.map((trabajo) => (
                  <figure className="gallery-item" key={trabajo.id}>
                    <div
                      className="gallery-inner"
                      style={{
                        backgroundImage: `url('${trabajo.imagen ?? IMAGEN_GALERIA(trabajo.titulo)}')`,
                      }}
                    >
                      <figcaption>
                        <div className="h6 mb-0 font-serif">{trabajo.titulo}</div>
                        {trabajo.categoria && (
                          <small className="opacity-75">{trabajo.categoria.nombre}</small>
                        )}
                      </figcaption>
                    </div>
                  </figure>
                ))}
              </div>
              <div className="text-center mt-5">
                <Link className="btn btn-outline-light" href="/galeria">
                  Ver galería completa →
                </Link>
              </div>
            </>
          ) : (
            <div className="gallery-grid">
              {[1, 2, 3, 4, 5, 6].map((indice) => (
                <figure className="gallery-item" key={indice}>
                  <div
                    className="gallery-inner"
                    style={{ backgroundImage: `url('${IMAGEN_GALERIA_VACIA}')` }}
                  />
                </figure>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-section">
        <div className="container-custom">
          <div className="cta-final card-custom">
            <div className="row align-items-center gap-4 flex-wrap gy-5">
              <div className="col-12 col-lg-7">
                <h2 className="section-title font-serif mb-2">
                  ¿Lista para tu <span className="text-gradient-gold">nueva versión</span>?
                </h2>
                <p className="text-subtle mb-0">
                  Reserva tu próxima hora en menos de 1 minuto. Sin registro complicado ni llamadas.
                </p>
              </div>
              <div className="col-12 col-lg-4 text-lg-end">
                <Link href="/reservas" className="btn btn-primary btn-lg px-5">
                  Reservar ahora ✨
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
