/**
 * Middleware RBAC (control de acceso basado en roles).
 *
 * Implementa la matriz de permisos del DDS §7.3, limitada
 * a los módulos ya implementados en el backend. A medida que
 * se agreguen nuevos módulos (Notas, Asistencia, Comunicados,
 * Reportes), se declaran aquí como una nueva entrada de
 * PERMISOS — las rutas no deben hardcodear roles sueltos.
 */

export const ROLES = {
	ADMINISTRADOR: "ADMINISTRADOR",
	DOCENTE: "DOCENTE",
	ESTUDIANTE: "ESTUDIANTE",
	PADRE_FAMILIA: "PADRE_FAMILIA",
	DIRECTIVO: "DIRECTIVO",
};

const TODOS_LOS_ROLES = Object.values(ROLES);

/**
 * Matriz de permisos por módulo (DDS §7.3).
 *
 * Módulo               Administrador  Docente  Estudiante  Padre  Directivo
 * Gestión de usuarios   CRUD           —        —           —      —
 * Perfil propio         CRUD           CRUD     CRUD        CRUD   CRUD
 */
export const PERMISOS = {
	USUARIOS: [ROLES.ADMINISTRADOR],
	PERFIL: TODOS_LOS_ROLES,
};

/**
 * Middleware para restringir rutas según el rol.
 *
 * Se usa junto con la matriz PERMISOS:
 *
 * authorizeRoles(...PERMISOS.USUARIOS)
 *
 * @param  {...string} rolesPermitidos
 */
export const authorizeRoles = (...rolesPermitidos) => {
	return (req, res, next) => {
		if (!req.usuario) {
			const error = new Error("Usuario no autenticado.");

			error.statusCode = 401;
			return next(error);
		}

		if (!rolesPermitidos.includes(req.usuario.rol)) {
			const error = new Error("No tiene permisos para realizar esta acción.");

			error.statusCode = 403;
			return next(error);
		}

		next();
	};
};

const rbacMiddleware = {
	ROLES,
	PERMISOS,
	authorizeRoles,
};

export default rbacMiddleware;
