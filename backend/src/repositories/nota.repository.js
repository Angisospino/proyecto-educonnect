import prisma from '../config/prisma.js';

/**
 * Crea una nueva nota.
 *
 * @param {Object} datos - Datos de la nota.
 * @returns {Promise<Object>} Nota creada.
 */
const crear = async (datos) => {
  return prisma.nota.create({
    data: datos,
  });
};

/**
 * Busca las notas de un estudiante en un período académico.
 *
 * @param {number} estudianteId - ID del perfil del estudiante.
 * @param {string} periodo - Período académico.
 * @returns {Promise<Array>} Lista de notas.
 */
const buscarPorEstudiante = async (estudianteId, periodo) => {
  return prisma.nota.findMany({
    where: {
      estudianteId,
      periodo,
    },
    include: {
      asignatura: true,
      // No se usa `docente: true` a secas: el modelo Usuario incluye
      // passwordHash, y ese campo nunca debe salir hacia el cliente
      // (mismo criterio que usuario.repository.js, que siempre hace
      // select explícito para excluirlo).
      docente: {
        select: {
          id: true,
          nombre: true,
          apellido: true,
          email: true,
        },
      },
    },
  });
};

/**
 * Busca una nota por su ID.
 *
 * @param {number} id - ID de la nota.
 * @returns {Promise<Object|null>} Nota encontrada o null.
 */
const buscarPorId = async (id) => {
  return prisma.nota.findUnique({
    where: {
      id,
    },
  });
};

/**
 * Actualiza una nota existente.
 *
 * @param {number} id - ID de la nota.
 * @param {Object} datos - Datos que se van a actualizar.
 * @returns {Promise<Object>} Nota actualizada.
 */
const actualizar = async (id, datos) => {
  return prisma.nota.update({
    where: {
      id,
    },
    data: datos,
  });
};

export default {
  crear,
  buscarPorEstudiante,
  buscarPorId,
  actualizar,
};