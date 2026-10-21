import { useEffect, useState } from "react";

import authService from "../services/auth.service.js";

import { AuthContext } from "./auth-context.js";

/* ==========================================
   RESOLVER SESIÓN
   ==========================================

   Devuelve el usuario de la sesión actual o null
   si no hay sesión válida. No toca el estado de
   React: quien la llama decide qué hacer con el
   resultado.
   ========================================== */

const resolverSesion = async () => {
	if (!authService.estaAutenticado()) {
		return null;
	}

	try {
		return await authService.obtenerUsuarioActual();
	} catch (error) {
		console.error("Error verificando sesión:", error);

		authService.limpiarSesion();

		return null;
	}
};

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);

	const [loading, setLoading] = useState(true);

	/* ==========================================
     VERIFICAR SESIÓN AL INICIAR
     ========================================== */

	useEffect(() => {
		let activo = true;

		const verificarSesionInicial = async () => {
			const usuario = await resolverSesion();

			if (!activo) {
				return;
			}

			setUser(usuario);
			setLoading(false);
		};

		verificarSesionInicial();

		return () => {
			activo = false;
		};
	}, []);

	/* ==========================================
     VERIFICAR SESIÓN (MANUAL)
     ========================================== */

	const checkAuth = async () => {
		const usuario = await resolverSesion();

		setUser(usuario);
		setLoading(false);
	};

	/* ==========================================
     LOGIN
     ========================================== */

	const login = async (credentials) => {
		const { token, usuario } = await authService.login(credentials);

		if (!token) {
			throw new Error("El servidor no devolvió el token de autenticación.");
		}

		if (!usuario) {
			throw new Error("El servidor no devolvió los datos del usuario.");
		}

		setUser(usuario);

		return usuario;
	};

	/* ==========================================
     LOGOUT
     ========================================== */

	const logout = async () => {
		await authService.logout();

		setUser(null);
	};

	/* ==========================================
     ACTUALIZAR USUARIO
     ========================================== */

	const updateUser = (data) => {
		setUser((current) => ({
			...current,
			...data,
		}));
	};

	return (
		<AuthContext.Provider
			value={{
				user,
				setUser,
				loading,
				login,
				logout,
				updateUser,
				checkAuth,
			}}
		>
			{children}
		</AuthContext.Provider>
	);
};
