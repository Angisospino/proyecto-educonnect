import { Outlet } from "react-router-dom";
import { GraduationCap } from "lucide-react";

import "./AuthLayout.css";

const AuthLayout = () => {
	const currentYear = new Date().getFullYear();

	return (
		<div className="auth-layout">
			{/* ======================================
          PANEL INSTITUCIONAL
          ====================================== */}

			<section className="auth-layout__brand">
				<div className="auth-layout__brand-content">
					<div className="auth-layout__logo" aria-hidden="true">
						<GraduationCap size={42} />
					</div>

					<h1 className="auth-layout__title">EduConnect BR</h1>

					<p className="auth-layout__institution">
						I.E.D. Bienvenido Rodríguez
					</p>

					<p className="auth-layout__description">
						Plataforma para la gestión y comunicación de la comunidad educativa.
					</p>
				</div>

				<div className="auth-layout__decoration auth-layout__decoration--one" />
				<div className="auth-layout__decoration auth-layout__decoration--two" />
			</section>

			{/* ======================================
          CONTENIDO
          ====================================== */}

			<main className="auth-layout__main">
				<div className="auth-layout__content">
					<Outlet />
				</div>

				<footer className="auth-layout__footer">
					<p>© {currentYear} EduConnect BR</p>

					<p>I.E.D. Bienvenido Rodríguez</p>
				</footer>
			</main>
		</div>
	);
};

export default AuthLayout;
