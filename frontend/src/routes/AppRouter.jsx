import { Navigate, Route, Routes } from "react-router-dom";

/* Layouts */
import AuthLayout from "../layouts/AuthLayout.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";

/* Protección de rutas */
import ProtectedRoute from "./ProtectedRoute.jsx";
import RoleRoute from "./RoleRoute.jsx";

/* Páginas */
import Login from "../pages/auth/Login.jsx";
import Dashboard from "../pages/dashboard/Dashboard.jsx";
import Perfil from "../pages/profile/Perfil.jsx";
import Usuarios from "../pages/admin/usuarios/Usuarios.jsx";
import MisNotas from "../pages/student/MisNotas.jsx";
import Asistencia from "../pages/student/Asistencia.jsx";
import Comunicados from "../pages/student/Comunicados.jsx";
import Mensajes from "../pages/student/Mensajes.jsx";

/* Constantes */
import { ROUTES, ROLES } from "../utils/constants.js";

const AppRoutes = () => {
	return (
		<Routes>
			{/* =====================================
          RUTAS PÚBLICAS
          ===================================== */}

			<Route element={<AuthLayout />}>
				<Route path={ROUTES.LOGIN} element={<Login />} />
			</Route>

			{/* =====================================
          RUTAS PRIVADAS
          ===================================== */}

			<Route element={<ProtectedRoute />}>
				<Route element={<DashboardLayout />}>
					{/* ===============================
              DASHBOARD
              Todos los usuarios autenticados
              =============================== */}

					<Route path={ROUTES.DASHBOARD} element={<Dashboard />} />

					{/* ===============================
              PERFIL
              Todos los usuarios autenticados
              =============================== */}

					<Route path={ROUTES.PROFILE} element={<Perfil />} />

					{/* ===============================
              ADMINISTRACIÓN
              Solo ADMINISTRADOR
              =============================== */}

					<Route element={<RoleRoute allowedRoles={[ROLES.ADMINISTRADOR]} />}>
						<Route path={ROUTES.USERS} element={<Usuarios />} />
					</Route>

					{/* ===============================
              ESTUDIANTE
              Solo ESTUDIANTE
              =============================== */}

					<Route element={<RoleRoute allowedRoles={[ROLES.ESTUDIANTE]} />}>
						<Route path={ROUTES.GRADES} element={<MisNotas />} />
						<Route path={ROUTES.ATTENDANCE} element={<Asistencia />} />
						<Route path={ROUTES.COMMUNICATIONS} element={<Comunicados />} />
						<Route path={ROUTES.MESSAGES} element={<Mensajes />} />
					</Route>
				</Route>
			</Route>

			{/* =====================================
          RUTA RAÍZ
          ===================================== */}

			<Route path="/" element={<Navigate to={ROUTES.DASHBOARD} replace />} />

			{/* =====================================
          404
          ===================================== */}

			<Route path="*" element={<Navigate to={ROUTES.DASHBOARD} replace />} />
		</Routes>
	);
};

export default AppRoutes;
