import perfilService from "../services/perfil.service.js";

/* ==========================================
   OBTENER PERFIL
   GET /api/perfil
   ========================================== */

export const obtenerPerfil = async (req, res, next) => {
	try {
		const usuarioId = req.usuario.id;

		const perfil = await perfilService.obtenerPerfil(usuarioId);

		return res.status(200).json({
			success: true,
			data: perfil,
		});
	} catch (error) {
		next(error);
	}
};

/* ==========================================
   ACTUALIZAR PERFIL
   PATCH /api/perfil
   ========================================== */

export const actualizarPerfil = async (req, res, next) => {
	try {
		const usuarioId = req.usuario.id;

		const perfilActualizado = await perfilService.actualizarPerfil(
			usuarioId,
			req.body,
		);

		return res.status(200).json({
			success: true,
			message: "Perfil actualizado correctamente.",
			data: perfilActualizado,
		});
	} catch (error) {
		next(error);
	}
};

/* ==========================================
   CAMBIAR CONTRASEÑA
   PATCH /api/perfil/password
   ========================================== */

export const cambiarPassword = async (req, res, next) => {
	try {
		const usuarioId = req.usuario.id;

		const resultado = await perfilService.cambiarPassword(usuarioId, req.body);

		return res.status(200).json({
			success: true,
			message: resultado.message,
		});
	} catch (error) {
		next(error);
	}
};
