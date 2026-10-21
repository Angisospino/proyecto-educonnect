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

// No se usa `docente: true` a secas: el modelo Usuario incluye
// passwordHash, y ese campo nunca debe salir hacia el cliente
// (mismo criterio que usuario.repository.js, que siempre hace
// select explícito para excluirlo).
const incluirRelaciones = {
  asignatura: true,
  docente: {
    select: {
      id: true,
      nombre: true,
      apellido: true,
      email: true,
    },
  },
};

// Filtro compartido por la consulta completa y la paginada: así el
// total (count) siempre se calcula sobre las mismas notas que se listan.
const filtrarPorEstudiante = (estudianteId, periodo) => ({
  estudianteId,
  periodo,
});

/**
 * Busca las notas de un estudiante en un período académico.
 *
 * @param {number} estudianteId - ID del perfil del estudiante.
 * @param {string} periodo - Período académico.
 * @returns {Promise<Array>} Lista de notas.
 */
const buscarPorEstudiante = async (estudianteId, periodo) => {
  return prisma.nota.findMany({
    where: filtrarPorEstudiante(estudianteId, periodo),
    include: incluirRelaciones,
  });
};

/**
 * Igual que buscarPorEstudiante pero devuelve una sola página y el total
 * de notas que cumplen el filtro (no el de la página).
 *
 * El orden es fijo (período e id) para que las páginas sean estables y
 * no se repitan ni se salten notas entre una página y otra.
 *
 * @param {number} estudianteId - ID del perfil del estudiante.
 * @param {string} periodo - Período académico.
 * @param {{ skip: number, take: number }} paginacion
 * @returns {Promise<{ notas: Array, total: number }>}
 */
const buscarPaginadasPorEstudiante = async (
  estudianteId,
  periodo,
  { skip, take }
) => {
  const where = filtrarPorEstudiante(estudianteId, periodo);

  const [notas, total] = await prisma.$transaction([
    prisma.nota.findMany({
      where,
      include: incluirRelaciones,
      orderBy: [{ periodo: 'asc' }, { id: 'asc' }],
      skip,
      take,
    }),
    prisma.nota.count({ where }),
  ]);

  return { notas, total };
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
  buscarPaginadasPorEstudiante,
  buscarPorId,
  actualizar,
};