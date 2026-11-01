import type { Metadata } from 'next';
import Link from 'next/link';
import { redirect } from 'next/navigation';

import { obtenerUsuarioActual } from '@/lib/auth';

import LoginForm from './LoginForm';

export const metadata: Metadata = { title: 'Iniciar sesión' };

const Logo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 28, height: 28 }}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const usuario = await obtenerUsuarioActual();
  if (usuario) redirect('/');

  const { next } = await searchParams;

  return (
    <section className="auth-page">
      <div className="card auth-card fade-in">
        <div className="auth-logo">
          <Link href="/" className="navbar-brand-custom" style={{ justifyContent: 'center' }}>
            <div className="logo-circle" style={{ width: 58, height: 58 }}>
              <Logo />
            </div>
          </Link>
        </div>

        <h2 className="text-center" style={{ fontFamily: 'var(--font-serif)', marginBottom: '0.3rem' }}>
          Bienvenida
        </h2>
        <p className="auth-sub">Inicia sesión para gestionar tus reservas</p>

        <LoginForm next={next ?? ''} />

        <div className="text-center mt-4" style={{ fontSize: '0.9rem', color: '#aaa' }}>
          <p className="mb-1">
            <Link href="/usuarios/password-reset" style={{ color: '#aaa' }}>
              ¿Olvidaste tu contraseña?
            </Link>
          </p>
          <p className="mb-0">
            ¿No tienes cuenta?{' '}
            <Link href="/usuarios/registro" style={{ fontWeight: 500, color: '#D4AF37' }}>
              Regístrate aquí
            </Link>
          </p>
        </div>

        <div
          style={{
            height: 1,
            background: 'linear-gradient(90deg,transparent,rgba(201,162,39,0.35),transparent)',
            margin: '2rem 0',
          }}
        />

        <div className="text-center" style={{ fontSize: '0.85rem', color: '#aaa' }}>
          <p className="mb-0">
            <Link
              href="/"
              style={{ color: '#aaa', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
              Volver al inicio
            </Link>
          </p>
        </div>
      </div>
    </section>
  );
}
