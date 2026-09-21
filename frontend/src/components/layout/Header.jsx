import { useState } from "react";

import { LogOut, Menu, UserRound } from "lucide-react";

import { useNavigate } from "react-router-dom";

import { useAuth } from "../../hooks/useAuth.js";

import ConfirmDialog from "../ui/ConfirmDialog.jsx";

import { ROUTES, ROLE_LABELS } from "../../utils/constants.js";

import "./Header.css";

const Header = ({ title = "EduConnect BR", onMenuClick }) => {
	const navigate = useNavigate();

	const { user, logout } = useAuth();

	const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

	const [isLogoutOpen, setIsLogoutOpen] = useState(false);

	const [isLoggingOut, setIsLoggingOut] = useState(false);

	/* ==========================================
     NOMBRE COMPLETO
     ========================================== */

	const fullName = user
		? `${user.nombre ?? ""} ${user.apellido ?? ""}`.trim()
		: "Usuario";

	/* ==========================================
     INICIALES
     ========================================== */

	const initials = user
		? `${user.nombre?.[0] ?? ""}${user.apellido?.[0] ?? ""}`.toUpperCase()
		: "U";

	/* ==========================================
     ROL
     ========================================== */

	const roleLabel = ROLE_LABELS[user?.rol] || user?.rol || "Usuario";

	/* ==========================================
     PERFIL
     ========================================== */

	const handleProfile = () => {
		setIsUserMenuOpen(false);

		navigate(ROUTES.PROFILE);
	};

	/* ==========================================
     ABRIR LOGOUT
     ========================================== */

	const handleOpenLogout = () => {
		setIsUserMenuOpen(false);

		setIsLogoutOpen(true);
	};

	/* ==========================================
     CERRAR SESIÓN
     ========================================== */

	const handleLogout = async () => {
		try {
			setIsLoggingOut(true);

			await logout();
		} finally {
			setIsLoggingOut(false);

			setIsLogoutOpen(false);

			navigate(ROUTES.LOGIN, {
				replace: true,
			});
		}
	};

	return (
		<>
			<header className="header">
				{/* =====================================
            IZQUIERDA
            ===================================== */}

				<div className="header__left">
					<button
						type="button"
						className="header__menu-button"
						onClick={onMenuClick}
						aria-label="Abrir menú de navegación"
						title="Abrir menú"
					>
						<Menu size={22} />
					</button>

					<div className="header__title-container">
						<h1 className="header__title">{title}</h1>
					</div>
				</div>

				{/* =====================================
            DERECHA
            ===================================== */}

				<div className="header__right">
					<div className="header__user">
						<button
							type="button"
							className="header__user-button"
							onClick={() => setIsUserMenuOpen((previous) => !previous)}
							aria-expanded={isUserMenuOpen}
							aria-haspopup="menu"
						>
							{/* AVATAR */}

							<span className="header__avatar">{initials}</span>

							{/* INFORMACIÓN */}

							<span className="header__user-info">
								<span className="header__user-name">{fullName}</span>

								<span className="header__user-role">{roleLabel}</span>
							</span>
						</button>

						{/* MENÚ USUARIO */}

						{isUserMenuOpen && (
							<div className="header__user-menu" role="menu">
								<div className="header__user-menu-info">
									<strong>{fullName}</strong>

									<span>{user?.email}</span>
								</div>

								<div className="header__user-menu-divider" />

								<button
									type="button"
									className="header__user-menu-item"
									onClick={handleProfile}
									role="menuitem"
								>
									<UserRound size={18} />

									<span>Mi perfil</span>
								</button>

								<button
									type="button"
									className="
                    header__user-menu-item
                    header__user-menu-item--danger
                  "
									onClick={handleOpenLogout}
									role="menuitem"
								>
									<LogOut size={18} />

									<span>Cerrar sesión</span>
								</button>
							</div>
						)}
					</div>
				</div>
			</header>

			{/* =====================================
          CONFIRMAR LOGOUT
          ===================================== */}

			<ConfirmDialog
				isOpen={isLogoutOpen}
				onClose={() => setIsLogoutOpen(false)}
				onConfirm={handleLogout}
				title="Cerrar sesión"
				message="¿Desea cerrar su sesión en EduConnect BR?"
				confirmText="Cerrar sesión"
				cancelText="Cancelar"
				variant="question"
				loading={isLoggingOut}
			/>
		</>
	);
};

export default Header;
