import { Navigate, Route, Routes } from "react-router-dom";

import { BarChart3, Bell, Settings } from "lucide-react";

/* Layouts */
import AuthLayout from "../layouts/AuthLayout.jsx";
import DashboardLayout from "../layouts/DashboardLayout.jsx";

/* Protección de rutas */
import ProtectedRoute from "./ProtectedRoute.jsx";
import RoleRoute from "./RoleRoute.jsx";
import RolePage from "./RolePage.jsx";

/* Componentes */
import Proximamente from "../components/ui/Proximamente.jsx";

/* Páginas */
import Login from "../pages/auth/Login.jsx";
import Dashboard from "../pages/dashboard/Dashboard.jsx";
import Perfil from "../pages/profile/Perfil.jsx";
import Usuarios from "../pages/admin/usuarios/Usuarios.jsx";
import Vinculos from "../pages/admin/vinculos/Vinculos.jsx";
import RegistrarNotas from "../pages/notas/RegistrarNotas.jsx";
import MisNotas from "../pages/notas/MisNotas.jsx";
import RegistrarAsistencia from "../pages/asistencia/RegistrarAsistencia.jsx";
import ConsultarAsistencia from "../pages/asistencia/ConsultarAsistencia.jsx";

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
						<Route path={ROUTES.FAMILY_LINKS} element={<Vinculos />} />
					</Route>

					{/* ===============================
              MÓDULOS PENDIENTES
              Tienen entrada en el menú pero todavía
              no se construyen: muestran "Próximamente"
              en vez de redirigir al dashboard. Los
              roles son los mismos del menú lateral.
              =============================== */}

					<Route
						path={ROUTES.NOTIFICATIONS}
						element={
							<Proximamente
								titulo="Notificaciones"
								descripcion="Aquí podrás revisar las novedades relacionadas con tu cuenta."
								icon={Bell}
							/>
						}
					/>

					<Route
						element={
							<RoleRoute allowedRoles={[ROLES.ADMINISTRADOR, ROLES.DIRECTIVO]} />
						}
					>
						<Route
							path={ROUTES.REPORTS}
							element={
								<Proximamente
									titulo="Reportes"
									descripcion="Aquí podrás consultar reportes académicos y administrativos."
									icon={BarChart3}
								/>
							}
						/>
					</Route>

					<Route element={<RoleRoute allowedRoles={[ROLES.ADMINISTRADOR]} />}>
						<Route
							path={ROUTES.SETTINGS}
							element={
								<Proximamente
									titulo="Configuración"
									descripcion="Aquí podrás administrar los parámetros generales de la plataforma."
									icon={Settings}
								/>
							}
						/>
					</Route>

					{/* ===============================
              NOTAS Y ASISTENCIA
              Una sola ruta por path: RolePage elige
              la vista según el rol y, si el rol no
              tiene vista, redirige al dashboard.
              =============================== */}

					<Route
						path={ROUTES.GRADES}
						element={
							<RolePage
								pages={{
									[ROLES.DOCENTE]: <RegistrarNotas />,
									[ROLES.ESTUDIANTE]: <MisNotas />,
								}}
							/>
						}
					/>

					<Route
						path={ROUTES.ATTENDANCE}
						element={
							<RolePage
								pages={{
									[ROLES.DOCENTE]: <RegistrarAsistencia />,
									[ROLES.ESTUDIANTE]: <ConsultarAsistencia />,
									[ROLES.PADRE_FAMILIA]: <ConsultarAsistencia />,
								}}
							/>
						}
					/>
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
