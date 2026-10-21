
import asistenciaService from "../services/asistencia.service.js";

/* ==========================================
   REGISTRAR ASISTENCIA
   POST /api/asistencia
   ========================================== */

/**
 * Registra la asistencia de un estudiante.
 *
 * @route POST /api/asistencia
 * @access DOCENTE
 */
export const registrarAsistencia = async (req, res, next) => {
  try {
    const asistencia = await asistenciaService.registrarAsistencia(
      req.body,
      req.usuario
    );

    return res.status(201).json({
      success: true,
      message: "Asistencia registrada correctamente.",
      data: asistencia,
    });
  } catch (error) {
    next(error);
  }
};

/* ==========================================
   OBTENER ASISTENCIA
   GET /api/asistencia
   ========================================== */

/**
 * Consulta los registros de asistencia
 * aplicando las restricciones por rol.
 *
 * @route GET /api/asistencia
 * @access Usuarios autenticados
 */
export const obtenerAsistencia = async (req, res, next) => {
  try {
    const { asistencias, paginacion } =
      await asistenciaService.consultarAsistencia(
        req.usuario,
        req.query
      );

    // Sin paginación la respuesta es la de siempre. Si se paginó, total es
    // el total de registros visibles (no el largo de la página) y se
    // agregan page y pageSize dentro de data.
    return res.status(200).json({
      success: true,
      message: "Asistencias obtenidas correctamente.",
      data: {
        asistencias,
        total: paginacion ? paginacion.total : asistencias.length,
        ...(paginacion && {
          page: paginacion.page,
          pageSize: paginacion.pageSize,
        }),
      },
    });
  } catch (error) {
    next(error);
  }
};
