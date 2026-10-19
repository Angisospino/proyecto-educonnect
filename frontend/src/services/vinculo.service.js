import api from "../api/api.js";

const BASE_URL = "/vinculos";

/* ==========================================
   LISTAR VINCULOS
   GET /api/vinculos
   GET /api/vinculos?padreId=...&estudianteId=...
   Los filtros se envian como query params.
   ========================================== */

const listarVinculos = async (filtros = {}) => {
	const response = await api.get(BASE_URL, {
		params: filtros,
	});

	return response.data;
};

/* ==========================================
   CREAR VINCULO
   POST /api/vinculos
   Body: { padreId, estudianteId }
   ========================================== */

const crearVinculo = async (datos) => {
	const response = await api.post(BASE_URL, datos);

	return response.data;
};

/* ==========================================
   ELIMINAR VINCULO
   DELETE /api/vinculos/:id
   ========================================== */

const eliminarVinculo = async (id) => {
	const response = await api.delete(`${BASE_URL}/${id}`);

	return response.data;
};

/* ==========================================
   EXPORT
   ========================================== */

const vinculoService = {
	listarVinculos,
	crearVinculo,
	eliminarVinculo,
};

export default vinculoService;
