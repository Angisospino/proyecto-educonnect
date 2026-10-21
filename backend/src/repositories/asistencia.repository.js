
import prisma from "../config/prisma.js";

/**
 * Incluye el estudiante con solo nombre y apellido de su usuario
 * (select explícito: nunca se devuelve passwordHash ni email).
 */
const incluirEstudiante = {
  estudiante: {
    include: {
      usuario: { select: { nombre: true, apellido: true } },
    },
  },
};

/* ==========================================
   FILTROS COMPARTIDOS
   ========================================== */

/*
 * La consulta completa y la paginada usan el mismo filtro (where), así el
 * total (count) siempre se calcula sobre los mismos registros que se listan.
 */

const filtrarPorCurso = (cursoId, fecha) => {
  const inicio = new Date(`${fecha}T00:00:00.000Z`);
  const fin = new Date(inicio);

  fin.setUTCDate(fin.getUTCDate() + 1);

  return {
    cursoId: Number(cursoId),
    fecha: {
      gte: inicio,
      lt: fin,
    },
  };
};

const ordenPorCurso = [
  { fecha: "asc" },
  { estudianteId: "asc" },
];

const filtrarPorEstudiante = (estudianteId, rangoFechas = {}) => {
  const { inicio, fin } = rangoFechas;

  const filtroFecha = {};

  if (inicio) {
    filtroFecha.gte = new Date(
      `${inicio}T00:00:00.000Z`
    );
  }

  if (fin) {
    const fechaFin = new Date(
      `${fin}T00:00:00.000Z`
    );

    fechaFin.setUTCDate(
      fechaFin.getUTCDate() + 1
    );

    filtroFecha.lt = fechaFin;
  }

  return {
    estudianteId: Number(estudianteId),

    ...(Object.keys(filtroFecha).length > 0 && {
      fecha: filtroFecha,
    }),
  };
};

/* ==========================================
   REGISTRAR ASISTENCIA
   ========================================== */

/**
 * Registra la asistencia de un estudiante en una fecha.
 *
 * Hay un único registro por estudiante y fecha (restricción
 * @@unique([estudianteId, fecha])): si ya existe, se actualiza
 * el estado y el docente que lo registró en vez de duplicarse,
 * de modo que volver a guardar el mismo día sirve para corregir
 * el estado. El curso no se modifica al actualizar: es el del
 * estudiante y un cursoId equivocado no debe mover el registro.
 *
 * @param {Object} datos
 * @returns {Promise<Object>}
 */
const registrar = async (datos) => {
  const estudianteId = Number(datos.estudianteId);
  const fecha = new Date(datos.fecha);
  const docenteId = Number(datos.docenteId);

  const upsert = () =>
    prisma.asistencia.upsert({
      where: {
        estudianteId_fecha: { estudianteId, fecha },
      },
      create: {
        estudianteId,
        fecha,
        cursoId: Number(datos.cursoId),
        docenteId,
        estado: datos.estado,
      },
      update: {
        docenteId,
        estado: datos.estado,
      },
    });

  try {
    return await upsert();
  } catch (error) {
    // Prisma emula el upsert en MySQL (buscar y luego crear): si dos
    // pedidos crean a la vez, el segundo choca con la restricción
    // única (P2002) y basta repetirlo para que actualice.
    if (error.code === "P2002") {
      return upsert();
    }

    throw error;
  }
};


/* ==========================================
   BUSCAR ASISTENCIA POR CURSO Y FECHA
   ========================================== */

/**
 * Consulta los registros de asistencia
 * de un curso en una fecha específica.
 *
 * @param {number} cursoId
 * @param {string|Date} fecha
 * @returns {Promise<Array>}
 */
const buscarPorCurso = async (cursoId, fecha) => {
  return prisma.asistencia.findMany({
    where: filtrarPorCurso(cursoId, fecha),
    include: incluirEstudiante,
    orderBy: ordenPorCurso,
  });
};

/**
 * Igual que buscarPorCurso pero devuelve una sola página y el total de
 * registros que cumplen el filtro (no el de la página).
 *
 * @param {number} cursoId
 * @param {string} fecha
 * @param {{ skip: number, take: number }} paginacion
 * @returns {Promise<{ asistencias: Array, total: number }>}
 */
const buscarPaginadasPorCurso = async (
  cursoId,
  fecha,
  { skip, take }
) => {
  const where = filtrarPorCurso(cursoId, fecha);

  const [asistencias, total] = await prisma.$transaction([
    prisma.asistencia.findMany({
      where,
      include: incluirEstudiante,
      orderBy: ordenPorCurso,
      skip,
      take,
    }),
    prisma.asistencia.count({ where }),
  ]);

  return { asistencias, total };
};


/* ==========================================
   BUSCAR ASISTENCIA POR ESTUDIANTE
   ========================================== */

/**
 * Consulta la asistencia de un estudiante
 * dentro de un rango de fechas.
 *
 * rangoFechas = {
 *   inicio: "2026-10-01",
 *   fin: "2026-10-31"
 * }
 *
 * @param {number} estudianteId
 * @param {Object} rangoFechas
 * @returns {Promise<Array>}
 */
const buscarPorEstudiante = async (
  estudianteId,
  rangoFechas = {}
) => {
  return prisma.asistencia.findMany({
    where: filtrarPorEstudiante(estudianteId, rangoFechas),

    include: incluirEstudiante,

    orderBy: {
      fecha: "desc",
    },
  });
};


/* ==========================================
   BUSCAR ASISTENCIA POR ESTUDIANTE (PAGINADA)
   ========================================== */

/**
 * Igual que buscarPorEstudiante pero devuelve una sola página y el total
 * de registros que cumplen el filtro (no el de la página).
 *
 * El id se agrega como desempate para que las páginas sean estables.
 *
 * @param {number} estudianteId
 * @param {Object} rangoFechas
 * @param {{ skip: number, take: number }} paginacion
 * @returns {Promise<{ asistencias: Array, total: number }>}
 */
const buscarPaginadasPorEstudiante = async (
  estudianteId,
  rangoFechas = {},
  { skip, take }
) => {
  const where = filtrarPorEstudiante(estudianteId, rangoFechas);

  const [asistencias, total] = await prisma.$transaction([
    prisma.asistencia.findMany({
      where,
      include: incluirEstudiante,
      orderBy: [
        { fecha: "desc" },
        { id: "desc" },
      ],
      skip,
      take,
    }),
    prisma.asistencia.count({ where }),
  ]);

  return { asistencias, total };
};


/* ==========================================
   EXPORTAR REPOSITORIO
   ========================================== */

const asistenciaRepository = {
  registrar,
  buscarPorCurso,
  buscarPaginadasPorCurso,
  buscarPorEstudiante,
  buscarPaginadasPorEstudiante,
};

export default asistenciaRepository;
