import prisma from '../config/prisma.js';

/**
 * Lista todos los cursos ordenados por nombre.
 *
 * @returns {Promise<Array>} Lista de cursos.
 */
const listar = async () => {
  return prisma.curso.findMany({
    orderBy: {
      nombre: 'asc',
    },
  });
};

/**
 * Busca un curso por su ID.
 *
 * @param {number} id - ID del curso.
 * @returns {Promise<Object|null>} Curso encontrado o null.
 */
const buscarPorId = async (id) => {
  return prisma.curso.findUnique({
    where: {
      id,
    },
  });
};

/**
 * Lista los estudiantes de un curso.
 *
 * El `id` devuelto es EstudiantePerfil.id, que es el que usan
 * Nota.estudianteId y Asistencia.estudianteId (no Usuario.id).
 *
 * Se usa `select` explícito en el usuario para no exponer nunca
 * passwordHash ni email (mismo criterio que usuario.repository.js).
 *
 * @param {number} cursoId - ID del curso.
 * @returns {Promise<Array>} Lista de perfiles de estudiante del curso.
 */
const listarEstudiantes = async (cursoId) => {
  return prisma.estudiantePerfil.findMany({
    where: {
      cursoId,
    },
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
    },
    orderBy: [
      { usuario: { apellido: 'asc' } },
      { usuario: { nombre: 'asc' } },
    ],
  });
};

export default {
  listar,
  buscarPorId,
  listarEstudiantes,
};
