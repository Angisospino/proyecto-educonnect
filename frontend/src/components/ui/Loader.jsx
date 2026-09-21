import "./Loader.css";

/**
 * Componente reutilizable para mostrar
 * estados de carga en EduConnect BR.
 *
 * Variantes:
 * - inline: dentro de componentes
 * - page: ocupa el área disponible
 * - fullscreen: cubre toda la pantalla
 *
 * Tamaños:
 * - sm
 * - md
 * - lg
 */
const Loader = ({
	message = "Cargando...",
	size = "md",
	variant = "page",
	showMessage = true,
	className = "",
}) => {
	const containerClasses = ["loader", `loader--${variant}`, className]
		.filter(Boolean)
		.join(" ");

	const spinnerClasses = ["loader__spinner", `loader__spinner--${size}`]
		.filter(Boolean)
		.join(" ");

	return (
		<div
			className={containerClasses}
			role="status"
			aria-live="polite"
			aria-busy="true"
		>
			<span className={spinnerClasses} aria-hidden="true" />

			{showMessage && message && <p className="loader__message">{message}</p>}

			<span className="sr-only">{message || "Cargando"}</span>
		</div>
	);
};

export default Loader;
