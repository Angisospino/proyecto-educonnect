import prisma from '../config/prisma.js';

/**
 * Elimina todos los vínculos de un padre
 * con sus estudiantes.
 *
 * @param {number} padreId
 * @param {object} db - Cliente Prisma o transacción.
 * @returns {Promise<{count: number}>}
 */
const eliminarPorPadre = async (
  padreId,
  db = prisma
) => {
  return db.padreEstudiante.deleteMany({
    where: {
      padreId: Number(padreId),
    },
  });
};

/**
 * Lista los hijos vinculados a un padre de familia.
 *
 * Devuelve un arreglo de perfiles de estudiante (ya aplanados, sin
 * el registro intermedio PadreEstudiante) con esta forma:
 *
 *   {
 *     id,                 // EstudiantePerfil.id (el que usan Nota y Asistencia)
 *     codigoEstudiantil,
 *     usuario: { id, nombre, apellido },
 *     curso: { id, nombre },
 *   }
 *
 * Se usa `select` explícito para no exponer nunca passwordHash ni email
 * (mismo criterio que curso.repository.js).
 *
 * @param {number} padreId - ID del padre (tabla Usuario).
 * @returns {Promise<Array>} Perfiles de estudiante de los hijos del padre.
 */
const listarHijos = async (padreId) => {
  const vinculos = await prisma.padreEstudiante.findMany({
    where: {
      padreId: Number(padreId),
    },
    select: {
      estudiante: {
        select: {
          id: true,
          codigoEstudiantil: true,
          usuario: {
            select: {
              id: true,
              nombre: true,
              apellido: true,
            },
          },
          curso: {
            select: {
              id: true,
              nombre: true,
            },
          },
        },
      },
    },
    orderBy: {
      estudianteId: 'asc',
    },
  });

  return vinculos.map((vinculo) => vinculo.estudiante);
};

/**
 * Obtiene los IDs de los hijos (EstudiantePerfil.id) de un padre.
 *
 * @param {number} padreId - ID del padre (tabla Usuario).
 * @returns {Promise<number[]>} IDs de los perfiles de estudiante vinculados.
 */
const buscarHijosIdsPorPadre = async (padreId) => {
  const vinculos = await prisma.padreEstudiante.findMany({
    where: {
      padreId: Number(padreId),
    },
    select: {
      estudianteId: true,
    },
  });

  return vinculos.map((vinculo) => vinculo.estudianteId);
};

/**
 * Indica si un padre está vinculado a un estudiante.
 *
 * @param {number} padreId - ID del padre (tabla Usuario).
 * @param {number} estudianteId - ID del perfil de estudiante (EstudiantePerfil.id).
 * @returns {Promise<boolean>} true si existe el vínculo.
 */
const esPadreDe = async (padreId, estudianteId) => {
  const total = await prisma.padreEstudiante.count({
    where: {
      padreId: Number(padreId),
      estudianteId: Number(estudianteId),
    },
  });

  return total > 0;
};

export default {
  eliminarPorPadre,
  listarHijos,
  buscarHijosIdsPorPadre,
  esPadreDe,
};
