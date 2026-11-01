import type { Metadata } from 'next';
import Link from 'next/link';

import { BRAND } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Política de Privacidad',
};

const DATOS_TABLA = [
  { dato: 'Nombre y apellidos', cuando: 'Al registrarte o reservar', badge: 'pendiente', obligatorio: 'Sí' },
  { dato: 'Correo electrónico', cuando: 'Al registrarte o reservar', badge: 'pendiente', obligatorio: 'Sí' },
  { dato: 'Número de teléfono', cuando: 'Al completar tu perfil', badge: 'reagendada', obligatorio: 'Sugerido' },
  { dato: 'Fecha de nacimiento', cuando: 'Al completar tu perfil', badge: 'cancelada', obligatorio: 'Opcional' },
  { dato: 'Foto de perfil', cuando: 'Al subirla manualmente', badge: 'cancelada', obligatorio: 'Opcional' },
  { dato: 'Datos de reserva', cuando: 'Cada vez que agendes una hora', badge: 'pendiente', obligatorio: 'Sí' },
  { dato: 'Notas y mensajes', cuando: 'Formulario de contacto o detalle reserva', badge: 'cancelada', obligatorio: 'Opcional' },
];

const USOS_DATOS = [
  'Gestionar tu cuenta de cliente y personalizar tu experiencia.',
  'Procesar, confirmar, reagendar o cancelar tus reservas de hora.',
  'Enviar notificaciones importantes sobre tus reservas (cambios de estado, recordatorios).',
  'Responder tus consultas enviadas desde el formulario de contacto.',
  'Aplicar promociones y beneficios VIP si tu perfil lo indica.',
  'Cumplir con obligaciones legales o tributarias aplicables.',
];

const SEGURIDAD_DATOS = [
  { titulo: 'HTTPS en producción', detalle: 'Todo el tráfico cifrado con TLS.' },
  { titulo: 'Contraseñas hasheadas', detalle: 'Almacenadas con algoritmos PBKDF2 recomendados.' },
  { titulo: 'Cookies HTTPOnly', detalle: 'No accesibles desde JavaScript.' },
  { titulo: 'Token CSRF', detalle: 'En todos los formularios POST.' },
  { titulo: 'Rate limit login', detalle: 'Bloqueo tras 5 intentos fallidos.' },
];

const DERECHOS_ARCO = [
  {
    titulo: '🅰️ Acceso',
    detalle:
      'Solicitar una copia de todos los datos personales que tenemos guardados sobre ti.',
  },
  {
    titulo: '🆁 Rectificación',
    detalle:
      'Modificar datos incorrectos o incompletos (también lo puedes hacer desde tu perfil).',
  },
  {
    titulo: '🅲 Cancelación / Supresión',
    detalle:
      'Pedir la eliminación de tus datos cuando ya no sean necesarios para el fin para el que fueron recolectados.',
  },
  {
    titulo: '🅾 Oposición / Limitación',
    detalle: 'Oponerte al tratamiento o limitar su uso en situaciones específicas.',
  },
];

export default function PrivacidadPage() {
  return (
    <section className="py-section">
      <div className="container">
        <div className="breadcrumb-custom mb-4 small">
          <Link href="/" className="text-muted text-decoration-none">
            Inicio
          </Link>
          <span className="mx-2 text-gold">/</span>
          <span className="text-gold fw-semibold">Política de Privacidad</span>
        </div>

        <div className="row g-5">
          <div className="col-12 col-lg-8 mx-auto">
            <div className="mb-5 text-center">
              <h1 className="font-serif display-6 mb-3">
                Política de <span className="text-gold">Privacidad</span>
              </h1>
              <p className="lead text-muted">
                En {BRAND.nombre} nos tomamos muy en serio la protección de tus datos personales.
                Esta política explica qué información recolectamos, cómo la usamos y cuáles son tus
                derechos.
              </p>
            </div>

            <div className="card card-boutique shadow-sm p-4 p-md-5">
              <div className="d-flex align-items-start gap-3 mb-4">
                <div className="icon-circle bg-gold-soft">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-serif h4 mb-1">1. Responsable del tratamiento de datos</h2>
                  <p className="mb-0 text-muted">
                    <strong>{BRAND.nombre}</strong> — {BRAND.subtitulo}
                    <br />
                    Instagram:{' '}
                    <a
                      href={BRAND.instagramUrl}
                      target="_blank"
                      rel="noopener"
                      className="text-gold"
                    >
                      {BRAND.instagram}
                    </a>
                    <br />
                    E-mail de contacto:{' '}
                    <a href={`mailto:${BRAND.emailContacto}`} className="text-gold">
                      {BRAND.emailContacto}
                    </a>
                  </p>
                </div>
              </div>

              <hr className="my-5" />

              <div className="d-flex align-items-start gap-3 mb-4">
                <div className="icon-circle bg-gold-soft">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <line x1="22" y1="11" x2="16" y2="11" />
                  </svg>
                </div>
                <div className="flex-grow-1">
                  <h2 className="font-serif h4 mb-3">2. ¿Qué datos personales recolectamos?</h2>
                  <p className="mb-3">
                    Recolectamos únicamente los datos necesarios para prestar nuestros servicios:
                  </p>

                  <div className="table-responsive">
                    <table className="table table-custom align-middle">
                      <thead>
                        <tr>
                          <th className="ps-0">Dato</th>
                          <th>¿Cuándo lo pedimos?</th>
                          <th className="pe-0">¿Es obligatorio?</th>
                        </tr>
                      </thead>
                      <tbody>
                        {DATOS_TABLA.map((fila) => (
                          <tr key={fila.dato}>
                            <td className="fw-semibold ps-0">{fila.dato}</td>
                            <td>{fila.cuando}</td>
                            <td className="pe-0">
                              <span className={`badge state-badge state-${fila.badge}`}>
                                {fila.obligatorio}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>

              <hr className="my-5" />

              <div className="d-flex align-items-start gap-3 mb-4">
                <div className="icon-circle bg-gold-soft">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <div className="flex-grow-1">
                  <h2 className="font-serif h4 mb-3">3. ¿Para qué usamos tus datos?</h2>
                  <ul className="list-group list-group-custom list-group-flush">
                    {USOS_DATOS.map((uso) => (
                      <li className="list-group-item bg-transparent ps-0 border-color-subtle" key={uso}>
                        <span className="text-gold me-2">✓</span>
                        {uso}
                      </li>
                    ))}
                  </ul>
                  <p className="small text-muted mt-3 mb-0">
                    <strong className="text-dark-custom">Nunca</strong> venderemos, alquilaremos ni
                    compartiremos tus datos con terceros para fines publicitarios.
                  </p>
                </div>
              </div>

              <hr className="my-5" />

              <div className="d-flex align-items-start gap-3 mb-4">
                <div className="icon-circle bg-gold-soft">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="flex-grow-1">
                  <h2 className="font-serif h4 mb-3">4. Cookies y tecnologías de seguimiento</h2>
                  <p className="mb-3">
                    Esta web utiliza <strong>únicamente cookies estrictamente necesarias</strong>
                    {' '}para su correcto funcionamiento.{' '}
                    <strong>No usamos cookies de análisis, publicidad ni tracking.</strong>
                  </p>

                  <div className="accordion" id="cookiesAccordion">
                    <div className="accordion-item border-color-subtle">
                      <h2 className="accordion-header" id="headingOne">
                        <button
                          className="accordion-button bg-soft-light text-dark-custom"
                          type="button"
                          data-bs-toggle="collapse"
                          data-bs-target="#collapseOne"
                          aria-expanded="true"
                          aria-controls="collapseOne"
                        >
                          <strong className="font-serif">
                            🍪 Cookies esenciales (no se pueden desactivar)
                          </strong>
                        </button>
                      </h2>
                      <div
                        id="collapseOne"
                        className="accordion-collapse collapse show"
                        aria-labelledby="headingOne"
                        data-bs-parent="#cookiesAccordion"
                      >
                        <div className="accordion-body">
                          <ul className="mb-0 small">
                            <li>
                              <code>sessionid</code> — Cookie de sesión (HTTPOnly).{' '}
                              <span className="text-muted">
                                Mantiene tu login mientras navegas. Caduca al cerrar el navegador.
                              </span>
                            </li>
                            <li className="mt-2">
                              <code>csrftoken</code> — Token CSRF.{' '}
                              <span className="text-muted">
                                Protege tus formularios contra ataques de suplantación de identidad.
                              </span>
                            </li>
                            <li className="mt-2">
                              <code>cookies_consent</code> — Tu consentimiento.{' '}
                              <span className="text-muted">
                                Guarda tu aceptación de esta política durante 12 meses.
                              </span>
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="small text-muted mt-3 mb-0">
                    Puedes desactivar o eliminar cookies desde la configuración de tu navegador en
                    cualquier momento, aunque algunas funcionalidades del sitio podrían dejar de
                    funcionar correctamente.
                  </p>
                </div>
              </div>

              <hr className="my-5" />

              <div className="d-flex align-items-start gap-3 mb-4">
                <div className="icon-circle bg-gold-soft">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="flex-grow-1">
                  <h2 className="font-serif h4 mb-3">5. Seguridad de tus datos</h2>
                  <p className="mb-2">Aplicamos medidas técnicas y organizativas para proteger tus datos:</p>
                  <ul className="mb-0 small">
                    {SEGURIDAD_DATOS.map((item) => (
                      <li className="mb-1" key={item.titulo}>
                        <span className="text-gold fw-semibold">{item.titulo}</span> — {item.detalle}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              <hr className="my-5" />

              <div className="d-flex align-items-start gap-3 mb-4">
                <div className="icon-circle bg-gold-soft">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div className="flex-grow-1">
                  <h2 className="font-serif h4 mb-3">6. Tus derechos (ARCO)</h2>
                  <p className="mb-3">
                    Tienes derecho a ejercer las siguientes acciones sobre tus datos personales, sin
                    costo alguno:
                  </p>
                  <div className="row g-3 mb-3">
                    {DERECHOS_ARCO.map((derecho) => (
                      <div className="col-12 col-md-6" key={derecho.titulo}>
                        <div className="p-3 border border-color-subtle rounded-4 bg-light h-100">
                          <p className="fw-bold mb-1 text-gold">{derecho.titulo}</p>
                          <p className="small mb-0 text-muted">{derecho.detalle}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                  <p className="small mb-0">
                    Para ejercer cualquiera de estos derechos, envía un correo a{' '}
                    <a
                      href={`mailto:${BRAND.emailContacto}`}
                      className="text-gold fw-semibold"
                    >
                      {BRAND.emailContacto}
                    </a>{' '}
                    adjuntando una copia de tu cédula de identidad y detallando la solicitud.
                    Responderemos a la brevedad.
                  </p>
                </div>
              </div>

              <hr className="my-5" />

              <div className="d-flex align-items-start gap-3">
                <div className="icon-circle bg-gold-soft">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <div>
                  <h2 className="font-serif h4 mb-2">7. Actualizaciones de esta política</h2>
                  <p className="mb-0 text-muted">
                    Nos reservamos el derecho de actualizar esta política de privacidad para reflejar
                    cambios en nuestras prácticas o por requisitos legales. Te recomendamos revisarla
                    periódicamente. La versión vigente fue actualizada por última vez en{' '}
                    <strong>septiembre de 2026</strong>.
                  </p>
                </div>
              </div>
            </div>

            <div className="text-center mt-5">
              <Link href="/" className="btn btn-outline-dark-custom btn-lg me-2">
                ← Volver al inicio
              </Link>
              <Link href="/contacto" className="btn btn-gold btn-lg">
                ¿Tienes dudas? Contáctanos
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
