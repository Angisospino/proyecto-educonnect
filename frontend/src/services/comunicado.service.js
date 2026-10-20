import api from "../api/api.js";

const BASE_URL = "/comunicados";

/* ==========================================
   LISTAR COMUNICADOS
   GET /api/comunicados?page=1&pageSize=10
   La paginación se envía como query params.
   Respuesta: data = { comunicados, total, page, pageSize }
   ========================================== */

const listarComunicados = async (params = {}) => {
	const response = await api.get(BASE_URL, {
		params,
	});

	return response.data;
};

/* ==========================================
   PUBLICAR COMUNICADO
   POST /api/comunicados
   Body: { titulo, contenido }
   El autor se toma del token.
   ========================================== */

const publicarComunicado = async (datos) => {
	const response = await api.post(BASE_URL, datos);

	return response.data;
};

/* ==========================================
   EDITAR COMUNICADO
   PUT /api/comunicados/:id
   Body: { titulo, contenido }
   Solo el autor puede editarlo.
   ========================================== */

const editarComunicado = async (id, datos) => {
	const response = await api.put(`${BASE_URL}/${id}`, datos);

	return response.data;
};

/* ==========================================
   ELIMINAR COMUNICADO
   DELETE /api/comunicados/:id
   Eliminación lógica; solo el autor.
   ========================================== */

const eliminarComunicado = async (id) => {
	const response = await api.delete(`${BASE_URL}/${id}`);

	return response.data;
};

/* ==========================================
   EXPORT
   ========================================== */

const comunicadoService = {
	listarComunicados,
	publicarComunicado,
	editarComunicado,
	eliminarComunicado,
};

export default comunicadoService;
