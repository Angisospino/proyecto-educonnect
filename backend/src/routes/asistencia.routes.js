
import { Router } from "express";

import {
  registrarAsistencia,
  obtenerAsistencia,
} from "../controllers/asistencia.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

import {
  authorizeRoles,
  PERMISOS,
} from "../middlewares/rbac.middleware.js";

const router = Router();

/* ==========================================
   AUTENTICACIÓN
   ========================================== */

// Todas las rutas requieren un JWT válido.
router.use(authenticate);

/* ==========================================
   RUTAS DE ASISTENCIA
   ========================================== */

/**
 * POST /api/asistencia
 *
 * Registrar asistencia de un estudiante.
 *
 * Solo docentes.
 */
router.post(
  "/",
  authorizeRoles("DOCENTE"),
  registrarAsistencia,
);

/**
 * GET /api/asistencia
 *
 * Consultar registros de asistencia.
 *
 * Permisos definidos en:
 * PERMISOS.ASISTENCIA.LEER
 *
 * ADMINISTRADOR: lectura
 * DOCENTE: lectura de registros autorizados
 * ESTUDIANTE: lectura de asistencia propia
 * PADRE_FAMILIA: lectura de hijos vinculados
 * DIRECTIVO: lectura
 *
 * Las restricciones sobre qué registros puede
 * consultar cada usuario se aplican en el servicio.
 */
router.get(
  "/",
  authorizeRoles(...PERMISOS.ASISTENCIA.LEER),
  obtenerAsistencia,
);

/* ==========================================
   EXPORTACIÓN
   ========================================== */

export default router;
