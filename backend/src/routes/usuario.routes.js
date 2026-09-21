import { Router } from "express";

import {
	obtenerUsuarios,
	obtenerUsuarioPorId,
	crearUsuario,
	actualizarUsuario,
	cambiarEstadoUsuario,
	eliminarUsuario,
} from "../controllers/usuario.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

import {
	authorizeRoles,
	PERMISOS,
} from "../middlewares/rbac.middleware.js";

const router = Router();

/* ==========================================
   TODAS LAS RUTAS REQUIEREN AUTENTICACIÓN
   ========================================== */

router.use(authenticate);

/* ==========================================
   GET /api/usuarios
   ========================================== */

/**
 * Obtener todos los usuarios.
 *
 * Acceso:
 * - ADMINISTRADOR
 *
 * Ejemplo:
 * GET /api/usuarios
 */
router.get("/", authorizeRoles(...PERMISOS.USUARIOS), obtenerUsuarios);

/* ==========================================
   GET /api/usuarios/:id
   ========================================== */

/**
 * Obtener un usuario por su ID.
 *
 * Acceso:
 * - ADMINISTRADOR
 *
 * Ejemplo:
 * GET /api/usuarios/5
 */
router.get("/:id", authorizeRoles(...PERMISOS.USUARIOS), obtenerUsuarioPorId);

/* ==========================================
   POST /api/usuarios
   ========================================== */

/**
 * Crear un nuevo usuario.
 *
 * Acceso:
 * - ADMINISTRADOR
 *
 * Body:
 *
 * {
 *   "nombre": "Carlos",
 *   "apellido": "Martínez",
 *   "email": "carlos@educonnectbr.edu.co",
 *   "password": "EduConnect123*",
 *   "rol": "DOCENTE"
 * }
 */
router.post("/", authorizeRoles(...PERMISOS.USUARIOS), crearUsuario);

/* ==========================================
   PATCH /api/usuarios/:id/estado
   ========================================== */

/**
 * Activar o desactivar un usuario.
 *
 * Acceso:
 * - ADMINISTRADOR
 *
 * Body:
 *
 * {
 *   "estado": "INACTIVO"
 * }
 *
 * o:
 *
 * {
 *   "estado": "ACTIVO"
 * }
 */
router.patch(
	"/:id/estado",
	authorizeRoles(...PERMISOS.USUARIOS),
	cambiarEstadoUsuario,
);

/* ==========================================
   PATCH /api/usuarios/:id
   ========================================== */

/**
 * Actualizar información de un usuario.
 *
 * Acceso:
 * - ADMINISTRADOR
 *
 * Puede recibir uno o varios campos:
 *
 * {
 *   "nombre": "Carlos Alberto",
 *   "apellido": "Martínez",
 *   "email": "carlos@educonnectbr.edu.co",
 *   "rol": "DOCENTE"
 * }
 */
router.patch("/:id", authorizeRoles(...PERMISOS.USUARIOS), actualizarUsuario);

/* ==========================================
   DELETE /api/usuarios/:id
   ========================================== */

/**
 * Eliminar físicamente un usuario.
 *
 * Acceso:
 * - ADMINISTRADOR
 *
 * IMPORTANTE:
 * En EduConnect BR se recomienda utilizar
 * preferentemente la desactivación:
 *
 * PATCH /api/usuarios/:id/estado
 *
 * en lugar de DELETE.
 */
router.delete("/:id", authorizeRoles(...PERMISOS.USUARIOS), eliminarUsuario);

/* ==========================================
   EXPORTAR ROUTER
   ========================================== */

export default router;
