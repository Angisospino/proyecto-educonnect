import usuarioService from "../services/usuario.service.js";

/**
 * ==========================================
 * OBTENER TODOS LOS USUARIOS
 * ==========================================
 *
 * GET /api/usuarios
 *
 * Ruta destinada principalmente al
 * ADMINISTRADOR.
 */
export const obtenerUsuarios = async (req, res, next) => {
	try {
		const usuarios = await usuarioService.obtenerUsuarios();

		return res.status(200).json({
			success: true,
			message: "Usuarios obtenidos correctamente.",
			data: {
				usuarios,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * ==========================================
 * OBTENER USUARIO POR ID
 * ==========================================
 *
 * GET /api/usuarios/:id
 *
 * Ejemplo:
 * GET /api/usuarios/1
 */
export const obtenerUsuarioPorId = async (req, res, next) => {
	try {
		const { id } = req.params;

		const usuario = await usuarioService.obtenerUsuarioPorId(id);

		return res.status(200).json({
			success: true,
			message: "Usuario obtenido correctamente.",
			data: {
				usuario,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * ==========================================
 * CREAR USUARIO
 * ==========================================
 *
 * POST /api/usuarios
 *
 * Body esperado:
 *
 * {
 *   "nombre": "Carlos",
 *   "apellido": "Martínez",
 *   "email": "carlos@educonnectbr.edu.co",
 *   "password": "EduConnect123*",
 *   "rol": "DOCENTE"
 * }
 */
export const crearUsuario = async (req, res, next) => {
	try {
		const { nombre, apellido, email, password, rol } = req.body;

		const usuario = await usuarioService.crearUsuario({
			nombre,
			apellido,
			email,
			password,
			rol,
		});

		return res.status(201).json({
			success: true,
			message: "Usuario creado correctamente.",
			data: {
				usuario,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * ==========================================
 * ACTUALIZAR USUARIO
 * ==========================================
 *
 * PATCH /api/usuarios/:id
 *
 * Se utiliza PATCH porque los datos pueden
 * actualizarse parcialmente.
 *
 * Ejemplo:
 *
 * {
 *   "nombre": "Carlos Alberto",
 *   "email": "carlos@educonnectbr.edu.co"
 * }
 */
export const actualizarUsuario = async (req, res, next) => {
	try {
		const { id } = req.params;

		const usuario = await usuarioService.actualizarUsuario(id, req.body);

		return res.status(200).json({
			success: true,
			message: "Usuario actualizado correctamente.",
			data: {
				usuario,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * ==========================================
 * CAMBIAR ESTADO DEL USUARIO
 * ==========================================
 *
 * PATCH /api/usuarios/:id/estado
 *
 * Body:
 *
 * {
 *   "estado": "INACTIVO"
 * }
 *
 * o:
 *
 * {
 *   "estado": "ACTIVO"
 * }
 */
export const cambiarEstadoUsuario = async (req, res, next) => {
	try {
		const { id } = req.params;
		const { estado } = req.body;

		const usuario = await usuarioService.cambiarEstadoUsuario(id, estado);

		return res.status(200).json({
			success: true,
			message: `Usuario ${
				estado === "ACTIVO" ? "activado" : "desactivado"
			} correctamente.`,
			data: {
				usuario,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * ==========================================
 * ELIMINAR USUARIO
 * ==========================================
 *
 * DELETE /api/usuarios/:id
 *
 * IMPORTANTE:
 * Para EduConnect BR se recomienda utilizar
 * principalmente la desactivación del usuario
 * en lugar de eliminarlo físicamente.
 */
export const eliminarUsuario = async (req, res, next) => {
	try {
		const { id } = req.params;

		const usuario = await usuarioService.eliminarUsuario(id);

		return res.status(200).json({
			success: true,
			message: "Usuario eliminado correctamente.",
			data: {
				usuario,
			},
		});
	} catch (error) {
		next(error);
	}
};

/**
 * ==========================================
 * EXPORTACIÓN
 * ==========================================
 */

const usuarioController = {
	obtenerUsuarios,
	obtenerUsuarioPorId,
	crearUsuario,
	actualizarUsuario,
	cambiarEstadoUsuario,
	eliminarUsuario,
};

export default usuarioController;
