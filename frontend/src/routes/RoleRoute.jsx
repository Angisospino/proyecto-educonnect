import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../hooks/useAuth.js";

import { ROUTES } from "../utils/constants.js";

/**
 * Protege rutas según el rol del usuario.
 *
 * Ejemplo:
 *
 * <Route
 *   element={
 *     <RoleRoute
 *       allowedRoles={["ADMINISTRADOR"]}
 *     />
 *   }
 * >
 *   ...
 * </Route>
 *
 * Roles disponibles en EduConnect BR:
 *
 * - ADMINISTRADOR
 * - DOCENTE
 * - ESTUDIANTE
 * - PADRE_FAMILIA
 * - DIRECTIVO
 */
const RoleRoute = ({ allowedRoles = [] }) => {
	const { user } = useAuth();

	/* ==========================================
     SIN USUARIO
     ========================================== */

	if (!user) {
		return <Navigate to={ROUTES.LOGIN} replace />;
	}

	/* ==========================================
     ROL NO AUTORIZADO
     ========================================== */

	if (!allowedRoles.includes(user.rol)) {
		return <Navigate to={ROUTES.DASHBOARD} replace />;
	}

	/* ==========================================
     AUTORIZADO
     ========================================== */

	return <Outlet />;
};

export default RoleRoute;
