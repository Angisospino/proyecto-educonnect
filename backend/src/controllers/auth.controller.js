import authService from "../services/auth.service.js";

/**
 * Iniciar sesión.
 *
 * Endpoint:
 * POST /api/auth/login
 *
 * Body esperado:
 * {
 *   "email": "admin@educonnectbr.edu.co",
 *   "password": "EduConnect123*"
 * }
 */
export const login = async (req, res, next) => {
	try {
		const { email, password } = req.body;

		const resultado = await authService.login({
			email,
			password,
		});

		return res.status(200).json({
			success: true,
			message: "Inicio de sesión exitoso.",
			data: resultado,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Cerrar sesión.
 *
 * Endpoint:
 * POST /api/auth/logout
 *
 * En la implementación actual con JWT,
 * el servidor no mantiene una sesión activa.
 * El frontend será responsable de eliminar
 * el token almacenado.
 */
export const logout = async (req, res, next) => {
	try {
		const resultado = authService.logout();

		return res.status(200).json({
			success: true,
			message: resultado.message,
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Obtener información del usuario autenticado.
 *
 * Endpoint:
 * GET /api/auth/me
 *
 * Este endpoint requiere que auth.middleware.js
 * haya validado previamente el JWT y agregado
 * los datos del usuario a req.usuario.
 */
export const me = async (req, res, next) => {
	try {
		const usuario = await authService.obtenerUsuarioAutenticado(req.usuario.id);

		return res.status(200).json({
			success: true,
			message: "Usuario autenticado obtenido correctamente.",
			data: {
				usuario,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * Exportación del controlador.
 */
const authController = {
	login,
	logout,
	me,
};

export default authController;
