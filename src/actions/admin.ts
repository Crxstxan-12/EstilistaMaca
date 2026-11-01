'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { requerirAdmin } from '@/lib/auth';
import { parseFechaHoraLocal } from '@/lib/datetime';
import { texto } from '@/lib/form';
import { prisma } from '@/lib/prisma';
import { slugify } from '@/lib/slug';
import { eliminarImagen, subirImagen } from '@/lib/upload';
import type {
  MotivoBloqueo,
  Prisma,
  TipoDescuento,
} from '@prisma/client';

function aNumero(valor: FormDataEntryValue | null, porDefecto = 0): number {
  const numero = Number(valor);
  return Number.isFinite(numero) ? numero : porDefecto;
}

function aBooleano(valor: FormDataEntryValue | null): boolean {
  return valor === 'on' || valor === 'true' || valor === '1';
}

function aFechaLocal(valor: string): Date | null {
  if (!valor) return null;
  const [fecha, hora = '00:00'] = valor.split('T');
  return parseFechaHoraLocal(fecha, hora.slice(0, 5));
}

function destino(formData: FormData, alternativo: string): string {
  const volverA = texto(formData, 'volverA');
  return volverA.startsWith('/') ? volverA : alternativo;
}

/** Genera un slug único dentro de una tabla, considerando el registro actual. */
async function slugUnico(
  modelo: 'categoria' | 'servicio' | 'promocion',
  nombre: string,
  idActual?: string,
): Promise<string> {
  const base = slugify(nombre);
  let candidato = base;
  let sufijo = 1;

  for (;;) {
    const existente =
      modelo === 'categoria'
        ? await prisma.categoria.findUnique({ where: { slug: candidato } })
        : modelo === 'servicio'
          ? await prisma.servicio.findUnique({ where: { slug: candidato } })
          : await prisma.promocion.findUnique({ where: { slug: candidato } });

    if (!existente || existente.id === idActual) return candidato;
    sufijo += 1;
    candidato = `${base}-${sufijo}`;
  }
}

// --------------------------------------------
// CATEGORÍAS
// --------------------------------------------

export async function guardarCategoriaAction(formData: FormData): Promise<void> {
  const volverA = destino(formData, '/admin/categorias');
  await requerirAdmin(volverA);

  const id = texto(formData, 'id');
  const nombre = texto(formData, 'nombre');
  if (!nombre) redirect(`${volverA}?error=El nombre de la categoría es obligatorio.`);

  const datos = {
    nombre,
    slug: await slugUnico('categoria', nombre, id || undefined),
    descripcion: texto(formData, 'descripcion'),
    icono: texto(formData, 'icono'),
    orden: aNumero(formData.get('orden')),
    activo: aBooleano(formData.get('activo')),
  };

  if (id) {
    await prisma.categoria.update({ where: { id }, data: datos });
  } else {
    await prisma.categoria.create({ data: datos });
  }

  revalidatePath('/admin/categorias');
  revalidatePath('/servicios');
  redirect(`${volverA}?msg=datos-actualizados`);
}

export async function eliminarCategoriaAction(formData: FormData): Promise<void> {
  const volverA = destino(formData, '/admin/categorias');
  await requerirAdmin(volverA);
  const id = texto(formData, 'id');

  const servicios = await prisma.servicio.count({ where: { categoriaId: id } });
  if (servicios > 0) {
    redirect(
      `${volverA}?error=No se puede eliminar: la categoría tiene ${servicios} servicio(s) asociado(s).`,
    );
  }

  await prisma.categoria.delete({ where: { id } });
  revalidatePath('/admin/categorias');
  redirect(`${volverA}?msg=datos-actualizados`);
}

// --------------------------------------------
// SERVICIOS
// --------------------------------------------

export async function guardarServicioAction(formData: FormData): Promise<void> {
  const volverA = destino(formData, '/admin/servicios');
  await requerirAdmin(volverA);

  const id = texto(formData, 'id');
  const nombre = texto(formData, 'nombre');
  const categoriaId = texto(formData, 'categoriaId');
  if (!nombre || !categoriaId) {
    redirect(`${volverA}?error=El nombre y la categoría son obligatorios.`);
  }

  const anterior = id
    ? await prisma.servicio.findUnique({ where: { id }, select: { imagen: true } })
    : null;
  const nuevaImagen = await subirImagen(formData.get('imagen'), 'servicios');
  if (nuevaImagen && anterior?.imagen) await eliminarImagen(anterior.imagen);

  const descripcionCorta = texto(formData, 'descripcionCorta');
  const datos: Prisma.ServicioUncheckedCreateInput = {
    categoriaId,
    nombre,
    slug: await slugUnico('servicio', nombre, id || undefined),
    descripcion: texto(formData, 'descripcion') || descripcionCorta,
    descripcionCorta,
    precio: aNumero(formData.get('precio')),
    duracion: aNumero(formData.get('duracion'), 60),
    precioDesde: aBooleano(formData.get('precioDesde')),
    activo: aBooleano(formData.get('activo')),
    destacado: aBooleano(formData.get('destacado')),
    orden: aNumero(formData.get('orden')),
    ...(nuevaImagen ? { imagen: nuevaImagen } : {}),
  };

  if (id) {
    await prisma.servicio.update({ where: { id }, data: datos });
  } else {
    await prisma.servicio.create({ data: datos });
  }

  revalidatePath('/admin/servicios');
  revalidatePath('/servicios');
  revalidatePath('/');
  redirect(`${volverA}?msg=datos-actualizados`);
}

export async function eliminarServicioAction(formData: FormData): Promise<void> {
  const volverA = destino(formData, '/admin/servicios');
  await requerirAdmin(volverA);
  const id = texto(formData, 'id');

  const reservas = await prisma.reserva.count({ where: { servicioId: id } });
  if (reservas > 0) {
    redirect(
      `${volverA}?error=No se puede eliminar: el servicio tiene ${reservas} reserva(s) asociada(s). Desactívalo en su lugar.`,
    );
  }

  const servicio = await prisma.servicio.findUnique({ where: { id }, select: { imagen: true } });
  await prisma.servicio.delete({ where: { id } });
  if (servicio?.imagen) await eliminarImagen(servicio.imagen);

  revalidatePath('/admin/servicios');
  revalidatePath('/servicios');
  redirect(`${volverA}?msg=datos-actualizados`);
}

// --------------------------------------------
// PROMOCIONES
// --------------------------------------------

export async function guardarPromocionAction(formData: FormData): Promise<void> {
  const volverA = destino(formData, '/admin/promociones');
  await requerirAdmin(volverA);

  const id = texto(formData, 'id');
  const nombre = texto(formData, 'nombre');
  if (!nombre) redirect(`${volverA}?error=El nombre de la promoción es obligatorio.`);

  const stockTexto = texto(formData, 'stockUsos');
  const codigo = texto(formData, 'codigo').toUpperCase() || null;
  const servicios = formData.getAll('servicios').map(String).filter(Boolean);

  const datos = {
    nombre,
    slug: await slugUnico('promocion', nombre, id || undefined),
    descripcion: texto(formData, 'descripcion'),
    codigo,
    tipoDescuento: (texto(formData, 'tipoDescuento') || 'PORCENTAJE') as TipoDescuento,
    valorDescuento: aNumero(formData.get('valorDescuento')),
    validoDesde: aFechaLocal(texto(formData, 'validoDesde')) ?? new Date(),
    validoHasta: aFechaLocal(texto(formData, 'validoHasta')),
    stockUsos: stockTexto === '' ? null : aNumero(stockTexto),
    activo: aBooleano(formData.get('activo')),
  };

  if (id) {
    await prisma.promocion.update({
      where: { id },
      data: {
        ...datos,
        serviciosAplicables: { set: servicios.map((servicioId) => ({ id: servicioId })) },
      },
    });
  } else {
    await prisma.promocion.create({
      data: {
        ...datos,
        serviciosAplicables: { connect: servicios.map((servicioId) => ({ id: servicioId })) },
      },
    });
  }

  revalidatePath('/admin/promociones');
  revalidatePath('/servicios');
  revalidatePath('/');
  redirect(`${volverA}?msg=datos-actualizados`);
}

export async function eliminarPromocionAction(formData: FormData): Promise<void> {
  const volverA = destino(formData, '/admin/promociones');
  await requerirAdmin(volverA);

  await prisma.promocion.delete({ where: { id: texto(formData, 'id') } });
  revalidatePath('/admin/promociones');
  redirect(`${volverA}?msg=datos-actualizados`);
}

// --------------------------------------------
// GALERÍA
// --------------------------------------------

export async function guardarTrabajoAction(formData: FormData): Promise<void> {
  const volverA = destino(formData, '/admin/galeria');
  await requerirAdmin(volverA);

  const id = texto(formData, 'id');
  const titulo = texto(formData, 'titulo');
  if (!titulo) redirect(`${volverA}?error=El título es obligatorio.`);

  const anterior = id
    ? await prisma.galeriaTrabajo.findUnique({ where: { id }, select: { imagen: true } })
    : null;
  const nuevaImagen = await subirImagen(formData.get('imagen'), 'galeria');
  if (nuevaImagen && anterior?.imagen) await eliminarImagen(anterior.imagen);

  const categoriaId = texto(formData, 'categoriaId') || null;
  const datos = {
    titulo,
    descripcion: texto(formData, 'descripcion'),
    categoriaId,
    tags: texto(formData, 'tags'),
    clienteAnonimo: aBooleano(formData.get('clienteAnonimo')),
    destacado: aBooleano(formData.get('destacado')),
    activo: aBooleano(formData.get('activo')),
    orden: aNumero(formData.get('orden')),
    ...(nuevaImagen ? { imagen: nuevaImagen } : {}),
  };

  if (id) {
    await prisma.galeriaTrabajo.update({ where: { id }, data: datos });
  } else {
    await prisma.galeriaTrabajo.create({ data: datos });
  }

  revalidatePath('/admin/galeria');
  revalidatePath('/galeria');
  revalidatePath('/');
  redirect(`${volverA}?msg=datos-actualizados`);
}

export async function eliminarTrabajoAction(formData: FormData): Promise<void> {
  const volverA = destino(formData, '/admin/galeria');
  await requerirAdmin(volverA);

  const id = texto(formData, 'id');
  const trabajo = await prisma.galeriaTrabajo.findUnique({ where: { id }, select: { imagen: true } });
  await prisma.galeriaTrabajo.delete({ where: { id } });
  if (trabajo?.imagen) await eliminarImagen(trabajo.imagen);

  revalidatePath('/admin/galeria');
  revalidatePath('/galeria');
  redirect(`${volverA}?msg=datos-actualizados`);
}

// --------------------------------------------
// HORARIOS Y BLOQUEOS
// --------------------------------------------

export async function guardarHorarioAction(formData: FormData): Promise<void> {
  const volverA = destino(formData, '/admin/agenda');
  await requerirAdmin(volverA);

  const dia = aNumero(formData.get('dia'), -1);
  if (dia < 0 || dia > 6) redirect(`${volverA}?error=Día inválido.`);

  const abierto = aBooleano(formData.get('abierto'));
  const horaApertura = texto(formData, 'horaApertura') || null;
  const horaCierre = texto(formData, 'horaCierre') || null;

  const datos = {
    abierto,
    horaApertura: abierto ? horaApertura : null,
    horaCierre: abierto ? horaCierre : null,
    nota: texto(formData, 'nota'),
  };

  await prisma.horarioSemanal.upsert({
    where: { dia },
    create: { dia, ...datos },
    update: datos,
  });

  revalidatePath('/admin/agenda');
  revalidatePath('/');
  redirect(`${volverA}?msg=datos-actualizados`);
}

export async function crearBloqueoAction(formData: FormData): Promise<void> {
  const volverA = destino(formData, '/admin/agenda');
  await requerirAdmin(volverA);

  const titulo = texto(formData, 'titulo');
  const fechaInicio = aFechaLocal(texto(formData, 'fechaInicio'));
  const fechaFin = aFechaLocal(texto(formData, 'fechaFin'));

  if (!titulo || !fechaInicio || !fechaFin) {
    redirect(`${volverA}?error=Indica título, fecha de inicio y fecha de término.`);
  }
  if (fechaFin <= fechaInicio) {
    redirect(`${volverA}?error=La fecha de término debe ser posterior al inicio.`);
  }

  await prisma.bloqueoHorario.create({
    data: {
      titulo,
      fechaInicio,
      fechaFin,
      motivo: (texto(formData, 'motivo') || 'OTRO') as MotivoBloqueo,
      nota: texto(formData, 'nota'),
      mostrarAClientes: aBooleano(formData.get('mostrarAClientes')),
    },
  });

  revalidatePath('/admin/agenda');
  redirect(`${volverA}?msg=datos-actualizados`);
}

export async function eliminarBloqueoAction(formData: FormData): Promise<void> {
  const volverA = destino(formData, '/admin/agenda');
  await requerirAdmin(volverA);

  await prisma.bloqueoHorario.delete({ where: { id: texto(formData, 'id') } });
  revalidatePath('/admin/agenda');
  redirect(`${volverA}?msg=datos-actualizados`);
}

// --------------------------------------------
// CLIENTES
// --------------------------------------------

export async function guardarClienteAction(formData: FormData): Promise<void> {
  const volverA = destino(formData, '/admin/clientes');
  await requerirAdmin(volverA);

  const id = texto(formData, 'id');
  const nombre = texto(formData, 'nombre');
  const email = texto(formData, 'email').toLowerCase();
  if (!nombre || !email) redirect(`${volverA}?error=El nombre y el correo son obligatorios.`);

  const datos = {
    nombre,
    apellido: texto(formData, 'apellido'),
    email,
    telefono: texto(formData, 'telefono'),
    notas: texto(formData, 'notas'),
    esVip: aBooleano(formData.get('esVip')),
    fechaNacimiento: aFechaLocal(texto(formData, 'fechaNacimiento')),
  };

  if (id) {
    await prisma.cliente.update({ where: { id }, data: datos });
  } else {
    await prisma.cliente.create({ data: datos });
  }

  revalidatePath('/admin/clientes');
  redirect(`${volverA}?msg=datos-actualizados`);
}

export async function eliminarClienteAction(formData: FormData): Promise<void> {
  const volverA = destino(formData, '/admin/clientes');
  await requerirAdmin(volverA);
  const id = texto(formData, 'id');

  const reservas = await prisma.reserva.count({ where: { clienteId: id } });
  if (reservas > 0) {
    redirect(
      `${volverA}?error=No se puede eliminar: el cliente tiene ${reservas} reserva(s) registrada(s).`,
    );
  }

  await prisma.cliente.delete({ where: { id } });
  revalidatePath('/admin/clientes');
  redirect(`${volverA}?msg=datos-actualizados`);
}

// --------------------------------------------
// USUARIOS Y NOTIFICACIONES
// --------------------------------------------

export async function cambiarRolUsuarioAction(formData: FormData): Promise<void> {
  const volverA = destino(formData, '/admin/usuarios');
  await requerirAdmin(volverA);

  const id = texto(formData, 'id');
  const esAdministrador = aBooleano(formData.get('esAdministrador'));

  await prisma.usuario.update({
    where: { id },
    data: {
      rol: esAdministrador ? 'ADMINISTRADOR' : 'CLIENTE',
      isStaff: esAdministrador,
    },
  });

  revalidatePath('/admin/usuarios');
  redirect(`${volverA}?msg=datos-actualizados`);
}

export async function alternarUsuarioActivoAction(formData: FormData): Promise<void> {
  const volverA = destino(formData, '/admin/usuarios');
  await requerirAdmin(volverA);

  const id = texto(formData, 'id');
  const usuario = await prisma.usuario.findUnique({ where: { id }, select: { isActive: true } });
  if (!usuario) redirect(`${volverA}?error=El usuario no existe.`);

  await prisma.usuario.update({ where: { id }, data: { isActive: !usuario.isActive } });
  revalidatePath('/admin/usuarios');
  redirect(`${volverA}?msg=datos-actualizados`);
}

export async function marcarNotificacionesLeidasAction(formData: FormData): Promise<void> {
  const volverA = destino(formData, '/admin/notificaciones');
  const usuario = await requerirAdmin(volverA);

  await prisma.notificacion.updateMany({
    where: { usuarioId: usuario.id, leida: false },
    data: { leida: true, leidaAt: new Date() },
  });

  revalidatePath('/admin/notificaciones');
  redirect(`${volverA}?msg=datos-actualizados`);
}
