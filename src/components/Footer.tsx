import Link from 'next/link';

import { BRAND } from '@/lib/config';

const Logo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

export default function Footer({ autenticado, esAdmin }: { autenticado: boolean; esAdmin: boolean }) {
  const anio = new Date().getFullYear();

  return (
    <footer className="footer-custom">
      <div className="container-custom">
        <div className="footer-grid">
          <div className="footer-brand">
            <Link className="navbar-brand-custom" href="/" style={{ padding: 0 }}>
              <div className="logo-circle"><Logo /></div>
              <div className="brand-text">
                <span className="brand-name">{BRAND.nombre}</span>
                <span className="brand-sub">Estilista Profesional</span>
              </div>
            </Link>
            <p className="footer-brand-desc">
              Salón boutique dedicado a resaltar tu belleza natural con cortes, coloración y
              tratamientos de alta calidad. Tu cabello merece el mejor cuidado.
            </p>
          </div>

          <div>
            <h4 className="footer-title">Navegación</h4>
            <ul className="footer-links">
              <li><Link href="/">Inicio</Link></li>
              <li><Link href="/servicios">Servicios</Link></li>
              <li><Link href="/galeria">Galería de trabajos</Link></li>
              <li><Link href="/contacto">Contacto</Link></li>
              {autenticado ? (
                <>
                  <li><Link href="/usuarios/perfil">Mi cuenta</Link></li>
                  <li><Link href="/reservas/mi-cuenta">Mis reservas</Link></li>
                  <li><Link href="/reservas">Reservar hora</Link></li>
                  {esAdmin && <li><Link href="/reservas/admin/agenda">Agenda salón</Link></li>}
                </>
              ) : (
                <>
                  <li><Link href="/usuarios/login">Iniciar sesión</Link></li>
                  <li><Link href="/usuarios/registro">Registrarme</Link></li>
                </>
              )}
              <li><Link href="/privacidad">Política de privacidad</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Servicios</h4>
            <ul className="footer-links">
              <li><Link href="/servicios">Cortes y peinados</Link></li>
              <li><Link href="/servicios">Coloración & Balayage</Link></li>
              <li><Link href="/servicios">Alisados y tratamientos</Link></li>
              <li><Link href="/servicios">Rizos permanentes</Link></li>
              <li><Link href="/servicios">Barbería</Link></li>
              <li><Link href="/servicios">Manicure & Pedicure</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="footer-title">Contacto</h4>
            <div className="footer-contact-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                <circle cx="12" cy="10" r="3" />
              </svg>
              <span>Dirección a confirmar<br />Región Metropolitana</span>
            </div>
            <div className="footer-contact-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <span>{BRAND.telefonoVisible}</span>
            </div>
            <div className="footer-contact-item">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>{BRAND.emailContacto}</span>
            </div>
            <div className="social-icons mt-3">
              <a href={BRAND.instagramUrl} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                </svg>
              </a>
              <a href={`https://wa.me/${BRAND.whatsapp}`} target="_blank" rel="noopener noreferrer" className="social-icon" aria-label="WhatsApp">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
                </svg>
              </a>
              <a href="#" className="social-icon" aria-label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p className="footer-copy mb-0">
            © {anio} {BRAND.nombre} · Estilista Profesional. Todos los derechos reservados.
          </p>
          <p className="footer-copy mb-0" style={{ fontSize: '0.8rem' }}>
            Hecho con <span style={{ color: '#C9A227' }}>♥</span> en Chile
          </p>
        </div>
      </div>
    </footer>
  );
}
