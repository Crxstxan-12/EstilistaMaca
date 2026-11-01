import {
  crearBloqueoAction,
  eliminarBloqueoAction,
  guardarHorarioAction,
} from '@/actions/admin';
import { requerirAdmin } from '@/lib/auth';
import { DIAS_SEMANA } from '@/lib/datetime';
import { MOTIVOS_BLOQUEO, formatFechaHoraCorta } from '@/lib/format';
import { prisma } from '@/lib/prisma';
import type { HorarioSemanal } from '@prisma/client';

export default async function AdminAgendaPage() {
  await requerirAdmin('/admin/agenda');

  const [horarios, bloqueos] = await Promise.all([
    prisma.horarioSemanal.findMany({ orderBy: { dia: 'asc' } }),
    prisma.bloqueoHorario.findMany({ orderBy: { fechaInicio: 'desc' } }),
  ]);

  const horarioPorDia = new Map<number, HorarioSemanal>();
  for (const horario of horarios) horarioPorDia.set(horario.dia, horario);

  const ahora = new Date();
  const bloqueosProximos = bloqueos.filter((bloqueo) => bloqueo.fechaFin >= ahora);
  const bloqueosVencidos = bloqueos.filter((bloqueo) => bloqueo.fechaFin < ahora);
  const bloqueosOrdenados = [...bloqueosProximos, ...bloqueosVencidos];

  return (
    <>
      <h2 className="h4 font-serif mb-3">Horario semanal</h2>
      <div className="row g-3 mb-5">
        {DIAS_SEMANA.map((nombreDia, dia) => {
          const horario = horarioPorDia.get(dia);
          const abierto = horario ? horario.abierto : true;
          return (
            <div className="col-12 col-md-6 col-xl-4" key={dia}>
              <div className="card-custom h-100">
                <h3 className="h6 font-serif mb-3">{nombreDia}</h3>
                <form action={guardarHorarioAction} className="d-flex flex-column gap-2">
                  <input type="hidden" name="dia" value={dia} />
                  <input type="hidden" name="volverA" value="/admin/agenda" />
                  <div className="form-check">
                    <input id={`abierto-${dia}`} type="checkbox" name="abierto" className="form-check-input" defaultChecked={abierto} />
                    <label htmlFor={`abierto-${dia}`} className="form-check-label">Abierto</label>
                  </div>
                  <div className="row g-2">
                    <div className="col-6">
                      <label className="form-label small" htmlFor={`apertura-${dia}`}>Apertura</label>
                      <input id={`apertura-${dia}`} type="time" name="horaApertura" className="form-control form-control-sm shadow-none" defaultValue={horario?.horaApertura ?? '10:00'} />
                    </div>
                    <div className="col-6">
                      <label className="form-label small" htmlFor={`cierre-${dia}`}>Cierre</label>
                      <input id={`cierre-${dia}`} type="time" name="horaCierre" className="form-control form-control-sm shadow-none" defaultValue={horario?.horaCierre ?? '20:00'} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label small" htmlFor={`nota-${dia}`}>Nota</label>
                    <input id={`nota-${dia}`} name="nota" className="form-control form-control-sm shadow-none" defaultValue={horario?.nota ?? ''} />
                  </div>
                  <button type="submit" className="btn btn-outline-light btn-sm mt-1">Guardar</button>
                </form>
              </div>
            </div>
          );
        })}
      </div>

      <h2 className="h4 font-serif mb-3">Bloqueos de agenda</h2>

      <div className="card-custom mb-4">
        <h3 className="h6 font-serif mb-3">Nuevo bloqueo</h3>
        <form action={crearBloqueoAction} className="row g-3">
          <input type="hidden" name="volverA" value="/admin/agenda" />
          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="blo-titulo">Título</label>
            <input id="blo-titulo" name="titulo" className="form-control shadow-none" required />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="blo-inicio">Inicio</label>
            <input id="blo-inicio" type="datetime-local" name="fechaInicio" className="form-control shadow-none" required />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="blo-fin">Término</label>
            <input id="blo-fin" type="datetime-local" name="fechaFin" className="form-control shadow-none" required />
          </div>
          <div className="col-12 col-md-4">
            <label className="form-label" htmlFor="blo-motivo">Motivo</label>
            <select id="blo-motivo" name="motivo" className="form-select shadow-none" defaultValue="OTRO">
              {Object.entries(MOTIVOS_BLOQUEO).map(([valor, etiqueta]) => (
                <option key={valor} value={valor}>{etiqueta}</option>
              ))}
            </select>
          </div>
          <div className="col-12 col-md-8">
            <label className="form-label" htmlFor="blo-nota">Nota</label>
            <input id="blo-nota" name="nota" className="form-control shadow-none" />
          </div>
          <div className="col-12 d-flex align-items-center gap-3">
            <div className="form-check">
              <input id="blo-mostrar" type="checkbox" name="mostrarAClientes" className="form-check-input" defaultChecked />
              <label htmlFor="blo-mostrar" className="form-check-label">Mostrar a clientes</label>
            </div>
            <button type="submit" className="btn btn-primary">Crear bloqueo</button>
          </div>
        </form>
      </div>

      {bloqueosOrdenados.length === 0 ? (
        <div className="card-custom empty-state">
          <div className="empty-icon mb-3">🗓️</div>
          <p className="text-subtle mb-0">No hay bloqueos registrados.</p>
        </div>
      ) : (
        <div className="card-custom p-0 overflow-hidden">
          <div className="table-responsive">
            <table className="table-custom align-middle mb-0">
              <thead>
                <tr>
                  <th>Bloqueo</th>
                  <th>Rango</th>
                  <th>Motivo</th>
                  <th>Visible</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {bloqueosOrdenados.map((bloqueo) => (
                  <tr key={bloqueo.id} className={bloqueo.fechaFin < ahora ? 'opacity-50' : ''}>
                    <td>
                      {bloqueo.titulo}
                      {bloqueo.nota && (
                        <>
                          <br />
                          <small className="text-subtle">{bloqueo.nota}</small>
                        </>
                      )}
                    </td>
                    <td>
                      <small className="text-subtle">
                        {formatFechaHoraCorta(bloqueo.fechaInicio)} → {formatFechaHoraCorta(bloqueo.fechaFin)}
                      </small>
                    </td>
                    <td>{MOTIVOS_BLOQUEO[bloqueo.motivo] ?? bloqueo.motivo}</td>
                    <td>{bloqueo.mostrarAClientes ? 'Sí' : 'No'}</td>
                    <td>
                      <form action={eliminarBloqueoAction} data-confirm="¿Eliminar este bloqueo?">
                        <input type="hidden" name="id" value={bloqueo.id} />
                        <input type="hidden" name="volverA" value="/admin/agenda" />
                        <button type="submit" className="btn btn-outline-light btn-sm">Eliminar</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
