import "./Badge.css";

const Badge = ({
	children,
	variant = "neutral",
	size = "md",
	dot = false,
	icon = null,
	className = "",
	...props
}) => {
	const badgeClasses = [
		"badge",
		`badge--${variant}`,
		`badge--${size}`,
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<span className={badgeClasses} {...props}>
			{dot && <span className="badge__dot" aria-hidden="true" />}

			{icon && (
				<span className="badge__icon" aria-hidden="true">
					{icon}
				</span>
			)}

			<span className="badge__text">{children}</span>
		</span>
	);
};

export default Badge;
