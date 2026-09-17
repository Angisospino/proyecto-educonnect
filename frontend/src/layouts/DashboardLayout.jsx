import { useEffect, useMemo, useState } from "react";

import { Outlet, useLocation } from "react-router-dom";

import Header from "../components/layout/Header.jsx";
import Sidebar from "../components/layout/Sidebar.jsx";

import { ROUTES } from "../utils/constants.js";

import "./DashboardLayout.css";

/* ==========================================
   TÍTULOS DE LAS RUTAS
   ========================================== */

const PAGE_TITLES = {
	[ROUTES.DASHBOARD]: "Inicio",
	[ROUTES.PROFILE]: "Mi perfil",
	[ROUTES.USERS]: "Gestión de usuarios",
	[ROUTES.GRADES]: "Notas",
	[ROUTES.ATTENDANCE]: "Asistencia",
	[ROUTES.COMMUNICATIONS]: "Comunicados",
	[ROUTES.NOTIFICATIONS]: "Notificaciones",
	[ROUTES.REPORTS]: "Reportes",
	[ROUTES.SETTINGS]: "Configuración",
};

/* ==========================================
   OBTENER TÍTULO
   ========================================== */

const getPageTitle = (pathname) => {
	/*
	 * Primero buscamos una coincidencia exacta.
	 */

	if (PAGE_TITLES[pathname]) {
		return PAGE_TITLES[pathname];
	}

	/*
	 * Después verificamos rutas internas.
	 *
	 * Ejemplo:
	 *
	 * /admin/usuarios/10
	 * /admin/usuarios/10/editar
	 */

	const matchingRoute = Object.keys(PAGE_TITLES)
		.filter(Boolean)
		.sort((a, b) => b.length - a.length)
		.find((route) => pathname.startsWith(`${route}/`));

	if (matchingRoute) {
		return PAGE_TITLES[matchingRoute];
	}

	return "EduConnect BR";
};

/* ==========================================
   COMPONENTE
   ========================================== */

const DashboardLayout = () => {
	const location = useLocation();

	const [sidebarOpen, setSidebarOpen] = useState(false);

	/* ========================================
     TÍTULO ACTUAL
     ======================================== */

	const pageTitle = useMemo(
		() => getPageTitle(location.pathname),
		[location.pathname],
	);

	/* ========================================
     ABRIR SIDEBAR
     ======================================== */

	const handleOpenSidebar = () => {
		setSidebarOpen(true);
	};

	/* ========================================
     CERRAR SIDEBAR
     ======================================== */

	const handleCloseSidebar = () => {
		setSidebarOpen(false);
	};

	/* ========================================
     CERRAR AL CAMBIAR DE RUTA
     ======================================== */

	useEffect(() => {
		setSidebarOpen(false);
	}, [location.pathname]);

	/* ========================================
     ESCAPE
     ======================================== */

	useEffect(() => {
		if (!sidebarOpen) {
			return undefined;
		}

		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				setSidebarOpen(false);
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [sidebarOpen]);

	/* ========================================
     BLOQUEAR SCROLL EN MÓVIL
     ======================================== */

	useEffect(() => {
		if (!sidebarOpen) {
			return undefined;
		}

		const previousOverflow = document.body.style.overflow;

		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [sidebarOpen]);

	/* ========================================
     RENDER
     ======================================== */

	return (
		<div className="dashboard-layout">
			{/* ===================================
          SIDEBAR
          =================================== */}

			<Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

			{/* ===================================
          ÁREA PRINCIPAL
          =================================== */}

			<div className="dashboard-layout__main">
				{/* ===============================
            HEADER
            =============================== */}

				<Header title={pageTitle} onMenuClick={handleOpenSidebar} />

				{/* ===============================
            CONTENIDO
            =============================== */}

				<main className="dashboard-layout__content" id="main-content">
					<div className="dashboard-layout__container">
						<Outlet />
					</div>
				</main>
			</div>
		</div>
	);
};

export default DashboardLayout;
