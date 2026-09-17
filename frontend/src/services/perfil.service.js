import api from "../api/api.js";

/* ==========================================
   CONFIGURACIÓN
   ========================================== */

const BASE_URL = "/perfil";

/* ==========================================
   OBTENER MI PERFIL
   GET /api/perfil
   ========================================== */

const obtenerPerfil = async () => {
	const response = await api.get(BASE_URL);

	return response.data;
};

/* ==========================================
   ACTUALIZAR MI PERFIL
   PATCH /api/perfil
   ========================================== */

const actualizarPerfil = async (perfilData) => {
	const response = await api.patch(BASE_URL, perfilData);

	return response.data;
};

/* ==========================================
   CAMBIAR CONTRASEÑA
   PATCH /api/perfil/password
   ========================================== */

const cambiarPassword = async (passwordData) => {
	const response = await api.patch(`${BASE_URL}/password`, passwordData);

	return response.data;
};

/* ==========================================
   SERVICIO
   ========================================== */

const perfilService = {
	obtenerPerfil,
	actualizarPerfil,
	cambiarPassword,
};

export default perfilService;
