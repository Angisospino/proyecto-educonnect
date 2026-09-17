import { useState } from "react";
import { Lock, LogIn, Mail } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

import Button from "../../components/ui/Button.jsx";
import Input from "../../components/ui/Input.jsx";

import { useAuth } from "../../hooks/useAuth.js";

import { hasErrors, validateLogin } from "../../utils/validators.js";

import { ROUTES } from "../../utils/constants.js";

import "./Login.css";

const Login = () => {
	const navigate = useNavigate();
	const location = useLocation();

	const { login } = useAuth();

	/* ==========================================
     ESTADOS
     ========================================== */

	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const [errors, setErrors] = useState({});

	const [serverError, setServerError] = useState("");

	const [loading, setLoading] = useState(false);

	/* ==========================================
     MANEJAR CAMBIOS
     ========================================== */

	const handleChange = (event) => {
		const { name, value } = event.target;

		setFormData((current) => ({
			...current,
			[name]: value,
		}));

		/*
		 * Elimina el error del campo mientras
		 * el usuario corrige la información.
		 */
		if (errors[name]) {
			setErrors((current) => ({
				...current,
				[name]: "",
			}));
		}

		if (serverError) {
			setServerError("");
		}
	};

	/* ==========================================
     SUBMIT
     ========================================== */

	const handleSubmit = async (event) => {
		event.preventDefault();

		setServerError("");

		const validationErrors = validateLogin(formData);

		if (hasErrors(validationErrors)) {
			setErrors(validationErrors);
			return;
		}

		setErrors({});
		setLoading(true);

		try {
			await login({
				email: formData.email.trim(),
				password: formData.password,
			});

			/*
			 * Si ProtectedRoute envió al usuario
			 * al login desde otra página,
			 * regresamos a esa ruta.
			 */
			const from = location.state?.from?.pathname || ROUTES.DASHBOARD;

			navigate(from, {
				replace: true,
			});
		} catch (error) {
			const message =
				error.response?.data?.message ||
				"No fue posible iniciar sesión. Intente nuevamente.";

			setServerError(message);
		} finally {
			setLoading(false);
		}
	};

	/* ==========================================
     RENDER
     ========================================== */

	return (
		<section className="login">
			<div className="login__header">
				<div className="login__icon">
					<LogIn size={26} aria-hidden="true" />
				</div>

				<div>
					<h2 className="login__title">Iniciar sesión</h2>

					<p className="login__subtitle">
						Ingrese sus credenciales para acceder a EduConnect BR.
					</p>
				</div>
			</div>

			{serverError && (
				<div className="login__alert" role="alert">
					{serverError}
				</div>
			)}

			<form className="login__form" onSubmit={handleSubmit} noValidate>
				<Input
					label="Correo electrónico"
					name="email"
					type="email"
					value={formData.email}
					placeholder="usuario@correo.com"
					leftIcon={<Mail size={18} />}
					error={errors.email}
					onChange={handleChange}
					autoComplete="email"
					disabled={loading}
					required
				/>

				<Input
					label="Contraseña"
					name="password"
					type="password"
					value={formData.password}
					placeholder="Ingrese su contraseña"
					leftIcon={<Lock size={18} />}
					error={errors.password}
					onChange={handleChange}
					autoComplete="current-password"
					disabled={loading}
					required
				/>

				<Button
					type="submit"
					fullWidth
					loading={loading}
					disabled={loading}
					leftIcon={<LogIn size={18} />}
				>
					Iniciar sesión
				</Button>
			</form>

			<div className="login__help">
				<p>
					Si presenta problemas para acceder, comuníquese con el administrador
					de EduConnect BR.
				</p>
			</div>
		</section>
	);
};

export default Login;
