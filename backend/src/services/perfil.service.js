import usuarioRepository from "../repositories/usuario.repository.js";

import { comparePassword, hashPassword } from "../utils/bcrypt.util.js";

/* ==========================================
   UTILIDADES
   ========================================== */

const createError = (message, statusCode = 500) => {
	const error = new Error(message);

	error.statusCode = statusCode;

	return error;
};

const validarId = (id) => {
	const usuarioId = Number(id);

	if (!Number.isInteger(usuarioId) || usuarioId <= 0) {
		throw createError("El identificador del usuario no es válido.", 400);
	}

	return usuarioId;
};

const normalizarEmail = (email) => {
	return email.trim().toLowerCase();
};

const validarEmail = (email) => {
	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	return emailRegex.test(email);
};

const limpiarUsuario = (usuario) => {
	if (!usuario) {
		return null;
	}

	return {
		id: usuario.id,
		nombre: usuario.nombre,
		apellido: usuario.apellido,
		email: usuario.email,
		rol: usuario.rol,
		estado: usuario.estado,
		createdAt: usuario.createdAt,
		updatedAt: usuario.updatedAt,
	};
};

/* ==========================================
   OBTENER PERFIL
   ========================================== */

const obtenerPerfil = async (usuarioId) => {
	const id = validarId(usuarioId);

	const usuario = await usuarioRepository.findById(id);

	if (!usuario) {
		throw createError("Usuario no encontrado.", 404);
	}

	return limpiarUsuario(usuario);
};

/* ==========================================
   ACTUALIZAR PERFIL
   ========================================== */

const actualizarPerfil = async (usuarioId, data) => {
	const id = validarId(usuarioId);

	const usuarioActual = await usuarioRepository.findById(id);

	if (!usuarioActual) {
		throw createError("Usuario no encontrado.", 404);
	}

	/* ========================================
     VALIDAR NOMBRE
     ======================================== */

	const nombre = data?.nombre?.trim();

	if (!nombre || nombre.length < 2) {
		throw createError("El nombre debe tener al menos 2 caracteres.", 400);
	}

	/* ========================================
     VALIDAR APELLIDO
     ======================================== */

	const apellido = data?.apellido?.trim();

	if (!apellido || apellido.length < 2) {
		throw createError("El apellido debe tener al menos 2 caracteres.", 400);
	}

	/* ========================================
     VALIDAR EMAIL
     ======================================== */

	if (typeof data?.email !== "string" || !data.email.trim()) {
		throw createError("El correo electrónico es obligatorio.", 400);
	}

	const email = normalizarEmail(data.email);

	if (!validarEmail(email)) {
		throw createError("El correo electrónico no es válido.", 400);
	}

	/* ========================================
     VERIFICAR EMAIL DUPLICADO
     ======================================== */

	if (email !== usuarioActual.email.trim().toLowerCase()) {
		const usuarioConEmail = await usuarioRepository.findByEmail(email);

		if (usuarioConEmail && usuarioConEmail.id !== id) {
			throw createError("El correo electrónico ya está registrado.", 409);
		}
	}

	/* ========================================
     ACTUALIZAR SOLO CAMPOS PERMITIDOS
     ======================================== */

	const datosActualizados = {
		nombre,
		apellido,
		email,
	};

	const usuarioActualizado = await usuarioRepository.update(
		id,
		datosActualizados,
	);

	return limpiarUsuario(usuarioActualizado);
};

/* ==========================================
   CAMBIAR CONTRASEÑA
   ========================================== */

const cambiarPassword = async (usuarioId, data) => {
	const id = validarId(usuarioId);

	/* ========================================
     VALIDAR CAMPOS
     ======================================== */

	const passwordActual = data?.passwordActual;

	const nuevaPassword = data?.nuevaPassword;

	if (typeof passwordActual !== "string" || !passwordActual) {
		throw createError("La contraseña actual es obligatoria.", 400);
	}

	if (typeof nuevaPassword !== "string" || !nuevaPassword) {
		throw createError("La nueva contraseña es obligatoria.", 400);
	}

	if (nuevaPassword.length < 8) {
		throw createError(
			"La nueva contraseña debe tener al menos 8 caracteres.",
			400,
		);
	}

	if (passwordActual === nuevaPassword) {
		throw createError(
			"La nueva contraseña debe ser diferente de la contraseña actual.",
			400,
		);
	}

	/* ========================================
     CONSULTAR USUARIO CON PASSWORD HASH
     ======================================== */

	const usuario = await usuarioRepository.findByIdWithPassword(id);

	if (!usuario) {
		throw createError("Usuario no encontrado.", 404);
	}

	/* ========================================
     VERIFICAR CONTRASEÑA ACTUAL
     ======================================== */

	const passwordCorrecta = await comparePassword(
		passwordActual,
		usuario.passwordHash,
	);

	if (!passwordCorrecta) {
		throw createError("La contraseña actual es incorrecta.", 400);
	}

	/* ========================================
     GENERAR NUEVO HASH
     ======================================== */

	const nuevoPasswordHash = await hashPassword(nuevaPassword);

	/* ========================================
     ACTUALIZAR CONTRASEÑA
     ======================================== */

	await usuarioRepository.update(id, {
		passwordHash: nuevoPasswordHash,
	});

	return {
		message: "Contraseña actualizada correctamente.",
	};
};

/* ==========================================
   EXPORTAR SERVICIO
   ========================================== */

const perfilService = {
	obtenerPerfil,
	actualizarPerfil,
	cambiarPassword,
};

export default perfilService;
