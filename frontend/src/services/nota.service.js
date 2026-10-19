import api from "../api/api.js";

const BASE_URL = "/notas";

/* ==========================================
   OBTENER NOTAS
   GET /api/notas
   GET /api/notas?periodo=...&asignaturaId=...
   Los filtros se envian como query params.
   ========================================== */

const obtenerNotas = async (filtros = {}) => {
	const response = await api.get(BASE_URL, {
		params: filtros,
	});

	return response.data;
};

/* ==========================================
   CREAR NOTA
   POST /api/notas
   ========================================== */

const crearNota = async (datos) => {
	const response = await api.post(BASE_URL, datos);

	return response.data;
};

/* ==========================================
   ACTUALIZAR NOTA
   PATCH /api/notas/:id
   ========================================== */

const actualizarNota = async (id, datos) => {
	const response = await api.patch(`${BASE_URL}/${id}`, datos);

	return response.data;
};

/* ==========================================
   EXPORT
   ========================================== */

const notaService = {
	obtenerNotas,
	crearNota,
	actualizarNota,
};

export default notaService;
