import Link from 'next/link';

export default function PasswordResetDonePage() {
  return (
    <section className="auth-section py-5">
      <div className="container-custom">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5">
            <div className="card-custom auth-card">
              <h1 className="h3 font-serif mb-2 text-center">Revisa tu bandeja</h1>
              <p className="text-subtle mb-0 text-center">
                Te enviamos un correo con instrucciones para restablecer tu contraseña. Si no llega en
                los próximos minutos, revisa la carpeta de Spam o contacta con nosotros.
              </p>
              <div className="d-grid gap-2 mt-4">
                <Link className="btn btn-primary btn-lg" href="/">
                  Volver al inicio
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
