import jwt from "jsonwebtoken";

/**
 * Clave secreta utilizada para firmar los tokens.
 * Debe estar definida en el archivo .env.
 */
const JWT_SECRET = process.env.JWT_SECRET;

/**
 * Tiempo de expiración del token.
 * Según el diseño de EduConnect BR,
 * la sesión tendrá una duración de 2 horas.
 */
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "2h";

/**
 * Valida que exista la clave secreta.
 */
if (!JWT_SECRET) {
	throw new Error("JWT_SECRET no está definido en las variables de entorno.");
}

/**
 * Genera un token JWT para un usuario autenticado.
 *
 * @param {Object} usuario
 * @param {number|string} usuario.id
 * @param {string} usuario.email
 * @param {string} usuario.rol
 *
 * @returns {string} Token JWT generado.
 */
export const generateToken = (usuario) => {
	if (!usuario?.id || !usuario?.email || !usuario?.rol) {
		throw new Error(
			"No se puede generar el token: datos de usuario incompletos.",
		);
	}

	const payload = {
		id: usuario.id,
		email: usuario.email,
		rol: usuario.rol,
	};

	return jwt.sign(payload, JWT_SECRET, {
		expiresIn: JWT_EXPIRES_IN,
	});
};

/**
 * Verifica la validez de un token JWT.
 *
 * Si el token es válido devuelve su payload.
 * Si está vencido o fue modificado, lanza un error.
 *
 * @param {string} token
 * @returns {Object}
 */
export const verifyToken = (token) => {
	if (!token) {
		throw new Error("Token no proporcionado.");
	}

	return jwt.verify(token, JWT_SECRET);
};

/**
 * Decodifica un token sin verificar su firma.
 *
 * IMPORTANTE:
 * Esta función no debe utilizarse para autorizar
 * operaciones protegidas.
 *
 * @param {string} token
 * @returns {Object|null}
 */
export const decodeToken = (token) => {
	if (!token) {
		return null;
	}

	return jwt.decode(token);
};

export default {
	generateToken,
	verifyToken,
	decodeToken,
};
