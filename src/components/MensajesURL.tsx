'use client';

import { useSearchParams } from 'next/navigation';

import Mensajes from './Mensajes';

/** Lee `?msg=` / `?error=` de la URL y muestra los avisos correspondientes. */
export default function MensajesURL() {
  const parametros = useSearchParams();
  return <Mensajes msg={parametros.get('msg')} error={parametros.get('error')} />;
}
