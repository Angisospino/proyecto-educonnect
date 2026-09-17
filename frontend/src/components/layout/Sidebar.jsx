import {
	BarChart3,
	Bell,
	BookOpen,
	CalendarCheck,
	FileText,
	GraduationCap,
	Home,
	LogOut,
	Megaphone,
	Settings,
	ShieldCheck,
	UserRound,
	Users,
	X,
} from "lucide-react";

import { NavLink } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth.js";

import { ROLES, ROUTES } from "../../utils/constants.js";

import "./Sidebar.css";

const Sidebar = ({ isOpen = false, onClose }) => {
	const { user } = useAuth();

	/* ==========================================
     MENÚ SEGÚN ROL
     ========================================== */

	const menuItems = [
		{
			label: "Inicio",
			icon: Home,
			path: ROUTES.DASHBOARD,
			roles: [
				ROLES.ADMINISTRADOR,
				ROLES.DOCENTE,
				ROLES.ESTUDIANTE,
				ROLES.PADRE_FAMILIA,
				ROLES.DIRECTIVO,
			],
		},

		{
			label: "Usuarios",
			icon: Users,
			path: ROUTES.USERS,
			roles: [ROLES.ADMINISTRADOR],
		},

		{
			label: "Perfil",
			icon: UserRound,
			path: ROUTES.PROFILE,
			roles: [
				ROLES.ADMINISTRADOR,
				ROLES.DOCENTE,
				ROLES.ESTUDIANTE,
				ROLES.PADRE_FAMILIA,
				ROLES.DIRECTIVO,
			],
		},

		{
			label: "Notas",
			icon: GraduationCap,
			path: ROUTES.GRADES,
			roles: [
				ROLES.ADMINISTRADOR,
				ROLES.DOCENTE,
				ROLES.ESTUDIANTE,
				ROLES.PADRE_FAMILIA,
				ROLES.DIRECTIVO,
			],
		},

		{
			label: "Asistencia",
			icon: CalendarCheck,
			path: ROUTES.ATTENDANCE,
			roles: [
				ROLES.ADMINISTRADOR,
				ROLES.DOCENTE,
				ROLES.ESTUDIANTE,
				ROLES.PADRE_FAMILIA,
				ROLES.DIRECTIVO,
			],
		},

		{
			label: "Comunicados",
			icon: Megaphone,
			path: ROUTES.COMMUNICATIONS,
			roles: [
				ROLES.ADMINISTRADOR,
				ROLES.DOCENTE,
				ROLES.ESTUDIANTE,
				ROLES.PADRE_FAMILIA,
				ROLES.DIRECTIVO,
			],
		},

		{
			label: "Notificaciones",
			icon: Bell,
			path: ROUTES.NOTIFICATIONS,
			roles: [
				ROLES.ADMINISTRADOR,
				ROLES.DOCENTE,
				ROLES.ESTUDIANTE,
				ROLES.PADRE_FAMILIA,
				ROLES.DIRECTIVO,
			],
		},

		{
			label: "Reportes",
			icon: BarChart3,
			path: ROUTES.REPORTS,
			roles: [ROLES.ADMINISTRADOR, ROLES.DIRECTIVO],
		},

		{
			label: "Configuración",
			icon: Settings,
			path: ROUTES.SETTINGS,
			roles: [ROLES.ADMINISTRADOR],
		},
	];

	/* ==========================================
     FILTRAR POR ROL
     ========================================== */

	const visibleItems = menuItems.filter((item) =>
		item.roles.includes(user?.rol),
	);

	/* ==========================================
     CERRAR AL NAVEGAR
     ========================================== */

	const handleNavigation = () => {
		onClose?.();
	};

	return (
		<>
			{/* OVERLAY MÓVIL */}

			{isOpen && (
				<div className="sidebar-overlay" onClick={onClose} aria-hidden="true" />
			)}

			<aside
				className={["sidebar", isOpen ? "sidebar--open" : ""]
					.filter(Boolean)
					.join(" ")}
			>
				{/* =====================================
            HEADER
            ===================================== */}

				<div className="sidebar__header">
					<div className="sidebar__brand">
						<div className="sidebar__logo">
							<BookOpen size={24} />
						</div>

						<div className="sidebar__brand-text">
							<span className="sidebar__brand-name">EduConnect BR</span>

							<span className="sidebar__brand-subtitle">
								Plataforma educativa
							</span>
						</div>
					</div>

					<button
						type="button"
						className="sidebar__close"
						onClick={onClose}
						aria-label="Cerrar menú"
						title="Cerrar menú"
					>
						<X size={22} />
					</button>
				</div>

				{/* =====================================
            NAVEGACIÓN
            ===================================== */}

				<nav className="sidebar__navigation" aria-label="Menú principal">
					<ul className="sidebar__menu">
						{visibleItems.map((item) => {
							const Icon = item.icon;

							return (
								<li key={item.path} className="sidebar__menu-item">
									<NavLink
										to={item.path}
										onClick={handleNavigation}
										className={({ isActive }) =>
											["sidebar__link", isActive ? "sidebar__link--active" : ""]
												.filter(Boolean)
												.join(" ")
										}
									>
										<Icon className="sidebar__link-icon" size={20} />

										<span className="sidebar__link-label">{item.label}</span>
									</NavLink>
								</li>
							);
						})}
					</ul>
				</nav>

				{/* =====================================
            FOOTER
            ===================================== */}

				<div className="sidebar__footer">
					<div className="sidebar__institution">
						<ShieldCheck size={18} />

						<div>
							<span>I.E.D.</span>

							<strong>Bienvenido Rodríguez</strong>
						</div>
					</div>
				</div>
			</aside>
		</>
	);
};

export default Sidebar;
