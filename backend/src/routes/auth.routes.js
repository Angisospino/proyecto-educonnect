import { Router } from "express";

import { login, logout, me } from "../controllers/auth.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

const router = Router();

/**
 * ==========================================
 * POST /api/auth/login
 * ==========================================
 *
 * Iniciar sesión.
 *
 * Ruta pública.
 *
 * Body:
 * {
 *   "email": "admin@educonnectbr.edu.co",
 *   "password": "EduConnect123*"
 * }
 */
router.post("/login", login);

/**
 * ==========================================
 * POST /api/auth/logout
 * ==========================================
 *
 * Cerrar sesión.
 *
 * Ruta protegida.
 *
 * Requiere:
 *
 * Authorization: Bearer <token>
 */
router.post("/logout", authenticate, logout);

/**
 * ==========================================
 * GET /api/auth/me
 * ==========================================
 *
 * Obtener información del usuario
 * actualmente autenticado.
 *
 * Ruta protegida.
 *
 * Requiere:
 *
 * Authorization: Bearer <token>
 */
router.get("/me", authenticate, me);

export default router;
