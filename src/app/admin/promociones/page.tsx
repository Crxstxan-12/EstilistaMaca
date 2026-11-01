import Link from 'next/link';

import { eliminarPromocionAction, guardarPromocionAction } from '@/actions/admin';
import { requerirAdmin } from '@/lib/auth';
import { partesEnZona } from '@/lib/datetime';
import { TIPOS_DESCUENTO, formatFechaHoraCorta } from '@/lib/format';
import { prisma } from '@/lib/prisma';

/** Valor para un input datetime-local a partir de un Date (hora local). */
function valorDatetimeLocal(fecha: Date | null | undefined): string {
  if (!fecha) return '';
  const p = partesEnZona(fecha);
  const dos = (n: number) => String(n).padStart(2, '0');
  return `${p.year}-${dos(p.month)}-${dos(p.day)}T${dos(p.hour)}:${dos(p.minute)}`;
}

export default async function AdminPromocionesPage({
  searchParams,
}: {
  searchParams: Promise<{ id?: string }>;
}) {
  const { id } = await searchParams;
  await requerirAdmin('/admin/promociones');

  const [servicios, promociones, editando] = await Promise.all([
    prisma.servicio.findMany({ orderBy: [{ orden: 'asc' }, { nombre: 'asc' }], include: { categoria: true } }),
    prisma.promocion.findMany({
      orderBy: { createdAt: 'desc' },
      include: { serviciosAplicables: { select: { id: true } } },
    }),
    id
      ? prisma.promocion.findUnique({
          where: { id },
          include: { serviciosAplicables: { select: { id: true } } },
        })
      : Promise.resolve(null),
  ]);

  const serviciosSeleccionados = new Set(editando?.serviciosAplicables.map((s) => s.id) ?? []);

  return (
    <>
      <h2 className="h4 font-serif mb-3">Promociones</h2>

      <div className="card-custom mb-4">
        <h3 className="h6 font-serif mb-3">{editando ? 'Editar promoción' : 'Nueva promoción'}</h3>
        <form action={guardarPromocionAction} className="row g-3">
          <input type="hidden" name="volverA" value="/admin/promociones" />
          {editando && <input type="hidden" name="id" value={editando.id} />}

          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="promo-nombre">Nombre</label>
            <input id="promo-nombre" name="nombre" className="form-control shadow-none" defaultValue={editando?.nombre ?? ''} required />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label" htmlFor="promo-codigo">Código</label>
            <input id="promo-codigo" name="codigo" className="form-control shadow-none text-uppercase" defaultValue={editando?.codigo ?? ''} />
          </div>
          <div className="col-12 col-md-3">
            <label className="form-label" htmlFor="promo-stock">Stock de usos</label>
            <input id="promo-stock" type="number" name="stockUsos" className="form-control shadow-none" defaultValue={editando?.stockUsos ?? ''} min={0} />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="promo-tipo">Tipo de descuento</label>
            <select id="promo-tipo" name="tipoDescuento" className="form-select shadow-none" defaultValue={editando?.tipoDescuento ?? 'PORCENTAJE'}>
              {Object.entries(TIPOS_DESCUENTO).map(([valor, etiqueta]) => (
                <option key={valor} value={valor}>{etiqueta}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="promo-valor">Valor del descuento</label>
            <input id="promo-valor" type="number" name="valorDescuento" className="form-control shadow-none" defaultValue={editando?.valorDescuento ?? 0} min={0} />
          </div>
          <div className="col-12 col-md-4 d-flex align-items-end">
            <div className="form-check">
              <input id="promo-activo" type="checkbox" name="activo" className="form-check-input" defaultChecked={editando ? editando.activo : true} />
              <label htmlFor="promo-activo" className="form-check-label">Activa</label>
            </div>
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="promo-desde">Válida desde</label>
            <input id="promo-desde" type="datetime-local" name="validoDesde" className="form-control shadow-none" defaultValue={valorDatetimeLocal(editando?.validoDesde)} />
          </div>
          <div className="col-12 col-md-6">
            <label className="form-label" htmlFor="promo-hasta">Válida hasta</label>
            <input id="promo-hasta" type="datetime-local" name="validoHasta" className="form-control shadow-none" defaultValue={valorDatetimeLocal(editando?.validoHasta)} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="promo-descripcion">Descripción</label>
            <textarea id="promo-descripcion" name="descripcion" rows={2} className="form-control shadow-none" defaultValue={editando?.descripcion ?? ''} />
          </div>
          <div className="col-12">
            <label className="form-label" htmlFor="promo-servicios">Servicios aplicables (Ctrl/Cmd para selección múltiple)</label>
            <select
              id="promo-servicios"
              name="servicios"
              multiple
              size={Math.min(servicios.length, 6)}
              className="form-select shadow-none"
              defaultValue={[...serviciosSeleccionados]}
            >
              {servicios.map((servicio) => (
                <option key={servicio.id} value={servicio.id}>
                  {servicio.categoria.nombre} · {servicio.nombre}
                </option>
              ))}
            </select>
          </div>
          <div className="col-12 d-flex gap-2">
            <button type="submit" className="btn btn-primary">{editando ? 'Guardar cambios' : 'Crear promoción'}</button>
            {editando && <Link href="/admin/promociones" className="btn btn-outline-light">Cancelar</Link>}
          </div>
        </form>
      </div>

      <div className="card-custom p-0 overflow-hidden">
        <div className="table-responsive">
          <table className="table-custom align-middle mb-0">
            <thead>
              <tr>
                <th>Promoción</th>
                <th>Descuento</th>
                <th>Vigencia</th>
                <th>Usos</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {promociones.map((promocion) => (
                <tr key={promocion.id}>
                  <td>
                    {promocion.nombre}
                    {promocion.codigo && <span className="badge-outline ms-2">{promocion.codigo}</span>}
                    <br />
                    <small className="text-subtle">
                      {promocion.serviciosAplicables.length} servicio(s)
                    </small>
                  </td>
                  <td>
                    {TIPOS_DESCUENTO[promocion.tipoDescuento]}: {promocion.valorDescuento}
                  </td>
                  <td>
                    <small className="text-subtle">
                      {formatFechaHoraCorta(promocion.validoDesde)}
                      {promocion.validoHasta ? ` → ${formatFechaHoraCorta(promocion.validoHasta)}` : ' → sin fin'}
                    </small>
                  </td>
                  <td>
                    {promocion.usosActuales}
                    {promocion.stockUsos !== null ? ` / ${promocion.stockUsos}` : ''}
                  </td>
                  <td>
                    {promocion.activo ? (
                      <span className="badge-gold">Activa</span>
                    ) : (
                      <span className="badge-outline">Inactiva</span>
                    )}
                  </td>
                  <td>
                    <div className="d-flex gap-2">
                      <Link className="btn btn-outline-light btn-sm" href={`/admin/promociones?id=${promocion.id}`}>Editar</Link>
                      <form action={eliminarPromocionAction} data-confirm="¿Eliminar esta promoción?">
                        <input type="hidden" name="id" value={promocion.id} />
                        <input type="hidden" name="volverA" value="/admin/promociones" />
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
