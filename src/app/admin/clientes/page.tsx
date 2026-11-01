import Link from 'next/link';

import { eliminarClienteAction, guardarClienteAction } from '@/actions/admin';
import { requerirAdmin } from '@/lib/auth';
import { fechaISOEnZona } from '@/lib/datetime';
import { prisma } from '@/lib/prisma';

export default async function AdminClientesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  await requerirAdmin('/admin/clientes');

  const [clientes, editando] = await Promise.all([
    prisma.cliente.findMany({
      orderBy: [{ nombre: 'asc' }, { apellido: 'asc' }],
      include: { _count: { select: { reservas: true } } },
    }),
    id ? prisma.cliente.findUnique({ where: { id } }) : Promise.resolve(null),
  ]);

  return (
    <>
      <h2 className="h4 font-serif mb-3">Clientes</h2>

      <div className="card-custom mb-4">
        <h3 className="h6 font-serif mb-3">{editando ? 'Editar cliente' : 'Nuevo cliente'}</h3>
        <form action={guardarClienteAction} className="row g-3">
          <input type="hidden" name="volverA" value="/admin/clientes" />
          {editando && <input type="hidden" name="id" value={editando.id} />}

          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="cli-nombre">Nombre</label>
            <input id="cli-nombre" name="nombre" className="form-control shadow-none" defaultValue={editando?.nombre ?? ''} required />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="cli-apellido">Apellido</label>
            <input id="cli-apellido" name="apellido" className="form-control shadow-none" defaultValue={editando?.apellido ?? ''} />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="cli-email">Correo</label>
            <input id="cli-email" type="email" name="email" className="form-control shadow-none" defaultValue={editando?.email ?? ''} required />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="cli-telefono">Teléfono</label>
            <input id="cli-telefono" name="telefono" className="form-control shadow-none" defaultValue={editando?.telefono ?? ''} />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="cli-nacimiento">Fecha de nacimiento</label>
            <input
              id="cli-nacimiento"
              type="date"
              name="fechaNacimiento"
              className="form-control shadow-none"
              defaultValue={editando?.fechaNacimiento ? fechaISOEnZona(editando.fechaNacimiento) : ''}
            />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="cli-notas">Notas</label>
            <textarea id="cli-notas" name="notas" rows={2} className="form-control shadow-none" defaultValue={editando?.notas ?? ''} />
          </div>
          <div className="col-12 d-flex align-items-center gap-3">
            <div className="form-check">
              <input id="cli-vip" type="checkbox" name="esVip" className="form-check-input" defaultChecked={editando?.esVip ?? false} />
              <label htmlFor="cli-vip" className="form-check-label">Cliente VIP</label>
            </div>
            <button type="submit" className="btn btn-primary">{editando ? 'Guardar cambios' : 'Crear cliente'}</button>
            {editando && <Link href="/admin/clientes" className="btn btn-outline-light">Cancelar</Link>}
          </div>
        </form>
      </div>

      <div className="card-custom p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table-custom align-middle mb-0">
            <thead>
              <tr>
                <th>Cliente</th>
                <th>Contacto</th>
                <th>Reservas</th>
                <th>VIP</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clientes.map((cliente) => (
                <tr key={cliente.id}>
                  <td>{cliente.nombre} {cliente.apellido}</td>
                  <td>
                    {cliente.email}
                    {cliente.telefono && (
                      <>
                        <br />
                        <small className="text-subtle">{cliente.telefono}</small>
                      </>
                    )}
                  </td>
                  <td>{cliente._count.reservas}</td>
                  <td>{cliente.esVip ? <span className="badge-gold">VIP</span> : <span className="text-subtle">—</span>}</td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link className="btn btn-outline-light btn-sm" href={`/admin/clientes?id=${cliente.id}`}>Editar</Link>
                      <form action={eliminarClienteAction} data-confirm="¿Eliminar este cliente?">
                        <input type="hidden" name="id" value={cliente.id} />
                        <input type="hidden" name="volverA" value="/admin/clientes" />
                        <button type="submit" className="btn btn-outline-light btn-sm">Eliminar</button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}
