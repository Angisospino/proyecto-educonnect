import { useEffect, useRef } from "react";

import { X } from "lucide-react";

import "./Modal.css";

const Modal = ({
	isOpen,
	onClose,
	title,
	children,
	footer = null,
	size = "md",
	closeOnOverlay = true,
	showCloseButton = true,
	className = "",
}) => {
	const modalRef = useRef(null);

	/* ==========================================
     CERRAR CON ESCAPE
     ========================================== */

	useEffect(() => {
		if (!isOpen) {
			return undefined;
		}

		const handleKeyDown = (event) => {
			if (event.key === "Escape") {
				onClose?.();
			}
		};

		document.addEventListener("keydown", handleKeyDown);

		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, onClose]);

	/* ==========================================
     BLOQUEAR SCROLL DEL BODY
     ========================================== */

	useEffect(() => {
		if (!isOpen) {
			return undefined;
		}

		const previousOverflow = document.body.style.overflow;

		document.body.style.overflow = "hidden";

		return () => {
			document.body.style.overflow = previousOverflow;
		};
	}, [isOpen]);

	/* ==========================================
     FOCUS
     ========================================== */

	useEffect(() => {
		if (isOpen && modalRef.current) {
			modalRef.current.focus();
		}
	}, [isOpen]);

	/* ==========================================
     CLIC EN OVERLAY
     ========================================== */

	const handleOverlayClick = (event) => {
		if (event.target === event.currentTarget && closeOnOverlay) {
			onClose?.();
		}
	};

	/* ==========================================
     NO RENDERIZAR
     ========================================== */

	if (!isOpen) {
		return null;
	}

	/* ==========================================
     CLASES
     ========================================== */

	const modalClasses = ["modal", `modal--${size}`, className]
		.filter(Boolean)
		.join(" ");

	/* ==========================================
     RENDER
     ========================================== */

	return (
		<div
			className="modal-overlay"
			onMouseDown={handleOverlayClick}
			role="presentation"
		>
			<section
				ref={modalRef}
				className={modalClasses}
				role="dialog"
				aria-modal="true"
				aria-labelledby={title ? "modal-title" : undefined}
				tabIndex={-1}
			>
				{/* HEADER */}

				{(title || showCloseButton) && (
					<header className="modal__header">
						{title && (
							<h2 id="modal-title" className="modal__title">
								{title}
							</h2>
						)}

						{showCloseButton && (
							<button
								type="button"
								className="modal__close"
								onClick={onClose}
								aria-label="Cerrar modal"
								title="Cerrar"
							>
								<X size={20} />
							</button>
						)}
					</header>
				)}

				{/* BODY */}

				<div className="modal__body">{children}</div>

				{/* FOOTER */}

				{footer && <footer className="modal__footer">{footer}</footer>}
			</section>
		</div>
	);
};

export default Modal;
