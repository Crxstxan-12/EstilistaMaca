'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cerrarSesionAction } from '@/actions/auth';

export type NavbarUsuario = {
  nombre: string;
  email: string;
  esAdmin: boolean;
};

const Logo = ({ size = 24 }: { size?: number }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" width={size} height={size}>
    <circle cx="6" cy="6" r="3" />
    <circle cx="6" cy="18" r="3" />
    <line x1="20" y1="4" x2="8.12" y2="15.88" />
    <line x1="14.47" y1="14.48" x2="20" y2="20" />
    <line x1="8.12" y1="8.12" x2="12" y2="12" />
  </svg>
);

export default function Navbar({ usuario }: { usuario: NavbarUsuario | null }) {
  const pathname = usePathname();
  const activo = (href: string) => (pathname === href ? 'active' : '');

  return (
    <nav className="navbar navbar-expand-lg navbar-custom">
      <div className="container-custom">
        <Link className="navbar-brand-custom" href="/">
          <div className="logo-circle" aria-hidden="true">
            <Logo />
          </div>
          <div className="brand-text">
            <span className="brand-name">Macarena Escobar</span>
            <span className="brand-sub">Estilista</span>
          </div>
        </Link>

        <button
          className="navbar-toggler navbar-toggler-custom"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNavbar"
          aria-controls="mainNavbar"
          aria-expanded="false"
          aria-label="Abrir menú de navegación"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#C9A227' }}>
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>

        <div className="collapse navbar-collapse" id="mainNavbar">
          <ul className="navbar-nav ms-auto align-items-lg-center gap-0 gap-lg-1 mb-2 mb-lg-0">
            <li className="nav-item">
              <Link className={`nav-link-custom nav-link ${activo('/')}`} href="/">Inicio</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link-custom nav-link ${activo('/servicios')}`} href="/servicios">Servicios</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link-custom nav-link ${activo('/galeria')}`} href="/galeria">Galería</Link>
            </li>
            <li className="nav-item">
              <Link className={`nav-link-custom nav-link ${activo('/contacto')}`} href="/contacto">Contacto</Link>
            </li>

            <li className="nav-item ms-lg-2 mt-3 mt-lg-0">
              <Link className="btn btn-primary w-100 w-lg-auto" href="/reservas">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                Reservar Hora
              </Link>
            </li>

            {usuario ? (
              <li className="nav-item dropdown ms-lg-2 mt-2 mt-lg-0">
                <a className="nav-link nav-link-custom dropdown-toggle d-flex align-items-center gap-2" href="#" id="userDropdown" role="button" data-bs-toggle="dropdown" aria-expanded="false">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  <span className="d-lg-none">{usuario.nombre}</span>
                </a>
                <ul className="dropdown-menu dropdown-menu-end shadow" aria-labelledby="userDropdown">
                  <li className="px-3 py-2 text-muted small border-bottom border-dark-subtle mb-1">
                    <div className="fw-semibold text-light">{usuario.nombre}</div>
                    <div className="text-lowercase" style={{ color: '#888' }}>{usuario.email}</div>
                    {usuario.esAdmin && <span className="badge-gold mt-1 d-inline-block">Administrador</span>}
                  </li>
                  {usuario.esAdmin && (
                    <>
                      <li><Link className="dropdown-item" href="/admin">🛠️ Panel de administración</Link></li>
                      <li><Link className="dropdown-item" href="/reservas/admin/agenda">📅 Agenda del Salón</Link></li>
                    </>
                  )}
                  <li><Link className="dropdown-item" href="/usuarios/perfil">Mis Datos</Link></li>
                  <li><Link className="dropdown-item" href="/reservas/mi-cuenta">Mis Reservas</Link></li>
                  <li><Link className="dropdown-item" href="/reservas">Nueva Reserva</Link></li>
                  <li><hr className="dropdown-divider" /></li>
                  <li>
                    <form action={cerrarSesionAction} className="m-0">
                      <button type="submit" className="dropdown-item text-danger">Cerrar sesión</button>
                    </form>
                  </li>
                </ul>
              </li>
            ) : (
              <li className="nav-item ms-lg-1 mt-2 mt-lg-0">
                <Link className="nav-link nav-link-custom" href="/usuarios/login">Iniciar sesión</Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
