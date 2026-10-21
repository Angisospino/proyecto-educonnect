import { createContext } from "react";

/*
 * Contexto de autenticación.
 *
 * Vive en un archivo aparte (sin componentes) para que AuthContext.jsx
 * exporte únicamente el AuthProvider y el fast refresh siga funcionando.
 */

export const AuthContext = createContext(null);
