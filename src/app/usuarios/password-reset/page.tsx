import type { Metadata } from 'next';

import SolicitarResetForm from './SolicitarResetForm';

export const metadata: Metadata = { title: 'Restablecer contraseña' };

export default function PasswordResetPage() {
  return (
    <section className="auth-section">
      <div className="container-custom py-5">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="text-center mb-4">
              <h1 className="h2 font-serif mb-2">Recupera tu acceso</h1>
              <p className="text-subtle">
                Te enviaremos un correo con los pasos para crear una nueva contraseña.
              </p>
            </div>
            <div className="card-custom auth-card">
              <SolicitarResetForm />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
