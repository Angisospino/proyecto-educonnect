import { Router } from "express";

import padreController from "../controllers/padre.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";

const router = Router();

/* ==========================================
   AUTENTICACIÓN
   ========================================== */

router.use(authenticate);

/* ==========================================
   RUTAS DE PADRES DE FAMILIA
   ========================================== */

/**
 * GET /api/padres/mis-hijos
 *
 * Listar los hijos vinculados al padre autenticado.
 * El id devuelto de cada hijo es EstudiantePerfil.id.
 *
 * Solo padres de familia.
 */
router.get(
    "/mis-hijos",
    authorizeRoles("PADRE_FAMILIA"),
    padreController.obtenerMisHijos,
);

export default router;
