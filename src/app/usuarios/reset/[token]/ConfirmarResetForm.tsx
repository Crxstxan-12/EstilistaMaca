'use client';

import { useActionState, useState, type ChangeEvent } from 'react';

import { confirmarResetAction } from '@/actions/auth';
import { ESTADO_INICIAL } from '@/lib/form';

const VALORES_INICIALES = { password: '', password2: '' };

export default function ConfirmarResetForm({ token }: { token: string }) {
  const [estado, accion, pendiente] = useActionState(confirmarResetAction, ESTADO_INICIAL);
  const [valores, setValores] = useState(VALORES_INICIALES);

  const cambiar =
    (campo: keyof typeof VALORES_INICIALES) => (evento: ChangeEvent<HTMLInputElement>) =>
      setValores((previos) => ({ ...previos, [campo]: evento.target.value }));

  return (
    <form action={accion} noValidate>
      {estado.mensaje && (
        <div className="alert alert-danger" role="alert">
          {estado.mensaje}
        </div>
      )}

      <div className="mb-3">
        <label className="form-label" htmlFor="password">
          Contraseña nueva
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className="form-control shadow-none"
          required
          value={valores.password}
          onChange={cambiar('password')}
        />
        {estado.errores?.password && (
          <div className="text-danger small mt-1">{estado.errores.password}</div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="password2">
          Contraseña nueva (confirmación)
        </label>
        <input
          type="password"
          id="password2"
          name="password2"
          className="form-control shadow-none"
          required
          value={valores.password2}
          onChange={cambiar('password2')}
        />
        <div className="text-subtle small mt-1">
          Para verificar, introduzca la misma contraseña anterior.
        </div>
        {estado.errores?.password2 && (
          <div className="text-danger small mt-1">{estado.errores.password2}</div>
        )}
      </div>

      <input type="hidden" name="token" value={token} />

      <div className="d-grid gap-2">
        <button className="btn btn-primary btn-lg" type="submit" disabled={pendiente}>
          Cambiar mi contraseña
        </button>
      </div>
    </form>
  );
}
