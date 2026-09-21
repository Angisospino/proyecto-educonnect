import {
	Bell,
	BookOpen,
	CalendarCheck,
	FileText,
	GraduationCap,
	Megaphone,
	Settings,
	ShieldCheck,
	UserRound,
	Users,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth.js";

import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";

import { ROLE_LABELS, ROLES, ROUTES } from "../../utils/constants.js";

import "./Dashboard.css";

/* ==========================================
   CONFIGURACIÓN DE ACCESOS POR ROL
   ========================================== */

const QUICK_ACTIONS = [
	{
		id: "perfil",
		title: "Mi perfil",
		description: "Consulta y actualiza tu información personal.",
		icon: UserRound,
		route: ROUTES.PROFILE,
		roles: [
			ROLES.ADMINISTRADOR,
			ROLES.DOCENTE,
			ROLES.ESTUDIANTE,
			ROLES.PADRE_FAMILIA,
			ROLES.DIRECTIVO,
		],
		enabled: true,
	},

	{
		id: "usuarios",
		title: "Gestión de usuarios",
		description: "Administra las cuentas institucionales y sus estados.",
		icon: Users,
		route: ROUTES.USERS,
		roles: [ROLES.ADMINISTRADOR],
		enabled: true,
	},

	{
		id: "notas",
		title: "Notas",
		description: "Consulta y gestiona la información académica.",
		icon: GraduationCap,
		route: ROUTES.GRADES,
		roles: [
			ROLES.ADMINISTRADOR,
			ROLES.DOCENTE,
			ROLES.ESTUDIANTE,
			ROLES.PADRE_FAMILIA,
			ROLES.DIRECTIVO,
		],
		enabled: false,
	},

	{
		id: "asistencia",
		title: "Asistencia",
		description: "Consulta y registra la asistencia académica.",
		icon: CalendarCheck,
		route: ROUTES.ATTENDANCE,
		roles: [
			ROLES.ADMINISTRADOR,
			ROLES.DOCENTE,
			ROLES.ESTUDIANTE,
			ROLES.PADRE_FAMILIA,
			ROLES.DIRECTIVO,
		],
		enabled: false,
	},

	{
		id: "comunicados",
		title: "Comunicados",
		description: "Consulta información y anuncios institucionales.",
		icon: Megaphone,
		route: ROUTES.COMMUNICATIONS,
		roles: [
			ROLES.ADMINISTRADOR,
			ROLES.DOCENTE,
			ROLES.ESTUDIANTE,
			ROLES.PADRE_FAMILIA,
			ROLES.DIRECTIVO,
		],
		enabled: false,
	},

	{
		id: "notificaciones",
		title: "Notificaciones",
		description: "Revisa las novedades relacionadas con tu cuenta.",
		icon: Bell,
		route: ROUTES.NOTIFICATIONS,
		roles: [
			ROLES.ADMINISTRADOR,
			ROLES.DOCENTE,
			ROLES.ESTUDIANTE,
			ROLES.PADRE_FAMILIA,
			ROLES.DIRECTIVO,
		],
		enabled: false,
	},

	{
		id: "reportes",
		title: "Reportes",
		description: "Consulta reportes académicos y administrativos.",
		icon: FileText,
		route: ROUTES.REPORTS,
		roles: [ROLES.ADMINISTRADOR, ROLES.DIRECTIVO],
		enabled: false,
	},

	{
		id: "configuracion",
		title: "Configuración",
		description: "Administra parámetros generales de la plataforma.",
		icon: Settings,
		route: ROUTES.SETTINGS,
		roles: [ROLES.ADMINISTRADOR],
		enabled: false,
	},
];

/* ==========================================
   MENSAJES SEGÚN ROL
   ========================================== */

const ROLE_DESCRIPTIONS = {
	[ROLES.ADMINISTRADOR]:
		"Desde aquí puedes administrar usuarios y supervisar la plataforma.",

	[ROLES.DOCENTE]:
		"Desde aquí podrás gestionar los procesos académicos asignados.",

	[ROLES.ESTUDIANTE]: "Desde aquí podrás consultar tu información académica.",

	[ROLES.PADRE_FAMILIA]:
		"Desde aquí podrás consultar la información académica disponible.",

	[ROLES.DIRECTIVO]:
		"Desde aquí podrás consultar información académica y administrativa.",
};

/* ==========================================
   COMPONENTE
   ========================================== */

const Dashboard = () => {
	const navigate = useNavigate();

	const { user } = useAuth();

	/* ========================================
     DATOS DEL USUARIO
     ======================================== */

	const nombre = user?.nombre || "Usuario";

	const apellido = user?.apellido || "";

	const nombreCompleto = `${nombre} ${apellido}`.trim();

	const rol = user?.rol;

	const rolLabel = ROLE_LABELS[rol] || "Usuario";

	const descripcionRol =
		ROLE_DESCRIPTIONS[rol] || "Bienvenido a EduConnect BR.";

	/* ========================================
     ACCIONES DISPONIBLES
     ======================================== */

	const accionesDisponibles = QUICK_ACTIONS.filter((action) =>
		action.roles.includes(rol),
	);

	/* ========================================
     NAVEGAR
     ======================================== */

	const handleNavigate = (action) => {
		if (!action.enabled) {
			return;
		}

		navigate(action.route);
	};

	/* ========================================
     RENDER
     ======================================== */

	return (
		<section className="dashboard-page">
			{/* ===================================
          BIENVENIDA
          =================================== */}

			<header className="dashboard-page__hero">
				<div className="dashboard-page__hero-content">
					<div className="dashboard-page__welcome">
						<span className="dashboard-page__eyebrow">
							Bienvenido a EduConnect BR
						</span>

						<h1 className="dashboard-page__title">Hola, {nombreCompleto}</h1>

						<p className="dashboard-page__description">{descripcionRol}</p>
					</div>

					<div className="dashboard-page__role">
						<ShieldCheck size={20} aria-hidden="true" />

						<span>Rol actual</span>

						<Badge variant="primary" size="md">
							{rolLabel}
						</Badge>
					</div>
				</div>
			</header>

			{/* ===================================
          RESUMEN
          =================================== */}

			<section
				className="dashboard-page__summary"
				aria-label="Resumen de la cuenta"
			>
				<article className="dashboard-summary-card">
					<div className="dashboard-summary-card__icon">
						<UserRound size={24} aria-hidden="true" />
					</div>

					<div className="dashboard-summary-card__content">
						<span className="dashboard-summary-card__label">Usuario</span>

						<strong className="dashboard-summary-card__value">
							{nombreCompleto}
						</strong>
					</div>
				</article>

				<article className="dashboard-summary-card">
					<div className="dashboard-summary-card__icon">
						<ShieldCheck size={24} aria-hidden="true" />
					</div>

					<div className="dashboard-summary-card__content">
						<span className="dashboard-summary-card__label">Rol</span>

						<strong className="dashboard-summary-card__value">
							{rolLabel}
						</strong>
					</div>
				</article>

				<article className="dashboard-summary-card">
					<div className="dashboard-summary-card__icon">
						<BookOpen size={24} aria-hidden="true" />
					</div>

					<div className="dashboard-summary-card__content">
						<span className="dashboard-summary-card__label">Plataforma</span>

						<strong className="dashboard-summary-card__value">
							EduConnect BR
						</strong>
					</div>
				</article>
			</section>

			{/* ===================================
          ACCESOS RÁPIDOS
          =================================== */}

			<section className="dashboard-page__section">
				<div className="dashboard-page__section-header">
					<div>
						<h2 className="dashboard-page__section-title">Accesos rápidos</h2>

						<p className="dashboard-page__section-description">
							Selecciona una opción para continuar.
						</p>
					</div>
				</div>

				<div className="dashboard-actions">
					{accionesDisponibles.map((action) => {
						const Icon = action.icon;

						return (
							<article
								key={action.id}
								className={[
									"dashboard-action-card",
									!action.enabled ? "dashboard-action-card--disabled" : "",
								]
									.filter(Boolean)
									.join(" ")}
							>
								<div className="dashboard-action-card__top">
									<div className="dashboard-action-card__icon">
										<Icon size={26} aria-hidden="true" />
									</div>

									{!action.enabled && (
										<Badge variant="neutral" size="sm">
											Próximamente
										</Badge>
									)}
								</div>

								<div className="dashboard-action-card__content">
									<h3 className="dashboard-action-card__title">
										{action.title}
									</h3>

									<p className="dashboard-action-card__description">
										{action.description}
									</p>
								</div>

								<div className="dashboard-action-card__footer">
									<Button
										type="button"
										variant={action.enabled ? "primary" : "outline"}
										disabled={!action.enabled}
										onClick={() => handleNavigate(action)}
									>
										{action.enabled ? "Ir al módulo" : "No disponible"}
									</Button>
								</div>
							</article>
						);
					})}
				</div>
			</section>
		</section>
	);
};

export default Dashboard;
