
import { Router } from "express";

import notaController from "../controllers/nota.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

import {
  authorizeRoles,
  PERMISOS,
} from "../middlewares/rbac.middleware.js";

const router = Router();

/* ==========================================
   AUTENTICACIÓN
   ========================================== */

router.use(authenticate);

/* ==========================================
   RUTAS DE NOTAS
   ========================================== */

/**
 * POST /api/notas
 *
 * Registrar una nueva nota.
 *
 * Solo docentes.
 */
router.post(
  "/",
  authorizeRoles("DOCENTE"),
  notaController.crearNota,
);

/**
 * GET /api/notas
 *
 * Consultar notas.
 *
 * Permisos definidos en:
 * PERMISOS.NOTAS.LEER
 *
 * ADMINISTRADOR: lectura
 * DOCENTE: lectura de notas autorizadas
 * ESTUDIANTE: lectura de notas propias
 * PADRE_FAMILIA: lectura de hijos vinculados
 * DIRECTIVO: lectura
 */
router.get(
  "/",
  authorizeRoles(...PERMISOS.NOTAS.LEER),
  notaController.obtenerNotas,
);

/**
 * PATCH /api/notas/:id
 *
 * Actualizar una nota.
 *
 * Solo docentes.
 *
 * El servicio debe verificar que el docente
 * esté autorizado a modificar la nota.
 */
router.patch(
  "/:id",
  authorizeRoles("DOCENTE"),
  notaController.actualizarNota,
);

export default router;
