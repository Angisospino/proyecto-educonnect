import usuarioRepository from "../repositories/usuario.repository.js";
import { comparePassword } from "../utils/bcrypt.util.js";
import { generateToken } from "../utils/jwt.util.js";

/**
 * Normaliza un correo electrónico.
 *
 * @param {string} email
 * @returns {string}
 */
const normalizarEmail = (email) => {
	return email.trim().toLowerCase();
};

/**
 * Inicia sesión en EduConnect BR.
 *
 * Flujo:
 * 1. Valida email y contraseña.
 * 2. Busca el usuario por email.
 * 3. Comprueba que el usuario esté activo.
 * 4. Verifica la contraseña.
 * 5. Genera el token JWT.
 * 6. Devuelve token + información segura del usuario.
 *
 * @param {Object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 *
 * @returns {Promise<Object>}
 */
export const login = async ({ email, password }) => {
	/* =========================
     VALIDAR EMAIL
     ========================= */

	if (!email || typeof email !== "string" || !email.trim()) {
		const error = new Error("El correo electrónico es obligatorio.");

		error.statusCode = 400;
		throw error;
	}

	/* =========================
     VALIDAR CONTRASEÑA
     ========================= */

	if (!password || typeof password !== "string") {
		const error = new Error("La contraseña es obligatoria.");

		error.statusCode = 400;
		throw error;
	}

	/* =========================
     NORMALIZAR EMAIL
     ========================= */

	const emailNormalizado = normalizarEmail(email);

	/* =========================
     BUSCAR USUARIO
     ========================= */

	const usuario = await usuarioRepository.findByEmail(emailNormalizado);

	/*
	 * Por seguridad usamos el mismo mensaje tanto
	 * si el correo no existe como si la contraseña
	 * es incorrecta.
	 */
	if (!usuario) {
		const error = new Error("Correo electrónico o contraseña incorrectos.");

		error.statusCode = 401;
		throw error;
	}

	/* =========================
     VERIFICAR ESTADO
     ========================= */

	if (usuario.estado !== "ACTIVO") {
		const error = new Error(
			"El usuario se encuentra inactivo. Contacte al administrador.",
		);

		error.statusCode = 403;
		throw error;
	}

	/* =========================
     VERIFICAR CONTRASEÑA
     ========================= */

	const passwordValida = await comparePassword(password, usuario.passwordHash);

	if (!passwordValida) {
		const error = new Error("Correo electrónico o contraseña incorrectos.");

		error.statusCode = 401;
		throw error;
	}

	/* =========================
     GENERAR JWT
     ========================= */

	const token = generateToken(usuario);

	/* =========================
     USUARIO SEGURO
     ========================= */

	/*
	 * passwordHash nunca debe enviarse
	 * al frontend.
	 */
	const usuarioSeguro = {
		id: usuario.id,
		nombre: usuario.nombre,
		apellido: usuario.apellido,
		email: usuario.email,
		rol: usuario.rol,
		estado: usuario.estado,
	};

	/* =========================
     RESPUESTA
     ========================= */

	return {
		token,
		usuario: usuarioSeguro,
	};
};

/**
 * Obtiene los datos del usuario autenticado.
 *
 * Puede utilizarse posteriormente para un endpoint:
 *
 * GET /api/auth/me
 *
 * @param {number|string} usuarioId
 * @returns {Promise<Object>}
 */
export const obtenerUsuarioAutenticado = async (usuarioId) => {
	const id = Number(usuarioId);

	if (!Number.isInteger(id) || id <= 0) {
		const error = new Error("Usuario autenticado no válido.");

		error.statusCode = 400;
		throw error;
	}

	const usuario = await usuarioRepository.findById(id);

	if (!usuario) {
		const error = new Error("Usuario no encontrado.");

		error.statusCode = 404;
		throw error;
	}

	if (usuario.estado !== "ACTIVO") {
		const error = new Error("El usuario se encuentra inactivo.");

		error.statusCode = 403;
		throw error;
	}

	return {
		id: usuario.id,
		nombre: usuario.nombre,
		apellido: usuario.apellido,
		email: usuario.email,
		rol: usuario.rol,
		estado: usuario.estado,
	};
};

/**
 * Cierre de sesión.
 *
 * Actualmente EduConnect BR utiliza JWT sin estado.
 * Por lo tanto, el logout consiste principalmente
 * en eliminar el token desde el cliente.
 *
 * Esta función queda preparada para que posteriormente
 * se pueda implementar una blacklist de tokens o
 * refresh tokens.
 *
 * @returns {Object}
 */
export const logout = () => {
	return {
		message: "Sesión cerrada correctamente.",
	};
};

/**
 * Exportación del servicio.
 */
const authService = {
	login,
	logout,
	obtenerUsuarioAutenticado,
};

export default authService;
