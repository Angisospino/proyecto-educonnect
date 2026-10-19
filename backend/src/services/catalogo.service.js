import cursoRepository from '../repositories/curso.repository.js';
import asignaturaRepository from '../repositories/asignatura.repository.js';

/**
 * Valida que el ID de un curso sea un entero positivo.
 *
 * @param {number|string} id - ID recibido.
 * @returns {number} ID numérico validado.
 */
const validarCursoId = (id) => {
  const cursoId = Number(id);

  if (!Number.isInteger(cursoId) || cursoId <= 0) {
    const error = new Error('El ID del curso no es válido.');
    error.statusCode = 400;
    throw error;
  }

  return cursoId;
};

/**
 * Lista todos los cursos.
 *
 * @returns {Promise<Array>} Lista de cursos.
 */
const listarCursos = async () => {
  return cursoRepository.listar();
};

/**
 * Lista todas las asignaturas.
 *
 * @returns {Promise<Array>} Lista de asignaturas.
 */
const listarAsignaturas = async () => {
  return asignaturaRepository.listar();
};

/**
 * Lista los estudiantes de un curso.
 *
 * Un curso inexistente responde 404 (no una lista vacía), para
 * distinguirlo de un curso que existe pero no tiene estudiantes.
 *
 * @param {number|string} cursoId - ID del curso.
 * @returns {Promise<Array>} Perfiles de estudiante del curso.
 */
const listarEstudiantesDeCurso = async (cursoId) => {
  const id = validarCursoId(cursoId);

  const curso = await cursoRepository.buscarPorId(id);

  if (!curso) {
    const error = new Error('Curso no encontrado.');
    error.statusCode = 404;
    throw error;
  }

  return cursoRepository.listarEstudiantes(id);
};

export default {
  listarCursos,
  listarAsignaturas,
  listarEstudiantesDeCurso,
};
