import Link from 'next/link';

import { eliminarTrabajoAction, guardarTrabajoAction } from '@/actions/admin';
import { requerirAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

export default async function AdminGaleriaPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  await requerirAdmin('/admin/galeria');

  const [categorias, trabajos, editando] = await Promise.all([
    prisma.categoria.findMany({ orderBy: [{ orden: 'asc' }, { nombre: 'asc' }] }),
    prisma.galeriaTrabajo.findMany({
      orderBy: [{ orden: 'asc' }, { createdAt: 'desc' }],
      include: { categoria: true },
    }),
    id ? prisma.galeriaTrabajo.findUnique({ where: { id } }) : Promise.resolve(null),
  ]);

  return (
    <>
      <h2 className="h4 font-serif mb-3">Galería</h2>

      <div className="card-custom mb-4">
        <h3 className="h6 font-serif mb-3">{editando ? 'Editar trabajo' : 'Nuevo trabajo'}</h3>
        <form action={guardarTrabajoAction} className="row g-3" encType="multipart/form-data">
          <input type="hidden" name="volverA" value="/admin/galeria" />
          {editando && <input type="hidden" name="id" value={editando.id} />}

          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="gal-titulo">Título</label>
            <input id="gal-titulo" name="titulo" className="form-control shadow-none" defaultValue={editando?.titulo ?? ''} required />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label" htmlFor="gal-categoria">Categoría</label>
            <select id="gal-categoria" name="categoriaId" className="form-select shadow-none" defaultValue={editando?.categoriaId ?? ''}>
              <option value="">Sin categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label" htmlFor="gal-orden">Orden</label>
            <input id="gal-orden" type="number" name="orden" className="form-control shadow-none" defaultValue={editando?.orden ?? 0} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="gal-descripcion">Descripción</label>
            <textarea id="gal-descripcion" name="descripcion" rows={2} className="form-control shadow-none" defaultValue={editando?.descripcion ?? ''} />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="gal-tags">Etiquetas (separadas por coma)</label>
            <input id="gal-tags" name="tags" className="form-control shadow-none" defaultValue={editando?.tags ?? ''} />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="gal-imagen">Imagen {editando?.imagen && <span className="text-subtle small">(actual: {editando.imagen.split('/').pop()})</span>}</label>
            <input id="gal-imagen" type="file" name="imagen" accept="image/*" className="form-control shadow-none" />
          </div>
          <div className="col-12 d-flex flex-wrap align-items-center gap-3">
            <div className="form-check">
              <input id="gal-anonimo" type="checkbox" name="clienteAnonimo" className="form-check-input" defaultChecked={editando ? editando.clienteAnonimo : true} />
              <label htmlFor="gal-anonimo" className="form-check-label">Cliente anónimo</label>
            </div>
            <div className="form-check">
              <input id="gal-destacado" type="checkbox" name="destacado" className="form-check-input" defaultChecked={editando?.destacado ?? false} />
              <label htmlFor="gal-destacado" className="form-check-label">Destacado</label>
            </div>
            <div className="form-check">
              <input id="gal-activo" type="checkbox" name="activo" className="form-check-input" defaultChecked={editando ? editando.activo : true} />
              <label htmlFor="gal-activo" className="form-check-label">Activo</label>
            </div>
            <button type="submit" className="btn btn-primary ms-md-auto">{editando ? 'Guardar cambios' : 'Crear trabajo'}</button>
            {editando && <Link href="/admin/galeria" className="btn btn-outline-light">Cancelar</Link>}
          </div>
        </form>
      </div>

      <div className="card-custom p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table-custom align-middle mb-0">
            <thead>
              <tr>
                <th>Trabajo</th>
                <th>Categoría</th>
                <th>Orden</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {trabajos.map((trabajo) => (
                <tr key={trabajo.id}>
                  <td>
                    {trabajo.titulo}
                    {trabajo.destacado && <span className="badge-outline ms-2">Destacado</span>}
                    <br />
                    <small className="text-subtle">{trabajo.tags}</small>
                  </td>
                  <td>{trabajo.categoria?.nombre ?? '—'}</td>
                  <td>{trabajo.orden}</td>
                  <td>
                    {trabajo.activo ? (
                      <span className="badge-gold">Activo</span>
                    ) : (
                      <span className="badge-outline">Inactivo</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link className="btn btn-outline-light btn-sm" href={`/admin/galeria?id=${trabajo.id}`}>Editar</Link>
                      <form action={eliminarTrabajoAction} data-confirm="¿Eliminar este trabajo de la galería?">
                        <input type="hidden" name="id" value={trabajo.id} />
                        <input type="hidden" name="volverA" value="/admin/galeria" />
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
