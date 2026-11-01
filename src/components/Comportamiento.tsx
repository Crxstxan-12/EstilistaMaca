'use client';

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

/**
 * Comportamientos globales que dependen del DOM renderizado en cada navegación
 * (equivalente a static/js/main.js del proyecto Django original):
 *  - animación de aparición de elementos `.fade-in-when-ready`
 *  - cierre del menú móvil al navegar
 *  - confirmación en formularios con `data-confirm`
 */
export default function Comportamiento() {
  const pathname = usePathname();

  useEffect(() => {
    const elementos = document.querySelectorAll('.fade-in-when-ready');
    if (!('IntersectionObserver' in window) || elementos.length === 0) return;

    const observador = new IntersectionObserver(
      (entradas) => {
        for (const entrada of entradas) {
          if (entrada.isIntersecting) {
            entrada.target.classList.add('fade-in');
            observador.unobserve(entrada.target);
          }
        }
      },
      { threshold: 0.1 },
    );

    elementos.forEach((el) => observador.observe(el));
    return () => observador.disconnect();
  }, [pathname]);

  useEffect(() => {
    const alEnviar = (evento: Event) => {
      const formulario = evento.target as HTMLFormElement | null;
      const mensaje = formulario?.getAttribute?.('data-confirm');
      if (mensaje && !window.confirm(mensaje)) {
        evento.preventDefault();
      }
    };

    const alHacerClic = (evento: MouseEvent) => {
      const enlace = (evento.target as HTMLElement | null)?.closest(
        '.navbar-collapse .nav-link, .navbar-collapse .btn',
      );
      if (!enlace) return;
      const colapso = document.querySelector('#mainNavbar');
      if (colapso?.classList.contains('show')) {
        document.querySelector<HTMLButtonElement>('.navbar-toggler-custom')?.click();
      }
    };

    document.addEventListener('submit', alEnviar);
    document.addEventListener('click', alHacerClic);
    return () => {
      document.removeEventListener('submit', alEnviar);
      document.removeEventListener('click', alHacerClic);
    };
  }, []);

  return null;
}
