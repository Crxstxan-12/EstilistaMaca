import {
  alternarUsuarioActivoAction,
  cambiarRolUsuarioAction,
} from '@/actions/admin';
import { esAdmin, nombreCompleto, requerirAdmin } from '@/lib/auth';
import { formatFechaHoraCorta } from '@/lib/format';
import { prisma } from '@/lib/prisma';

export default async function AdminUsuariosPage() {
  await requerirAdmin('/admin/usuarios');

  const usuarios = await prisma.usuario.findMany({ orderBy: { createdAt: 'desc' } });

  return (
    <>
      <h2 className="h4 font-serif mb-3">Usuarios</h2>

      <div className="card-custom p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table-custom align-middle mb-0">
            <thead>
              <tr>
                <th>Usuario</th>
                <th>Rol</th>
                <th>Último acceso</th>
                <th>Estado</th>
                <th>Rol</th>
                <th>Acceso</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((usuario) => {
                const administrador = esAdmin(usuario);
                return (
                  <tr key={usuario.id}>
                    <td>
                      {nombreCompleto(usuario)}
                      <br />
                      <small className="text-subtle">{usuario.email}</small>
                    </td>
                    <td>
                      {administrador ? (
                        <span className="badge-gold">Administrador</span>
                      ) : (
                        <span className="badge-outline">Cliente</span>
                      )}
                    </td>
                    <td>
                      <small className="text-subtle">
                        {usuario.lastLogin ? formatFechaHoraCorta(usuario.lastLogin) : '—'}
                      </small>
                    </td>
                    <td>
                      {usuario.isActive ? (
                        <span className="badge-gold">Activo</span>
                      ) : (
                        <span className="badge-outline">Inactivo</span>
                      )}
                    </td>
                    <td>
                      <form action={cambiarRolUsuarioAction} className="d-flex align-items-center gap-2">
                        <input type="hidden" name="id" value={usuario.id} />
                        <input type="hidden" name="volverA" value="/admin/usuarios" />
                        <div className="form-check mb-0">
                          <input
                            id={`rol-${usuario.id}`}
                            type="checkbox"
                            name="esAdministrador"
                            className="form-check-input"
                            defaultChecked={administrador}
                          />
                          <label htmlFor={`rol-${usuario.id}`} className="form-check-label small">Admin</label>
                        </div>
                        <button type="submit" className="btn btn-outline-light btn-sm">Guardar</button>
                      </form>
                    </td>
                    <td>
                      <form action={alternarUsuarioActivoAction}>
                        <input type="hidden" name="id" value={usuario.id} />
                        <input type="hidden" name="volverA" value="/admin/usuarios" />
                        <button type="submit" className="btn btn-outline-light btn-sm">
                          {usuario.isActive ? 'Desactivar' : 'Activar'}
                        </button>
                      </form>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
