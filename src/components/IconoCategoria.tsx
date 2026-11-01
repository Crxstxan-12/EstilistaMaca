/** Emoji representativo de cada categoría del catálogo. */
export default function IconoCategoria({ icono }: { icono: string }) {
  if (icono === 'tijeras' || icono === 'secador') return <>✂️</>;
  if (icono === 'unas') return <>💅</>;
  if (icono === 'rizos') return <>🌀</>;
  if (icono === 'navaja') return <>🪒</>;
  return <>✨</>;
}
