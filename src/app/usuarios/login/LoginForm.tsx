'use client';

import { useActionState } from 'react';

import { loginAction } from '@/actions/auth';
import { ESTADO_INICIAL } from '@/lib/form';

export default function LoginForm({ next }: { next: string }) {
  const [estado, accion, pendiente] = useActionState(loginAction, ESTADO_INICIAL);

  return (
    <form action={accion} className="mb-3" noValidate>
      {estado.mensaje && (
        <div className="alert alert-danger" role="alert">
          {estado.mensaje}
        </div>
      )}

      <div className="mb-3">
        <label className="form-label" htmlFor="email">
          Correo electrónico
        </label>
        <input
          type="email"
          id="email"
          name="email"
          className="form-control shadow-none"
          placeholder="tu@email.com"
          required
          maxLength={254}
          autoFocus
        />
        {estado.errores?.email && <div className="text-danger small mt-1">{estado.errores.email}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="password">
          Contraseña
        </label>
        <input
          type="password"
          id="password"
          name="password"
          className="form-control shadow-none"
          required
        />
        {estado.errores?.password && (
          <div className="text-danger small mt-1">{estado.errores.password}</div>
        )}
      </div>

      <input type="hidden" name="next" value={next} />

      <div className="d-grid mt-4">
        <button type="submit" className="btn btn-primary" disabled={pendiente}>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4" />
            <polyline points="10 17 15 12 10 7" />
            <line x1="15" y1="12" x2="3" y2="12" />
          </svg>
          Iniciar sesión
        </button>
      </div>
    </form>
  );
}
