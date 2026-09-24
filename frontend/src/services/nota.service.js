import api from "../api/api.js";

const BASE_URL = "/notas";

/* ==========================================
   OBTENER NOTAS DEL USUARIO AUTENTICADO
   GET /api/notas
   GET /api/notas?periodo=...
   ========================================== */

const obtenerNotas = async (periodo) => {
	const response = await api.get(BASE_URL, {
		params: periodo ? { periodo } : undefined,
	});

	return response.data;
};

/* ==========================================
   EXPORT
   ========================================== */

const notaService = {
	obtenerNotas,
};

export default notaService;
