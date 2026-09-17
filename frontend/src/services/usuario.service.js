import api from "../api/api.js";

const BASE_URL = "/usuarios";

/* ==========================================
   OBTENER TODOS LOS USUARIOS
   GET /api/usuarios
   ========================================== */

const obtenerUsuarios = async () => {
	const response = await api.get(BASE_URL);

	return response.data;
};

/* ==========================================
   OBTENER USUARIO POR ID
   GET /api/usuarios/:id
   ========================================== */

const obtenerUsuarioPorId = async (id) => {
	const response = await api.get(`${BASE_URL}/${id}`);

	return response.data;
};

/* ==========================================
   CREAR USUARIO
   POST /api/usuarios
   ========================================== */

const crearUsuario = async (usuarioData) => {
	const response = await api.post(BASE_URL, usuarioData);

	return response.data;
};

/* ==========================================
   ACTUALIZAR USUARIO
   PATCH /api/usuarios/:id
   ========================================== */

const actualizarUsuario = async (id, usuarioData) => {
	const response = await api.patch(`${BASE_URL}/${id}`, usuarioData);

	return response.data;
};

/* ==========================================
   CAMBIAR ESTADO
   PATCH /api/usuarios/:id/estado
   ========================================== */

const cambiarEstadoUsuario = async (id, estado) => {
	const response = await api.patch(`${BASE_URL}/${id}/estado`, {
		estado,
	});

	return response.data;
};

/* ==========================================
   ELIMINAR USUARIO
   DELETE /api/usuarios/:id
   ========================================== */

const eliminarUsuario = async (id) => {
	const response = await api.delete(`${BASE_URL}/${id}`);

	return response.data;
};

/* ==========================================
   EXPORT
   ========================================== */

const usuarioService = {
	obtenerUsuarios,
	obtenerUsuarioPorId,
	crearUsuario,
	actualizarUsuario,
	cambiarEstadoUsuario,
	eliminarUsuario,
};

export default usuarioService;
