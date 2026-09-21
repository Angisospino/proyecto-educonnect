import { forwardRef, useId, useState } from "react";

import { Eye, EyeOff } from "lucide-react";

import "./Input.css";

const Input = forwardRef(
	(
		{
			id,
			name,
			label,
			type = "text",
			value,
			placeholder = "",
			error = "",
			helperText = "",
			required = false,
			disabled = false,
			readOnly = false,
			leftIcon = null,
			className = "",
			inputClassName = "",
			onChange,
			onBlur,
			...props
		},
		ref,
	) => {
		const generatedId = useId();

		const inputId = id || name || generatedId;

		const [showPassword, setShowPassword] = useState(false);

		const isPassword = type === "password";

		const inputType = isPassword && showPassword ? "text" : type;

		const inputClasses = [
			"input",
			error ? "input--error" : "",
			leftIcon ? "input--with-left-icon" : "",
			isPassword ? "input--with-right-icon" : "",
			inputClassName,
		]
			.filter(Boolean)
			.join(" ");

		const wrapperClasses = ["input-field", className].filter(Boolean).join(" ");

		const messageId = error || helperText ? `${inputId}-message` : undefined;

		return (
			<div className={wrapperClasses}>
				{label && (
					<label htmlFor={inputId} className="input-field__label">
						{label}

						{required && (
							<span className="input-field__required" aria-hidden="true">
								*
							</span>
						)}
					</label>
				)}

				<div className="input-field__control">
					{leftIcon && (
						<span className="input-field__left-icon" aria-hidden="true">
							{leftIcon}
						</span>
					)}

					<input
						ref={ref}
						id={inputId}
						name={name}
						type={inputType}
						value={value}
						placeholder={placeholder}
						required={required}
						disabled={disabled}
						readOnly={readOnly}
						className={inputClasses}
						onChange={onChange}
						onBlur={onBlur}
						aria-invalid={error ? "true" : undefined}
						aria-describedby={messageId}
						{...props}
					/>

					{isPassword && (
						<button
							type="button"
							className="input-field__password-button"
							onClick={() => setShowPassword((current) => !current)}
							disabled={disabled}
							aria-label={
								showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
							}
							title={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
						>
							{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
						</button>
					)}
				</div>

				{error ? (
					<p
						id={messageId}
						className="input-field__message input-field__message--error"
						role="alert"
					>
						{error}
					</p>
				) : (
					helperText && (
						<p id={messageId} className="input-field__message">
							{helperText}
						</p>
					)
				)}
			</div>
		);
	},
);

Input.displayName = "Input";

export default Input;
