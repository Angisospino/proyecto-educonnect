import { isValidElement } from "react";

import { Inbox } from "lucide-react";

import "./EmptyState.css";

const EmptyState = ({
	icon = null,
	title = "No hay información disponible",
	description = "",
	action = null,
	secondaryAction = null,
	className = "",
	compact = false,
}) => {
	const classes = [
		"empty-state",
		compact ? "empty-state--compact" : "",
		className,
	]
		.filter(Boolean)
		.join(" ");

	const Icon = icon || Inbox;

	return (
		<div className={classes} role="status">
			{/* ICONO */}

			<div className="empty-state__icon" aria-hidden="true">
				{isValidElement(Icon) ? Icon : <Icon size={38} />}
			</div>

			{/* CONTENIDO */}

			<div className="empty-state__content">
				<h3 className="empty-state__title">{title}</h3>

				{description && (
					<p className="empty-state__description">{description}</p>
				)}
			</div>

			{/* ACCIONES */}

			{(action || secondaryAction) && (
				<div className="empty-state__actions">
					{secondaryAction}

					{action}
				</div>
			)}
		</div>
	);
};

export default EmptyState;
