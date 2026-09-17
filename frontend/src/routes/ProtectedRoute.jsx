import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "../hooks/useAuth.js";

import Loader from "../components/ui/Loader.jsx";

import { ROUTES } from "../utils/constants.js";

/**
 * Protege las rutas que requieren autenticación.
 *
 * Funcionamiento:
 *
 * 1. Espera mientras AuthContext verifica la sesión.
 * 2. Si el usuario no está autenticado:
 *    → redirige a /login.
 * 3. Si está autenticado:
 *    → permite mostrar la ruta solicitada.
 */
const ProtectedRoute = () => {
	const { user, loading } = useAuth();

	const location = useLocation();

	/* ==========================================
     VERIFICANDO SESIÓN
     ========================================== */

	if (loading) {
		return (
			<div
				style={{
					minHeight: "100vh",
					display: "flex",
					alignItems: "center",
					justifyContent: "center",
				}}
			>
				<Loader />
			</div>
		);
	}

	/* ==========================================
     USUARIO NO AUTENTICADO
     ========================================== */

	if (!user) {
		return (
			<Navigate
				to={ROUTES.LOGIN}
				replace
				state={{
					from: location,
				}}
			/>
		);
	}

	/* ==========================================
     USUARIO AUTENTICADO
     ========================================== */

	return <Outlet />;
};

export default ProtectedRoute;
