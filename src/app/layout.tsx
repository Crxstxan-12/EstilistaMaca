import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';
import { Suspense } from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import './globals.css';

import BootstrapClient from '@/components/BootstrapClient';
import Comportamiento from '@/components/Comportamiento';
import CookieConsent from '@/components/CookieConsent';
import Footer from '@/components/Footer';
import MensajesURL from '@/components/MensajesURL';
import Navbar from '@/components/Navbar';
import { esAdmin, nombreCompleto, obtenerUsuarioActual } from '@/lib/auth';
import { BRAND } from '@/lib/config';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
});

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

export const dynamic = 'force-dynamic';

export default async function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const usuario = await obtenerUsuarioActual();

  return (
    <html lang="es-CL">
      <body className={`${inter.variable} ${playfair.variable}`}>
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
        <BootstrapClient />
      </body>
    </html>
  );
}
