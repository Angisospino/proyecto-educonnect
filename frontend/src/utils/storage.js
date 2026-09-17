import { STORAGE_KEYS } from "./constants.js";

/* ==========================================
   VERIFICAR DISPONIBILIDAD
   ========================================== */

/**
 * Comprueba si localStorage está disponible.
 *
 * @returns {boolean}
 */
const isStorageAvailable = () => {
	try {
		return typeof window !== "undefined" && window.localStorage !== undefined;
	} catch {
		return false;
	}
};

/* ==========================================
   GUARDAR VALOR
   ========================================== */

/**
 * Guarda un valor en localStorage.
 *
 * Si el valor es un objeto o arreglo,
 * se convierte automáticamente a JSON.
 *
 * @param {string} key
 * @param {*} value
 *
 * @returns {boolean}
 */
export const setItem = (key, value) => {
	if (!isStorageAvailable()) {
		return false;
	}

	try {
		const valueToStore =
			typeof value === "string" ? value : JSON.stringify(value);

		localStorage.setItem(key, valueToStore);

		return true;
	} catch (error) {
		console.error(`Error guardando "${key}" en localStorage:`, error);

		return false;
	}
};

/* ==========================================
   OBTENER VALOR
   ========================================== */

/**
 * Obtiene un valor desde localStorage.
 *
 * Si detecta un JSON válido, lo convierte
 * automáticamente a objeto/arreglo.
 *
 * @param {string} key
 * @param {*} defaultValue
 *
 * @returns {*}
 */
export const getItem = (key, defaultValue = null) => {
	if (!isStorageAvailable()) {
		return defaultValue;
	}

	try {
		const value = localStorage.getItem(key);

		if (value === null) {
			return defaultValue;
		}

		try {
			return JSON.parse(value);
		} catch {
			return value;
		}
	} catch (error) {
		console.error(`Error obteniendo "${key}" de localStorage:`, error);

		return defaultValue;
	}
};

/* ==========================================
   ELIMINAR VALOR
   ========================================== */

/**
 * Elimina una clave específica.
 *
 * @param {string} key
 *
 * @returns {boolean}
 */
export const removeItem = (key) => {
	if (!isStorageAvailable()) {
		return false;
	}

	try {
		localStorage.removeItem(key);

		return true;
	} catch (error) {
		console.error(`Error eliminando "${key}" de localStorage:`, error);

		return false;
	}
};

/* ==========================================
   VERIFICAR EXISTENCIA
   ========================================== */

/**
 * Comprueba si existe una clave.
 *
 * @param {string} key
 *
 * @returns {boolean}
 */
export const hasItem = (key) => {
	if (!isStorageAvailable()) {
		return false;
	}

	try {
		return localStorage.getItem(key) !== null;
	} catch {
		return false;
	}
};

/* ==========================================
   LIMPIAR STORAGE DE EDUCONNECT
   ========================================== */

/**
 * Elimina únicamente la información
 * perteneciente a EduConnect BR.
 *
 * No utiliza localStorage.clear() para evitar
 * borrar información de otras aplicaciones.
 */
export const clearEduConnectStorage = () => {
	removeItem(STORAGE_KEYS.TOKEN);
	removeItem(STORAGE_KEYS.USUARIO);
	removeItem(STORAGE_KEYS.THEME);
};

/* ==========================================
   TOKEN
   ========================================== */

export const setToken = (token) => {
	if (!token) {
		removeItem(STORAGE_KEYS.TOKEN);
		return;
	}

	setItem(STORAGE_KEYS.TOKEN, token);
};

export const getToken = () => {
	return getItem(STORAGE_KEYS.TOKEN);
};

export const removeToken = () => {
	removeItem(STORAGE_KEYS.TOKEN);
};

/* ==========================================
   USUARIO
   ========================================== */

export const setUser = (usuario) => {
	if (!usuario) {
		removeItem(STORAGE_KEYS.USUARIO);

		return;
	}

	setItem(STORAGE_KEYS.USUARIO, usuario);
};

export const getUser = () => {
	const usuario = getItem(STORAGE_KEYS.USUARIO);

	if (usuario && typeof usuario === "object" && !Array.isArray(usuario)) {
		return usuario;
	}

	return null;
};

export const removeUser = () => {
	removeItem(STORAGE_KEYS.USUARIO);
};

/* ==========================================
   SESIÓN
   ========================================== */

/**
 * Guarda token y usuario.
 *
 * @param {string} token
 * @param {Object} usuario
 */
export const setSession = (token, usuario) => {
	setToken(token);
	setUser(usuario);
};

/**
 * Elimina únicamente la información
 * relacionada con la sesión.
 */
export const clearSession = () => {
	removeToken();
	removeUser();
};

/**
 * Comprueba si existe un token.
 *
 * Importante:
 * esto no garantiza que el JWT siga siendo
 * válido. La validación real se hace mediante
 * GET /api/auth/me.
 */
export const hasSession = () => {
	return Boolean(getToken());
};

/* ==========================================
   TEMA
   ========================================== */

export const setTheme = (theme) => {
	setItem(STORAGE_KEYS.THEME, theme);
};

export const getTheme = () => {
	return getItem(STORAGE_KEYS.THEME, "light");
};

/* ==========================================
   EXPORTACIÓN
   ========================================== */

const storage = {
	setItem,
	getItem,
	removeItem,
	hasItem,

	setToken,
	getToken,
	removeToken,

	setUser,
	getUser,
	removeUser,

	setSession,
	clearSession,
	hasSession,

	setTheme,
	getTheme,

	clearEduConnectStorage,
};

export default storage;
