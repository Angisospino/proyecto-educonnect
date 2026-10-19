import padreEstudianteRepository from '../repositories/padreEstudiante.repository.js';

/**
 * Lista los hijos del padre de familia autenticado.
 *
 * El padre sale siempre del token (usuario.id): no se acepta ningún
 * identificador de padre desde el cliente. Cada hijo trae `id` =
 * EstudiantePerfil.id, que es el que se envía como `estudianteId` al
 * consultar notas y asistencia.
 *
 * @param {Object} usuario - Usuario autenticado (req.usuario).
 * @returns {Promise<Array>} Perfiles de estudiante de los hijos.
 */
const listarMisHijos = async (usuario) => {
  return padreEstudianteRepository.listarHijos(usuario.id);
};

export default {
  listarMisHijos,
};
