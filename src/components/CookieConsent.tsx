'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

const COOKIE_NAME = 'cookies_consent';
const COOKIE_VALUE = 'accepted';
const COOKIE_DAYS = 365;

function getCookie(nombre: string): string | null {
  const partes = `; ${document.cookie}`.split(`; ${nombre}=`);
  if (partes.length === 2) return partes.pop()!.split(';').shift() ?? null;
  return null;
}

function setCookie(nombre: string, valor: string, dias: number) {
  const fecha = new Date();
  fecha.setTime(fecha.getTime() + dias * 24 * 60 * 60 * 1000);
  document.cookie = `${nombre}=${valor}; expires=${fecha.toUTCString()}; path=/; SameSite=Lax`;
}

/** Banner de consentimiento de cookies (equivalente al include cookie_consent.html). */
export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setVisible(getCookie(COOKIE_NAME) !== COOKIE_VALUE);
  }, []);

  if (!visible) return null;

  return (
    <div
      id="cookieConsentBanner"
      className="cookie-consent-banner fixed-bottom w-100 py-3 px-3 px-md-4"
      style={{
        zIndex: 9999,
        background: 'linear-gradient(135deg, #0D0D0D 0%, #1A1A1A 100%)',
        borderTop: '2px solid #D4AF37',
        boxShadow: '0 -6px 24px rgba(212, 175, 55, 0.12)',
      }}
    >
      <div className="container">
        <div className="row align-items-center g-3">
          <div className="col-12 col-lg-9 text-white">
            <div className="d-flex align-items-start align-items-lg-center gap-3">
              <div className="flex-shrink-0 d-none d-sm-block">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D4AF37" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15.79A9 9 0 0 1 8.21 3a7 7 0 0 0 0 12.77 5 5 0 0 1 6.56 6.56A7 7 0 0 0 21 15.79z" />
                  <path d="M8.5 8.5v.01" />
                  <path d="M16.5 14.5v.01" />
                  <path d="M11.5 11.5v.01" />
                  <path d="M12.5 17.5v.01" />
                  <path d="M6.5 12.5v.01" />
                </svg>
              </div>
              <div className="flex-grow-1">
                <p className="mb-0 fw-bold small" style={{ color: '#D4AF37', letterSpacing: '0.01em' }}>
                  Uso de cookies y datos personales
                </p>
                <p className="mb-0 small mt-1 lh-sm fw-bold" style={{ color: '#F5F5F0' }}>
                  Utilizamos cookies estrictamente necesarias para que la web funcione (sesión, login).
                  Además guardamos tu nombre, e-mail, teléfono, fecha de nacimiento y datos de reserva para
                  gestionar tus citas. Al aceptar, confirmas que has leído nuestra{' '}
                  <Link href="/privacidad" className="text-decoration-underline fw-semibold" style={{ color: '#F5F5F0' }}>
                    Política de Privacidad
                  </Link>.
                </p>
              </div>
            </div>
          </div>
          <div className="col-12 col-lg-3">
            <div className="d-grid gap-2 d-flex flex-row justify-content-lg-end">
              <Link
                href="/privacidad"
                className="btn btn-sm btn-outline-light rounded-pill px-4 flex-grow-1 flex-lg-grow-0 fw-bold"
                style={{ borderColor: 'rgba(245,245,240,0.35)', color: '#F5F5F0' }}
              >
                Más info
              </Link>
              <button
                type="button"
                onClick={() => {
                  setCookie(COOKIE_NAME, COOKIE_VALUE, COOKIE_DAYS);
                  setVisible(false);
                }}
                className="btn btn-sm rounded-pill px-4 flex-grow-1 flex-lg-grow-0"
                style={{ background: '#D4AF37', color: '#0D0D0D', borderColor: '#D4AF37', fontWeight: 700 }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
