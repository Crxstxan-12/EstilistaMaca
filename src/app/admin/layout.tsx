import Link from 'next/link';
import type { ReactNode } from 'react';

import { nombreCompleto, requerirAdmin } from '@/lib/auth';

import AdminNav from './_components/AdminNav';

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const usuario = await requerirAdmin('/admin');

  return (
    <section className="py-5">
      <div className="container-custom">
        <div className="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
          <div>
            <span className="section-eyebrow">Administración</span>
            <h1 className="h2 font-serif mb-1">Panel de administración</h1>
            <p className="text-subtle mb-0 small">
              Sesión activa: {nombreCompleto(usuario)}
            </p>
          </div>
          <div className="d-flex gap-2">
            <Link href="/reservas/admin/agenda" className="btn btn-outline-light">
              📅 Agenda del salón
            </Link>
            <Link href="/" className="btn btn-outline-light">
              Ver sitio
            </Link>
          </div>
        </div>

        <div className="row g-4">
          <aside className="col-12 col-lg-3">
            <AdminNav />
          </aside>
          <div className="col-12 col-lg-9">{children}</div>
        </div>
      </div>
    </section>
  );
}
