import Link from 'next/link';

import { eliminarServicioAction, guardarServicioAction } from '@/actions/admin';
import { requerirAdmin } from '@/lib/auth';
import { formatCLP } from '@/lib/format';
import { prisma } from '@/lib/prisma';

export default async function AdminServiciosPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  await requerirAdmin('/admin/servicios');

  const [categorias, servicios, editando] = await Promise.all([
    prisma.categoria.findMany({ orderBy: [{ orden: 'asc' }, { nombre: 'asc' }] }),
    prisma.servicio.findMany({
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
      include: { categoria: true },
    }),
    id ? prisma.servicio.findUnique({ where: { id } }) : Promise.resolve(null),
  ]);

  return (
    <>
      <h2 className="h4 font-serif mb-3">Servicios</h2>

      <div className="card-custom mb-4">
        <h3 className="h6 font-serif mb-3">{editando ? 'Editar servicio' : 'Nuevo servicio'}</h3>
        <form action={guardarServicioAction} className="row g-3" encType="multipart/form-data">
          <input type="hidden" name="volverA" value="/admin/servicios" />
          {editando && <input type="hidden" name="id" value={editando.id} />}

          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="srv-nombre">Nombre</label>
            <input id="srv-nombre" name="nombre" className="form-control shadow-none" defaultValue={editando?.nombre ?? ''} required />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="srv-categoria">Categoría</label>
            <select id="srv-categoria" name="categoriaId" className="form-select shadow-none" defaultValue={editando?.categoriaId ?? ''} required>
              <option value="">Selecciona una categoría</option>
              {categorias.map((categoria) => (
                <option key={categoria.id} value={categoria.id}>{categoria.nombre}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="srv-precio">Precio (CLP)</label>
            <input id="srv-precio" type="number" name="precio" className="form-control shadow-none" defaultValue={editando?.precio ?? 0} min={0} />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="srv-duracion">Duración (min)</label>
            <input id="srv-duracion" type="number" name="duracion" className="form-control shadow-none" defaultValue={editando?.duracion ?? 60} min={0} />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="srv-orden">Orden</label>
            <input id="srv-orden" type="number" name="orden" className="form-control shadow-none" defaultValue={editando?.orden ?? 0} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="srv-corta">Descripción corta</label>
            <input id="srv-corta" name="descripcionCorta" className="form-control shadow-none" defaultValue={editando?.descripcionCorta ?? ''} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="srv-descripcion">Descripción</label>
            <textarea id="srv-descripcion" name="descripcion" rows={3} className="form-control shadow-none" defaultValue={editando?.descripcion ?? ''} />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="srv-imagen">Imagen {editando?.imagen && <span className="text-subtle small">(actual: {editando.imagen.split('/').pop()})</span>}</label>
            <input id="srv-imagen" type="file" name="imagen" accept="image/*" className="form-control shadow-none" />
          </div>
          <div className="col-12 col-md-6 d-flex align-items-end gap-3">
            <div className="form-check">
              <input id="srv-preciodesde" type="checkbox" name="precioDesde" className="form-check-input" defaultChecked={editando?.precioDesde ?? false} />
              <label htmlFor="srv-preciodesde" className="form-check-label">Precio &quot;Desde&quot;</label>
            </div>
            <div className="form-check">
              <input id="srv-activo" type="checkbox" name="activo" className="form-check-input" defaultChecked={editando ? editando.activo : true} />
              <label htmlFor="srv-activo" className="form-check-label">Activo</label>
            </div>
            <div className="form-check">
              <input id="srv-destacado" type="checkbox" name="destacado" className="form-check-input" defaultChecked={editando?.destacado ?? false} />
              <label htmlFor="srv-destacado" className="form-check-label">Destacado</label>
            </div>
          </div>
          <div className="col-12 d-flex gap-2">
            <button type="submit" className="btn btn-primary">{editando ? 'Guardar cambios' : 'Crear servicio'}</button>
            {editando && <Link href="/admin/servicios" className="btn btn-outline-light">Cancelar</Link>}
          </div>
        </form>
      </div>

      <div className="card-custom p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table-custom align-middle mb-0">
            <thead>
              <tr>
                <th>Servicio</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Duración</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {servicios.map((servicio) => (
                <tr key={servicio.id}>
                  <td>
                    {servicio.nombre}
                    {servicio.destacado && <span className="badge-outline ms-2">Destacado</span>}
                  </td>
                  <td>{servicio.categoria.nombre}</td>
                  <td>{servicio.precioDesde ? 'Desde ' : ''}{formatCLP(servicio.precio)}</td>
                  <td>{servicio.duracion} min</td>
                  <td>
                    {servicio.activo ? (
                      <span className="badge-gold">Activo</span>
                    ) : (
                      <span className="badge-outline">Inactivo</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link className="btn btn-outline-light btn-sm" href={`/admin/servicios?id=${servicio.id}`}>Editar</Link>
                      <form action={eliminarServicioAction} data-confirm="¿Eliminar este servicio?">
                        <input type="hidden" name="id" value={servicio.id} />
                        <input type="hidden" name="volverA" value="/admin/servicios" />
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
