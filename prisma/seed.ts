/**
 * Seed de datos demo: categorías, servicios, horario semanal, promociones,
 * usuarios de prueba y galería.
 *
 * Ejecutar con:  npm run db:seed
 */
import { PrismaClient, type TipoDescuento } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

function slugify(texto: string): string {
  return texto
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/gi, 'n')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

type ServicioSeed = {
  nombre: string;
  duracion: number;
  precio: number;
  precioDesde?: boolean;
  descripcionCorta: string;
  destacado?: boolean;
};

type CategoriaSeed = {
  nombre: string;
  icono: string;
  orden: number;
  descripcion: string;
  servicios: ServicioSeed[];
};

const CATEGORIAS: CategoriaSeed[] = [
  {
    nombre: 'Cabello',
    icono: 'secador',
    orden: 1,
    descripcion:
      'Cortes, coloración, visos, balayage, tratamientos y procesos químicos con evaluación previa.',
    servicios: [
      {
        nombre: 'Corte de cabello',
        duracion: 45,
        precio: 8000,
        descripcionCorta: 'Corte y terminaciones. El tiempo puede variar entre 30 y 60 minutos.',
        destacado: true,
      },
      {
        nombre: 'Coloración',
        duracion: 60,
        precio: 35000,
        precioDesde: true,
        descripcionCorta: 'Servicio base de color. El valor final se confirma en evaluación.',
      },
      {
        nombre: 'Balayage',
        duracion: 300,
        precio: 80000,
        precioDesde: true,
        descripcionCorta: 'Técnica de iluminación degradada. Puede tardar entre 4 y 6 horas.',
        destacado: true,
      },
      {
        nombre: 'Visos / mechas',
        duracion: 300,
        precio: 60000,
        precioDesde: true,
        descripcionCorta: 'Visos o mechas con diagnóstico previo según base y largo.',
      },
      {
        nombre: 'Btx',
        duracion: 180,
        precio: 35000,
        precioDesde: true,
        descripcionCorta: 'Tratamiento capilar restaurador. Duración referencial de 3 horas.',
      },
      {
        nombre: 'Baño de color',
        duracion: 60,
        precio: 30000,
        descripcionCorta: 'Realza el tono, matiza y aporta brillo al cabello.',
      },
      {
        nombre: 'Alisado permanente',
        duracion: 120,
        precio: 50000,
        precioDesde: true,
        descripcionCorta: 'Alisado sujeto a largo, cantidad y evaluación del cabello.',
      },
      {
        nombre: 'Ondulación / permanente',
        duracion: 120,
        precio: 35000,
        precioDesde: true,
        descripcionCorta: 'Ondulación o permanente con evaluación previa del estado capilar.',
      },
    ],
  },
  {
    nombre: 'Uñas',
    icono: 'unas',
    orden: 2,
    descripcion: 'Servicios de manicure y soft gel con enfoque estético y duración informada.',
    servicios: [
      {
        nombre: 'Manicure',
        duracion: 120,
        precio: 25000,
        descripcionCorta: 'Servicio de manicure con duración aproximada de 2 horas.',
        destacado: true,
      },
      {
        nombre: 'Soft gel',
        duracion: 150,
        precio: 25000,
        descripcionCorta: 'Aplicación de soft gel con duración aproximada de 2 horas y 30 minutos.',
      },
    ],
  },
];

/** 0 = Lunes … 6 = Domingo */
const HORARIO_SEMANAL: { dia: number; abierto: boolean; apertura: string | null; cierre: string | null; nota: string }[] = [
  { dia: 0, abierto: true, apertura: '09:00', cierre: '18:00', nota: '' },
  { dia: 1, abierto: true, apertura: '09:00', cierre: '18:00', nota: '' },
  { dia: 2, abierto: true, apertura: '09:00', cierre: '18:00', nota: '' },
  { dia: 3, abierto: true, apertura: '09:00', cierre: '18:00', nota: '' },
  { dia: 4, abierto: true, apertura: '09:00', cierre: '18:00', nota: '' },
  { dia: 5, abierto: false, apertura: null, cierre: null, nota: 'Solo con cita' },
  { dia: 6, abierto: false, apertura: null, cierre: null, nota: 'Cerrado' },
];

type PromocionSeed = {
  nombre: string;
  codigo: string;
  tipoDescuento: TipoDescuento;
  valorDescuento: number;
  diasVigencia: number;
  stockUsos: number | null;
  descripcion: string;
};

const PROMOCIONES: PromocionSeed[] = [
  {
    nombre: 'Promoción hombres · Permanente / rizos',
    codigo: 'RIZOSHOMBRE',
    tipoDescuento: 'MONTO',
    valorDescuento: 40000,
    diasVigencia: 30,
    stockUsos: null,
    descripcion:
      'Promoción orientada a permanente o rizos para hombres. Confirmar vigencia al reservar.',
  },
  {
    nombre: 'Promoción mujeres · Color Glow',
    codigo: 'COLORGLOW',
    tipoDescuento: 'MONTO',
    valorDescuento: 65000,
    diasVigencia: 30,
    stockUsos: null,
    descripcion:
      'Promoción Color Glow. Confirmar qué incluye exactamente y su vigencia antes de confirmar la cita.',
  },
];

async function main() {
  console.log('🔶 Cargando categorías y servicios...');
  const serviciosPorSlug = new Map<string, string>();

  for (const cat of CATEGORIAS) {
    const slugCategoria = slugify(cat.nombre);
    const categoria = await prisma.categoria.upsert({
      where: { slug: slugCategoria },
      create: {
        nombre: cat.nombre,
        slug: slugCategoria,
        descripcion: cat.descripcion,
        orden: cat.orden,
        icono: cat.icono,
        activo: true,
      },
      update: {
        nombre: cat.nombre,
        descripcion: cat.descripcion,
        orden: cat.orden,
        icono: cat.icono,
        activo: true,
      },
    });

    for (const [indice, servicio] of cat.servicios.entries()) {
      const slugServicio = `${slugCategoria}-${slugify(servicio.nombre)}`;
      const creado = await prisma.servicio.upsert({
        where: { slug: slugServicio },
        create: {
          categoriaId: categoria.id,
          nombre: servicio.nombre,
          slug: slugServicio,
          descripcion: servicio.descripcionCorta,
          descripcionCorta: servicio.descripcionCorta,
          precio: servicio.precio,
          duracion: servicio.duracion,
          precioDesde: servicio.precioDesde ?? false,
          activo: true,
          destacado: servicio.destacado ?? false,
          orden: indice,
        },
        update: {
          categoriaId: categoria.id,
          precio: servicio.precio,
          duracion: servicio.duracion,
          precioDesde: servicio.precioDesde ?? false,
          destacado: servicio.destacado ?? false,
          orden: indice,
          activo: true,
        },
      });
      serviciosPorSlug.set(slugServicio, creado.id);
    }
  }
  console.log(`   Categorías: ${CATEGORIAS.length} · Servicios: ${serviciosPorSlug.size}`);

  console.log('🔶 Cargando horario semanal...');
  for (const h of HORARIO_SEMANAL) {
    await prisma.horarioSemanal.upsert({
      where: { dia: h.dia },
      create: {
        dia: h.dia,
        abierto: h.abierto,
        horaApertura: h.apertura,
        horaCierre: h.cierre,
        nota: h.nota,
      },
      update: {
        abierto: h.abierto,
        horaApertura: h.apertura,
        horaCierre: h.cierre,
        nota: h.nota,
      },
    });
  }
  console.log('   Horario semanal establecido.');

  console.log('🔶 Cargando promociones...');
  const ahora = new Date();
  for (const promo of PROMOCIONES) {
    const slug = slugify(promo.nombre);
    const validoHasta = new Date(ahora.getTime() + promo.diasVigencia * 24 * 60 * 60 * 1000);
    const promocion = await prisma.promocion.upsert({
      where: { slug },
      create: {
        nombre: promo.nombre,
        slug,
        codigo: promo.codigo,
        descripcion: promo.descripcion,
        tipoDescuento: promo.tipoDescuento,
        valorDescuento: promo.valorDescuento,
        validoDesde: ahora,
        validoHasta,
        stockUsos: promo.stockUsos,
        activo: true,
      },
      update: {
        nombre: promo.nombre,
        codigo: promo.codigo,
        descripcion: promo.descripcion,
        tipoDescuento: promo.tipoDescuento,
        valorDescuento: promo.valorDescuento,
        validoHasta,
        stockUsos: promo.stockUsos,
        activo: true,
      },
    });

    if (promo.codigo === 'COLORGLOW') {
      const coloracion = serviciosPorSlug.get('cabello-coloracion');
      const banoColor = serviciosPorSlug.get('cabello-bano-de-color');
      if (coloracion || banoColor) {
        await prisma.promocion.update({
          where: { id: promocion.id },
          data: {
            serviciosAplicables: {
              set: [coloracion, banoColor].filter(Boolean).map((id) => ({ id: id! })),
            },
          },
        });
      }
    }

    if (promo.codigo === 'RIZOSHOMBRE') {
      const permanente = serviciosPorSlug.get('cabello-ondulacion-permanente');
      if (permanente) {
        await prisma.promocion.update({
          where: { id: promocion.id },
          data: { serviciosAplicables: { set: [{ id: permanente }] } },
        });
      }
    }
  }
  console.log(`   Promociones: ${PROMOCIONES.length}`);

  console.log('🔶 Creando usuarios demo...');
  const passwordAdmin = await bcrypt.hash('Admin1234', 12);
  const passwordCliente = await bcrypt.hash('Cliente1234', 12);

  const admin = await prisma.usuario.upsert({
    where: { email: 'admin@macarenaestilista.cl' },
    create: {
      email: 'admin@macarenaestilista.cl',
      passwordHash: passwordAdmin,
      firstName: 'Macarena',
      lastName: 'Escobar',
      rol: 'ADMINISTRADOR',
      telefono: '+56978033409',
      isStaff: true,
      isSuperuser: true,
    },
    update: {
      passwordHash: passwordAdmin,
      rol: 'ADMINISTRADOR',
      isStaff: true,
      isSuperuser: true,
    },
  });

  const clienteUsuario = await prisma.usuario.upsert({
    where: { email: 'cliente@ejemplo.cl' },
    create: {
      email: 'cliente@ejemplo.cl',
      passwordHash: passwordCliente,
      firstName: 'Valentina',
      lastName: 'Rojas',
      rol: 'CLIENTE',
      telefono: '+56911111111',
    },
    update: { passwordHash: passwordCliente },
  });

  await prisma.cliente.upsert({
    where: { email: 'cliente@ejemplo.cl' },
    create: {
      usuarioId: clienteUsuario.id,
      nombre: 'Valentina',
      apellido: 'Rojas',
      email: 'cliente@ejemplo.cl',
      telefono: '+56911111111',
    },
    update: { usuarioId: clienteUsuario.id },
  });

  console.log(`   Admin: ${admin.email} · Cliente: cliente@ejemplo.cl`);

  console.log('🔶 Cargando galería demo...');
  const categoriasGaleria = ['Cortes & Peinados', 'Coloración & Técnicas', 'Manicure & Pedicure'];
  for (const [indice, nombreCategoria] of categoriasGaleria.entries()) {
    const categoria = await prisma.categoria.findUnique({
      where: { slug: slugify(nombreCategoria) },
    });
    const slugTrabajo = slugify(`trabajo-demo-${indice + 1}-${nombreCategoria}`);
    await prisma.galeriaTrabajo.upsert({
      where: { id: `demo-galeria-${indice + 1}` },
      create: {
        id: `demo-galeria-${indice + 1}`,
        titulo: `Trabajo destacado ${indice + 1}`,
        descripcion: `Resultado real del servicio de ${nombreCategoria.toLowerCase()} realizado en el salón.`,
        imagen: null,
        categoriaId: categoria?.id ?? null,
        clienteAnonimo: true,
        destacado: indice === 0,
        activo: true,
        orden: indice,
      },
      update: {
        titulo: `Trabajo destacado ${indice + 1}`,
        categoriaId: categoria?.id ?? null,
        activo: true,
        orden: indice,
      },
    });
    void slugTrabajo;
  }
  console.log('   Galería demo cargada.');

  console.log('\n✅ Datos demo cargados exitosamente.');
  console.log('   Admin:   admin@macarenaestilista.cl / Admin1234');
  console.log('   Cliente: cliente@ejemplo.cl / Cliente1234');
}

main()
  .catch((error) => {
    console.error('❌ Error al cargar datos demo:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
