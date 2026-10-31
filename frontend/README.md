# EduConnect BR - Frontend

Aplicación web (SPA) de EduConnect BR, la plataforma de gestión académica y comunicación de la I.E.D. Bienvenido Rodríguez (Colombia). Consume la API REST de [`../backend`](../backend/README.md) y adapta menús, vistas y rutas al rol de la persona que inicia sesión: `ADMINISTRADOR`, `DIRECTIVO`, `DOCENTE`, `ESTUDIANTE` y `PADRE_FAMILIA`.

## Stack

| Pieza | Tecnología (versión de `package.json`) |
| --- | --- |
| UI | React `^19.2.8` con el React Compiler habilitado (`babel-plugin-react-compiler`) |
| Bundler | Vite `^8.2.0` con `@vitejs/plugin-react` |
| Enrutamiento | `react-router-dom` `^7.18.2` |
| HTTP | `axios` `^1.20.0` |
| Iconos | `lucide-react` `^1.43.0` |
| Estilos | CSS plano: un `.css` junto a cada componente y hojas globales en `src/styles/` (sin framework de estilos) |
| Calidad | ESLint `^10.8.0` con `eslint-plugin-react-hooks` y `eslint-plugin-react-refresh` |

## Requisitos

- Node.js y npm (el repositorio no fija una versión mínima; use una compatible con Vite 8).
- El backend en ejecución. Sin él la pantalla de inicio de sesión carga, pero no se puede entrar. Ver [`../backend/README.md`](../backend/README.md).

## Inicio rápido

Desde la carpeta `frontend/`:

```bash
npm install
```

```bash
npm run dev
```

La aplicación queda en `http://localhost:5173`. Inicie antes el backend (por defecto en `http://localhost:3000`). Las cuentas de prueba están en [`../docs/guion-demostracion.md`](../docs/guion-demostracion.md).

### Puerto 5173 ocupado

Si otro proceso usa el 5173, Vite pasa al 5174. El backend solo acepta el origen definido en su variable `FRONTEND_URL` (por defecto `http://localhost:5173`), así que el inicio de sesión fallará por CORS. Dos salidas:

- Cerrar el proceso que ocupa el 5173 y volver a ejecutar `npm run dev`.
- Iniciar el backend con `FRONTEND_URL=http://localhost:5174`.

## Scripts

| Script | Comando real | Uso |
| --- | --- | --- |
| `npm run dev` | `vite` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | `vite build` | Compilación de producción en `dist/` |
| `npm run preview` | `vite preview` | Sirve localmente el resultado de `build` |
| `npm run lint` | `eslint .` | Revisa el código (la carpeta `dist` se ignora) |

No hay script de pruebas en este paquete.

## Variables de entorno

Vite solo expone al código las variables con prefijo `VITE_`, y las incorpora en tiempo de compilación.

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `VITE_API_URL` | No | URL base del backend, incluyendo `/api`. Por defecto `http://localhost:3000/api` (`src/api/api.js`) |

Para apuntar a otro backend, copie la plantilla versionada `.env.example` a `.env` dentro de `frontend/` (el `.env` no se versiona) y ajuste la variable, o defínala en el entorno de compilación. Si el backend cambia de puerto, actualícela aquí y ajuste `FRONTEND_URL` allá si cambia el origen del frontend. En producción, `VITE_API_URL` debe estar definida antes de ejecutar `npm run build`.

## Estructura

```
frontend/
├── index.html
├── vite.config.js           Plugins de React y del React Compiler
├── eslint.config.js
└── src/
    ├── main.jsx             Punto de entrada: BrowserRouter + AuthProvider
    ├── App.jsx
    ├── api/                 Instancia de axios (api.js)
    ├── components/
    │   ├── layout/          Header y Sidebar
    │   └── ui/              Button, Input, Select, Modal, Badge, Loader, Pagination...
    ├── context/             AuthContext (sesión del usuario)
    ├── hooks/               useAuth
    ├── layouts/             AuthLayout y DashboardLayout
    ├── pages/               admin/usuarios, admin/vinculos, asistencia, auth, comunicados,
    │                        dashboard, errors, notas, profile
    ├── routes/              AppRouter, ProtectedRoute, RoleRoute, RolePage
    ├── services/            Una función por endpoint, agrupadas por módulo
    ├── styles/              variables, reset, global y responsive
    └── utils/               constants.js, storage.js, validators.js, errores.js
```

## Pantallas

Las rutas están definidas en `ROUTES` (`src/utils/constants.js`) y se registran en `src/routes/AppRouter.jsx`.

| Ruta | Pantalla | Quién accede |
| --- | --- | --- |
| `/login` | Inicio de sesión | Público |
| `/dashboard` | Inicio con accesos rápidos; `ESTUDIANTE` y `PADRE_FAMILIA` ven además un resumen académico | Todos los autenticados |
| `/perfil` | Perfil propio | Todos los autenticados |
| `/admin/usuarios` | Gestión de usuarios | `ADMINISTRADOR` |
| `/admin/vinculos` | Vínculos padre-estudiante | `ADMINISTRADOR` |
| `/notas` | `DOCENTE`: registrar notas; `ESTUDIANTE` y `PADRE_FAMILIA`: consultar | Esos tres roles |
| `/asistencia` | `DOCENTE`: registrar asistencia; `ESTUDIANTE` y `PADRE_FAMILIA`: consultar | Esos tres roles |
| `/comunicados` | Comunicados institucionales | Todos los autenticados |
| `/notificaciones` | "Próximamente" | Todos los autenticados |
| `/reportes` | "Próximamente" | `ADMINISTRADOR`, `DIRECTIVO` |
| `/configuracion` | "Próximamente" | `ADMINISTRADOR` |

Cualquier ruta desconocida redirige a `/dashboard`.

## Convenciones

- **Sesión.** Al iniciar sesión se guardan en `localStorage` el token (`educonnect_token`) y el usuario (`educonnect_usuario`). `AuthContext` revisa la sesión al cargar llamando a `GET /api/auth/me`; si falla, limpia ambas claves.
- **Autenticación en las peticiones.** `src/api/api.js` añade `Authorization: Bearer <token>` a cada petición y, ante una respuesta 401, borra el token y el usuario guardados.
- **Protección de rutas.** `ProtectedRoute` exige sesión y redirige a `/login`. `RoleRoute` restringe un grupo de rutas a los roles indicados en `allowedRoles` y redirige al dashboard si el rol no corresponde. `RolePage` elige qué vista mostrar en un mismo path según el rol (por ejemplo `/notas`); si el rol no tiene vista, redirige al dashboard.
- **Menú por rol.** El menú lateral (`components/layout/Sidebar.jsx`) y los accesos del dashboard filtran por rol. Los permisos reales los aplica el backend; el frontend solo evita mostrar lo que no corresponde.
- **Servicios.** Las llamadas HTTP viven en `src/services/*.service.js` (una por módulo: auth, usuario, perfil, nota, asistencia, comunicado, catálogo, vínculo). Solo `src/api/api.js` y los servicios importan `axios` o la instancia `api`.
- **Constantes.** Roles, rutas, claves de almacenamiento y mensajes generales se centralizan en `src/utils/constants.js`; no se escriben a mano en los componentes.

## Cómo se conecta con el backend

- Base de la API: `VITE_API_URL`, o `http://localhost:3000/api` si no está definida.
- Endpoints que usa cada servicio: `/auth`, `/usuarios`, `/vinculos`, `/perfil`, `/notas`, `/asistencia`, `/comunicados`, `/catalogos` y `/padres/mis-hijos`. El detalle de rutas, métodos y roles está en la sección Endpoints de [`../backend/README.md`](../backend/README.md).
- CORS, expiración del token (2 horas por defecto) y datos de demostración se configuran en el backend.

## Documentación relacionada

- [`../backend/README.md`](../backend/README.md): API, variables de entorno, migraciones y datos de demostración.
- [`../docs/guion-demostracion.md`](../docs/guion-demostracion.md): preparación de la demo, cuentas y orden sugerido.
- [`../docs/verificar-migraciones-linux.md`](../docs/verificar-migraciones-linux.md): migraciones y variables de despliegue (incluye `VITE_API_URL`).
