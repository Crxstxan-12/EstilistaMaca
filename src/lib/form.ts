/**
 * Tipos compartidos por los formularios que usan `useActionState`.
 * El estado viaja del servidor (Server Action) al cliente (componente de formulario).
 */

export type ActionState = {
  ok: boolean;
  mensaje?: string;
  /** Errores por campo: { email: 'Este correo ya está registrado.' } */
  errores?: Record<string, string>;
};

export const ESTADO_INICIAL: ActionState = { ok: false };

/** Normaliza texto de un FormData. */
export function texto(formData: FormData, campo: string): string {
  const valor = formData.get(campo);
  return typeof valor === 'string' ? valor.trim() : '';
}

/** Valida el formato de un correo electrónico. */
export function esEmailValido(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/** Rango aceptado de caracteres permitidos en una contraseña nueva. */
export function validarPassword(password: string): string | null {
  if (password.length < 8) return 'La contraseña debe tener al menos 8 caracteres.';
  if (!/[A-Za-z]/.test(password) || !/\d/.test(password)) {
    return 'La contraseña debe incluir letras y números.';
  }
  return null;
}
