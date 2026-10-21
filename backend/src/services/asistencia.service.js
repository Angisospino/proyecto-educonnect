
import asistenciaRepository from "../repositories/asistencia.repository.js";
import estudiantePerfilRepository from "../repositories/estudiantePerfil.repository.js";
import padreEstudianteRepository from "../repositories/padreEstudiante.repository.js";
import {
  hayPaginacion,
  validarPaginacion,
} from "../utils/pagination.util.js";

/* ==========================================
   CONSTANTES
   ========================================== */

const ESTADOS_ASISTENCIA = [
  "PRESENTE",
  "AUSENTE",
  "TARDANZA",
];

// Máximo valor de un INT de MySQL (los ids de las tablas).
const INT_MAX = 2147483647;

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
   PAGINACIÓN OPCIONAL
   ========================================== */

/**
 * Ejecuta la consulta completa o la paginada según la petición.
 *
 * Se invoca siempre DESPUÉS de resolver el alcance por rol, así los
 * errores de permisos (400/403) tienen prioridad sobre los de paginación
 * y el total solo cuenta lo que el usuario puede ver.
 *
 * @param {Object} filtros - Filtros de la petición (page y pageSize).
 * @param {Function} consultaCompleta - () => Promise<Array>
 * @param {Function} consultaPaginada - ({ skip, take }) => Promise<{ asistencias, total }>
 * @returns {Promise<{ asistencias: Array, paginacion: ({ total: number, page: number, pageSize: number }|null) }>}
 */
const resolverConsulta = async (
  filtros,
  consultaCompleta,
  consultaPaginada
) => {
  if (!hayPaginacion(filtros)) {
    const asistencias = await consultaCompleta();

    return { asistencias, paginacion: null };
  }

  const { page, pageSize, skip, take } = validarPaginacion(filtros);
  const { asistencias, total } = await consultaPaginada({ skip, take });

  return { asistencias, paginacion: { total, page, pageSize } };
};

/* ==========================================
   REGISTRAR ASISTENCIA
   ========================================== */

/**
 * Registra la asistencia de un estudiante.
 *
 * El docenteId siempre sale del usuario autenticado (token);
 * cualquier docenteId recibido en el body se ignora.
 *
 * @param {Object} datos
 * @param {Object} usuario - Usuario autenticado (req.usuario)
 * @returns {Promise<Object>}
 */
const registrarAsistencia = async (datos = {}, usuario) => {
  if (!usuario?.id) {
    throw crearError(
      "Usuario no autenticado.",
      401
    );
  }

  const docenteId = validarId(
    usuario.id,
    "usuario.id"
  );

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
    docenteId,
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
 * - ESTUDIANTE: solo su propia asistencia (se ignora estudianteId).
 * - PADRE_FAMILIA: estudianteId obligatorio (400) y debe ser de un hijo
 *   vinculado (403); admite inicio/fin y nunca cursoId + fecha.
 * - ADMINISTRADOR / DOCENTE / DIRECTIVO: por estudianteId o por
 *   cursoId + fecha.
 *
 * La paginación es opcional: solo se aplica si llega page y/o pageSize.
 * Sin esos parámetros se devuelven todos los registros.
 *
 * @param {Object} usuario
 * @param {Object} filtros
 * @returns {Promise<{ asistencias: Array, paginacion: ({ total: number, page: number, pageSize: number }|null) }>}
 *   paginacion es null cuando la consulta no se paginó.
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
     * Asistencia.estudianteId referencia EstudiantePerfil.id
     * (no Usuario.id), así que primero se resuelve el perfil
     * del usuario autenticado.
     */

    const usuarioId = validarId(
      usuario.id,
      "usuario.id"
    );

    const perfil =
      await estudiantePerfilRepository.buscarPorUsuarioId(
        usuarioId
      );

    if (!perfil) {
      /* Sin perfil de estudiante: mismo resultado que una consulta vacía. */
      return resolverConsulta(
        filtros,
        async () => [],
        async () => ({ asistencias: [], total: 0 })
      );
    }

    return resolverConsulta(
      filtros,
      () =>
        asistenciaRepository.buscarPorEstudiante(
          perfil.id,
          rangoFechas
        ),
      (paginacion) =>
        asistenciaRepository.buscarPaginadasPorEstudiante(
          perfil.id,
          rangoFechas,
          paginacion
        )
    );
  }

  /* ========================================
     PADRE DE FAMILIA
     ======================================== */

  if (usuario.rol === "PADRE_FAMILIA") {
    /*
     * Solo puede consultar la asistencia de un hijo vinculado.
     *
     * estudianteId (EstudiantePerfil.id) es obligatorio. Los filtros
     * cursoId y fecha se ignoran para este rol: un padre nunca puede
     * listar un curso completo. Cualquier consulta sin estudianteId
     * vinculado termina en 400 o 403 antes de llegar al repositorio.
     */

    if (
      filtros.estudianteId === undefined ||
      filtros.estudianteId === ""
    ) {
      throw crearError(
        "El campo estudianteId es obligatorio para consultar " +
        "la asistencia de un hijo."
      );
    }

    const estudianteId = validarId(
      filtros.estudianteId,
      "estudianteId"
    );

    // Un id fuera del rango de INT de MySQL haría fallar la consulta (500).
    if (estudianteId > INT_MAX) {
      throw crearError(
        "El campo estudianteId debe ser un identificador válido."
      );
    }

    const esPadre = await padreEstudianteRepository.esPadreDe(
      usuario.id,
      estudianteId
    );

    if (!esPadre) {
      throw crearError(
        "No tiene permisos para consultar la asistencia de este estudiante.",
        403
      );
    }

    return resolverConsulta(
      filtros,
      () =>
        asistenciaRepository.buscarPorEstudiante(
          estudianteId,
          rangoFechas
        ),
      (paginacion) =>
        asistenciaRepository.buscarPaginadasPorEstudiante(
          estudianteId,
          rangoFechas,
          paginacion
        )
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

    return resolverConsulta(
      filtros,
      () =>
        asistenciaRepository.buscarPorEstudiante(
          estudianteId,
          rangoFechas
        ),
      (paginacion) =>
        asistenciaRepository.buscarPaginadasPorEstudiante(
          estudianteId,
          rangoFechas,
          paginacion
        )
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

    return resolverConsulta(
      filtros,
      () => asistenciaRepository.buscarPorCurso(cursoId, fecha),
      (paginacion) =>
        asistenciaRepository.buscarPaginadasPorCurso(
          cursoId,
          fecha,
          paginacion
        )
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
