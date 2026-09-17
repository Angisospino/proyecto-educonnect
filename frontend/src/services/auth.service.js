import api from "../api/api.js";

/* ==========================================
   CLAVES DE LOCALSTORAGE
   ========================================== */

const TOKEN_KEY = "educonnect_token";
const USER_KEY = "educonnect_usuario";

/* ==========================================
   GUARDAR SESIÓN
   ========================================== */

/**
 * Guarda el token JWT y el usuario en localStorage.
 *
 * @param {string} token
 * @param {Object} usuario
 */
const guardarSesion = (token, usuario) => {
	localStorage.setItem(TOKEN_KEY, token);

	localStorage.setItem(USER_KEY, JSON.stringify(usuario));
};

/* ==========================================
   ELIMINAR SESIÓN
   ========================================== */

/**
 * Elimina la información de autenticación
 * almacenada en el navegador.
 */
export const limpiarSesion = () => {
	localStorage.removeItem(TOKEN_KEY);
	localStorage.removeItem(USER_KEY);
};

/* ==========================================
   LOGIN
   ========================================== */

/**
 * Inicia sesión.
 *
 * Endpoint:
 * POST /api/auth/login
 *
 * @param {Object} credentials
 * @param {string} credentials.email
 * @param {string} credentials.password
 *
 * @returns {Promise<Object>}
 */
export const login = async ({ email, password }) => {
	const response = await api.post("/auth/login", {
		email,
		password,
	});

	const { token, usuario } = response.data.data;

	guardarSesion(token, usuario);

	return {
		token,
		usuario,
	};
};

/* ==========================================
   OBTENER USUARIO AUTENTICADO
   ========================================== */

/**
 * Consulta al backend para verificar
 * la sesión actual.
 *
 * Endpoint:
 * GET /api/auth/me
 *
 * El token se agrega automáticamente
 * mediante el interceptor de api.js.
 *
 * @returns {Promise<Object>}
 */
export const obtenerUsuarioActual = async () => {
	const response = await api.get("/auth/me");

	const usuario = response.data.data.usuario;

	/*
	 * Actualizamos la información almacenada
	 * por si el usuario fue modificado
	 * en el backend.
	 */
	localStorage.setItem(USER_KEY, JSON.stringify(usuario));

	return usuario;
};

/* ==========================================
   LOGOUT
   ========================================== */

/**
 * Cierra la sesión del usuario.
 *
 * Endpoint:
 * POST /api/auth/logout
 *
 * Aunque el backend utiliza JWT stateless,
 * notificamos primero al servidor y luego
 * eliminamos la sesión local.
 */
export const logout = async () => {
	try {
		await api.post("/auth/logout");
	} catch (error) {
		/*
		 * Aunque el token esté expirado o el backend
		 * no esté disponible, debemos permitir que
		 * el usuario cierre su sesión local.
		 */
		console.error("Error realizando logout en el servidor:", error);
	} finally {
		limpiarSesion();
	}
};

/* ==========================================
   OBTENER TOKEN LOCAL
   ========================================== */

/**
 * Retorna el JWT almacenado.
 *
 * @returns {string|null}
 */
export const obtenerToken = () => {
	return localStorage.getItem(TOKEN_KEY);
};

/* ==========================================
   OBTENER USUARIO LOCAL
   ========================================== */

/**
 * Retorna el usuario almacenado
 * en localStorage.
 *
 * @returns {Object|null}
 */
export const obtenerUsuarioLocal = () => {
	const usuario = localStorage.getItem(USER_KEY);

	if (!usuario) {
		return null;
	}

	try {
		return JSON.parse(usuario);
	} catch {
		limpiarSesion();
		return null;
	}
};

/* ==========================================
   VERIFICAR AUTENTICACIÓN LOCAL
   ========================================== */

/**
 * Permite saber rápidamente si existe
 * un token almacenado.
 *
 * Esto NO sustituye la validación del backend.
 *
 * @returns {boolean}
 */
export const estaAutenticado = () => {
	return Boolean(obtenerToken());
};

/* ==========================================
   VERIFICAR ROL
   ========================================== */

/**
 * Verifica si el usuario almacenado
 * tiene alguno de los roles indicados.
 *
 * Ejemplos:
 *
 * tieneRol("ADMINISTRADOR")
 *
 * tieneRol(
 *   "ADMINISTRADOR",
 *   "DIRECTIVO"
 * )
 *
 * @param  {...string} roles
 *
 * @returns {boolean}
 */
export const tieneRol = (...roles) => {
	const usuario = obtenerUsuarioLocal();

	if (!usuario) {
		return false;
	}

	return roles.includes(usuario.rol);
};

/* ==========================================
   EXPORTACIÓN
   ========================================== */

const authService = {
	login,
	logout,
	obtenerUsuarioActual,
	obtenerToken,
	obtenerUsuarioLocal,
	estaAutenticado,
	tieneRol,
	limpiarSesion,
};

export default authService;
