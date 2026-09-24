/* ==========================================
   ROLES DE USUARIO
   ========================================== */

export const ROLES = Object.freeze({
	ADMINISTRADOR: "ADMINISTRADOR",
	DOCENTE: "DOCENTE",
	ESTUDIANTE: "ESTUDIANTE",
	PADRE_FAMILIA: "PADRE_FAMILIA",
	DIRECTIVO: "DIRECTIVO",
});

/* ==========================================
   ETIQUETAS DE ROLES
   ========================================== */

export const ROLE_LABELS = Object.freeze({
	[ROLES.ADMINISTRADOR]: "Administrador",
	[ROLES.DOCENTE]: "Docente",
	[ROLES.ESTUDIANTE]: "Estudiante",
	[ROLES.PADRE_FAMILIA]: "Padre de familia",
	[ROLES.DIRECTIVO]: "Directivo",
});

/* ==========================================
   ESTADOS DE USUARIO
   ========================================== */

export const ESTADOS_USUARIO = Object.freeze({
	ACTIVO: "ACTIVO",
	INACTIVO: "INACTIVO",
});

/* ==========================================
   ETIQUETAS DE ESTADOS
   ========================================== */

export const ESTADO_USUARIO_LABELS = Object.freeze({
	[ESTADOS_USUARIO.ACTIVO]: "Activo",
	[ESTADOS_USUARIO.INACTIVO]: "Inactivo",
});

/* ==========================================
   RUTAS DE LA APLICACIÓN
   ========================================== */

export const ROUTES = Object.freeze({
	HOME: "/",

	LOGIN: "/login",

	DASHBOARD: "/dashboard",
	PROFILE: "/perfil",

	USERS: "/admin/usuarios",

	GRADES: "/notas",
	ATTENDANCE: "/asistencia",
	COMMUNICATIONS: "/comunicados",
	MESSAGES: "/mensajes",
	NOTIFICATIONS: "/notificaciones",
	REPORTS: "/reportes",
	SETTINGS: "/configuracion",
});

/* ==========================================
   RUTAS DE API
   ========================================== */

export const API_ROUTES = Object.freeze({
	/* Autenticación */

	LOGIN: "/auth/login",

	LOGOUT: "/auth/logout",

	ME: "/auth/me",

	/* Usuarios */

	USUARIOS: "/usuarios",

	USUARIO_BY_ID: (id) => `/usuarios/${id}`,

	USUARIO_ESTADO: (id) => `/usuarios/${id}/estado`,
});

/* ==========================================
   LOCAL STORAGE
   ========================================== */

export const STORAGE_KEYS = Object.freeze({
	TOKEN: "educonnect_token",

	USUARIO: "educonnect_usuario",

	THEME: "educonnect_theme",
});

/* ==========================================
   CONFIGURACIÓN GENERAL
   ========================================== */

export const APP_CONFIG = Object.freeze({
	NAME: "EduConnect BR",

	SHORT_NAME: "EduConnect",

	INSTITUTION: "I.E.D. Bienvenido Rodríguez",

	VERSION: "1.0.0",
});

/* ==========================================
   MENSAJES GENERALES
   ========================================== */

export const MESSAGES = Object.freeze({
	ERROR_GENERAL: "Ha ocurrido un error. Intente nuevamente.",

	ERROR_CONNECTION: "No fue posible conectar con el servidor.",

	SESSION_EXPIRED: "La sesión ha expirado. Inicie sesión nuevamente.",

	ACCESS_DENIED: "No tiene permisos para acceder a esta sección.",

	LOGIN_SUCCESS: "Inicio de sesión exitoso.",

	LOGOUT_SUCCESS: "Sesión cerrada correctamente.",

	REQUIRED_FIELDS: "Complete todos los campos obligatorios.",
});

/* ==========================================
   VALIDACIÓN
   ========================================== */

export const VALIDATION = Object.freeze({
	PASSWORD_MIN_LENGTH: 8,

	NAME_MIN_LENGTH: 2,

	NAME_MAX_LENGTH: 100,

	EMAIL_MAX_LENGTH: 150,
});

/* ==========================================
   PAGINACIÓN
   ========================================== */

export const PAGINATION = Object.freeze({
	DEFAULT_PAGE: 1,

	DEFAULT_LIMIT: 10,

	LIMIT_OPTIONS: [10, 20, 50, 100],
});

/* ==========================================
   FORMATO DE FECHA
   ========================================== */

export const DATE_FORMATS = Object.freeze({
	SHORT: "dd/MM/yyyy",

	LONG: "dd 'de' MMMM 'de' yyyy",

	DATE_TIME: "dd/MM/yyyy HH:mm",
});
