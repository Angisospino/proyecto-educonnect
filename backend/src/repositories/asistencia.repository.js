
import prisma from "../config/prisma.js";

/* ==========================================
   REGISTRAR ASISTENCIA
   ========================================== */

/**
 * Registra una asistencia en la base de datos.
 *
 * @param {Object} datos
 * @returns {Promise<Object>}
 */
const registrar = async (datos) => {
  return prisma.asistencia.create({
    data: {
      estudianteId: Number(datos.estudianteId),
      cursoId: Number(datos.cursoId),
      fecha: new Date(datos.fecha),
      estado: datos.estado,
    },
  });
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

    orderBy: {
      fecha: "desc",
    },
  });
};


/* ==========================================
   EXPORTAR REPOSITORIO
   ========================================== */

const asistenciaRepository = {
  registrar,
  buscarPorCurso,
  buscarPorEstudiante,
};

export default asistenciaRepository;
