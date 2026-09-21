import { forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";

import "./Select.css";

const Select = forwardRef(
	(
		{
			id,
			name,
			label,
			value,
			options = [],
			placeholder = "Seleccione una opción",
			error = "",
			helperText = "",
			required = false,
			disabled = false,
			className = "",
			selectClassName = "",
			onChange,
			onBlur,
			...props
		},
		ref,
	) => {
		const generatedId = useId();

		const selectId = id || name || generatedId;

		const wrapperClasses = ["select-field", className]
			.filter(Boolean)
			.join(" ");

		const selectClasses = [
			"select-field__select",
			error ? "select-field__select--error" : "",
			!value ? "select-field__select--placeholder" : "",
			selectClassName,
		]
			.filter(Boolean)
			.join(" ");

		const messageId = error || helperText ? `${selectId}-message` : undefined;

		return (
			<div className={wrapperClasses}>
				{/* LABEL */}

				{label && (
					<label htmlFor={selectId} className="select-field__label">
						{label}

						{required && (
							<span className="select-field__required" aria-hidden="true">
								*
							</span>
						)}
					</label>
				)}

				{/* SELECT */}

				<div className="select-field__control">
					<select
						ref={ref}
						id={selectId}
						name={name}
						value={value}
						disabled={disabled}
						required={required}
						className={selectClasses}
						onChange={onChange}
						onBlur={onBlur}
						aria-invalid={error ? "true" : undefined}
						aria-describedby={messageId}
						{...props}
					>
						{placeholder && <option value="">{placeholder}</option>}

						{options.map((option) => (
							<option
								key={option.value}
								value={option.value}
								disabled={option.disabled ?? false}
							>
								{option.label}
							</option>
						))}
					</select>

					<ChevronDown
						className="select-field__icon"
						size={18}
						aria-hidden="true"
					/>
				</div>

				{/* ERROR / AYUDA */}

				{error ? (
					<p
						id={messageId}
						className="
              select-field__message
              select-field__message--error
            "
						role="alert"
					>
						{error}
					</p>
				) : (
					helperText && (
						<p id={messageId} className="select-field__message">
							{helperText}
						</p>
					)
				)}
			</div>
		);
	},
);

Select.displayName = "Select";

export default Select;
