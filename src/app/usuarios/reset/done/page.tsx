import Link from 'next/link';

export default function PasswordResetCompletePage() {
  return (
    <section className="auth-section py-5">
      <div className="container-custom">
        <div className="row justify-content-center">
          <div className="col-12 col-md-8 col-lg-5 text-center">
            <div className="card-custom auth-card">
              <div className="mb-3">
                <div className="logo-circle mx-auto" style={{ width: 72, height: 72 }}>
                  ✅
                </div>
              </div>
              <h1 className="h3 font-serif mb-2">Listo</h1>
              <p className="text-subtle mb-4">
                Tu contraseña fue actualizada. Ya puedes iniciar sesión con tus nuevas credenciales.
              </p>
              <Link className="btn btn-primary btn-lg" href="/usuarios/login">
                Iniciar sesión
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
