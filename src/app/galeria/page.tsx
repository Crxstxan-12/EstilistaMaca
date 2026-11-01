import type { Metadata } from 'next';

import { prisma } from '@/lib/prisma';

export const metadata: Metadata = {
  title: 'Galería de trabajos',
};

/** URL de imagen placeholder generada en el mismo formato que la plantilla Django. */
function urlPlaceholder(prompt: string): string {
  return `https://coresg-normal.trae.ai/api/ide/v1/text_to_image?prompt=${encodeURIComponent(
    prompt,
  )}&image_size=square_hd`;
}

const PROMPT_PLACEHOLDER_VACIO =
  'peluqueria macarena estilista corte mujer color balayage elegante';

/** Divide los tags separados por coma en una lista limpia. */
function listaTags(tags: string): string[] {
  return tags
    ? tags
        .split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
    : [];
}

export default async function GaleriaPage() {
  const trabajos = await prisma.galeriaTrabajo.findMany({
    where: { activo: true },
    include: { categoria: true },
  });

  return (
    <>
      <section className="page-head">
        <div className="container-custom">
          <div className="text-center py-5">
            <p className="section-eyebrow mb-2">🖼️ GALERÍA</p>
            <h1 className="h1 font-serif mb-2 section-title">
              Trabajos <span className="text-gradient-gold">recientes</span>
            </h1>
            <p className="text-subtle">Cortes, color, balayage, manicure y más. Inspírate.</p>
          </div>
        </div>
      </section>

      <section className="py-section">
        <div className="container-custom">
          {trabajos.length > 0 ? (
            <div className="gallery-grid gallery-grid-dense">
              {trabajos.map((trabajo) => (
                <figure
                  className={`gallery-item${trabajo.destacado ? ' tall' : ''}`}
                  key={trabajo.id}
                >
                  <div
                    className={`gallery-inner${trabajo.imagen ? '' : ' gallery-placeholder'}`}
                    style={{
                      backgroundImage: `url('${
                        trabajo.imagen ??
                        urlPlaceholder(trabajo.titulo || 'peluqueria elegante salon belleza mujer')
                      }')`,
                    }}
                  >
                    <figcaption>
                      <div className="h6 mb-0 font-serif">{trabajo.titulo}</div>
                      {trabajo.categoria && (
                        <small className="opacity-75">{trabajo.categoria.nombre}</small>
                      )}
                      {trabajo.tags && (
                        <div className="mt-2 d-flex gap-1 flex-wrap">
                          {listaTags(trabajo.tags).map((tag) => (
                            <span className="mini-pill" key={tag}>
                              #{tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </figcaption>
                  </div>
                </figure>
              ))}
            </div>
          ) : (
            <>
              <div className="gallery-grid gallery-grid-dense">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((indice) => (
                  <figure
                    className={`gallery-item${indice % 3 === 0 ? ' tall' : ''}`}
                    key={indice}
                  >
                    <div
                      className="gallery-inner gallery-placeholder"
                      style={{
                        backgroundImage: `url('${urlPlaceholder(PROMPT_PLACEHOLDER_VACIO)}')`,
                      }}
                    />
                  </figure>
                ))}
              </div>
              <div className="text-center mt-4">
                <p className="text-subtle small">📸 Galería con trabajos de ejemplo.</p>
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}
