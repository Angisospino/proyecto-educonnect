import { ROLES, ESTADOS_USUARIO, VALIDATION } from "./constants.js";

/* ==========================================
   UTILIDADES INTERNAS
   ========================================== */

const isEmpty = (value) => {
	return value === undefined || value === null || String(value).trim() === "";
};

/* ==========================================
   CAMPO OBLIGATORIO
   ========================================== */

export const required = (value, fieldName = "Este campo") => {
	if (isEmpty(value)) {
		return `${fieldName} es obligatorio.`;
	}

	return null;
};

/* ==========================================
   VALIDAR EMAIL
   ========================================== */

export const validateEmail = (email) => {
	if (isEmpty(email)) {
		return "El correo electrónico es obligatorio.";
	}

	const normalizedEmail = String(email).trim().toLowerCase();

	const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

	if (!emailRegex.test(normalizedEmail)) {
		return "Ingrese un correo electrónico válido.";
	}

	if (normalizedEmail.length > VALIDATION.EMAIL_MAX_LENGTH) {
		return `El correo electrónico no puede superar los ${VALIDATION.EMAIL_MAX_LENGTH} caracteres.`;
	}

	return null;
};

/* ==========================================
   VALIDAR CONTRASEÑA
   ========================================== */

export const validatePassword = (
	password,
	{ required: isRequired = true } = {},
) => {
	if (isEmpty(password)) {
		return isRequired ? "La contraseña es obligatoria." : null;
	}

	if (String(password).length < VALIDATION.PASSWORD_MIN_LENGTH) {
		return `La contraseña debe tener mínimo ${VALIDATION.PASSWORD_MIN_LENGTH} caracteres.`;
	}

	return null;
};

/* ==========================================
   CONFIRMAR CONTRASEÑA
   ========================================== */

export const validatePasswordConfirmation = (password, confirmPassword) => {
	if (isEmpty(confirmPassword)) {
		return "Debe confirmar la contraseña.";
	}

	if (password !== confirmPassword) {
		return "Las contraseñas no coinciden.";
	}

	return null;
};

/* ==========================================
   VALIDAR NOMBRE / APELLIDO
   ========================================== */

export const validateName = (value, fieldName = "Nombre") => {
	if (isEmpty(value)) {
		return `${fieldName} es obligatorio.`;
	}

	const normalizedValue = String(value).trim();

	if (normalizedValue.length < VALIDATION.NAME_MIN_LENGTH) {
		return `${fieldName} debe tener mínimo ${VALIDATION.NAME_MIN_LENGTH} caracteres.`;
	}

	if (normalizedValue.length > VALIDATION.NAME_MAX_LENGTH) {
		return `${fieldName} no puede superar los ${VALIDATION.NAME_MAX_LENGTH} caracteres.`;
	}

	/*
	 * Permite letras, espacios, tildes,
	 * diéresis, ñ, apóstrofes y guiones.
	 */
	const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñÜü\s'-]+$/;

	if (!nameRegex.test(normalizedValue)) {
		return `${fieldName} contiene caracteres no válidos.`;
	}

	return null;
};

/* ==========================================
   VALIDAR ROL
   ========================================== */

export const validateRole = (rol) => {
	if (isEmpty(rol)) {
		return "El rol es obligatorio.";
	}

	const validRoles = Object.values(ROLES);

	if (!validRoles.includes(rol)) {
		return "El rol seleccionado no es válido.";
	}

	return null;
};

/* ==========================================
   VALIDAR ESTADO DE USUARIO
   ========================================== */

export const validateUserStatus = (estado) => {
	if (isEmpty(estado)) {
		return "El estado es obligatorio.";
	}

	const validStatuses = Object.values(ESTADOS_USUARIO);

	if (!validStatuses.includes(estado)) {
		return "El estado seleccionado no es válido.";
	}

	return null;
};

/* ==========================================
   VALIDAR ID
   ========================================== */

export const validateId = (id) => {
	const numericId = Number(id);

	if (!Number.isInteger(numericId) || numericId <= 0) {
		return "El identificador no es válido.";
	}

	return null;
};

/* ==========================================
   VALIDAR LOGIN
   ========================================== */

export const validateLogin = ({ email = "", password = "" }) => {
	const errors = {};

	const emailError = validateEmail(email);

	const passwordRequired = required(password, "La contraseña");

	if (emailError) {
		errors.email = emailError;
	}

	if (passwordRequired) {
		errors.password = passwordRequired;
	}

	return errors;
};

/* ==========================================
   VALIDAR CREACIÓN DE USUARIO
   ========================================== */

export const validateCreateUser = ({
	nombre = "",
	apellido = "",
	email = "",
	password = "",
	confirmPassword = "",
	rol = "",
}) => {
	const errors = {};

	const nombreError = validateName(nombre, "El nombre");

	const apellidoError = validateName(apellido, "El apellido");

	const emailError = validateEmail(email);

	const passwordError = validatePassword(password);

	const confirmationError = validatePasswordConfirmation(
		password,
		confirmPassword,
	);

	const roleError = validateRole(rol);

	if (nombreError) {
		errors.nombre = nombreError;
	}

	if (apellidoError) {
		errors.apellido = apellidoError;
	}

	if (emailError) {
		errors.email = emailError;
	}

	if (passwordError) {
		errors.password = passwordError;
	}

	if (confirmationError) {
		errors.confirmPassword = confirmationError;
	}

	if (roleError) {
		errors.rol = roleError;
	}

	return errors;
};

/* ==========================================
   VALIDAR ACTUALIZACIÓN DE USUARIO
   ========================================== */

export const validateUpdateUser = ({
	nombre = "",
	apellido = "",
	email = "",
	password = "",
	confirmPassword = "",
	rol = "",
	estado = "",
}) => {
	const errors = {};

	const nombreError = validateName(nombre, "El nombre");

	const apellidoError = validateName(apellido, "El apellido");

	const emailError = validateEmail(email);

	const roleError = validateRole(rol);

	const statusError = validateUserStatus(estado);

	if (nombreError) {
		errors.nombre = nombreError;
	}

	if (apellidoError) {
		errors.apellido = apellidoError;
	}

	if (emailError) {
		errors.email = emailError;
	}

	if (roleError) {
		errors.rol = roleError;
	}

	if (statusError) {
		errors.estado = statusError;
	}

	/*
	 * En edición la contraseña es opcional.
	 * Solo se valida si el usuario escribe una.
	 */
	if (!isEmpty(password)) {
		const passwordError = validatePassword(password);

		const confirmationError = validatePasswordConfirmation(
			password,
			confirmPassword,
		);

		if (passwordError) {
			errors.password = passwordError;
		}

		if (confirmationError) {
			errors.confirmPassword = confirmationError;
		}
	}

	return errors;
};

/* ==========================================
   COMPROBAR SI HAY ERRORES
   ========================================== */

export const hasErrors = (errors) => {
	return errors && Object.keys(errors).length > 0;
};

/* ==========================================
   NORMALIZAR EMAIL
   ========================================== */

export const normalizeEmail = (email) => {
	return String(email || "")
		.trim()
		.toLowerCase();
};

/* ==========================================
   EXPORTACIÓN
   ========================================== */

const validators = {
	required,
	validateEmail,
	validatePassword,
	validatePasswordConfirmation,
	validateName,
	validateRole,
	validateUserStatus,
	validateId,
	validateLogin,
	validateCreateUser,
	validateUpdateUser,
	hasErrors,
	normalizeEmail,
};

export default validators;
