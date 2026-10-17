
import { Router } from "express";

import {
  authenticate,
  authorizeRoles,
} from "../middlewares/auth.middleware.js";

import {
  registrarAsistencia,
  obtenerAsistencia,
} from "../controllers/asistencia.controller.js";

/* ==========================================
   CONFIGURACIÓN DEL ROUTER
   ========================================== */

const router = Router();

/* ==========================================
   AUTENTICACIÓN GLOBAL
   ========================================== */

// Todas las rutas requieren un JWT válido.
router.use(authenticate);

/* ==========================================
   REGISTRAR ASISTENCIA
   POST /api/asistencia
   ========================================== */

// Solo docentes y administradores pueden
// registrar asistencias.
//
// La validación de asignación del docente
// al curso se implementará en el servicio.

router.post(
  "/",
  authorizeRoles("ADMINISTRADOR", "DOCENTE"),
  registrarAsistencia
);

/* ==========================================
   CONSULTAR ASISTENCIA
   GET /api/asistencia
   ========================================== */

// PLACEHOLDER — Sprint 3 - 07 [03]
//
// Posteriormente se reemplazará por
// PERMISOS.ASISTENCIA.
//
// Por ahora se permite consultar a:
// DOCENTE, ESTUDIANTE, PADRE_FAMILIA,
// DIRECTIVO.
//
// El servicio restringe los registros
// que cada usuario puede consultar.

router.get(
  "/",
  authorizeRoles(
    "DOCENTE",
    "ESTUDIANTE",
    "PADRE_FAMILIA",
    "DIRECTIVO"
  ),
  obtenerAsistencia
);

/* ==========================================
   EXPORTACIÓN
   ========================================== */

export default router;
