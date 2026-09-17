import usuarioRepository from "../repositories/usuario.repository.js";
import { hashPassword } from "../utils/bcrypt.util.js";

/**
 * Roles permitidos en EduConnect BR.
 */
const ROLES_VALIDOS = [
	"ADMINISTRADOR",
	"DOCENTE",
	"ESTUDIANTE",
	"PADRE_FAMILIA",
	"DIRECTIVO",
];

/**
 * Estados permitidos para un usuario.
 */
const ESTADOS_VALIDOS = ["ACTIVO", "INACTIVO"];

/**
 * Normaliza un correo electrónico.
 *
 * @param {string} email
 * @returns {string}
 */
const normalizarEmail = (email) => {
	return email.trim().toLowerCase();
};

/**
 * Valida que un ID sea válido.
 *
 * @param {number|string} id
 * @returns {number}
 */
const validarId = (id) => {
	const usuarioId = Number(id);

	if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
		const error = new Error("El ID del usuario no es válido.");
		error.statusCode = 400;
		throw error;
	}

	return usuarioId;
};

/**
 * Obtiene todos los usuarios.
 *
 * @returns {Promise<Array>}
 */
export const obtenerUsuarios = async () => {
	return usuarioRepository.findAll();
};

/**
 * Obtiene un usuario por ID.
 *
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export const obtenerUsuarioPorId = async (id) => {
	const usuarioId = validarId(id);

	const usuario = await usuarioRepository.findById(usuarioId);

	if (!usuario) {
		const error = new Error("Usuario no encontrado.");
		error.statusCode = 404;
		throw error;
	}

	// Evitamos devolver passwordHash.
	const { passwordHash, ...usuarioSeguro } = usuario;

	return usuarioSeguro;
};

/**
 * Crea un nuevo usuario.
 *
 * @param {Object} data
 * @param {string} data.nombre
 * @param {string} data.apellido
 * @param {string} data.email
 * @param {string} data.password
 * @param {string} data.rol
 *
 * @returns {Promise<Object>}
 */
export const crearUsuario = async (data) => {
	const { nombre, apellido, email, password, rol } = data;

	/* =========================
     VALIDACIONES
     ========================= */

	if (!nombre?.trim()) {
		const error = new Error("El nombre es obligatorio.");
		error.statusCode = 400;
		throw error;
	}

	if (!apellido?.trim()) {
		const error = new Error("El apellido es obligatorio.");
		error.statusCode = 400;
		throw error;
	}

	if (!email?.trim()) {
		const error = new Error("El correo electrónico es obligatorio.");
		error.statusCode = 400;
		throw error;
	}

	if (!password) {
		const error = new Error("La contraseña es obligatoria.");
		error.statusCode = 400;
		throw error;
	}

	if (!rol) {
		const error = new Error("El rol es obligatorio.");
		error.statusCode = 400;
		throw error;
	}

	const emailNormalizado = normalizarEmail(email);

	/* =========================
     VALIDAR FORMATO EMAIL
     ========================= */

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!emailRegex.test(emailNormalizado)) {
		const error = new Error(
			"El correo electrónico no tiene un formato válido.",
		);

		error.statusCode = 400;
		throw error;
	}

	/* =========================
     VALIDAR ROL
     ========================= */

	if (!ROLES_VALIDOS.includes(rol)) {
		const error = new Error("El rol seleccionado no es válido.");
		error.statusCode = 400;
		throw error;
	}

	/* =========================
     VALIDAR CONTRASEÑA
     ========================= */

	if (password.length < 8) {
		const error = new Error("La contraseña debe tener mínimo 8 caracteres.");

		error.statusCode = 400;
		throw error;
	}

	/* =========================
     VERIFICAR EMAIL DUPLICADO
     ========================= */

	const existeUsuario = await usuarioRepository.existsByEmail(emailNormalizado);

	if (existeUsuario) {
		const error = new Error(
			"Ya existe un usuario registrado con este correo electrónico.",
		);

		error.statusCode = 409;
		throw error;
	}

	/* =========================
     CIFRAR CONTRASEÑA
     ========================= */

	const passwordHash = await hashPassword(password);

	/* =========================
     CREAR USUARIO
     ========================= */

	return usuarioRepository.create({
		nombre: nombre.trim(),
		apellido: apellido.trim(),
		email: emailNormalizado,
		passwordHash,
		rol,
		estado: "ACTIVO",
	});
};

/**
 * Actualiza los datos de un usuario.
 *
 * @param {number|string} id
 * @param {Object} data
 *
 * @returns {Promise<Object>}
 */
export const actualizarUsuario = async (id, data) => {
	const usuarioId = validarId(id);

	const usuarioActual = await usuarioRepository.findById(usuarioId);

	if (!usuarioActual) {
		const error = new Error("Usuario no encontrado.");
		error.statusCode = 404;
		throw error;
	}

	const datosActualizar = {};

	/* =========================
     NOMBRE
     ========================= */

	if (data.nombre !== undefined) {
		if (!data.nombre?.trim()) {
			const error = new Error("El nombre no puede estar vacío.");

			error.statusCode = 400;
			throw error;
		}

		datosActualizar.nombre = data.nombre.trim();
	}

	/* =========================
     APELLIDO
     ========================= */

	if (data.apellido !== undefined) {
		if (!data.apellido?.trim()) {
			const error = new Error("El apellido no puede estar vacío.");

			error.statusCode = 400;
			throw error;
		}

		datosActualizar.apellido = data.apellido.trim();
	}

	/* =========================
     EMAIL
     ========================= */

	if (data.email !== undefined) {
		const emailNormalizado = normalizarEmail(data.email);

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

		if (!emailRegex.test(emailNormalizado)) {
			const error = new Error(
				"El correo electrónico no tiene un formato válido.",
			);

			error.statusCode = 400;
			throw error;
		}

		/*
		 * Solo verificamos duplicado si el usuario
		 * está intentando cambiar su correo.
		 */
		if (emailNormalizado !== usuarioActual.email) {
			const existeEmail =
				await usuarioRepository.existsByEmail(emailNormalizado);

			if (existeEmail) {
				const error = new Error("El correo electrónico ya está registrado.");

				error.statusCode = 409;
				throw error;
			}
		}

		datosActualizar.email = emailNormalizado;
	}

	/* =========================
     ROL
     ========================= */

	if (data.rol !== undefined) {
		if (!ROLES_VALIDOS.includes(data.rol)) {
			const error = new Error("El rol seleccionado no es válido.");

			error.statusCode = 400;
			throw error;
		}

		datosActualizar.rol = data.rol;
	}

	/* =========================
     ESTADO
     ========================= */

	if (data.estado !== undefined) {
		if (!ESTADOS_VALIDOS.includes(data.estado)) {
			const error = new Error("El estado del usuario no es válido.");

			error.statusCode = 400;
			throw error;
		}

		datosActualizar.estado = data.estado;
	}

	/* =========================
     CONTRASEÑA
     ========================= */

	if (data.password !== undefined) {
		if (data.password.length < 8) {
			const error = new Error("La contraseña debe tener mínimo 8 caracteres.");

			error.statusCode = 400;
			throw error;
		}

		datosActualizar.passwordHash = await hashPassword(data.password);
	}

	if (Object.keys(datosActualizar).length === 0) {
		const error = new Error("No se proporcionaron datos para actualizar.");

		error.statusCode = 400;
		throw error;
	}

	return usuarioRepository.update(usuarioId, datosActualizar);
};

/**
 * Cambia el estado de un usuario.
 *
 * En lugar de eliminarlo físicamente,
 * podemos activarlo o desactivarlo.
 *
 * @param {number|string} id
 * @param {"ACTIVO"|"INACTIVO"} estado
 *
 * @returns {Promise<Object>}
 */
export const cambiarEstadoUsuario = async (id, estado) => {
	const usuarioId = validarId(id);

	if (!ESTADOS_VALIDOS.includes(estado)) {
		const error = new Error("El estado debe ser ACTIVO o INACTIVO.");

		error.statusCode = 400;
		throw error;
	}

	const usuario = await usuarioRepository.findById(usuarioId);

	if (!usuario) {
		const error = new Error("Usuario no encontrado.");
		error.statusCode = 404;
		throw error;
	}

	if (usuario.estado === estado) {
		const error = new Error(`El usuario ya se encuentra ${estado}.`);

		error.statusCode = 400;
		throw error;
	}

	return usuarioRepository.updateEstado(usuarioId, estado);
};

/**
 * Elimina físicamente un usuario.
 *
 * Se recomienda utilizar esta función solamente
 * cuando realmente sea necesario.
 *
 * Para EduConnect BR normalmente será preferible
 * cambiar el estado del usuario a INACTIVO.
 *
 * @param {number|string} id
 *
 * @returns {Promise<Object>}
 */
export const eliminarUsuario = async (id) => {
	const usuarioId = validarId(id);

	const usuario = await usuarioRepository.findById(usuarioId);

	if (!usuario) {
		const error = new Error("Usuario no encontrado.");
		error.statusCode = 404;
		throw error;
	}

	return usuarioRepository.remove(usuarioId);
};

/**
 * Exportación del servicio.
 */
const usuarioService = {
	obtenerUsuarios,
	obtenerUsuarioPorId,
	crearUsuario,
	actualizarUsuario,
	cambiarEstadoUsuario,
	eliminarUsuario,
};

export default usuarioService;
