import padreEstudianteRepository from '../repositories/padreEstudiante.repository.js';
import estudiantePerfilRepository from '../repositories/estudiantePerfil.repository.js';
import usuarioRepository from '../repositories/usuario.repository.js';

const crearError = (mensaje, statusCode) => {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  return error;
};

const INT_MAX = 2147483647;

// Number(null), Number(''), Number([]) y Number(false) dan 0: sin esta
// guarda un valor vacío pasaría la validación en vez de rechazarse.
const aNumero = (valor) => {
  const esNumero = typeof valor === 'number';
  const esTextoNumerico =
    typeof valor === 'string' && valor.trim() !== '';

  return esNumero || esTextoNumerico ? Number(valor) : NaN;
};

const validarId = (valor, nombre) => {
  const id = aNumero(valor);

  if (!Number.isInteger(id) || id <= 0 || id > INT_MAX) {
    throw crearError(`${nombre} no es válido.`, 400);
  }

  return id;
};

/**
 * Lista los vínculos padre-estudiante.
 *
 * Los filtros padreId (Usuario.id) y estudianteId (EstudiantePerfil.id) son
 * opcionales, pero si vienen deben ser enteros positivos (400 si no lo son).
 * Un filtro repetido en la URL (?padreId=1&padreId=2) llega como arreglo y
 * también se rechaza.
 *
 * @param {Object} filtros - Filtros de búsqueda (req.query).
 * @returns {Promise<Array>} Vínculos encontrados.
 */
const listarVinculos = async (filtros = {}) => {
  const where = {};

  if (filtros.padreId !== undefined) {
    where.padreId = validarId(filtros.padreId, 'padreId');
  }

  if (filtros.estudianteId !== undefined) {
    where.estudianteId = validarId(filtros.estudianteId, 'estudianteId');
  }

  return padreEstudianteRepository.listar(where);
};

/**
 * Crea un vínculo entre un padre de familia y un estudiante.
 *
 * Validaciones, en este orden:
 * - ids inválidos: 400.
 * - el usuario no existe: 404; no tiene rol PADRE_FAMILIA o está inactivo: 400.
 * - el perfil de estudiante no existe: 404.
 * - el vínculo ya existe: 409.
 *
 * @param {Object} datos - { padreId, estudianteId }.
 * @returns {Promise<Object>} Vínculo creado.
 */
const crearVinculo = async (datos = {}) => {
  const padreId = validarId(datos.padreId, 'padreId');
  const estudianteId = validarId(datos.estudianteId, 'estudianteId');

  // findById devuelve la fila completa del usuario (incluye passwordHash):
  // aquí solo se leen rol y estado y nunca se devuelve al cliente.
  const padre = await usuarioRepository.findById(padreId);

  if (!padre) {
    throw crearError('El usuario indicado no existe.', 404);
  }

  if (padre.rol !== 'PADRE_FAMILIA') {
    throw crearError('El usuario indicado no es un padre de familia.', 400);
  }

  if (padre.estado !== 'ACTIVO') {
    throw crearError('El padre de familia indicado está inactivo.', 400);
  }

  const estudiante = await estudiantePerfilRepository.buscarPorId(estudianteId);

  if (!estudiante) {
    throw crearError('El estudiante indicado no existe.', 404);
  }

  const existente = await padreEstudianteRepository.buscarPorPar(
    padreId,
    estudianteId
  );

  if (existente) {
    throw crearError('El vínculo ya existe.', 409);
  }

  return padreEstudianteRepository.crear(padreId, estudianteId);
};

/**
 * Elimina un vínculo padre-estudiante.
 *
 * @param {number|string} id - ID del vínculo (PadreEstudiante.id).
 * @returns {Promise<Object>} { id } del vínculo eliminado.
 */
const eliminarVinculo = async (id) => {
  const vinculoId = validarId(id, 'El id del vínculo');

  const vinculo = await padreEstudianteRepository.buscarPorId(vinculoId);

  if (!vinculo) {
    throw crearError('Vínculo no encontrado.', 404);
  }

  await padreEstudianteRepository.eliminar(vinculoId);

  return { id: vinculoId };
};

export default {
  listarVinculos,
  crearVinculo,
  eliminarVinculo,
};
