import "./Button.css";

const Button = ({
	children,
	type = "button",
	variant = "primary",
	size = "md",
	fullWidth = false,
	loading = false,
	disabled = false,
	leftIcon = null,
	rightIcon = null,
	className = "",
	onClick,
	...props
}) => {
	const buttonClasses = [
		"btn",
		`btn--${variant}`,
		`btn--${size}`,
		fullWidth ? "btn--full" : "",
		loading ? "btn--loading" : "",
		className,
	]
		.filter(Boolean)
		.join(" ");

	const isDisabled = disabled || loading;

	return (
		<button
			type={type}
			className={buttonClasses}
			disabled={isDisabled}
			onClick={onClick}
			aria-busy={loading}
			{...props}
		>
			{loading ? (
				<>
					<span className="btn__spinner" aria-hidden="true" />

					<span className="btn__text">Cargando...</span>
				</>
			) : (
				<>
					{leftIcon && (
						<span className="btn__icon" aria-hidden="true">
							{leftIcon}
						</span>
					)}

					<span className="btn__text">{children}</span>

					{rightIcon && (
						<span className="btn__icon" aria-hidden="true">
							{rightIcon}
						</span>
					)}
				</>
			)}
		</button>
	);
};

export default Button;
