import type { Metadata } from 'next';
import Link from 'next/link';

import { esAdmin, requerirUsuario } from '@/lib/auth';

import PerfilForm from './PerfilForm';

export const metadata: Metadata = { title: 'Mi perfil' };

function iniciales(usuario: {
  firstName: string;
  lastName: string;
  email: string;
}): string {
  if (usuario.firstName) {
    return `${usuario.firstName.charAt(0)}${usuario.lastName.charAt(0)}`.toUpperCase();
  }
  return usuario.email.charAt(0).toUpperCase();
}

export default async function PerfilPage() {
  const usuario = await requerirUsuario('/usuarios/perfil');

  const nombre =
    [usuario.firstName, usuario.lastName].filter(Boolean).join(' ').trim() || 'Mi cuenta';
  const admin = esAdmin(usuario);
  const fechaNacimiento = usuario.fechaNacimiento
    ? usuario.fechaNacimiento.toISOString().slice(0, 10)
    : '';

  return (
    <section className="py-5">
      <div className="container-custom">
        <nav aria-label="breadcrumb" className="mb-4">
          <ol className="breadcrumb breadcrumb-custom mb-0">
            <li className="breadcrumb-item">
              <Link href="/">Inicio</Link>
            </li>
            <li className="breadcrumb-item active" aria-current="page">
              Mi perfil
            </li>
          </ol>
        </nav>

        <div className="row g-4">
          <aside className="col-12 col-lg-4">
            <div className="card-custom h-100">
              <div className="text-center py-3">
                <div className="avatar-big mb-3">
                  {usuario.fotoPerfil ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={usuario.fotoPerfil} alt={nombre} />
                  ) : (
                    <div className="avatar-placeholder">{iniciales(usuario)}</div>
                  )}
                </div>
                <h3 className="h4 font-serif mb-1">{nombre}</h3>
                <p className="text-subtle mb-3 small">{usuario.email}</p>
                {admin ? (
                  <span className="badge-gold mb-2 d-inline-block">Administrador</span>
                ) : (
                  usuario.rol === 'CLIENTE' && (
                    <span className="badge-outline mb-2 d-inline-block">Cliente</span>
                  )
                )}
                <div className="list-group list-group-flush text-start mt-4 nav-list">
                  <Link
                    href="/reservas/mi-cuenta"
                    className="list-group-item list-group-item-action list-group-custom"
                  >
                    📅 Mis reservas
                  </Link>
                  <Link
                    href="/reservas"
                    className="list-group-item list-group-item-action list-group-custom"
                  >
                    ✨ Nueva reserva
                  </Link>
                  <Link
                    href="/usuarios/password-reset"
                    className="list-group-item list-group-item-action list-group-custom"
                  >
                    🔑 Cambiar contraseña
                  </Link>
                </div>
              </div>
            </div>
          </aside>

          <div className="col-12 col-lg-8">
            <div className="card-custom">
              <h2 className="h3 font-serif mb-4">Editar mis datos</h2>
              <PerfilForm
                firstName={usuario.firstName}
                lastName={usuario.lastName}
                telefono={usuario.telefono}
                fechaNacimiento={fechaNacimiento}
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
