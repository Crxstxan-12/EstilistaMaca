'use client';

import Link from 'next/link';
import { useActionState, useState, useTransition } from 'react';

import { consultarEstadoHorasAction, reagendarReservaAction } from '@/actions/reservas';
import { fechaLocalAUtc, hoyISO } from '@/lib/datetime';
import { ESTADO_INICIAL } from '@/lib/form';
import { formatFechaLarga } from '@/lib/format';

type EstadoHora = {
  hora: string;
  disponible: boolean;
};

type Props = {
  reservaId: string;
  servicioSlug: string;
  fechaInicial: string;
  horaInicial: string;
  horasIniciales: EstadoHora[];
};

function fechaLegible(fechaISO: string): string {
  const [year, month, day] = fechaISO.split('-').map(Number);
  return formatFechaLarga(fechaLocalAUtc(year, month, day));
}

export default function ReagendarForm({
  reservaId,
  servicioSlug,
  fechaInicial,
  horaInicial,
  horasIniciales,
}: Props) {
  const [estado, accion, pendiente] = useActionState(reagendarReservaAction, ESTADO_INICIAL);
  const [fecha, setFecha] = useState(fechaInicial);
  const [hora, setHora] = useState(horaInicial);
  const [horas, setHoras] = useState<EstadoHora[]>(horasIniciales);
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
      setHoras(await consultarEstadoHorasAction(servicioSlug, nuevaFecha, reservaId));
    });
  }

  return (
    <form action={accion} noValidate>
      <input type="hidden" name="reservaId" value={reservaId} />
      <input type="hidden" name="hora" value={hora} />

      <div className="mb-3">
        <label htmlFor="reagendar-fecha" className="form-label">
          Nueva fecha
        </label>
        <input
          type="date"
          id="reagendar-fecha"
          name="fecha"
          className="form-control shadow-none"
          min={hoyISO()}
          value={fecha}
          onChange={(evento) => cambiarFecha(evento.target.value)}
          required
        />
      </div>

      {estado.mensaje && (
        <div className="alert alert-danger" role="alert">
          {estado.mensaje}
        </div>
      )}

      <div className="card-custom mt-4">
        <h3 className="h5 font-serif mb-3">Horarios para reagendar</h3>
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
            className="alert alert-secondary bg-dark text-light border-warning-subtle mb-0"
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

      <div className="d-flex flex-wrap gap-2 justify-content-end mt-4">
        <Link className="btn btn-outline-light" href={`/reservas/${reservaId}`}>
          Volver
        </Link>
        <button type="submit" className="btn btn-primary" disabled={pendiente || !hora}>
          {pendiente ? 'Reagendando…' : 'Guardar nuevo horario'}
        </button>
      </div>
    </form>
  );
}
