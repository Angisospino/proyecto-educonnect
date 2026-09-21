import { useEffect, useMemo, useState } from "react";

import {
	Camera,
	Eye,
	EyeOff,
	KeyRound,
	Mail,
	Save,
	ShieldCheck,
	UserRound,
} from "lucide-react";

import { useAuth } from "../../hooks/useAuth.js";

import perfilService from "../../services/perfil.service.js";

import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";
import Loader from "../../components/ui/Loader.jsx";

import { ROLE_LABELS } from "../../utils/constants.js";

import "./Perfil.css";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const INITIAL_FORM = {
	nombre: "",
	apellido: "",
	email: "",
};

const INITIAL_PASSWORD_FORM = {
	passwordActual: "",
	nuevaPassword: "",
	confirmarPassword: "",
};

const Perfil = () => {
	const { user, setUser } = useAuth();

	/* ==========================================
     ESTADO DEL PERFIL
     ========================================== */

	const [perfil, setPerfil] = useState(null);

	const [formData, setFormData] = useState(INITIAL_FORM);

	const [errors, setErrors] = useState({});

	const [loading, setLoading] = useState(true);

	const [saving, setSaving] = useState(false);

	const [error, setError] = useState("");

	const [success, setSuccess] = useState("");

	/* ==========================================
     CONTRASEÑA
     ========================================== */

	const [passwordForm, setPasswordForm] = useState(INITIAL_PASSWORD_FORM);

	const [passwordErrors, setPasswordErrors] = useState({});

	const [changingPassword, setChangingPassword] = useState(false);

	const [passwordError, setPasswordError] = useState("");

	const [passwordSuccess, setPasswordSuccess] = useState("");

	const [showCurrentPassword, setShowCurrentPassword] = useState(false);

	const [showNewPassword, setShowNewPassword] = useState(false);

	const [showConfirmPassword, setShowConfirmPassword] = useState(false);

	/* ==========================================
     CARGAR PERFIL
     ========================================== */

	const cargarPerfil = async () => {
		try {
			setLoading(true);
			setError("");

			const response = await perfilService.obtenerPerfil();

			/*
			 * Permite trabajar tanto con:
			 *
			 * { success: true, data: {...} }
			 *
			 * como directamente:
			 *
			 * { id, nombre, apellido, ... }
			 */

			const data = response?.data || response;

			setPerfil(data);

			setFormData({
				nombre: data?.nombre || "",

				apellido: data?.apellido || "",

				email: data?.email || "",
			});
		} catch (err) {
			console.error("Error cargando perfil:", err);

			setError(
				err.response?.data?.message ||
					err.response?.data?.error ||
					"No fue posible cargar la información del perfil.",
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		cargarPerfil();
	}, []);

	/* ==========================================
     INFORMACIÓN VISUAL
     ========================================== */

	const fullName = useMemo(() => {
		const source = perfil || user;

		return `${source?.nombre || ""} ${source?.apellido || ""}`.trim();
	}, [perfil, user]);

	const initials = useMemo(() => {
		const source = perfil || user;

		const first = source?.nombre?.[0] || "";

		const last = source?.apellido?.[0] || "";

		return `${first}${last}`.toUpperCase() || "U";
	}, [perfil, user]);

	const roleLabel =
		ROLE_LABELS[perfil?.rol || user?.rol] ||
		perfil?.rol ||
		user?.rol ||
		"Usuario";

	/* ==========================================
     CAMBIOS DEL PERFIL
     ========================================== */

	const handleChange = (event) => {
		const { name, value } = event.target;

		setFormData((previous) => ({
			...previous,
			[name]: value,
		}));

		if (errors[name]) {
			setErrors((previous) => ({
				...previous,
				[name]: "",
			}));
		}

		setError("");
		setSuccess("");
	};

	/* ==========================================
     VALIDAR PERFIL
     ========================================== */

	const validateProfile = () => {
		const newErrors = {};

		if (!formData.nombre.trim()) {
			newErrors.nombre = "El nombre es obligatorio.";
		} else if (formData.nombre.trim().length < 2) {
			newErrors.nombre = "El nombre debe tener al menos 2 caracteres.";
		}

		if (!formData.apellido.trim()) {
			newErrors.apellido = "El apellido es obligatorio.";
		} else if (formData.apellido.trim().length < 2) {
			newErrors.apellido = "El apellido debe tener al menos 2 caracteres.";
		}

		const email = formData.email.trim().toLowerCase();

		if (!email) {
			newErrors.email = "El correo electrónico es obligatorio.";
		} else if (!EMAIL_REGEX.test(email)) {
			newErrors.email = "Ingrese un correo electrónico válido.";
		}

		setErrors(newErrors);

		return Object.keys(newErrors).length === 0;
	};

	/* ==========================================
     ACTUALIZAR PERFIL
     ========================================== */

	const handleSubmit = async (event) => {
		event.preventDefault();

		if (saving || !validateProfile()) {
			return;
		}

		try {
			setSaving(true);
			setError("");
			setSuccess("");

			const payload = {
				nombre: formData.nombre.trim(),

				apellido: formData.apellido.trim(),

				email: formData.email.trim().toLowerCase(),
			};

			const response = await perfilService.actualizarPerfil(payload);

			const updatedProfile = response?.data || response;

			setPerfil(updatedProfile);

			/*
			 * Actualizamos AuthContext para que
			 * Header y Sidebar reflejen los cambios
			 * inmediatamente.
			 */

			if (typeof setUser === "function") {
				setUser((previous) => ({
					...previous,
					...updatedProfile,
				}));
			}

			setFormData({
				nombre: updatedProfile?.nombre || payload.nombre,

				apellido: updatedProfile?.apellido || payload.apellido,

				email: updatedProfile?.email || payload.email,
			});

			setSuccess("La información del perfil se actualizó correctamente.");
		} catch (err) {
			console.error("Error actualizando perfil:", err);

			const status = err.response?.status;

			const message = err.response?.data?.message || err.response?.data?.error;

			if (status === 409) {
				setErrors((previous) => ({
					...previous,
					email: message || "Este correo electrónico ya está registrado.",
				}));

				return;
			}

			setError(message || "No fue posible actualizar el perfil.");
		} finally {
			setSaving(false);
		}
	};

	/* ==========================================
     CAMBIO CONTRASEÑA
     ========================================== */

	const handlePasswordChange = (event) => {
		const { name, value } = event.target;

		setPasswordForm((previous) => ({
			...previous,
			[name]: value,
		}));

		if (passwordErrors[name]) {
			setPasswordErrors((previous) => ({
				...previous,
				[name]: "",
			}));
		}

		setPasswordError("");
		setPasswordSuccess("");
	};

	/* ==========================================
     VALIDAR CONTRASEÑA
     ========================================== */

	const validatePassword = () => {
		const newErrors = {};

		if (!passwordForm.passwordActual) {
			newErrors.passwordActual = "Ingrese su contraseña actual.";
		}

		if (!passwordForm.nuevaPassword) {
			newErrors.nuevaPassword = "Ingrese la nueva contraseña.";
		} else if (passwordForm.nuevaPassword.length < 8) {
			newErrors.nuevaPassword =
				"La nueva contraseña debe tener al menos 8 caracteres.";
		}

		if (!passwordForm.confirmarPassword) {
			newErrors.confirmarPassword = "Confirme la nueva contraseña.";
		} else if (passwordForm.nuevaPassword !== passwordForm.confirmarPassword) {
			newErrors.confirmarPassword = "Las contraseñas no coinciden.";
		}

		if (
			passwordForm.passwordActual &&
			passwordForm.nuevaPassword &&
			passwordForm.passwordActual === passwordForm.nuevaPassword
		) {
			newErrors.nuevaPassword =
				"La nueva contraseña debe ser diferente de la actual.";
		}

		setPasswordErrors(newErrors);

		return Object.keys(newErrors).length === 0;
	};

	/* ==========================================
     GUARDAR NUEVA CONTRASEÑA
     ========================================== */

	const handlePasswordSubmit = async (event) => {
		event.preventDefault();

		if (changingPassword || !validatePassword()) {
			return;
		}

		try {
			setChangingPassword(true);

			setPasswordError("");
			setPasswordSuccess("");

			await perfilService.cambiarPassword({
				passwordActual: passwordForm.passwordActual,

				nuevaPassword: passwordForm.nuevaPassword,
			});

			setPasswordForm({
				...INITIAL_PASSWORD_FORM,
			});

			setShowCurrentPassword(false);

			setShowNewPassword(false);

			setShowConfirmPassword(false);

			setPasswordSuccess("La contraseña se actualizó correctamente.");
		} catch (err) {
			console.error("Error cambiando contraseña:", err);

			setPasswordError(
				err.response?.data?.message ||
					err.response?.data?.error ||
					"No fue posible cambiar la contraseña.",
			);
		} finally {
			setChangingPassword(false);
		}
	};

	/* ==========================================
     LOADING
     ========================================== */

	if (loading) {
		return (
			<section className="perfil-page">
				<div className="perfil-page__loading">
					<Loader />

					<p>Cargando perfil...</p>
				</div>
			</section>
		);
	}

	/* ==========================================
     ERROR DE CARGA
     ========================================== */

	if (error && !perfil) {
		return (
			<section className="perfil-page">
				<div className="perfil-page__load-error" role="alert">
					<UserRound size={42} />

					<h2>No fue posible cargar el perfil</h2>

					<p>{error}</p>

					<Button onClick={cargarPerfil}>Intentar nuevamente</Button>
				</div>
			</section>
		);
	}

	/* ==========================================
     RENDER
     ========================================== */

	return (
		<section className="perfil-page">
			{/* =====================================
          ENCABEZADO
          ===================================== */}

			<div className="perfil-page__header">
				<div>
					<h2 className="perfil-page__title">Mi perfil</h2>

					<p className="perfil-page__description">
						Consulte y actualice su información personal y sus credenciales de
						acceso.
					</p>
				</div>
			</div>

			<div className="perfil-page__layout">
				{/* ===================================
            RESUMEN
            =================================== */}

				<aside className="perfil-page__summary">
					<div className="perfil-page__avatar-wrapper">
						<div className="perfil-page__avatar">{initials}</div>

						<button
							type="button"
							className="perfil-page__avatar-button"
							aria-label="Cambiar foto de perfil"
							title="Foto de perfil no disponible actualmente"
							disabled
						>
							<Camera size={16} />
						</button>
					</div>

					<h3>{fullName || "Usuario"}</h3>

					<p className="perfil-page__email">{perfil?.email || user?.email}</p>

					<Badge variant="primary">{roleLabel}</Badge>

					<div className="perfil-page__summary-divider" />

					<div className="perfil-page__summary-item">
						<Mail size={18} />

						<div>
							<span>Correo</span>

							<strong>{perfil?.email || user?.email || "No disponible"}</strong>
						</div>
					</div>

					<div className="perfil-page__summary-item">
						<ShieldCheck size={18} />

						<div>
							<span>Rol</span>

							<strong>{roleLabel}</strong>
						</div>
					</div>
				</aside>

				{/* ===================================
            CONTENIDO
            =================================== */}

				<div className="perfil-page__content">
					{/* ===============================
              INFORMACIÓN PERSONAL
              =============================== */}

					<div className="perfil-page__card">
						<div className="perfil-page__card-header">
							<div className="perfil-page__card-icon">
								<UserRound size={20} />
							</div>

							<div>
								<h3>Información personal</h3>

								<p>Actualice los datos asociados a su cuenta.</p>
							</div>
						</div>

						<form
							className="perfil-page__form"
							onSubmit={handleSubmit}
							noValidate
						>
							{error && (
								<div
									className="perfil-page__alert perfil-page__alert--error"
									role="alert"
								>
									{error}
								</div>
							)}

							{success && (
								<div
									className="perfil-page__alert perfil-page__alert--success"
									role="status"
								>
									{success}
								</div>
							)}

							<div className="perfil-page__grid">
								<Input
									label="Nombre"
									name="nombre"
									value={formData.nombre}
									onChange={handleChange}
									error={errors.nombre}
									required
									disabled={saving}
									autoComplete="given-name"
								/>

								<Input
									label="Apellido"
									name="apellido"
									value={formData.apellido}
									onChange={handleChange}
									error={errors.apellido}
									required
									disabled={saving}
									autoComplete="family-name"
								/>
							</div>

							<Input
								type="email"
								label="Correo electrónico"
								name="email"
								value={formData.email}
								onChange={handleChange}
								error={errors.email}
								required
								disabled={saving}
								autoComplete="email"
							/>

							<div className="perfil-page__readonly">
								<div>
									<span>Rol en el sistema</span>

									<strong>{roleLabel}</strong>
								</div>

								<ShieldCheck size={20} />
							</div>

							<p className="perfil-page__readonly-help">
								El rol y los permisos de la cuenta no pueden modificarse desde
								el perfil.
							</p>

							<div className="perfil-page__form-actions">
								<Button
									type="submit"
									loading={saving}
									disabled={saving}
									icon={<Save size={18} />}
								>
									{saving ? "Guardando..." : "Guardar cambios"}
								</Button>
							</div>
						</form>
					</div>

					{/* ===============================
              SEGURIDAD
              =============================== */}

					<div className="perfil-page__card">
						<div className="perfil-page__card-header">
							<div className="perfil-page__card-icon">
								<KeyRound size={20} />
							</div>

							<div>
								<h3>Seguridad</h3>

								<p>
									Cambie la contraseña utilizada para ingresar a EduConnect BR.
								</p>
							</div>
						</div>

						<form
							className="perfil-page__form"
							onSubmit={handlePasswordSubmit}
							noValidate
						>
							{passwordError && (
								<div
									className="perfil-page__alert perfil-page__alert--error"
									role="alert"
								>
									{passwordError}
								</div>
							)}

							{passwordSuccess && (
								<div
									className="perfil-page__alert perfil-page__alert--success"
									role="status"
								>
									{passwordSuccess}
								</div>
							)}

							{/* CONTRASEÑA ACTUAL */}

							<Input
								type={showCurrentPassword ? "text" : "password"}
								label="Contraseña actual"
								name="passwordActual"
								value={passwordForm.passwordActual}
								onChange={handlePasswordChange}
								error={passwordErrors.passwordActual}
								required
								disabled={changingPassword}
								autoComplete="current-password"
								rightIcon={
									<button
										type="button"
										className="perfil-page__password-button"
										onClick={() =>
											setShowCurrentPassword((previous) => !previous)
										}
										aria-label={
											showCurrentPassword
												? "Ocultar contraseña"
												: "Mostrar contraseña"
										}
									>
										{showCurrentPassword ? (
											<EyeOff size={18} />
										) : (
											<Eye size={18} />
										)}
									</button>
								}
							/>

							<div className="perfil-page__grid">
								{/* NUEVA */}

								<Input
									type={showNewPassword ? "text" : "password"}
									label="Nueva contraseña"
									name="nuevaPassword"
									value={passwordForm.nuevaPassword}
									onChange={handlePasswordChange}
									error={passwordErrors.nuevaPassword}
									helperText="Utilice al menos 8 caracteres."
									required
									disabled={changingPassword}
									autoComplete="new-password"
									rightIcon={
										<button
											type="button"
											className="perfil-page__password-button"
											onClick={() =>
												setShowNewPassword((previous) => !previous)
											}
											aria-label={
												showNewPassword
													? "Ocultar contraseña"
													: "Mostrar contraseña"
											}
										>
											{showNewPassword ? (
												<EyeOff size={18} />
											) : (
												<Eye size={18} />
											)}
										</button>
									}
								/>

								{/* CONFIRMACIÓN */}

								<Input
									type={showConfirmPassword ? "text" : "password"}
									label="Confirmar nueva contraseña"
									name="confirmarPassword"
									value={passwordForm.confirmarPassword}
									onChange={handlePasswordChange}
									error={passwordErrors.confirmarPassword}
									required
									disabled={changingPassword}
									autoComplete="new-password"
									rightIcon={
										<button
											type="button"
											className="perfil-page__password-button"
											onClick={() =>
												setShowConfirmPassword((previous) => !previous)
											}
											aria-label={
												showConfirmPassword
													? "Ocultar contraseña"
													: "Mostrar contraseña"
											}
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

							<div className="perfil-page__form-actions">
								<Button
									type="submit"
									loading={changingPassword}
									disabled={changingPassword}
									icon={<KeyRound size={18} />}
								>
									{changingPassword ? "Actualizando..." : "Cambiar contraseña"}
								</Button>
							</div>
						</form>
					</div>
				</div>
			</div>
		</section>
	);
};

export default Perfil;
