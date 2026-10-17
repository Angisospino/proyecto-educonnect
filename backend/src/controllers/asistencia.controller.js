
import asistenciaService from "../services/asistencia.service.js";

/* ==========================================
   REGISTRAR ASISTENCIA
   POST /api/asistencias
   ========================================== */

/**
 * Registra la asistencia de un estudiante.
 *
 * @route POST /api/asistencias
 * @access Usuarios autorizados
 */
export const registrarAsistencia = async (req, res, next) => {
  try {
    const asistencia = await asistenciaService.registrarAsistencia(
      req.body
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
   GET /api/asistencias
   ========================================== */

/**
 * Consulta los registros de asistencia
 * aplicando las restricciones por rol.
 *
 * @route GET /api/asistencias
 * @access Usuarios autenticados
 */
export const obtenerAsistencia = async (req, res, next) => {
  try {
    const asistencias = await asistenciaService.consultarAsistencia(
      req.usuario,
      req.query
    );

    return res.status(200).json({
      success: true,
      message: "Asistencias obtenidas correctamente.",
      data: {
        asistencias,
        total: asistencias.length,
      },
    });
  } catch (error) {
    next(error);
  }
};
