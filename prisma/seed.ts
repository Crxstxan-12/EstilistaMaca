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
    nombre: 'Alisados & Tratamientos Capilares',
    icono: 'secador',
    orden: 1,
    descripcion:
      'Alisados profesionales, keratina, botox capilar, reconstrucciones y tratamientos de hidratación intensiva.',
    servicios: [
      { nombre: 'Alisado Orgánico Premium', duracion: 180, precio: 65000, precioDesde: true, descripcionCorta: 'Alisado sin formol, ideal cabellos teñidos o sensibles.', destacado: true },
      { nombre: 'Alisado con Keratina', duracion: 240, precio: 75000, descripcionCorta: 'Alisado duradero con keratina hidrolizada.' },
      { nombre: 'Botox Capilar', duracion: 150, precio: 55000, descripcionCorta: 'Tratamiento reestructurante con efecto anti-frizz.' },
      { nombre: 'Reconstrucción Capilar Intensiva', duracion: 90, precio: 38000, descripcionCorta: 'Para cabellos dañados y muy secos.' },
    ],
  },
  {
    nombre: 'Coloración & Técnicas',
    icono: 'tijeras',
    orden: 2,
    descripcion:
      'Coloración completa, mechas, balayage, baby lights, reflejos y correcciones de color.',
    servicios: [
      { nombre: 'Balayage Premium', duracion: 240, precio: 80000, precioDesde: true, descripcionCorta: 'Técnica francesa de color degradado natural.', destacado: true },
      { nombre: 'Mechas Californianas / Babylights', duracion: 210, precio: 70000, descripcionCorta: 'Mechas finas o degradado en puntas.', destacado: true },
      { nombre: 'Coloración Completa', duracion: 120, precio: 45000, descripcionCorta: 'Color total de la raíz a las puntas.' },
      { nombre: 'Retoque de Raíz', duracion: 60, precio: 28000, descripcionCorta: 'Retoque solo área de crecimiento.' },
      { nombre: 'Corrección de Color', duracion: 180, precio: 72000, precioDesde: true, descripcionCorta: 'Trabajo especializado sobre coloración previa.' },
    ],
  },
  {
    nombre: 'Cortes & Peinados',
    icono: 'tijeras',
    orden: 3,
    descripcion: 'Cortes de mujer, flequillos, bob, long bob, capas y peinados de fiesta.',
    servicios: [
      { nombre: 'Corte Mujer + Lavado + Peinado', duracion: 75, precio: 35000, descripcionCorta: 'Corte a tijera clásico o moderno según rostro.', destacado: true },
      { nombre: 'Bob / Long Bob (Lob)', duracion: 90, precio: 42000, descripcionCorta: 'Corte estructurado a la altura de mandíbula/hombros.' },
      { nombre: 'Flequillo + corte', duracion: 90, precio: 38000, descripcionCorta: 'Flequillo curtain, recto, abierto o side bangs.' },
      { nombre: 'Peinado de Fiesta', duracion: 120, precio: 48000, descripcionCorta: 'Recogidos, ondas o peinado glamour para eventos.' },
    ],
  },
  {
    nombre: 'Rizos Permanentes & Estructuras',
    icono: 'rizos',
    orden: 4,
    descripcion: 'Permanentes de rizos, activaciones y definición de ondas naturales.',
    servicios: [
      { nombre: 'Permanente de Rizos Soft', duracion: 180, precio: 68000, precioDesde: true, descripcionCorta: 'Rizos naturales y suaves, tratamiento incluido.' },
      { nombre: 'Permanente Volumen Ondulado', duracion: 150, precio: 58000, descripcionCorta: 'Ondas de playa naturales.' },
      { nombre: 'Definición de Rizos Naturales (Deva Cut)', duracion: 90, precio: 42000, descripcionCorta: 'Corte en seco adaptado a cada tipo de rizo.' },
    ],
  },
  {
    nombre: 'Barbería & Caballero',
    icono: 'navaja',
    orden: 5,
    descripcion: 'Cortes clásicos y modernos, degradados, perfilados de barba y afeitado.',
    servicios: [
      { nombre: 'Corte Caballero + lavado', duracion: 45, precio: 22000, descripcionCorta: 'Tijera y máquina, incluye lavado.', destacado: true },
      { nombre: 'Degradado / Fade', duracion: 60, precio: 26000, descripcionCorta: 'Baja, media o alta con acabado pulido.' },
      { nombre: 'Perfilado de Barba + Afeitado Tradicional', duracion: 45, precio: 22000, descripcionCorta: 'Navaja, toalla caliente y aceites.' },
      { nombre: 'Pack Corte + Barba', duracion: 75, precio: 38000, descripcionCorta: 'Corte degradado + perfilado completo.' },
    ],
  },
  {
    nombre: 'Manicure & Pedicure',
    icono: 'unas',
    orden: 6,
    descripcion: 'Manicura clásica, esmaltado semipermanente, gelificada y pedicura spa.',
    servicios: [
      { nombre: 'Manicura Clásica', duracion: 45, precio: 22000, descripcionCorta: 'Limpiado, limado, cutícula y esmalte tradicional.', destacado: true },
      { nombre: 'Esmaltado Semipermanente', duracion: 60, precio: 32000, descripcionCorta: 'Hasta 3 semanas de duración con acabado glossy.', destacado: true },
      { nombre: 'Uñas Gelificadas (sistema completo)', duracion: 120, precio: 48000, descripcionCorta: 'Extensión o construcción sobre uña natural.' },
      { nombre: 'Pedicura Spa Completa', duracion: 75, precio: 36000, descripcionCorta: 'Exfoliación, hidratación y esmaltado.' },
    ],
  },
];

/** 0 = Lunes … 6 = Domingo */
const HORARIO_SEMANAL: { dia: number; abierto: boolean; apertura: string | null; cierre: string | null; nota: string }[] = [
  { dia: 0, abierto: true, apertura: '10:00', cierre: '20:00', nota: '' },
  { dia: 1, abierto: true, apertura: '10:00', cierre: '20:00', nota: '' },
  { dia: 2, abierto: true, apertura: '10:00', cierre: '20:00', nota: '' },
  { dia: 3, abierto: true, apertura: '10:00', cierre: '20:00', nota: '' },
  { dia: 4, abierto: true, apertura: '10:00', cierre: '21:00', nota: '' },
  { dia: 5, abierto: true, apertura: '10:00', cierre: '18:00', nota: '' },
  { dia: 6, abierto: false, apertura: null, cierre: null, nota: 'Domingo cerrado' },
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
    nombre: 'Bienvenida: 15% OFF en tu primera visita',
    codigo: 'BIENVENIDA15',
    tipoDescuento: 'PORCENTAJE',
    valorDescuento: 15,
    diasVigencia: 30,
    stockUsos: 100,
    descripcion:
      'Incentivo para nuevas clientas: 15% de descuento en cualquier servicio en su primera reserva en Macarena Estilista.',
  },
  {
    nombre: 'Pack Novias: Color + Corte + Peinado',
    codigo: 'PACKNOVIAS',
    tipoDescuento: 'MONTO',
    valorDescuento: 30000,
    diasVigencia: 90,
    stockUsos: 20,
    descripcion: 'Descuento especial de $30.000 para servicios integrales de novia.',
  },
  {
    nombre: 'Martes de Color: 2x1 Retoque de Raíz',
    codigo: '2X1MARTES',
    tipoDescuento: 'DOS_POR_UNO',
    valorDescuento: 0,
    diasVigencia: 60,
    stockUsos: null,
    descripcion: 'Los martes, paga 1 y llevas 2 retoques de raíz (amigas/madre-hija).',
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
  const idServicioRetoque = serviciosPorSlug.get('coloracion-tecnicas-retoque-de-raiz');

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

    // La promo 2x1 aplica al retoque de raíz.
    if (promo.codigo === '2X1MARTES' && idServicioRetoque) {
      await prisma.promocion.update({
        where: { id: promocion.id },
        data: { serviciosAplicables: { set: [{ id: idServicioRetoque }] } },
      });
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
      telefono: '+56900000000',
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
