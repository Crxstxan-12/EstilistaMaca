import type { Metadata } from 'next';

import { BRAND } from '@/lib/config';

import ContactoForm from './ContactoForm';

export const metadata: Metadata = {
  title: 'Contacto',
};

const HORARIOS = [
  { dia: 'Lunes', hora: '10:00 a 20:00' },
  { dia: 'Martes', hora: '10:00 a 20:00' },
  { dia: 'Miércoles', hora: '10:00 a 20:00' },
  { dia: 'Jueves', hora: '10:00 a 20:00' },
  { dia: 'Viernes', hora: '10:00 a 20:00' },
  { dia: 'Sábado', hora: '10:00 a 18:00' },
  { dia: 'Domingo', hora: 'Cerrado' },
];

export default function ContactoPage() {
  return (
    <>
      <section className="page-head">
        <div className="container-custom">
          <div className="text-center py-5">
            <p className="section-eyebrow mb-2">💌 CONTACTO</p>
            <h1 className="h1 font-serif mb-2 section-title">
              Hablemos de tu <span className="text-gradient-gold">próximo look</span>
            </h1>
            <p className="text-subtle">
              ¿Tienes dudas? ¿Necesitas asesoría personalizada? Escríbenos.
            </p>
          </div>
        </div>
      </section>

      <section className="py-5">
        <div className="container-custom">
          <div className="row g-4">
            <div className="col-12 col-lg-6">
              <div className="card-custom h-100">
                <h2 className="h3 font-serif mb-4">Envíanos un mensaje</h2>
                <ContactoForm />
              </div>
            </div>
            <aside className="col-12 col-lg-6">
              <div className="card-custom h-100">
                <h2 className="h3 font-serif mb-4">Información &amp; redes</h2>
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
                        <strong>WhatsApp (preferente)</strong>
                        <br />
                        <a
                          href={`https://wa.me/${BRAND.whatsapp}`}
                          className="text-gold text-decoration-none"
                        >
                          {BRAND.telefonoVisible}
                        </a>
                      </div>
                    </div>
                  </li>
                  <li className="mb-3">
                    <div className="d-flex gap-3 align-items-start">
                      <div className="icon-circle">✉️</div>
                      <div>
                        <strong>Correo</strong>
                        <br />
                        <a
                          href={`mailto:${BRAND.emailContacto}`}
                          className="text-gold text-decoration-none"
                        >
                          {BRAND.emailContacto}
                        </a>
                      </div>
                    </div>
                  </li>
                  <li className="mb-3">
                    <div className="d-flex gap-3 align-items-start">
                      <div className="icon-circle">📸</div>
                      <div>
                        <strong>Instagram</strong>
                        <br />
                        <a
                          href={BRAND.instagramUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gold text-decoration-none"
                        >
                          {BRAND.instagram}
                        </a>
                      </div>
                    </div>
                  </li>
                </ul>
                <div className="card-custom hours-card bg-transparent shadow-none border border-dark-subtle p-3">
                  <h3 className="h5 font-serif mb-3">Horario de atención</h3>
                  <ul className="list-unstyled hours-list mb-0">
                    {HORARIOS.map((horario) => (
                      <li key={horario.dia}>
                        <span className="day">{horario.dia}</span>
                        <span className="time">{horario.hora}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </section>
    </>
  );
}
