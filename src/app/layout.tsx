import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import { Suspense } from 'react';

import Comportamiento from '@/components/Comportamiento';
import CookieConsent from '@/components/CookieConsent';
import Footer from '@/components/Footer';
import MensajesURL from '@/components/MensajesURL';
import Navbar from '@/components/Navbar';
import { esAdmin, nombreCompleto, obtenerUsuarioActual } from '@/lib/auth';
import { BRAND } from '@/lib/config';

export const metadata: Metadata = {
  title: {
    default: `${BRAND.nombre} · Estilista Profesional`,
    template: `%s · ${BRAND.nombre}`,
  },
  description:
    'Macarena Escobar - Estilista Profesional. Alisados, coloración, balayage, rizos permanentes, barbería y manicure. Reserva tu hora.',
  keywords: [
    'estilista',
    'peluquería',
    'salón de belleza',
    'coloración',
    'balayage',
    'alisados',
    'manicure',
    'Macarena Escobar',
  ],
};

export const viewport: Viewport = {
  themeColor: '#0D0D0D',
  width: 'device-width',
  initialScale: 1,
};

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const usuario = await obtenerUsuarioActual();

  return (
    <html lang="es-CL">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,600&display=swap"
          rel="stylesheet"
        />
        <link
          href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css"
          rel="stylesheet"
        />
        <link rel="stylesheet" href="/css/styles.css" />
      </head>
      <body>
        <Navbar
          usuario={
            usuario
              ? {
                  nombre: nombreCompleto(usuario),
                  email: usuario.email,
                  esAdmin: esAdmin(usuario),
                }
              : null
          }
        />

        <Suspense fallback={null}>
          <MensajesURL />
        </Suspense>

        <main>{children}</main>

        <Footer autenticado={!!usuario} esAdmin={esAdmin(usuario)} />

        <CookieConsent />
        <Comportamiento />

        <Script
          src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"
          strategy="afterInteractive"
        />
      </body>
    </html>
  );
}
