'use client';

import Link from 'next/link';
import { useActionState, useState, type ChangeEvent } from 'react';

import { solicitarResetAction } from '@/actions/auth';
import { ESTADO_INICIAL } from '@/lib/form';

export default function SolicitarResetForm() {
  const [estado, accion, pendiente] = useActionState(solicitarResetAction, ESTADO_INICIAL);
  const [email, setEmail] = useState('');

  const cambiarEmail = (evento: ChangeEvent<HTMLInputElement>) => setEmail(evento.target.value);

  return (
    <form action={accion} noValidate>
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
          required
          maxLength={254}
          className="form-control shadow-none"
          placeholder="tu@email.com"
          value={email}
          onChange={cambiarEmail}
        />
        {estado.errores?.email && <div className="text-danger small mt-1">{estado.errores.email}</div>}
      </div>

      <div className="d-grid gap-2 mt-2">
        <button type="submit" className="btn btn-primary btn-lg" disabled={pendiente}>
          Enviar correo de recuperación
        </button>
      </div>
      <p className="text-center small mt-4 mb-0">
        <Link href="/usuarios/login" className="text-gold text-decoration-none">
          ← Volver a iniciar sesión
        </Link>
      </p>
    </form>
  );
}
