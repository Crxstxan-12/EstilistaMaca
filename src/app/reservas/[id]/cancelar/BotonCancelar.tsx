'use client';

/** Botón de envío con confirmación previa (acción destructiva e irreversible). */
export default function BotonCancelar() {
  return (
    <button
      type="submit"
      className="btn btn-outline-danger px-4"
      onClick={(evento) => {
        if (!window.confirm('¿Seguro que deseas cancelar esta reserva?')) {
          evento.preventDefault();
        }
      }}
    >
      Sí, cancelar reserva
    </button>
  );
}
