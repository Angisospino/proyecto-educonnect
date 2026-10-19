
/* ==========================================
   SERVICIO DE ASISTENCIA
   Proyecto: EduConnect BR
   Sprint 3 - Gestión de asistencia
   ========================================== */

import api from "../api/api.js";

/* ==========================================
   ENDPOINT BASE
   ========================================== */

const ENDPOINT = "/asistencia";

/* ==========================================
   REGISTRAR ASISTENCIA
   POST /api/asistencia
   ========================================== */

/**
 * Registra la asistencia de un estudiante.
 *
 * @param {Object} datos - Información de asistencia.
 * @param {number} datos.estudianteId
 * @param {number} datos.cursoId
 * @param {string} datos.fecha - Formato YYYY-MM-DD.
 * @param {"PRESENTE"|"AUSENTE"|"TARDANZA"} datos.estado
 *
 * @returns {Promise<Object>} Respuesta del backend.
 */
const registrarAsistencia = async (datos) => {
  const response = await api.post(ENDPOINT, datos);

  return response.data;
};

/* ==========================================
   OBTENER ASISTENCIA
   GET /api/asistencia
   ========================================== */

/**
 * Consulta los registros de asistencia.
 *
 * @param {Object} filtros - Parámetros opcionales.
 *
 * Filtros disponibles según el backend:
 * - estudianteId
 * - cursoId
 * - fecha
 * - inicio
 * - fin
 *
 * @returns {Promise<Object>} Respuesta del backend.
 */
const obtenerAsistencia = async (filtros = {}) => {
  const response = await api.get(ENDPOINT, {
    params: filtros,
  });

  return response.data;
};

/* ==========================================
   EXPORTACIÓN
   ========================================== */

const asistenciaService = {
  registrarAsistencia,
  obtenerAsistencia,
};

export default asistenciaService;
