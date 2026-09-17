import { useEffect, useMemo, useState } from "react";

import { Eye, EyeOff, Save, UserPlus } from "lucide-react";

import usuarioService from "../../../services/usuario.service.js";

import Modal from "../../../components/ui/Modal.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import Button from "../../../components/ui/Button.jsx";

import {
	ROLES,
	ROLE_LABELS,
	ESTADOS_USUARIO,
	ESTADO_USUARIO_LABELS,
} from "../../../utils/constants.js";

import "./UsuarioForm.css";

/* ==========================================
   ESTADO INICIAL
   ========================================== */

const INITIAL_FORM = {
	nombre: "",
	apellido: "",
	email: "",
	rol: "",
	estado: ESTADOS_USUARIO.ACTIVO,
	password: "",
	confirmPassword: "",
};

/* ==========================================
   OPCIONES
   ========================================== */

const roleOptions = Object.values(ROLES).map((rol) => ({
	value: rol,
	label: ROLE_LABELS[rol] || rol,
}));

const estadoOptions = Object.values(ESTADOS_USUARIO).map((estado) => ({
	value: estado,
	label: ESTADO_USUARIO_LABELS[estado] || estado,
}));

/* ==========================================
   VALIDACIÓN DE EMAIL
   ========================================== */

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ==========================================
   COMPONENTE
   ========================================== */

const UsuarioForm = ({ isOpen, onClose, usuario = null, onSuccess }) => {
	const [formData, setFormData] = useState(INITIAL_FORM);

	const [errors, setErrors] = useState({});

	const [apiError, setApiError] = useState("");

	const [loading, setLoading] = useState(false);

	const [showPassword, setShowPassword] = useState(false);

	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	/* ========================================
     MODO EDICIÓN
     ======================================== */

	const isEditing = Boolean(usuario?.id);

	/* ========================================
     TÍTULO
     ======================================== */

	const modalTitle = isEditing ? "Editar usuario" : "Crear usuario";

	/* ========================================
     CARGAR DATOS
     ======================================== */

	useEffect(() => {
		if (!isOpen) {
			return;
		}

		setErrors({});
		setApiError("");
		setShowPassword(false);
		setShowConfirmPassword(false);

		if (usuario) {
			setFormData({
				nombre: usuario.nombre || "",

				apellido: usuario.apellido || "",

				email: usuario.email || "",

				rol: usuario.rol || "",

				estado: usuario.estado || ESTADOS_USUARIO.ACTIVO,

				password: "",

				confirmPassword: "",
			});

			return;
		}

		setFormData({
			...INITIAL_FORM,
		});
	}, [usuario, isOpen]);

	/* ========================================
     ¿SE MODIFICARÁ LA CONTRASEÑA?
     ======================================== */

	const isPasswordRequired = !isEditing;

	const isChangingPassword = Boolean(
		formData.password || formData.confirmPassword,
	);

	/* ========================================
     CAMBIOS
     ======================================== */

	const handleChange = (event) => {
		const { name, value } = event.target;

		setFormData((previous) => ({
			...previous,
			[name]: value,
		}));

		/*
		 * Elimina el error del campo
		 * mientras el usuario corrige.
		 */

		if (errors[name]) {
			setErrors((previous) => ({
				...previous,
				[name]: "",
			}));
		}

		if (apiError) {
			setApiError("");
		}
	};

	/* ========================================
     VALIDACIÓN
     ======================================== */

	const validateForm = () => {
		const newErrors = {};

		/* NOMBRE */

		if (!formData.nombre.trim()) {
			newErrors.nombre = "El nombre es obligatorio.";
		} else if (formData.nombre.trim().length < 2) {
			newErrors.nombre = "El nombre debe tener al menos 2 caracteres.";
		}

		/* APELLIDO */

		if (!formData.apellido.trim()) {
			newErrors.apellido = "El apellido es obligatorio.";
		} else if (formData.apellido.trim().length < 2) {
			newErrors.apellido = "El apellido debe tener al menos 2 caracteres.";
		}

		/* EMAIL */

		const email = formData.email.trim().toLowerCase();

		if (!email) {
			newErrors.email = "El correo electrónico es obligatorio.";
		} else if (!EMAIL_REGEX.test(email)) {
			newErrors.email = "Ingrese un correo electrónico válido.";
		}

		/* ROL */

		if (!formData.rol) {
			newErrors.rol = "Seleccione un rol.";
		} else if (!Object.values(ROLES).includes(formData.rol)) {
			newErrors.rol = "El rol seleccionado no es válido.";
		}

		/* ESTADO */

		if (
			isEditing &&
			!Object.values(ESTADOS_USUARIO).includes(formData.estado)
		) {
			newErrors.estado = "Seleccione un estado válido.";
		}

		/* CONTRASEÑA */

		if (isPasswordRequired && !formData.password) {
			newErrors.password = "La contraseña es obligatoria.";
		}

		if (formData.password && formData.password.length < 8) {
			newErrors.password = "La contraseña debe tener al menos 8 caracteres.";
		}

		/*
		 * En edición no es obligatorio
		 * cambiar la contraseña.
		 *
		 * Pero si escribe una nueva,
		 * debe confirmarla.
		 */

		if (
			(isPasswordRequired || isChangingPassword) &&
			!formData.confirmPassword
		) {
			newErrors.confirmPassword = "Confirme la contraseña.";
		}

		if (
			(formData.password || formData.confirmPassword) &&
			formData.password !== formData.confirmPassword
		) {
			newErrors.confirmPassword = "Las contraseñas no coinciden.";
		}

		setErrors(newErrors);

		return Object.keys(newErrors).length === 0;
	};

	/* ========================================
     CONSTRUIR PAYLOAD
     ======================================== */

	const buildPayload = () => {
		const payload = {
			nombre: formData.nombre.trim(),

			apellido: formData.apellido.trim(),

			email: formData.email.trim().toLowerCase(),

			rol: formData.rol,
		};

		/*
		 * En creación el backend asigna
		 * ACTIVO por defecto.
		 *
		 * En edición sí podemos enviar
		 * el estado seleccionado.
		 */

		if (isEditing) {
			payload.estado = formData.estado;
		}

		/*
		 * Nunca enviamos una contraseña
		 * vacía en modo edición.
		 */

		if (formData.password) {
			payload.password = formData.password;
		}

		return payload;
	};

	/* ========================================
     SUBMIT
     ======================================== */

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (loading) {
			return;
		}

		if (!validateForm()) {
			return;
		}

		try {
			setLoading(true);
			setApiError("");

			const payload = buildPayload();

			let response;

			/* CREAR */

			if (!isEditing) {
				response = await usuarioService.crearUsuario(payload);
			}

			/* EDITAR */

			if (isEditing) {
				response = await usuarioService.actualizarUsuario(usuario.id, payload);
			}

			/*
			 * Notificamos al componente padre.
			 * Usuarios.jsx cerrará el formulario
			 * y recargará la lista.
			 */

			await onSuccess?.(response);
		} catch (error) {
			console.error("Error guardando usuario:", error);

			const status = error.response?.status;

			const message =
				error.response?.data?.message || error.response?.data?.error;

			/* EMAIL DUPLICADO */

			if (status === 409) {
				setErrors((previous) => ({
					...previous,
					email: message || "Ya existe un usuario con este correo electrónico.",
				}));

				return;
			}

			/* VALIDACIÓN BACKEND */

			if (status === 400) {
				setApiError(message || "Revise la información ingresada.");

				return;
			}

			/* ERROR GENERAL */

			setApiError(
				message || "No fue posible guardar el usuario. Intente nuevamente.",
			);
		} finally {
			setLoading(false);
		}
	};

	/* ========================================
     CERRAR
     ======================================== */

	const handleClose = () => {
		if (loading) {
			return;
		}

		setErrors({});
		setApiError("");

		onClose?.();
	};

	/* ========================================
     TEXTO BOTÓN
     ======================================== */

	const submitText = useMemo(() => {
		if (loading) {
			return isEditing ? "Guardando..." : "Creando...";
		}

		return isEditing ? "Guardar cambios" : "Crear usuario";
	}, [loading, isEditing]);

	/* ========================================
     RENDER
     ======================================== */

	return (
		<Modal
			isOpen={isOpen}
			onClose={handleClose}
			title={modalTitle}
			size="lg"
			closeOnOverlay={!loading}
			showCloseButton={!loading}
			footer={
				<>
					<Button
						type="button"
						variant="outline"
						onClick={handleClose}
						disabled={loading}
					>
						Cancelar
					</Button>

					<Button
						type="submit"
						form="usuario-form"
						loading={loading}
						disabled={loading}
						icon={isEditing ? <Save size={18} /> : <UserPlus size={18} />}
					>
						{submitText}
					</Button>
				</>
			}
		>
			<form
				id="usuario-form"
				className="usuario-form"
				onSubmit={handleSubmit}
				noValidate
			>
				{/* =================================
            ERROR API
            ================================= */}

				{apiError && (
					<div className="usuario-form__alert" role="alert">
						{apiError}
					</div>
				)}

				{/* =================================
            INFORMACIÓN PERSONAL
            ================================= */}

				<div className="usuario-form__section">
					<div className="usuario-form__section-header">
						<h3>Información personal</h3>

						<p>Ingrese los datos básicos del usuario.</p>
					</div>

					<div className="usuario-form__grid">
						<Input
							label="Nombre"
							name="nombre"
							value={formData.nombre}
							onChange={handleChange}
							placeholder="Ej. Carlos"
							error={errors.nombre}
							required
							disabled={loading}
							autoComplete="given-name"
						/>

						<Input
							label="Apellido"
							name="apellido"
							value={formData.apellido}
							onChange={handleChange}
							placeholder="Ej. Martínez"
							error={errors.apellido}
							required
							disabled={loading}
							autoComplete="family-name"
						/>
					</div>

					<Input
						type="email"
						label="Correo electrónico"
						name="email"
						value={formData.email}
						onChange={handleChange}
						placeholder="usuario@educonnectbr.edu.co"
						error={errors.email}
						required
						disabled={loading}
						autoComplete="email"
					/>
				</div>

				{/* =================================
            ACCESO
            ================================= */}

				<div className="usuario-form__section">
					<div className="usuario-form__section-header">
						<h3>Acceso al sistema</h3>

						<p>Defina el rol y las credenciales de acceso.</p>
					</div>

					<div className="usuario-form__grid">
						<Select
							label="Rol"
							name="rol"
							value={formData.rol}
							onChange={handleChange}
							options={roleOptions}
							placeholder="Seleccione un rol"
							error={errors.rol}
							required
							disabled={loading}
						/>

						{isEditing && (
							<Select
								label="Estado"
								name="estado"
								value={formData.estado}
								onChange={handleChange}
								options={estadoOptions}
								placeholder="Seleccione un estado"
								error={errors.estado}
								required
								disabled={loading}
							/>
						)}
					</div>

					{/* CONTRASEÑA */}

					<div className="usuario-form__grid">
						<Input
							type={showPassword ? "text" : "password"}
							label={isEditing ? "Nueva contraseña" : "Contraseña"}
							name="password"
							value={formData.password}
							onChange={handleChange}
							placeholder={
								isEditing
									? "Dejar vacío para conservar la actual"
									: "Mínimo 8 caracteres"
							}
							error={errors.password}
							helperText={
								isEditing
									? "Complete este campo únicamente si desea cambiar la contraseña."
									: "La contraseña debe tener al menos 8 caracteres."
							}
							required={!isEditing}
							disabled={loading}
							autoComplete="new-password"
							rightIcon={
								<button
									type="button"
									className="usuario-form__password-button"
									onClick={() => setShowPassword((previous) => !previous)}
									aria-label={
										showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
									}
									title={
										showPassword ? "Ocultar contraseña" : "Mostrar contraseña"
									}
									tabIndex={-1}
								>
									{showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
								</button>
							}
						/>

						<Input
							type={showConfirmPassword ? "text" : "password"}
							label={
								isEditing
									? "Confirmar nueva contraseña"
									: "Confirmar contraseña"
							}
							name="confirmPassword"
							value={formData.confirmPassword}
							onChange={handleChange}
							placeholder="Repita la contraseña"
							error={errors.confirmPassword}
							required={!isEditing}
							disabled={loading}
							autoComplete="new-password"
							rightIcon={
								<button
									type="button"
									className="usuario-form__password-button"
									onClick={() =>
										setShowConfirmPassword((previous) => !previous)
									}
									aria-label={
										showConfirmPassword
											? "Ocultar contraseña"
											: "Mostrar contraseña"
									}
									title={
										showConfirmPassword
											? "Ocultar contraseña"
											: "Mostrar contraseña"
									}
									tabIndex={-1}
								>
									{showConfirmPassword ? (
										<EyeOff size={18} />
									) : (
										<Eye size={18} />
									)}
								</button>
							}
						/>
					</div>
				</div>
			</form>
		</Modal>
	);
};

export default UsuarioForm;
