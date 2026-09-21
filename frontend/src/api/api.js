import axios from "axios";

/* ==========================================
   URL BASE DEL BACKEND
   ========================================== */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";

/* ==========================================
   CREAR INSTANCIA DE AXIOS
   ========================================== */

const api = axios.create({
	baseURL: API_URL,

	headers: {
		"Content-Type": "application/json",
	},

	timeout: 10000,
});

/* ==========================================
   REQUEST INTERCEPTOR
   ========================================== */

/**
 * Antes de cada petición:
 *
 * 1. Busca el token almacenado.
 * 2. Si existe, lo envía como:
 *
 * Authorization: Bearer <token>
 */

api.interceptors.request.use(
	(config) => {
		const token = localStorage.getItem("educonnect_token");

		if (token) {
			config.headers.Authorization = `Bearer ${token}`;
		}

		return config;
	},

	(error) => {
		return Promise.reject(error);
	},
);

/* ==========================================
   RESPONSE INTERCEPTOR
   ========================================== */

/**
 * Intercepta las respuestas de la API.
 *
 * Si el backend devuelve 401:
 *
 * - elimina el token
 * - elimina los datos del usuario
 *
 * El AuthContext podrá encargarse posteriormente
 * de redirigir al login.
 */

api.interceptors.response.use(
	(response) => {
		return response;
	},

	(error) => {
		const status = error.response?.status;

		if (status === 401) {
			localStorage.removeItem("educonnect_token");

			localStorage.removeItem("educonnect_usuario");
		}

		return Promise.reject(error);
	},
);

/* ==========================================
   EXPORTAR INSTANCIA
   ========================================== */

export default api;
