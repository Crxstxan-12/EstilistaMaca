import type { Metadata } from 'next';
import { redirect } from 'next/navigation';

import { obtenerUsuarioActual } from '@/lib/auth';

import RegistroForm from './RegistroForm';

export const metadata: Metadata = { title: 'Regístrate' };

const Logo = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width="38" height="38">
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

export default async function RegistroPage() {
  const usuario = await obtenerUsuarioActual();
  if (usuario) redirect('/');

  return (
    <section className="auth-section">
      <div className="container-custom py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-6 col-xl-5">
            <div className="text-center mb-4">
              <div className="logo-circle mx-auto mb-3" aria-hidden="true" style={{ width: 82, height: 82 }}>
                <Logo />
              </div>
              <h1 className="h3 font-serif mb-1">Crea tu cuenta</h1>
              <p className="text-subtle mb-0">Únete al mundo Macarena Estilista y reserva en segundos.</p>
            </div>

            <div className="card-custom auth-card">
              <RegistroForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
