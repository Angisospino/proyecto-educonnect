import {
	AlertTriangle,
	CheckCircle2,
	HelpCircle,
	Info,
	XCircle,
} from "lucide-react";

import Modal from "./Modal.jsx";
import Button from "./Button.jsx";

import "./ConfirmDialog.css";

const ICONS = {
	warning: AlertTriangle,
	danger: XCircle,
	info: Info,
	success: CheckCircle2,
	question: HelpCircle,
};

const ConfirmDialog = ({
	isOpen,
	onClose,
	onConfirm,

	title = "Confirmar acción",

	message = "¿Está seguro de que desea continuar?",

	confirmText = "Confirmar",

	cancelText = "Cancelar",

	variant = "warning",

	loading = false,

	closeOnOverlay = true,
}) => {
	const Icon = ICONS[variant] || AlertTriangle;

	/* ==========================================
     CONFIRMAR
     ========================================== */

	const handleConfirm = async () => {
		if (loading) {
			return;
		}

		await onConfirm?.();
	};

	/* ==========================================
     CERRAR
     ========================================== */

	const handleClose = () => {
		if (loading) {
			return;
		}

		onClose?.();
	};

	/* ==========================================
     VARIANTE DEL BOTÓN
     ========================================== */

	const getButtonVariant = () => {
		switch (variant) {
			case "danger":
				return "danger";

			case "success":
				return "success";

			case "info":
				return "primary";

			case "question":
				return "primary";

			case "warning":
			default:
				return "warning";
		}
	};

	/* ==========================================
     RENDER
     ========================================== */

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			size="sm"
			showCloseButton={!loading}
			closeOnOverlay={closeOnOverlay && !loading}
		>
			<div className="confirm-dialog">
				{/* ICONO */}

				<div
					className={`
            confirm-dialog__icon
            confirm-dialog__icon--${variant}
          `}
					aria-hidden="true"
				>
					<Icon size={30} />
				</div>

				{/* CONTENIDO */}

				<div className="confirm-dialog__content">
					<h2 className="confirm-dialog__title">{title}</h2>

					<p className="confirm-dialog__message">{message}</p>
				</div>

				{/* ACCIONES */}

				<div className="confirm-dialog__actions">
					<Button variant="outline" onClick={handleClose} disabled={loading}>
						{cancelText}
					</Button>

					<Button
						variant={getButtonVariant()}
						onClick={handleConfirm}
						loading={loading}
						disabled={loading}
					>
						{confirmText}
					</Button>
				</div>
			</div>
		</Modal>
	);
};

export default ConfirmDialog;
