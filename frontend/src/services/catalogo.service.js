import api from "../api/api.js";

const BASE_URL = "/catalogos";

/* ==========================================
   OBTENER CURSOS
   GET /api/catalogos/cursos
   ========================================== */

const obtenerCursos = async () => {
	const response = await api.get(`${BASE_URL}/cursos`);

	return response.data;
};

/* ==========================================
   OBTENER ASIGNATURAS
   GET /api/catalogos/asignaturas
   ========================================== */

const obtenerAsignaturas = async () => {
	const response = await api.get(`${BASE_URL}/asignaturas`);

	return response.data;
};

/* ==========================================
   OBTENER ESTUDIANTES DE UN CURSO
   GET /api/catalogos/cursos/:id/estudiantes
   ========================================== */

const obtenerEstudiantesDeCurso = async (cursoId) => {
	const response = await api.get(`${BASE_URL}/cursos/${cursoId}/estudiantes`);

	return response.data;
};

/* ==========================================
   OBTENER MIS HIJOS (solo Padre de familia)
   GET /api/padres/mis-hijos
   ========================================== */

const obtenerMisHijos = async () => {
	const response = await api.get("/padres/mis-hijos");

	return response.data;
};

/* ==========================================
   EXPORT
   ========================================== */

const catalogoService = {
	obtenerCursos,
	obtenerAsignaturas,
	obtenerEstudiantesDeCurso,
	obtenerMisHijos,
};

export default catalogoService;
