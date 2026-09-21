import "dotenv/config";

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";
import perfilRoutes from "./routes/perfil.routes.js";
import notaRoutes from "./routes/nota.routes.js";

import { notFound, errorHandler } from "./middlewares/error.middleware.js";

/* ==========================================
   CREAR APLICACIÓN EXPRESS
   ========================================== */

const app = express();

/* ==========================================
   CONFIGURACIÓN GENERAL
   ========================================== */

app.disable("x-powered-by");

/* ==========================================
   CORS
   ========================================== */

/*
 * Durante desarrollo, el frontend de React + Vite
 * normalmente se ejecutará en:
 *
 * http://localhost:5173
 *
 * En producción se utilizará la URL desplegada
 * del frontend.
 */

const allowedOrigins = [process.env.FRONTEND_URL || "http://localhost:5173"];

const corsOptions = {
	origin(origin, callback) {
		/*
		 * Permitimos peticiones sin origin para herramientas
		 * como Postman o Thunder Client.
		 */
		if (!origin) {
			return callback(null, true);
		}

		if (allowedOrigins.includes(origin)) {
			return callback(null, true);
		}

		const error = new Error("Origen no permitido por la política CORS.");

		error.statusCode = 403;

		return callback(error);
	},

	methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

	allowedHeaders: ["Content-Type", "Authorization"],

	credentials: true,
};

app.use(cors(corsOptions));

/* ==========================================
   BODY PARSERS
   ========================================== */

/*
 * Permite recibir JSON:
 *
 * {
 *   "email": "...",
 *   "password": "..."
 * }
 */

app.use(
	express.json({
		limit: "1mb",
	}),
);

/*
 * Permite recibir formularios:
 *
 * application/x-www-form-urlencoded
 */

app.use(
	express.urlencoded({
		extended: true,
		limit: "1mb",
	}),
);

/* ==========================================
   RUTA PRINCIPAL
   ========================================== */

/*
 * Endpoint sencillo para comprobar
 * que la API está funcionando.
 */

app.get("/", (req, res) => {
	return res.status(200).json({
		success: true,
		message: "API EduConnect BR funcionando correctamente.",
	});
});

/* ==========================================
   HEALTH CHECK
   ========================================== */

/*
 * Será útil posteriormente para Render
 * y para verificar el estado del backend.
 */

app.get("/api/health", (req, res) => {
	return res.status(200).json({
		success: true,
		message: "Servidor funcionando correctamente.",
		timestamp: new Date().toISOString(),
	});
});

/* ==========================================
   RUTAS DE LA API
   ========================================== */

/*
 * Autenticación:
 *
 * POST /api/auth/login
 * POST /api/auth/logout
 * GET  /api/auth/me
 */

app.use("/api/auth", authRoutes);
app.use("/api/usuarios", usuarioRoutes);
app.use("/api/perfil", perfilRoutes);
app.use("/api/notas", notaRoutes);

/*
 * Posteriormente agregaremos:
 *
 * app.use("/api/cursos", cursoRoutes);
 * app.use("/api/asignaturas", asignaturaRoutes);
 * app.use("/api/notas", notaRoutes);
 * app.use("/api/asistencias", asistenciaRoutes);
 * app.use("/api/comunicados", comunicadoRoutes);
 * app.use("/api/notificaciones", notificacionRoutes);
 */

/* ==========================================
   RUTAS NO ENCONTRADAS
   ========================================== */

/*
 * IMPORTANTE:
 *
 * Debe estar después de todas las rutas.
 */

app.use(notFound);

/* ==========================================
   MANEJO GLOBAL DE ERRORES
   ========================================== */

/*
 * IMPORTANTE:
 *
 * Debe ser el último middleware.
 */

app.use(errorHandler);

/* ==========================================
   EXPORTAR APP
   ========================================== */

export default app;
