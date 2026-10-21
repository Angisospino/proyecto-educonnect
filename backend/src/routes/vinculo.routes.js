import { Router } from "express";

import vinculoController from "../controllers/vinculo.controller.js";
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
   RUTAS DE VÍNCULOS PADRE-ESTUDIANTE
   ========================================== */

/**
 * GET /api/vinculos
 *
 * Listar los vínculos padre-estudiante.
 * Filtros opcionales: ?padreId=<Usuario.id>&estudianteId=<EstudiantePerfil.id>
 *
 * Solo administrador.
 */
router.get(
    "/",
    authorizeRoles(...PERMISOS.USUARIOS),
    vinculoController.listarVinculos,
);

/**
 * POST /api/vinculos
 *
 * Vincular un padre de familia con un estudiante.
 *
 * Body: { "padreId": 6, "estudianteId": 1 }
 *
 * Solo administrador.
 */
router.post(
    "/",
    authorizeRoles(...PERMISOS.USUARIOS),
    vinculoController.crearVinculo,
);

/**
 * DELETE /api/vinculos/:id
 *
 * Eliminar un vínculo (para corregir errores de asignación).
 *
 * Solo administrador.
 */
router.delete(
    "/:id",
    authorizeRoles(...PERMISOS.USUARIOS),
    vinculoController.eliminarVinculo,
);

export default router;
