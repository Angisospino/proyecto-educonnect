import { Router } from "express";

import {
	obtenerPerfil,
	actualizarPerfil,
	cambiarPassword,
} from "../controllers/perfil.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

/* ==========================================
   TODAS LAS RUTAS DE PERFIL REQUIEREN LOGIN
   Acceso: PERMISOS.PERFIL (todos los roles) —
   ver rbac.middleware.js. No requiere
   authorizeRoles adicional: cualquier usuario
   autenticado accede a su propio perfil.
   ========================================== */

router.use(authenticate);

/* ==========================================
   OBTENER PERFIL DEL USUARIO AUTENTICADO
   GET /api/perfil
   ========================================== */

router.get("/", obtenerPerfil);

/* ==========================================
   ACTUALIZAR PERFIL DEL USUARIO AUTENTICADO
   PATCH /api/perfil
   ========================================== */

router.patch("/", actualizarPerfil);

/* ==========================================
   CAMBIAR CONTRASEÑA
   PATCH /api/perfil/password
   ========================================== */

router.patch("/password", cambiarPassword);

export default router;
