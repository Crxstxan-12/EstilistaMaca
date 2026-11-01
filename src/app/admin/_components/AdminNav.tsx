'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SECCIONES = [
  { href: '/admin', etiqueta: 'Escritorio', icono: '🏠' },
  { href: '/admin/reservas', etiqueta: 'Reservas', icono: '📋' },
  { href: '/admin/agenda', etiqueta: 'Agenda', icono: '📅' },
  { href: '/admin/clientes', etiqueta: 'Clientes', icono: '👥' },
  { href: '/admin/servicios', etiqueta: 'Servicios', icono: '💇' },
  { href: '/admin/categorias', etiqueta: 'Categorías', icono: '🗂️' },
  { href: '/admin/promociones', etiqueta: 'Promociones', icono: '🏷️' },
  { href: '/admin/galeria', etiqueta: 'Galería', icono: '🖼️' },
  { href: '/admin/usuarios', etiqueta: 'Usuarios', icono: '🧑' },
  { href: '/admin/notificaciones', etiqueta: 'Notificaciones', icono: '🔔' },
];

/** Navegación lateral del panel, con la sección activa resaltada. */
export default function AdminNav() {
  const pathname = usePathname();

  const estaActivo = (href: string) =>
    href === '/admin'
      ? pathname === '/admin'
      : pathname === href || pathname.startsWith(`${href}/`);

  return (
    <nav className="admin-sidebar list-group list-group-custom" aria-label="Secciones del panel">
      {SECCIONES.map((seccion) => (
        <Link
          key={seccion.href}
          href={seccion.href}
          className={`list-group-item list-group-item-action d-flex align-items-center gap-2 ${
            estaActivo(seccion.href) ? 'active' : ''
          }`}
        >
          <span aria-hidden="true">{seccion.icono}</span>
          {seccion.etiqueta}
        </Link>
      ))}
    </nav>
  );
}
