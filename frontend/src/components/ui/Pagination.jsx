import { ChevronLeft, ChevronRight } from "lucide-react";

import "./Pagination.css";

const Pagination = ({
	currentPage = 1,
	totalPages = 1,
	onPageChange,
	siblingCount = 1,
	disabled = false,
	className = "",
}) => {
	/* ==========================================
     VALIDACIONES
     ========================================== */

	if (totalPages <= 1 || currentPage < 1) {
		return null;
	}

	/* ==========================================
     CAMBIAR PÁGINA
     ========================================== */

	const handlePageChange = (page) => {
		if (disabled) {
			return;
		}

		if (page < 1 || page > totalPages || page === currentPage) {
			return;
		}

		onPageChange?.(page);
	};

	/* ==========================================
     GENERAR PÁGINAS
     ========================================== */

	const generatePages = () => {
		const pages = [];

		const startPage = Math.max(2, currentPage - siblingCount);

		const endPage = Math.min(totalPages - 1, currentPage + siblingCount);

		/* PRIMERA PÁGINA */

		pages.push(1);

		/* PUNTOS SUSPENSIVOS IZQUIERDA */

		if (startPage > 2) {
			pages.push("ellipsis-left");
		}

		/* PÁGINAS CENTRALES */

		for (let page = startPage; page <= endPage; page += 1) {
			pages.push(page);
		}

		/* PUNTOS SUSPENSIVOS DERECHA */

		if (endPage < totalPages - 1) {
			pages.push("ellipsis-right");
		}

		/* ÚLTIMA PÁGINA */

		if (totalPages > 1) {
			pages.push(totalPages);
		}

		return pages;
	};

	const pages = generatePages();

	const classes = [
		"pagination",
		disabled ? "pagination--disabled" : "",
		className,
	]
		.filter(Boolean)
		.join(" ");

	/* ==========================================
     RENDER
     ========================================== */

	return (
		<nav className={classes} aria-label="Paginación">
			{/* ANTERIOR */}

			<button
				type="button"
				className="
          pagination__button
          pagination__button--navigation
        "
				onClick={() => handlePageChange(currentPage - 1)}
				disabled={disabled || currentPage === 1}
				aria-label="Página anterior"
				title="Página anterior"
			>
				<ChevronLeft size={18} />

				<span className="pagination__navigation-text">Anterior</span>
			</button>

			{/* PÁGINAS */}

			<div className="pagination__pages">
				{pages.map((page) => {
					if (typeof page === "string") {
						return (
							<span
								key={page}
								className="pagination__ellipsis"
								aria-hidden="true"
							>
								...
							</span>
						);
					}

					const isActive = page === currentPage;

					return (
						<button
							key={page}
							type="button"
							className={[
								"pagination__button",
								"pagination__button--page",
								isActive ? "pagination__button--active" : "",
							]
								.filter(Boolean)
								.join(" ")}
							onClick={() => handlePageChange(page)}
							disabled={disabled}
							aria-label={`Ir a la página ${page}`}
							aria-current={isActive ? "page" : undefined}
						>
							{page}
						</button>
					);
				})}
			</div>

			{/* SIGUIENTE */}

			<button
				type="button"
				className="
          pagination__button
          pagination__button--navigation
        "
				onClick={() => handlePageChange(currentPage + 1)}
				disabled={disabled || currentPage === totalPages}
				aria-label="Página siguiente"
				title="Página siguiente"
			>
				<span className="pagination__navigation-text">Siguiente</span>

				<ChevronRight size={18} />
			</button>
		</nav>
	);
};

export default Pagination;
