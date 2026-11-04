'use client';

import Link from 'next/link';
import { useActionState, useState, type ChangeEvent } from 'react';

import { registroAction } from '@/actions/auth';
import { ESTADO_INICIAL } from '@/lib/form';

const VALORES_INICIALES = {
  firstName: '',
  lastName: '',
  email: '',
  telefono: '',
  password: '',
  password2: '',
};

export default function RegistroForm() {
  const [estado, accion, pendiente] = useActionState(registroAction, ESTADO_INICIAL);
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

      <div className="row">
        <div className="col-12 col-md-6 mb-3">
          <label className="form-label" htmlFor="firstName">
            Nombre
          </label>
          <input type="text" id="firstName" name="firstName" className="form-control shadow-none" required maxLength={150} value={valores.firstName} onChange={cambiar('firstName')} />
          {estado.errores?.firstName && (
            <div className="text-danger small mt-1">{estado.errores.firstName}</div>
          )}
        </div>
        <div className="col-12 col-md-6 mb-3">
          <label className="form-label" htmlFor="lastName">
            Apellido
          </label>
          <input type="text" id="lastName" name="lastName" className="form-control shadow-none" required maxLength={150} value={valores.lastName} onChange={cambiar('lastName')} />
          {estado.errores?.lastName && (
            <div className="text-danger small mt-1">{estado.errores.lastName}</div>
          )}
        </div>
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="email">
          Correo electrónico
        </label>
        <input type="email" id="email" name="email" className="form-control shadow-none" required maxLength={254} placeholder="tu@email.com" value={valores.email} onChange={cambiar('email')} />
        {estado.errores?.email && <div className="text-danger small mt-1">{estado.errores.email}</div>}
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="telefono">
          Teléfono
        </label>
        <input type="tel" id="telefono" name="telefono" className="form-control shadow-none" maxLength={20} value={valores.telefono} onChange={cambiar('telefono')} />
        {estado.errores?.telefono && (
          <div className="text-danger small mt-1">{estado.errores.telefono}</div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="password">
          Contraseña
        </label>
        <input type="password" id="password" name="password" className="form-control shadow-none" required value={valores.password} onChange={cambiar('password')} />
        {estado.errores?.password && (
          <div className="text-danger small mt-1">{estado.errores.password}</div>
        )}
      </div>

      <div className="mb-3">
        <label className="form-label" htmlFor="password2">
          Contraseña (confirmación)
        </label>
        <input type="password" id="password2" name="password2" className="form-control shadow-none" required value={valores.password2} onChange={cambiar('password2')} />
        {estado.errores?.password2 && (
          <div className="text-danger small mt-1">{estado.errores.password2}</div>
        )}
      </div>

      <div className="d-grid gap-2 mt-2">
        <button className="btn btn-primary btn-lg" type="submit" disabled={pendiente}>
          Crear mi cuenta
        </button>
      </div>
      <hr className="my-4 border-dark-subtle" />
      <p className="text-center small text-subtle mb-0">
        ¿Ya tienes cuenta?{' '}
        <Link href="/usuarios/login" className="text-gold text-decoration-none fw-semibold">
          Inicia sesión aquí
        </Link>
      </p>
    </form>
  );
}
