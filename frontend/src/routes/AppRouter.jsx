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
import MisNotas from "../pages/notas/MisNotas";
import ConsultarAsistencia from "../pages/asistencia/ConsultarAsistencia";

import RegistrarNotas from "../pages/notas/RegistrarNotas";
import RegistrarAsistencia from "../pages/asistencia/RegistrarAsistencia";
/* Constantes */
import { ROUTES, ROLES } from "../utils/constants.js";

export function NotasPorRol() {
  const { usuario } = useAuth();

  if (usuario?.rol === ROLES.DOCENTE) {
    return (
      <RoleRoute allowedRoles={[ROLES.DOCENTE]}>
        <RegistrarNotas />
      </RoleRoute>
    );
  }

  return (
    <RoleRoute allowedRoles={[ROLES.ESTUDIANTE]}>
      <MisNotas />
    </RoleRoute>
  );
}

/* ==========================================
   RUTA DE ASISTENCIA
   ========================================== */

export function AsistenciaPorRol() {
  const { usuario } = useAuth();

  if (usuario?.rol === ROLES.DOCENTE) {
    return (
      <RoleRoute allowedRoles={[ROLES.DOCENTE]}>
        <RegistrarAsistencia />
      </RoleRoute>
    );
  }

  return (
    <RoleRoute
      allowedRoles={[
        ROLES.ESTUDIANTE,
        ROLES.PADRE_FAMILIA,
      ]}
    >
      <ConsultarAsistencia />
    </RoleRoute>
  );
}

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
				</Route>
			</Route>

			{/* ==========================================
    NOTAS
    DOCENTE: RegistrarNotas
    ESTUDIANTE: MisNotas
    ========================================== */}

<Route
  path={ROUTES.GRADES}
  element={<NotasPorRol />}
/>

{/* ==========================================
    ASISTENCIA
    DOCENTE: RegistrarAsistencia
    ESTUDIANTE/PADRE: ConsultarAsistencia
    ========================================== */}

<Route
  path={ROUTES.ATTENDANCE}
  element={<AsistenciaPorRol />}
/>

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
