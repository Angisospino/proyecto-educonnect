/**
 * Middleware para rutas no encontradas.
 *
 * Debe colocarse después de todas las rutas
 * registradas en app.js.
 */
export const notFound = (req, res, next) => {
	const error = new Error(
		`Ruta no encontrada: ${req.method} ${req.originalUrl}`,
	);

	error.statusCode = 404;

	next(error);
};

/**
 * Middleware global para el manejo de errores.
 *
 * Recibe los errores enviados mediante:
 *
 * next(error)
 *
 * y genera una respuesta JSON uniforme.
 */
export const errorHandler = (error, req, res, next) => {
	console.error("❌ Error:", error);

	let statusCode = error.statusCode || 500;
	let message = error.message || "Ha ocurrido un error interno en el servidor.";

	/* =========================
     ERRORES DE PRISMA
     ========================= */

	// Registro duplicado.
	if (error.code === "P2002") {
		statusCode = 409;

		const campos = error.meta?.target;

		message = Array.isArray(campos)
			? `Ya existe un registro con el valor proporcionado en: ${campos.join(
					", ",
				)}.`
			: "Ya existe un registro con los datos proporcionados.";
	}

	// Registro no encontrado.
	if (error.code === "P2025") {
		statusCode = 404;
		message = "El registro solicitado no fue encontrado.";
	}

	// Violación de clave foránea.
	if (error.code === "P2003") {
		statusCode = 409;
		message =
			"No se puede realizar la operación debido a registros relacionados.";
	}

	/* =========================
     ERRORES DE JWT
     ========================= */

	if (error.name === "JsonWebTokenError") {
		statusCode = 401;
		message = "El token de autenticación no es válido.";
	}

	if (error.name === "TokenExpiredError") {
		statusCode = 401;
		message = "La sesión ha expirado. Inicie sesión nuevamente.";
	}

	if (error.name === "NotBeforeError") {
		statusCode = 401;
		message = "El token de autenticación todavía no es válido.";
	}

	/* =========================
     ERROR JSON MAL FORMADO
     ========================= */

	if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
		statusCode = 400;
		message = "El cuerpo de la solicitud contiene un JSON no válido.";
	}

	/* =========================
     RESPUESTA
     ========================= */

	const response = {
		success: false,
		message,
	};

	/*
	 * Durante desarrollo podemos incluir información
	 * adicional para facilitar la depuración.
	 *
	 * En producción no debemos exponer stack traces.
	 */
	if (process.env.NODE_ENV === "development") {
		response.error = {
			name: error.name,
			code: error.code || null,
			stack: error.stack,
		};
	}

	return res.status(statusCode).json(response);
};

/**
 * Exportación por defecto.
 */
const errorMiddleware = {
	notFound,
	errorHandler,
};

export default errorMiddleware;
