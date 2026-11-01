'use client';

import { useActionState } from 'react';

import { actualizarPerfilAction } from '@/actions/auth';
import { ESTADO_INICIAL } from '@/lib/form';

type Props = {
  firstName: string;
  lastName: string;
  telefono: string;
  /** Fecha en formato YYYY-MM-DD o cadena vacía. */
  fechaNacimiento: string;
};

export default function PerfilForm({ firstName, lastName, telefono, fechaNacimiento }: Props) {
  const [estado, accion, pendiente] = useActionState(actualizarPerfilAction, ESTADO_INICIAL);

  return (
    <form action={accion} encType="multipart/form-data" noValidate>
      {estado.mensaje && (
        <div className="alert alert-danger" role="alert">
          {estado.mensaje}
        </div>
      )}

      <div className="mb-3">
        <label className="form-label" htmlFor="firstName">
          Nombre
        </label>
        <input
          type="text"
          id="firstName"
          name="firstName"
          className="form-control shadow-none"
          defaultValue={firstName}
          required
          maxLength={150}
        />
        {estado.errores?.firstName && (
          <div className="text-danger small mt-1">{estado.errores.firstName}</div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="lastName">
          Apellidos
        </label>
        <input
          type="text"
          id="lastName"
          name="lastName"
          className="form-control shadow-none"
          defaultValue={lastName}
          required
          maxLength={150}
        />
        {estado.errores?.lastName && (
          <div className="text-danger small mt-1">{estado.errores.lastName}</div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="telefono">
          Teléfono
        </label>
        <input
          type="tel"
          id="telefono"
          name="telefono"
          className="form-control shadow-none"
          defaultValue={telefono}
          maxLength={20}
        />
        {estado.errores?.telefono && (
          <div className="text-danger small mt-1">{estado.errores.telefono}</div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="fechaNacimiento">
          Fecha de nacimiento
        </label>
        <input
          type="date"
          id="fechaNacimiento"
          name="fechaNacimiento"
          className="form-control shadow-none"
          defaultValue={fechaNacimiento}
        />
        {estado.errores?.fechaNacimiento && (
          <div className="text-danger small mt-1">{estado.errores.fechaNacimiento}</div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="fotoPerfil">
          Foto de perfil
        </label>
        <input
          type="file"
          id="fotoPerfil"
          name="fotoPerfil"
          className="form-control shadow-none"
          accept="image/*"
        />
        {estado.errores?.fotoPerfil && (
          <div className="text-danger small mt-1">{estado.errores.fotoPerfil}</div>
        )}
      </div>

      <div className="d-flex flex-wrap gap-2 justify-content-end mt-4">
        <button type="submit" className="btn btn-primary px-5" disabled={pendiente}>
          Guardar cambios
        </button>
      </div>
    </form>
  );
}
