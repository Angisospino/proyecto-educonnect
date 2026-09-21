import notaRepository from '../repositories/nota.repository.js';

/**
 * Registra una nueva nota.
 *
 * La calificación debe estar dentro del rango permitido: 0.0 - 5.0.
 *
 * @param {Object} datos - Datos de la nota.
 * @returns {Promise<Object>} Nota creada.
 */
const registrarNota = async (datos) => {
  const valor = Number(datos.valor);

  if (!Number.isFinite(valor) || valor < 0 || valor > 5) {
    const error = new Error('La nota debe estar entre 0.0 y 5.0.');
    error.statusCode = 400;
    throw error;
  }

  return notaRepository.crear({
    ...datos,
    valor,
  });
};

/**
 * Consulta las notas aplicando los filtros permitidos.
 *
 * Si el usuario autenticado es ESTUDIANTE, únicamente puede
 * consultar sus propias notas.
 *
 * @param {Object} usuario - Usuario autenticado.
 * @param {Object} filtros - Filtros de búsqueda.
 * @returns {Promise<Array>} Lista de notas.
 */
const consultarNotas = async (usuario, filtros = {}) => {
  let estudianteId = filtros.estudianteId;
  const periodo = filtros.periodo;

  // Auto-escopado para estudiantes.
  if (usuario.rol === 'ESTUDIANTE') {
    estudianteId = usuario.id;
  }

  return notaRepository.buscarPorEstudiante(
    estudianteId,
    periodo
  );
};

/**
 * Actualiza una nota existente.
 *
 * @param {number} id - ID de la nota.
 * @param {Object} datos - Datos que se van a actualizar.
 * @returns {Promise<Object>} Nota actualizada.
 */
const actualizarNota = async (id, datos) => {
  const notaExistente = await notaRepository.buscarPorId(id);

  if (!notaExistente) {
    const error = new Error('Nota no encontrada.');
    error.statusCode = 404;
    throw error;
  }

  // Si se intenta modificar el valor, también se valida.
  if (datos.valor !== undefined) {
    const valor = Number(datos.valor);

    if (!Number.isFinite(valor) || valor < 0 || valor > 5) {
      const error = new Error('La nota debe estar entre 0.0 y 5.0.');
      error.statusCode = 400;
      throw error;
    }

    datos = {
      ...datos,
      valor,
    };
  }

  return notaRepository.actualizar(id, datos);
};

export default {
  registrarNota,
  consultarNotas,
  actualizarNota,
};