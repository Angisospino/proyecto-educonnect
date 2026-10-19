import { Router } from "express";

import catalogoController from "../controllers/catalogo.controller.js";
import { authenticate } from "../middlewares/auth.middleware.js";
import { authorizeRoles } from "../middlewares/rbac.middleware.js";

const router = Router();

/* ==========================================
   AUTENTICACIÓN
   ========================================== */

router.use(authenticate);

/* ==========================================
   RUTAS DE CATÁLOGOS
   ========================================== */

/**
 * GET /api/catalogos/cursos
 *
 * Listar los cursos.
 *
 * Placeholder temporal: se reemplazará authorizeRoles
 * por una entrada de la matriz PERMISOS.
 */
router.get(
    "/cursos",
    authorizeRoles("DOCENTE", "ADMINISTRADOR"),
    catalogoController.obtenerCursos,
);

/**
 * GET /api/catalogos/cursos/:id/estudiantes
 *
 * Listar los estudiantes de un curso.
 * El id devuelto de cada estudiante es EstudiantePerfil.id.
 */
router.get(
    "/cursos/:id/estudiantes",
    authorizeRoles("DOCENTE", "ADMINISTRADOR"),
    catalogoController.obtenerEstudiantesDeCurso,
);

/**
 * GET /api/catalogos/asignaturas
 *
 * Listar las asignaturas.
 */
router.get(
    "/asignaturas",
    authorizeRoles("DOCENTE", "ADMINISTRADOR"),
    catalogoController.obtenerAsignaturas,
);

export default router;
