import Link from 'next/link';

import { marcarNotificacionesLeidasAction } from '@/actions/admin';
import { requerirAdmin } from '@/lib/auth';
import { formatFechaHoraCorta, TIPOS_NOTIFICACION } from '@/lib/format';
import { prisma } from '@/lib/prisma';

export default async function AdminNotificacionesPage() {
  const usuario = await requerirAdmin('/admin/notificaciones');

  const notificaciones = await prisma.notificacion.findMany({
    where: { usuarioId: usuario.id },
    orderBy: { createdAt: 'desc' },
  });

  const sinLeer = notificaciones.filter((notificacion) => !notificacion.leida).length;

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center mb-3 gap-2">
        <h2 className="h4 font-serif mb-0">Notificaciones</h2>
        {sinLeer > 0 && (
          <form action={marcarNotificacionesLeidasAction}>
            <input type="hidden" name="volverA" value="/admin/notificaciones" />
            <button type="submit" className="btn btn-outline-light btn-sm">
              Marcar todas como leídas ({sinLeer})
            </button>
          </form>
        )}
      </div>

      {notificaciones.length === 0 ? (
        <div className="card-custom empty-state">
          <div className="empty-icon mb-3">🔔</div>
          <p className="text-subtle mb-0">No tienes notificaciones.</p>
        </div>
      ) : (
        <div className="list-group list-group-custom">
          {notificaciones.map((notificacion) => (
            <div
              key={notificacion.id}
              className={`list-group-item d-flex gap-3 align-items-start ${notificacion.leida ? '' : 'bg-gold-soft'}`}
            >
              <span className="fs-4" aria-hidden="true">{notificacion.leida ? '📖' : '🔴'}</span>
              <div className="flex-grow-1">
                <div className="d-flex flex-wrap justify-content-between align-items-center gap-2">
                  <strong>{notificacion.titulo}</strong>
                  <small className="text-subtle">{formatFechaHoraCorta(notificacion.createdAt)}</small>
                </div>
                <div className="small text-subtle mb-1">
                  {TIPOS_NOTIFICACION[notificacion.tipo] ?? notificacion.tipo}
                </div>
                <p className="mb-1">{notificacion.mensaje}</p>
                {notificacion.enlace && (
                  <Link className="text-gold text-decoration-none small" href={notificacion.enlace}>
                    Ver detalle →
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
