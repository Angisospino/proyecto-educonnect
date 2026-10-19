import prisma from '../config/prisma.js';

/**
 * Lista todas las asignaturas ordenadas por nombre.
 *
 * @returns {Promise<Array>} Lista de asignaturas.
 */
const listar = async () => {
  return prisma.asignatura.findMany({
    orderBy: {
      nombre: 'asc',
    },
  });
};

export default {
  listar,
};
