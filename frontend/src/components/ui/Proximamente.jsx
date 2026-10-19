import { Clock } from "lucide-react";

import Badge from "./Badge.jsx";
import EmptyState from "./EmptyState.jsx";

import "./Proximamente.css";

/**
 * Página "Próximamente" para módulos cuya ruta ya existe pero cuya
 * funcionalidad todavía no está construida.
 *
 * @param {string} titulo - Título de la página (nombre del módulo).
 * @param {string} descripcion - Qué podrá hacer el usuario cuando esté listo.
 * @param {Function} icon - Ícono de lucide-react (por defecto, un reloj).
 */
const Proximamente = ({ titulo, descripcion = "", icon = Clock }) => {
	return (
		<section className="proximamente-page">
			<div className="proximamente-page__header">
				<h2 className="proximamente-page__title">{titulo}</h2>

				<Badge variant="primary">Próximamente</Badge>
			</div>

			<div className="proximamente-page__card">
				<EmptyState
					icon={icon}
					title="Este módulo estará disponible próximamente"
					description={descripcion}
				/>
			</div>
		</section>
	);
};

export default Proximamente;
