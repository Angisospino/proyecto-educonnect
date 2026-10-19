
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

const resultado =
  await asistenciaService.consultarAsistencia({
    // Conservar filtros y usuario autenticado.
    ...filtrosAutorizados,
    page: req.query.page,
    pageSize: req.query.pageSize,
  });

return res.status(200).json({
  success: true,
  data: {
    asistencias: resultado.asistencias,
    total: resultado.total,
  },
  page: resultado.page,
  pageSize: resultado.pageSize,
});

