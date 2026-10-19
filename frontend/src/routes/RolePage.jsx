import { Navigate } from "react-router-dom";

import { useAuth } from "../hooks/useAuth.js";

import { ROUTES } from "../utils/constants.js";

/**
 * Despachador de página por rol.
 *
 * Muestra una página distinta según el rol del usuario autenticado,
 * de modo que un mismo path (ej. /notas) tenga una sola <Route>.
 * Si el rol no tiene página asignada, redirige al dashboard.
 *
 * No se usa <RoleRoute> con hijos: RoleRoute es una ruta de layout
 * y solo renderiza <Outlet />.
 *
 * Ejemplo:
 *
 * <Route
 *   path={ROUTES.GRADES}
 *   element={
 *     <RolePage
 *       pages={{
 *         [ROLES.DOCENTE]: <RegistrarNotas />,
 *         [ROLES.ESTUDIANTE]: <MisNotas />,
 *       }}
 *     />
 *   }
 * />
 */
const RolePage = ({ pages = {} }) => {
	const { user } = useAuth();

	const page = user?.rol && Object.hasOwn(pages, user.rol) ? pages[user.rol] : null;

	if (!page) {
		return <Navigate to={ROUTES.DASHBOARD} replace />;
	}

	return page;
};

export default RolePage;
