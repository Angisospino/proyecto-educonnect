import { Router } from "express";

import notaController from "../controllers/nota.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";

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
 * Placeholder temporal:
 * Sprint 3 - 07 [02] reemplazará authorizeRoles
 * por PERMISOS.NOTAS.
 */
router.get(
    "/",
    authorizeRoles(
        "DOCENTE",
        "ESTUDIANTE",
        "PADRE_FAMILIA",
        "DIRECTIVO",
    ),
    notaController.obtenerNotas,
);

/**
 * PATCH /api/notas/:id
 *
 * Actualizar una nota.
 * Solo docentes.
 *
 * La validación de que el docente únicamente pueda
 * modificar sus propias notas debe realizarse en
 * la capa de servicio/autorización.
 */
router.patch(
    "/:id",
    authorizeRoles("DOCENTE"),
    notaController.actualizarNota,
);

export default router;