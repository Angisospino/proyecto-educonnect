
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
  const inicio = new Date(`${fecha}T00:00:00.000Z`);
  const fin = new Date(inicio);

  fin.setUTCDate(fin.getUTCDate() + 1);

  return prisma.asistencia.findMany({
    where: {
      cursoId: Number(cursoId),
      fecha: {
        gte: inicio,
        lt: fin,
      },
    },
    include: incluirEstudiante,
    orderBy: [
      { fecha: "asc" },
      { estudianteId: "asc" },
    ],
  });
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

  return prisma.asistencia.findMany({
    where: {
      estudianteId: Number(estudianteId),

      ...(Object.keys(filtroFecha).length > 0 && {
        fecha: filtroFecha,
      }),
    },

    include: incluirEstudiante,

    orderBy: {
      fecha: "desc",
    },
  });
};


const buscarPaginadas = async ({
  where,
  skip,
  take,
}) => {
  const [asistencias, total] =
    await prisma.$transaction([
      prisma.asistencia.findMany({
        where,
        skip,
        take,
        orderBy: [
          { fecha: "desc" },
          { id: "desc" },
        ],
      }),

      prisma.asistencia.count({
        where,
      }),
    ]);

  return {
    asistencias,
    total,
  };
};


/* ==========================================
   EXPORTAR REPOSITORIO
   ========================================== */

const asistenciaRepository = {
  registrar,
  buscarPorCurso,
  buscarPorEstudiante,
  buscarPaginadas
};

export default asistenciaRepository;
