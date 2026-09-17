import { verifyToken } from "../utils/jwt.util.js";
import usuarioRepository from "../repositories/usuario.repository.js";

/**
 * Middleware de autenticación.
 *
 * Verifica que:
 * 1. Exista el encabezado Authorization.
 * 2. Utilice el formato Bearer <token>.
 * 3. El JWT sea válido.
 * 4. El usuario exista en la base de datos.
 * 5. El usuario se encuentre ACTIVO.
 *
 * Si todo es correcto, agrega los datos
 * del usuario autenticado a req.usuario.
 */
export const authenticate = async (req, res, next) => {
	try {
		/* =========================
       OBTENER AUTHORIZATION
       ========================= */

		const authHeader = req.headers.authorization;

		if (!authHeader) {
			const error = new Error("No se proporcionó un token de autenticación.");

			error.statusCode = 401;
			return next(error);
		}

		/* =========================
       VALIDAR FORMATO BEARER
       ========================= */

		const [scheme, token] = authHeader.split(" ");

		if (scheme?.toLowerCase() !== "bearer" || !token) {
			const error = new Error(
				"El formato del token de autenticación no es válido.",
			);

			error.statusCode = 401;
			return next(error);
		}

		/* =========================
       VERIFICAR JWT
       ========================= */

		let decoded;

		try {
			decoded = verifyToken(token);
		} catch (jwtError) {
			const error = new Error(
				jwtError.name === "TokenExpiredError"
					? "La sesión ha expirado. Inicie sesión nuevamente."
					: "El token de autenticación no es válido.",
			);

			error.statusCode = 401;
			return next(error);
		}

		/* =========================
       VALIDAR PAYLOAD
       ========================= */

		if (!decoded?.id) {
			const error = new Error(
				"El token no contiene información de usuario válida.",
			);

			error.statusCode = 401;
			return next(error);
		}

		/* =========================
       BUSCAR USUARIO
       ========================= */

		const usuario = await usuarioRepository.findById(decoded.id);

		if (!usuario) {
			const error = new Error("El usuario asociado al token no existe.");

			error.statusCode = 401;
			return next(error);
		}

		/* =========================
       VALIDAR ESTADO
       ========================= */

		if (usuario.estado !== "ACTIVO") {
			const error = new Error("El usuario se encuentra inactivo.");

			error.statusCode = 403;
			return next(error);
		}

		/* =========================
       GUARDAR USUARIO EN REQUEST
       ========================= */

		req.usuario = {
			id: usuario.id,
			nombre: usuario.nombre,
			apellido: usuario.apellido,
			email: usuario.email,
			rol: usuario.rol,
			estado: usuario.estado,
		};

		next();
	} catch (error) {
		next(error);
	}
};

/**
 * Exportación del middleware.
 *
 * La restricción por rol (authorizeRoles) vive en
 * rbac.middleware.js junto con la matriz de permisos.
 */
const authMiddleware = {
	authenticate,
};

export default authMiddleware;
