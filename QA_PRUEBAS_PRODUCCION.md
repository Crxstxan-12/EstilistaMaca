# Pruebas recomendadas antes de publicar

## 1. Acceso general

- Abrir `/` y verificar que cargue sin errores visuales.
- Entrar a `/servicios`, `/galeria`, `/contacto` y `/privacidad`.
- Revisar que en móvil el menú abra y cierre correctamente.
- Confirmar que los botones de WhatsApp, Instagram y ubicación apunten al destino correcto.

## 2. Registro e inicio de sesión

- Crear una cuenta nueva con datos válidos.
- Intentar registrarse con contraseñas que no coinciden y confirmar que el formulario conserve los datos escritos.
- Intentar registrarse con un correo ya existente y revisar el mensaje.
- Iniciar sesión con credenciales correctas.
- Iniciar sesión con contraseña incorrecta y confirmar que el formulario no borre los campos.
- Cerrar sesión y volver a entrar.

## 3. Recuperación de contraseña

- Solicitar recuperación con un correo existente.
- Solicitar recuperación con un correo no registrado y revisar el mensaje.
- Abrir el enlace de recuperación.
- Cambiar la contraseña por una válida.
- Intentar una contraseña inválida y confirmar que el formulario muestre el error sin perder los datos.
- Iniciar sesión con la nueva contraseña.

## 4. Reserva de horas

- Iniciar sesión como clienta.
- Entrar a `/reservas` y comprobar que redirige al login si no hay sesión.
- Elegir un servicio y revisar que aparezcan fecha y horas disponibles.
- Confirmar que las horas ya ocupadas se muestren con `X`.
- Crear una reserva normal.
- Verificar que la reserva aparezca en `Mis Reservas`.
- Intentar reservar el mismo bloque desde otra cuenta y confirmar que no permita doble reserva.
- Probar agregar observaciones y revisar que queden guardadas.

## 5. Reagendar y cancelar

- Desde `Mis Reservas`, abrir una reserva y usar el botón `Reagendar`.
- Elegir un nuevo horario disponible y confirmar que la reserva cambie.
- Intentar reagendar a una hora ocupada y validar que el sistema la bloquee.
- Cancelar una reserva y revisar que el horario vuelva a quedar libre.
- Verificar que una reserva cancelada no siga bloqueando la agenda.

## 6. Panel administrador

- Iniciar sesión con una cuenta administradora.
- Entrar a `/admin` y comprobar acceso.
- Revisar módulos de servicios, categorías, promociones, reservas, galería y usuarios.
- Crear, editar y eliminar un servicio.
- Bloquear un día u hora en la agenda y verificar que deje de aparecer disponible al reservar.
- Eliminar o cancelar una reserva desde administración y comprobar que el horario se libere para clientas.

## 7. Galería y contenido

- Revisar que las imágenes carguen correctamente.
- Si usan Cloudinary, confirmar que las URLs y cargas funcionen.
- Verificar que no existan imágenes rotas ni textos cortados.

## 8. Contacto y notificaciones

- Enviar el formulario de contacto y revisar respuesta del sistema.
- Si el correo SMTP está configurado, confirmar recepción real.
- Si no está configurado, validar al menos que no rompa la página.

## 9. Salud técnica

- Ejecutar `npx tsc --noEmit`.
- Ejecutar `npm run lint`.
- Ejecutar `npm run build`.
- Abrir `/api/health` y confirmar que responda con `ok: true` y `db.connected: true`.

## 10. Validación final en Vercel

- Confirmar que Vercel tenga `DATABASE_URL`, `DIRECT_URL` y `AUTH_SECRET`.
- Verificar que el deploy termine sin errores.
- Probar en producción real el flujo completo: registro, login, reserva, reagendado, cancelación y acceso admin.
- Revisar consola del navegador y logs de Vercel para detectar errores silenciosos.

## Criterio de salida

Puedes considerar el proyecto listo para publicar cuando:

- no haya errores en `build`, `lint` y `typecheck`;
- `/api/health` responda bien en producción;
- no se puedan duplicar reservas;
- el reagendado y la cancelación funcionen;
- el panel admin permita gestionar agenda, servicios y reservas;
- los formularios no pierdan datos al mostrar errores.
