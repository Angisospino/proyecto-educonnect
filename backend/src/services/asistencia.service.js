
import prisma from "../config/prisma.js";

import asistenciaRepository from "../repositories/asistencia.repository.js";

/* ==========================================
   CONSTANTES
   ========================================== */

const ESTADOS_ASISTENCIA = [
  "PRESENTE",
  "AUSENTE",
  "TARDANZA",
];

/* ==========================================
   MANEJO DE ERRORES
   ========================================== */

const crearError = (mensaje, statusCode = 400) => {
  const error = new Error(mensaje);
  error.statusCode = statusCode;
  return error;
};

/* ==========================================
   VALIDACIONES
   ========================================== */

const validarId = (valor, campo) => {
  const id = Number(valor);

  if (!Number.isInteger(id) || id <= 0) {
    throw crearError(
      `El campo ${campo} debe ser un identificador válido.`
    );
  }

  return id;
};

const validarFecha = (valor, campo = "fecha") => {
  if (typeof valor !== "string") {
    throw crearError(
      `El campo ${campo} debe tener formato YYYY-MM-DD.`
    );
  }

  const formato = /^\d{4}-\d{2}-\d{2}$/;

  if (!formato.test(valor)) {
    throw crearError(
      `El campo ${campo} debe tener formato YYYY-MM-DD.`
    );
  }

  const fecha = new Date(`${valor}T00:00:00.000Z`);

  if (
    Number.isNaN(fecha.getTime()) ||
    fecha.toISOString().slice(0, 10) !== valor
  ) {
    throw crearError(`El campo ${campo} no es una fecha válida.`);
  }

  return valor;
};

const validarRangoFechas = (filtros = {}) => {
  const inicio = filtros.inicio
    ? validarFecha(filtros.inicio, "inicio")
    : undefined;

  const fin = filtros.fin
    ? validarFecha(filtros.fin, "fin")
    : undefined;

  if (inicio && fin && inicio > fin) {
    throw crearError(
      "La fecha inicial no puede ser posterior a la fecha final."
    );
  }

  return { inicio, fin };
};

/* ==========================================
   REGISTRAR ASISTENCIA
   ========================================== */

/**
 * Registra la asistencia de un estudiante.
 *
 * @param {Object} datos
 * @returns {Promise<Object>}
 */
const registrarAsistencia = async (datos = {}) => {
  const estudianteId = validarId(
    datos.estudianteId,
    "estudianteId"
  );

  const cursoId = validarId(
    datos.cursoId,
    "cursoId"
  );

  const fecha = validarFecha(datos.fecha);

  const estado = datos.estado;

  if (!ESTADOS_ASISTENCIA.includes(estado)) {
    throw crearError(
      "Estado de asistencia inválido. " +
      "Los valores permitidos son PRESENTE, AUSENTE o TARDANZA."
    );
  }

  return asistenciaRepository.registrar({
    estudianteId,
    cursoId,
    fecha,
    estado,
  });
};

/* ==========================================
   CONSULTAR ASISTENCIA
   ========================================== */

/**
 * Consulta registros de asistencia respetando
 * los permisos del usuario autenticado.
 *
 * @param {Object} usuario
 * @param {Object} filtros
 * @returns {Promise<Array>}
 */
const consultarAsistencia = async (
  usuario,
  filtros = {}
) => {
  if (!usuario?.id || !usuario?.rol) {
    throw crearError(
      "Usuario no autenticado.",
      401
    );
  }

  const rangoFechas = validarRangoFechas(filtros);

  /* ========================================
     ESTUDIANTE
     ======================================== */

  if (usuario.rol === "ESTUDIANTE") {
    /*
     * Se ignora cualquier estudianteId
     * recibido desde el frontend.
     *
     * La consulta queda limitada al
     * usuario autenticado.
     */

    const estudianteId = validarId(
      usuario.id,
      "usuario.id"
    );

    return asistenciaRepository.buscarPorEstudiante(
      estudianteId,
      rangoFechas
    );
  }

  /* ========================================
     PADRE DE FAMILIA
     ======================================== */

  if (usuario.rol === "PADRE_FAMILIA") {
    const padreId = validarId(
      usuario.id,
      "usuario.id"
    );

    /*
     * Se consultan los estudiantes vinculados
     * al padre de familia.
     *
     * Se supone que existe el modelo
     * PadreEstudiante con los campos:
     *
     * padreId
     * estudianteId
     */

    const vinculaciones =
      await prisma.padreEstudiante.findMany({
        where: {
          padreId,
        },
        select: {
          estudianteId: true,
        },
      });

    const hijosIds = vinculaciones.map(
      (vinculacion) => vinculacion.estudianteId
    );

    if (hijosIds.length === 0) {
      return [];
    }

    /*
     * Para el padre es obligatorio indicar
     * qué estudiante vinculado desea consultar.
     */

    if (
      filtros.estudianteId === undefined ||
      filtros.estudianteId === null ||
      filtros.estudianteId === ""
    ) {
      throw crearError(
        "Debe seleccionar un estudiante vinculado para consultar su asistencia."
      );
    }

    const estudianteId = validarId(
      filtros.estudianteId,
      "estudianteId"
    );

    if (!hijosIds.includes(estudianteId)) {
      throw crearError(
        "No tiene autorización para consultar la asistencia de este estudiante.",
        403
      );
    }

    return asistenciaRepository.buscarPorEstudiante(
      estudianteId,
      rangoFechas
    );
  }

  /* ========================================
     ADMINISTRADOR / DOCENTE / DIRECTIVO
     ======================================== */

  const rolesPermitidos = [
    "ADMINISTRADOR",
    "DOCENTE",
    "DIRECTIVO",
  ];

  if (!rolesPermitidos.includes(usuario.rol)) {
    throw crearError(
      "No tiene permisos para consultar asistencias.",
      403
    );
  }

  /*
   * Consulta individual de un estudiante.
   */

  if (filtros.estudianteId) {
    const estudianteId = validarId(
      filtros.estudianteId,
      "estudianteId"
    );

    return asistenciaRepository.buscarPorEstudiante(
      estudianteId,
      rangoFechas
    );
  }

  /*
   * Consulta por curso y fecha.
   */

  if (filtros.cursoId && filtros.fecha) {
    const cursoId = validarId(
      filtros.cursoId,
      "cursoId"
    );

    const fecha = validarFecha(filtros.fecha);

    return asistenciaRepository.buscarPorCurso(
      cursoId,
      fecha
    );
  }

  throw crearError(
    "Debe proporcionar estudianteId o cursoId y fecha para consultar la asistencia."
  );
};

/* ==========================================
   EXPORTAR SERVICIO
   ========================================== */

const asistenciaService = {
  registrarAsistencia,
  consultarAsistencia,
};

export default asistenciaService;
