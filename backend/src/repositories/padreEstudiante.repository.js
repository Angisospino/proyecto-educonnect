import prisma from '../config/prisma.js';

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

/**
 * Campos de un vínculo que se exponen a la administración.
 *
 * Select explícito: nunca incluye passwordHash ni email (mismo criterio
 * que listarHijos).
 */
const seleccionVinculo = {
  id: true,
  padre: {
    select: {
      id: true,
      nombre: true,
      apellido: true,
    },
  },
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
};

/**
 * Lista los vínculos padre-estudiante, con filtros opcionales.
 *
 * @param {Object} [filtros]
 * @param {number} [filtros.padreId] - ID del padre (tabla Usuario).
 * @param {number} [filtros.estudianteId] - ID del perfil de estudiante.
 * @returns {Promise<Array>} Vínculos ordenados por id ascendente.
 */
const listar = async ({ padreId, estudianteId } = {}) => {
  const where = {};

  if (padreId !== undefined) {
    where.padreId = Number(padreId);
  }

  if (estudianteId !== undefined) {
    where.estudianteId = Number(estudianteId);
  }

  return prisma.padreEstudiante.findMany({
    where,
    select: seleccionVinculo,
    orderBy: {
      id: 'asc',
    },
  });
};

/**
 * Busca un vínculo por su ID.
 *
 * @param {number} id - ID del vínculo (PadreEstudiante.id).
 * @returns {Promise<Object|null>} Vínculo encontrado o null.
 */
const buscarPorId = async (id) => {
  return prisma.padreEstudiante.findUnique({
    where: {
      id: Number(id),
    },
    select: seleccionVinculo,
  });
};

/**
 * Busca el vínculo de un par padre-estudiante concreto.
 *
 * @param {number} padreId - ID del padre (tabla Usuario).
 * @param {number} estudianteId - ID del perfil de estudiante.
 * @returns {Promise<Object|null>} Vínculo encontrado o null.
 */
const buscarPorPar = async (padreId, estudianteId) => {
  return prisma.padreEstudiante.findUnique({
    where: {
      padreId_estudianteId: {
        padreId: Number(padreId),
        estudianteId: Number(estudianteId),
      },
    },
    select: seleccionVinculo,
  });
};

/**
 * Crea un vínculo padre-estudiante.
 *
 * @param {number} padreId - ID del padre (tabla Usuario).
 * @param {number} estudianteId - ID del perfil de estudiante.
 * @returns {Promise<Object>} Vínculo creado.
 */
const crear = async (padreId, estudianteId) => {
  return prisma.padreEstudiante.create({
    data: {
      padreId: Number(padreId),
      estudianteId: Number(estudianteId),
    },
    select: seleccionVinculo,
  });
};

/**
 * Elimina un vínculo por su ID.
 *
 * @param {number} id - ID del vínculo (PadreEstudiante.id).
 * @returns {Promise<Object>} Vínculo eliminado (solo su id).
 */
const eliminar = async (id) => {
  return prisma.padreEstudiante.delete({
    where: {
      id: Number(id),
    },
    select: {
      id: true,
    },
  });
};

export default {
  listarHijos,
  buscarHijosIdsPorPadre,
  esPadreDe,
  listar,
  buscarPorId,
  buscarPorPar,
  crear,
  eliminar,
};
