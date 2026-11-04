'use client';

import { useActionState, useState, useTransition } from 'react';

import { consultarEstadoHorasAction, crearReservaAction } from '@/actions/reservas';
import { fechaLocalAUtc, hoyISO } from '@/lib/datetime';
import { ESTADO_INICIAL } from '@/lib/form';
import { formatFechaLarga } from '@/lib/format';

type Props = {
  servicioSlug: string;
  servicioNombre: string;
  duracion: number;
  precioFormateado: string;
  fechaInicial: string;
  horasIniciales: { hora: string; disponible: boolean }[];
};

/** "YYYY-MM-DD" -> "Lunes 12 de mayo de 2026" (sin desfases de zona horaria). */
function fechaLegible(fechaISO: string): string {
  const [year, month, day] = fechaISO.split('-').map(Number);
  return formatFechaLarga(fechaLocalAUtc(year, month, day));
}

/** Formulario de reserva: fecha, grilla de horas disponibles y notas del cliente. */
export default function SelectorFechaHora({
  servicioSlug,
  servicioNombre,
  duracion,
  precioFormateado,
  fechaInicial,
  horasIniciales,
}: Props) {
  const [estado, accion, pendiente] = useActionState(crearReservaAction, ESTADO_INICIAL);
  const [fecha, setFecha] = useState(fechaInicial);
  const [horas, setHoras] = useState<{ hora: string; disponible: boolean }[]>(horasIniciales);
  const [hora, setHora] = useState('');
  const [cargando, iniciarTransicion] = useTransition();
  const horasDisponibles = horas.filter((item) => item.disponible);

  function cambiarFecha(nuevaFecha: string) {
    setFecha(nuevaFecha);
    setHora('');
    if (!nuevaFecha) {
      setHoras([]);
      return;
    }
    iniciarTransicion(async () => {
      setHoras(await consultarEstadoHorasAction(servicioSlug, nuevaFecha));
    });
  }

  return (
    <div className="row g-4">
      <div className="col-12 col-lg-7">
        <div className="card-custom">
          <h2 className="h3 font-serif mb-4">Completa los datos</h2>
          <form action={accion} id="bookingForm" noValidate>
            <input type="hidden" name="servicioSlug" value={servicioSlug} />

            <div className="mb-3">
              <label htmlFor="fecha" className="form-label">
                Fecha
              </label>
              <input
                type="date"
                id="fecha"
                name="fecha"
                className="form-control shadow-none"
                min={hoyISO()}
                value={fecha}
                onChange={(evento) => cambiarFecha(evento.target.value)}
                required
              />
            </div>

            <input type="hidden" name="hora" value={hora} />

            <div className="mb-3">
              <label htmlFor="notasCliente" className="form-label">
                Notas o preferencias (opcional)
              </label>
              <textarea
                id="notasCliente"
                name="notasCliente"
                rows={3}
                className="form-control shadow-none"
                placeholder="Cuéntanos si tienes alguna preferencia o necesidad especial"
              />
            </div>

            {estado.mensaje && (
              <div className="alert alert-danger" role="alert">
                {estado.mensaje}
              </div>
            )}

            <div className="d-grid gap-2 mt-3">
              <button type="submit" className="btn btn-primary btn-lg" disabled={pendiente || !hora}>
                {pendiente ? 'Creando reserva…' : 'Confirmar reserva'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <aside className="col-12 col-lg-5">
        <div className="card-custom sticky-top-custom mb-4">
          <h3 className="h5 font-serif mb-3">Servicio seleccionado</h3>
          <div className="mb-3">
            <h4 className="h4 font-serif mb-1">{servicioNombre}</h4>
          </div>
          <hr className="border-dark-subtle my-3" />
          <ul className="list-unstyled small mb-4">
            <li className="d-flex justify-content-between py-1">
              <span className="text-subtle">Precio</span>
              <span className="fw-semibold">{precioFormateado}</span>
            </li>
            <li className="d-flex justify-content-between py-1">
              <span className="text-subtle">Duración</span>
              <span className="fw-semibold">⏱️ {duracion} min</span>
            </li>
            <li className="d-flex justify-content-between py-1">
              <span className="text-subtle">Pago</span>
              <span className="fw-semibold">En salón</span>
            </li>
          </ul>
          <div className="alert alert-warning bg-soft-warning border-color-subtle mb-0 small">
            Si el servicio aparece con valor <strong>desde</strong>, el monto final puede variar
            según largo, cantidad de cabello, trabajos químicos previos y evaluación profesional.
          </div>
        </div>

        <div className="card-custom">
          <h3 className="h5 font-serif mb-3">Horarios disponibles</h3>
          {fecha && horas.length > 0 ? (
            <>
              <p className="text-subtle mb-3">
                {fechaLegible(fecha)} · {horasDisponibles.length} horario
                {horasDisponibles.length === 1 ? '' : 's'} libre
                {horasDisponibles.length === 1 ? '' : 's'}
              </p>
              <div className="grid-hours">
                {horas.map((item) => (
                  <button
                    type="button"
                    key={item.hora}
                    className={`hour-btn${hora === item.hora ? ' selected' : ''}${
                      item.disponible ? '' : ' is-unavailable'
                    }`}
                    data-value={item.hora}
                    onClick={() => item.disponible && setHora(item.hora)}
                    disabled={!item.disponible}
                    aria-disabled={!item.disponible}
                  >
                    {item.disponible ? item.hora : `${item.hora} X`}
                  </button>
                ))}
              </div>
              {horasDisponibles.length === 0 && (
                <div
                  className="alert alert-secondary bg-dark text-light border-warning-subtle mt-3 mb-0"
                  role="alert"
                >
                  ⚠️ Todas las horas de esta fecha ya fueron tomadas. Prueba con otro día.
                </div>
              )}
            </>
          ) : fecha && horas.length === 0 ? (
            <div
              className="alert alert-secondary bg-dark text-light border-warning-subtle"
              role="alert"
            >
              ⚠️ No existen horas disponibles para esta fecha. Prueba con otro día.
            </div>
          ) : (
            <p className="text-subtle mb-0 small">
              Selecciona una fecha para ver los horarios disponibles.
            </p>
          )}
          {cargando && <p className="text-subtle small mt-3 mb-0">Cargando horarios…</p>}
        </div>

        <div className="card-custom mt-4">
          <h3 className="h5 font-serif mb-3">Recomendaciones antes de tu cita</h3>
          <ul className="mb-0 small">
            <li>Llega a la hora reservada.</li>
            <li>No asistas con productos pesados en el cabello.</li>
            <li>Evita gel, mousse, aceite y sérum antes de la evaluación.</li>
            <li>
              Si tu servicio es largo o incluye color/decoloración, usa las notas para contar tu
              historial químico y el largo actual de tu cabello.
            </li>
          </ul>
        </div>
      </aside>
    </div>
  );
}
