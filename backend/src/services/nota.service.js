import notaRepository from '../repositories/nota.repository.js';
import estudiantePerfilRepository from '../repositories/estudiantePerfil.repository.js';
import padreEstudianteRepository from '../repositories/padreEstudiante.repository.js';
import { validarPaginacion } from "../utils/pagination.util.js";

const crearError = (mensaje, statusCode) => {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  return error;
};

const INT_MAX = 2147483647;

// Number(null), Number(''), Number([]) y Number(false) dan 0: sin esta
// guarda un valor vacío se guardaría como 0.0 en vez de rechazarse.
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

const validarValor = (valorRecibido) => {
  const valor = aNumero(valorRecibido);

  if (!Number.isFinite(valor) || valor < 0 || valor > 5) {
    throw crearError('La nota debe estar entre 0.0 y 5.0.', 400);
  }

  return valor;
};

/**
 * Registra una nueva nota.
 *
 * La calificación debe estar dentro del rango permitido: 0.0 - 5.0.
 * El docenteId siempre sale del usuario autenticado (token): cualquier
 * docenteId recibido en el body se ignora, y solo se guardan los campos
 * permitidos.
 *
 * @param {Object} datos - Datos de la nota.
 * @param {Object} usuario - Usuario autenticado (req.usuario).
 * @returns {Promise<Object>} Nota creada.
 */
const registrarNota = async (datos = {}, usuario) => {
  const valor = validarValor(datos.valor);
  const estudianteId = validarId(datos.estudianteId, 'estudianteId');
  const asignaturaId = validarId(datos.asignaturaId, 'asignaturaId');

  // periodo es VarChar(10): se guarda siempre como texto. Solo se acepta
  // texto o número; arreglos, booleanos y objetos se rechazan.
  const periodoValido =
    typeof datos.periodo === 'string' || typeof datos.periodo === 'number';
  const periodo = periodoValido ? String(datos.periodo).trim() : '';

  if (!periodo || periodo.length > 10) {
    throw crearError(
      'El período es obligatorio y debe tener máximo 10 caracteres.',
      400
    );
  }

  return notaRepository.crear({
    estudianteId,
    asignaturaId,
    docenteId: usuario.id,
    periodo,
    valor,
  });
};

/**
 * Consulta las notas aplicando los filtros permitidos.
 *
 * Si el usuario autenticado es ESTUDIANTE, únicamente puede
 * consultar sus propias notas. Si es PADRE_FAMILIA, estudianteId
 * (EstudiantePerfil.id) es obligatorio (400 si falta o no es válido) y debe
 * ser de un hijo vinculado a él (403 si no lo es). Para los demás roles,
 * estudianteId es opcional y debe ser un entero positivo (400 si no lo es);
 * periodo se usa como texto.
 *
 * @param {Object} usuario - Usuario autenticado.
 * @param {Object} filtros - Filtros de búsqueda.
 * @returns {Promise<Array>} Lista de notas.
 */
const consultarNotas = async (usuario, filtros = {}) => {
  let estudianteId;
  const periodo = filtros.periodo;

  // Auto-escopado para estudiantes.
  //
  // IMPORTANTE: usuario.id es el ID de la tabla Usuario, pero
  // Nota.estudianteId referencia EstudiantePerfil.id (tabla distinta).
  // Hay que resolver el perfil del estudiante a partir del usuario.
  if (usuario.rol === 'ESTUDIANTE') {
    const perfil = await estudiantePerfilRepository.buscarPorUsuarioId(usuario.id);

    if (!perfil) {
      // Usuario con rol ESTUDIANTE sin perfil asociado: no explota,
      // simplemente no tiene notas que consultar.
      return [];
    }

    estudianteId = perfil.id;
  }

  // Escopado para padres de familia.
  //
  // El estudianteId es OBLIGATORIO (EstudiantePerfil.id) y debe pertenecer
  // a un hijo vinculado al padre autenticado. Sin ese filtro Prisma
  // devolvería las notas de todos los estudiantes, así que no hay ningún
  // camino que llegue a la consulta sin estudianteId validado.
  if (usuario.rol === 'PADRE_FAMILIA') {
    if (filtros.estudianteId === undefined) {
      throw crearError(
        'estudianteId es obligatorio para consultar las notas de un hijo.',
        400
      );
    }

    estudianteId = validarId(filtros.estudianteId, 'estudianteId');

    const esPadre = await padreEstudianteRepository.esPadreDe(
      usuario.id,
      estudianteId
    );

    if (!esPadre) {
      throw crearError(
        'No tiene permisos para consultar las notas de este estudiante.',
        403
      );
    }
  }

  // Para el resto de roles (excepto ESTUDIANTE y PADRE_FAMILIA, ya
  // resueltos arriba) el estudianteId es un filtro opcional. Llega de
  // req.query (siempre texto) y Prisma exige un Int: se valida y convierte
  // aquí para devolver 400 en vez de un 500. Si no viene, se mantiene el
  // comportamiento actual (sin filtro por estudiante).
  if (
    usuario.rol !== 'ESTUDIANTE' &&
    usuario.rol !== 'PADRE_FAMILIA' &&
    filtros.estudianteId !== undefined
  ) {
    estudianteId = validarId(filtros.estudianteId, 'estudianteId');
  }

  // Un periodo repetido en la URL (?periodo=1&periodo=2) llega como arreglo.
  if (periodo !== undefined && typeof periodo !== 'string') {
    throw crearError('periodo no es válido.', 400);
  }

  return notaRepository.buscarPorEstudiante(
    estudianteId,
    periodo
  );
};

/**
 * Actualiza el valor de una nota existente.
 *
 * Un docente solo puede editar sus propias notas (403 si la nota es de
 * otro docente). Solo se permite cambiar el valor: estudiante, asignatura,
 * período y docente no se modifican.
 *
 * @param {number|string} id - ID de la nota.
 * @param {Object} datos - Datos que se van a actualizar.
 * @param {Object} usuario - Usuario autenticado (req.usuario).
 * @returns {Promise<Object>} Nota actualizada.
 */
const actualizarNota = async (id, datos = {}, usuario) => {
  const notaId = validarId(id, 'El id de la nota');

  const notaExistente = await notaRepository.buscarPorId(notaId);

  if (!notaExistente) {
    throw crearError('Nota no encontrada.', 404);
  }

  if (notaExistente.docenteId !== usuario.id) {
    throw crearError('Solo puede modificar las notas que usted registró.', 403);
  }

  if (datos.valor === undefined) {
    throw crearError('Solo se puede modificar el valor de la nota.', 400);
  }

  return notaRepository.actualizar(notaId, {
    valor: validarValor(datos.valor),
  });
};


const { page, pageSize, skip, take } =
  validarPaginacion({
    page: filtros.page,
    pageSize: filtros.pageSize,
  });

// IMPORTANTE:
// "where" debe ser el filtro autorizado
// construido previamente por el servicio.

const { notas, total } =
  await notaRepository.buscarPaginadas({
    where,
    skip,
    take,
  });

return {
  notas,
  total,
  page,
  pageSize,
};


export default {
  registrarNota,
  consultarNotas,
  actualizarNota,
};