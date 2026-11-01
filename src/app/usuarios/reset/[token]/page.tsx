import type { Metadata } from 'next';

import ConfirmarResetForm from './ConfirmarResetForm';

export const metadata: Metadata = { title: 'Nueva contraseña' };

export default async function PasswordResetConfirmPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;

  return (
    <section className="auth-section py-5">
      <div className="container-custom">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="card-custom auth-card">
              <h1 className="h3 font-serif mb-2 text-center">Establece tu nueva contraseña</h1>
              <p className="text-subtle text-center mb-4">Elige una contraseña segura y confírmala.</p>
              <ConfirmarResetForm token={token} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
