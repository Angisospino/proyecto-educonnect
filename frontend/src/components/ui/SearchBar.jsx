import { Search, X } from "lucide-react";

import "./SearchBar.css";

const SearchBar = ({
	value = "",
	onChange,
	onClear,
	placeholder = "Buscar...",
	disabled = false,
	className = "",
	ariaLabel = "Buscar",
}) => {
	const handleChange = (event) => {
		onChange?.(event.target.value);
	};

	const handleClear = () => {
		onChange?.("");

		onClear?.();
	};

	const classes = [
		"search-bar",
		disabled ? "search-bar--disabled" : "",
		className,
	]
		.filter(Boolean)
		.join(" ");

	return (
		<div className={classes}>
			<Search className="search-bar__icon" size={18} aria-hidden="true" />

			<input
				type="search"
				className="search-bar__input"
				value={value}
				placeholder={placeholder}
				onChange={handleChange}
				disabled={disabled}
				aria-label={ariaLabel}
			/>

			{value && !disabled && (
				<button
					type="button"
					className="search-bar__clear"
					onClick={handleClear}
					aria-label="Limpiar búsqueda"
					title="Limpiar búsqueda"
				>
					<X size={18} />
				</button>
			)}
		</div>
	);
};

export default SearchBar;
