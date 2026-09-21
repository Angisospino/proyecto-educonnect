import bcrypt from "bcrypt";

/**
 * Número de rondas utilizadas para generar el hash.
 * 10 ofrece un buen equilibrio entre seguridad
 * y rendimiento para la aplicación.
 */
const SALT_ROUNDS = 10;

/**
 * Genera un hash seguro a partir de una contraseña.
 *
 * @param {string} password - Contraseña en texto plano.
 * @returns {Promise<string>} Hash generado.
 */
export const hashPassword = async (password) => {
	if (!password || typeof password !== "string") {
		throw new Error("La contraseña es obligatoria.");
	}

	try {
		return await bcrypt.hash(password, SALT_ROUNDS);
	} catch (error) {
		throw new Error("No fue posible cifrar la contraseña.");
	}
};

/**
 * Compara una contraseña en texto plano
 * con un hash almacenado en la base de datos.
 *
 * @param {string} password - Contraseña ingresada por el usuario.
 * @param {string} passwordHash - Hash almacenado en la base de datos.
 * @returns {Promise<boolean>}
 */
export const comparePassword = async (password, passwordHash) => {
	if (!password || !passwordHash) {
		return false;
	}

	try {
		return await bcrypt.compare(password, passwordHash);
	} catch (error) {
		return false;
	}
};

export default {
	hashPassword,
	comparePassword,
};
