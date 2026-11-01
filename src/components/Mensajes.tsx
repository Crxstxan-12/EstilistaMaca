import { resolverMensaje } from '@/lib/mensajes';

type Props = {
  msg?: string | null;
  error?: string | null;
};

function Icono({ tipo }: { tipo: string }) {
  if (tipo === 'success') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}>
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
      </svg>
    );
  }
  if (tipo === 'error') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}>
        <circle cx="12" cy="12" r="10" />
        <line x1="15" y1="9" x2="9" y2="15" />
        <line x1="9" y1="9" x2="15" y2="15" />
      </svg>
    );
  }
  if (tipo === 'warning') {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}>
        <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
        <line x1="12" y1="9" x2="12" y2="13" />
        <line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    );
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ marginTop: 2, flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="16" x2="12" y2="12" />
      <line x1="12" y1="8" x2="12.01" y2="8" />
    </svg>
  );
}

/** Renderiza los avisos provenientes de la redirección (?msg= y ?error=). */
export default function Mensajes({ msg, error }: Props) {
  const mensaje = resolverMensaje(msg);
  if (!mensaje && !error) return null;

  const alertas = [];
  if (mensaje) alertas.push({ tipo: mensaje.tipo, texto: mensaje.texto });
  if (error) alertas.push({ tipo: 'error' as const, texto: error });

  return (
    <div className="container-custom mt-3">
      <div className="messages-container mb-4">
        {alertas.map((alerta, i) => (
          <div key={i} className={`alert alert-${alerta.tipo} fade-in`} role="alert">
            <div className="d-flex align-items-start gap-2">
              <Icono tipo={alerta.tipo} />
              <div>{alerta.texto}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
