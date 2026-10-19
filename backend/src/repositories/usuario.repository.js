import prisma from "../config/prisma.js";
import padreEstudianteRepository from "./padreEstudiante.repository.js";

/**
 * Busca un usuario por su ID.
 *
 * @param {number|string} id
 * @returns {Promise<Object|null>}
 */
export const findById = async (id) => {
	return prisma.usuario.findUnique({
		where: {
			id: Number(id),
		},
	});
};

/**
 * Busca un usuario por su correo electrónico.
 *
 * Se utiliza principalmente durante el login.
 *
 * @param {string} email
 * @returns {Promise<Object|null>}
 */
export const findByEmail = async (email) => {
	return prisma.usuario.findUnique({
		where: {
			email: email.toLowerCase().trim(),
		},
	});
};

/**
 * Verifica si existe un usuario con determinado correo.
 *
 * @param {string} email
 * @returns {Promise<boolean>}
 */
export const existsByEmail = async (email) => {
	const usuario = await prisma.usuario.findUnique({
		where: {
			email: email.toLowerCase().trim(),
		},
		select: {
			id: true,
		},
	});

	return Boolean(usuario);
};

/**
 * Crea un nuevo usuario.
 *
 * IMPORTANTE:
 * passwordHash debe llegar previamente cifrado.
 * El repository no debe manejar bcrypt.
 *
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export const create = async (data) => {
	return prisma.usuario.create({
		data: {
			nombre: data.nombre.trim(),
			apellido: data.apellido.trim(),
			email: data.email.toLowerCase().trim(),
			passwordHash: data.passwordHash,
			rol: data.rol,
			estado: data.estado ?? "ACTIVO",
		},
		select: {
			id: true,
			nombre: true,
			apellido: true,
			email: true,
			rol: true,
			estado: true,
			createdAt: true,
			updatedAt: true,
		},
	});
};

/**
 * Obtiene todos los usuarios.
 *
 * No devuelve passwordHash.
 *
 * @returns {Promise<Array>}
 */
export const findAll = async () => {
	return prisma.usuario.findMany({
		select: {
			id: true,
			nombre: true,
			apellido: true,
			email: true,
			rol: true,
			estado: true,
			createdAt: true,
			updatedAt: true,
		},
		orderBy: {
			createdAt: "desc",
		},
	});
};

/**
 * Actualiza los datos de un usuario.
 *
 * @param {number|string} id
 * @param {Object} data
 * @returns {Promise<Object>}
 */
export const update = async (id, data, db = prisma) => {
	return db.usuario.update({
		where: {
			id: Number(id),
		},
		data,
		select: {
			id: true,
			nombre: true,
			apellido: true,
			email: true,
			rol: true,
			estado: true,
			createdAt: true,
			updatedAt: true,
		},
	});
};

/**
 * Actualiza un usuario que deja de ser PADRE_FAMILIA y elimina sus
 * vínculos con estudiantes (PadreEstudiante) en una sola transacción.
 *
 * Primero se actualiza el usuario y después se borran los vínculos: si la
 * actualización falla (p. ej. email duplicado) no se elimina nada, y si el
 * borrado falla se revierte el cambio de rol.
 *
 * El usuario devuelto usa el mismo select de update (sin passwordHash).
 *
 * @param {number|string} id
 * @param {Object} data - Campos ya validados por el service.
 * @returns {Promise<Object>}
 */
export const actualizarYLimpiarVinculos = async (id, data) => {
	return prisma.$transaction(async (tx) => {
		const usuarioActualizado = await update(id, data, tx);

		await padreEstudianteRepository.eliminarPorPadre(id, tx);

		return usuarioActualizado;
	});
};

/**
 * Cambia el estado de un usuario.
 *
 * @param {number|string} id
 * @param {"ACTIVO"|"INACTIVO"} estado
 * @returns {Promise<Object>}
 */
export const updateEstado = async (id, estado) => {
	return prisma.usuario.update({
		where: {
			id: Number(id),
		},
		data: {
			estado,
		},
		select: {
			id: true,
			nombre: true,
			apellido: true,
			email: true,
			rol: true,
			estado: true,
			updatedAt: true,
		},
	});
};

/**
 * Elimina físicamente un usuario.
 *
 * En EduConnect BR normalmente será preferible
 * cambiarlo a INACTIVO en lugar de eliminarlo.
 *
 * @param {number|string} id
 * @returns {Promise<Object>}
 */
export const remove = async (id) => {
	return prisma.usuario.delete({
		where: {
			id: Number(id),
		},
		select: {
			id: true,
			nombre: true,
			apellido: true,
			email: true,
		},
	});
};

const findByIdWithPassword = async (id) => {
	return prisma.usuario.findUnique({
		where: {
			id: Number(id),
		},

		select: {
			id: true,
			nombre: true,
			apellido: true,
			email: true,
			passwordHash: true,
			rol: true,
			estado: true,
			createdAt: true,
			updatedAt: true,
		},
	});
};

/**
 * Repository de Usuario.
 */
const usuarioRepository = {
	findById,
	findByEmail,
	existsByEmail,
	create,
	findAll,
	update,
	actualizarYLimpiarVinculos,
	updateEstado,
	remove,
	findByIdWithPassword,
};

export default usuarioRepository;
