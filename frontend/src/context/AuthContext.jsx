import { createContext, useEffect, useState } from "react";

import authService from "../services/auth.service.js";

export const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
	const [user, setUser] = useState(null);

	const [loading, setLoading] = useState(true);

	/* ==========================================
     VERIFICAR SESIÓN AL INICIAR
     ========================================== */

	const checkAuth = async () => {
		if (!authService.estaAutenticado()) {
			setUser(null);
			setLoading(false);

			return;
		}

		try {
			const usuario = await authService.obtenerUsuarioActual();

			setUser(usuario);
		} catch (error) {
			console.error("Error verificando sesión:", error);

			authService.limpiarSesion();

			setUser(null);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		checkAuth();
	}, []);

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
