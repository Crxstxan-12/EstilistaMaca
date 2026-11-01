import Link from 'next/link';

import { eliminarCategoriaAction, guardarCategoriaAction } from '@/actions/admin';
import IconoCategoria from '@/components/IconoCategoria';
import { requerirAdmin } from '@/lib/auth';
import { prisma } from '@/lib/prisma';

const ICONOS = [
  { valor: 'secador', etiqueta: 'Secador' },
  { valor: 'tijeras', etiqueta: 'Tijeras' },
  { valor: 'rizos', etiqueta: 'Rizos' },
  { valor: 'navaja', etiqueta: 'Navaja' },
  { valor: 'unas', etiqueta: 'Uñas' },
];

export default async function AdminCategoriasPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  await requerirAdmin('/admin/categorias');

  const [categorias, editando] = await Promise.all([
    prisma.categoria.findMany({
      orderBy: [{ orden: 'asc' }, { nombre: 'asc' }],
      include: { _count: { select: { servicios: true } } },
    }),
    id ? prisma.categoria.findUnique({ where: { id } }) : Promise.resolve(null),
  ]);

  return (
    <>
      <h2 className="h4 font-serif mb-3">Categorías</h2>

      <div className="card-custom mb-4">
        <h3 className="h6 font-serif mb-3">{editando ? 'Editar categoría' : 'Nueva categoría'}</h3>
        <form action={guardarCategoriaAction} className="row g-3">
          <input type="hidden" name="volverA" value="/admin/categorias" />
          {editando && <input type="hidden" name="id" value={editando.id} />}

          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="cat-nombre">Nombre</label>
            <input id="cat-nombre" name="nombre" className="form-control shadow-none" defaultValue={editando?.nombre ?? ''} required />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label" htmlFor="cat-icono">Icono</label>
            <select id="cat-icono" name="icono" className="form-select shadow-none" defaultValue={editando?.icono ?? ''}>
              <option value="">Sin icono</option>
              {ICONOS.map((icono) => (
                <option key={icono.valor} value={icono.valor}>{icono.etiqueta}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label" htmlFor="cat-orden">Orden</label>
            <input id="cat-orden" type="number" name="orden" className="form-control shadow-none" defaultValue={editando?.orden ?? 0} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="cat-descripcion">Descripción</label>
            <textarea id="cat-descripcion" name="descripcion" rows={2} className="form-control shadow-none" defaultValue={editando?.descripcion ?? ''} />
          </div>
          <div className="col-12 d-flex align-items-center gap-3">
            <div className="form-check">
              <input id="cat-activo" type="checkbox" name="activo" className="form-check-input" defaultChecked={editando ? editando.activo : true} />
              <label htmlFor="cat-activo" className="form-check-label">Activa</label>
            </div>
            <button type="submit" className="btn btn-primary">{editando ? 'Guardar cambios' : 'Crear categoría'}</button>
            {editando && <Link href="/admin/categorias" className="btn btn-outline-light">Cancelar</Link>}
          </div>
        </form>
      </div>

      <div className="card-custom p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table-custom align-middle mb-0">
            <thead>
              <tr>
                <th>Orden</th>
                <th>Categoría</th>
                <th>Servicios</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {categorias.map((categoria) => (
                <tr key={categoria.id}>
                  <td>{categoria.orden}</td>
                  <td>
                    <span className="me-2"><IconoCategoria icono={categoria.icono} /></span>
                    {categoria.nombre}
                    <br />
                    <small className="text-subtle">{categoria.slug}</small>
                  </td>
                  <td>{categoria._count.servicios}</td>
                  <td>
                    {categoria.activo ? (
                      <span className="badge-gold">Activa</span>
                    ) : (
                      <span className="badge-outline">Inactiva</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link className="btn btn-outline-light btn-sm" href={`/admin/categorias?id=${categoria.id}`}>Editar</Link>
                      <form action={eliminarCategoriaAction} data-confirm="¿Eliminar esta categoría?">
                        <input type="hidden" name="id" value={categoria.id} />
                        <input type="hidden" name="volverA" value="/admin/categorias" />
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
