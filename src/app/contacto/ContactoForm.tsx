'use client';

import { useActionState } from 'react';

import { contactoAction } from '@/actions/contacto';
import { ESTADO_INICIAL } from '@/lib/form';

/** Formulario de contacto con estado gestionado por Server Action. */
export default function ContactoForm() {
  const [estado, accion, pendiente] = useActionState(contactoAction, ESTADO_INICIAL);

  return (
    <form action={accion} noValidate>
      {estado.mensaje && (
        <div className="alert alert-danger py-2" role="alert">
          {estado.mensaje}
        </div>
      )}
      <div className="row g-3">
        <div className="col-12 col-md-6">
          <label className="form-label">Nombre *</label>
          <input
            type="text"
            name="nombre"
            required
            className="form-control shadow-none"
            placeholder="Tu nombre"
          />
          {estado.errores?.nombre && (
            <p className="text-danger small mb-0 mt-1">{estado.errores.nombre}</p>
          )}
        </div>
        <div className="col-12 col-md-6">
          <label className="form-label">Teléfono</label>
          <input
            type="tel"
            name="telefono"
            className="form-control shadow-none"
            placeholder="+56 9 ..."
          />
          {estado.errores?.telefono && (
            <p className="text-danger small mb-0 mt-1">{estado.errores.telefono}</p>
          )}
        </div>
        <div className="col-12">
          <label className="form-label">Correo electrónico *</label>
          <input
            type="email"
            name="email"
            required
            className="form-control shadow-none"
            placeholder="tu@email.com"
          />
          {estado.errores?.email && (
            <p className="text-danger small mb-0 mt-1">{estado.errores.email}</p>
          )}
        </div>
        <div className="col-12">
          <label className="form-label">Asunto</label>
          <input
            type="text"
            name="asunto"
            className="form-control shadow-none"
            placeholder="Ej: Consulta sobre balayage"
          />
          {estado.errores?.asunto && (
            <p className="text-danger small mb-0 mt-1">{estado.errores.asunto}</p>
          )}
        </div>
        <div className="col-12">
          <label className="form-label">Mensaje *</label>
          <textarea
            name="mensaje"
            rows={5}
            required
            className="form-control shadow-none"
            placeholder="Cuéntanos en qué podemos ayudarte..."
          />
          {estado.errores?.mensaje && (
            <p className="text-danger small mb-0 mt-1">{estado.errores.mensaje}</p>
          )}
        </div>
        <div className="col-12 d-flex justify-content-end">
          <button type="submit" className="btn btn-primary px-5" disabled={pendiente}>
            Enviar mensaje
          </button>
        </div>
      </div>
    </form>
  );
}
