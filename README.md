# EduConnect BR

Plataforma web de gestión académica y comunicación de la **I.E.D. Bienvenido Rodríguez** (Colombia). Reúne en un solo lugar a administradores, directivos, docentes, estudiantes y padres de familia: cada persona ve solo lo que le corresponde según su rol.

El proyecto se desarrolla con Scrum entre agosto y octubre de 2026 (Sprint 0 a Sprint 6). Los requisitos, el diseño y el plan están en [`docs/`](docs/).

## Qué incluye

**Disponible**

- Inicio y cierre de sesión con JWT, y control de acceso por rol (RBAC).
- Gestión de usuarios (solo el administrador crea cuentas; no hay autorregistro) y perfil propio.
- Vínculos entre padres de familia y estudiantes, administrados por el administrador.
- Registro de notas y de asistencia por parte del docente.
- Consulta de notas y asistencia para estudiantes y padres, con paginación.
- Resumen académico en el inicio de estudiantes y padres (promedio, asistencia y último comunicado).
- Comunicados institucionales: los publican docentes y directivos, los ven todos los roles.
- Notificaciones por correo al publicar comunicados (con envío simulado si no hay SMTP configurado).

**Pendiente** (las pantallas existen como "Próximamente")

- Generación de reportes.
- Pantalla de notificaciones y de configuración.

## Roles

`ADMINISTRADOR`, `DIRECTIVO`, `DOCENTE`, `ESTUDIANTE` y `PADRE_FAMILIA`.

## Tecnología

| Capa | Tecnología |
| --- | --- |
| Frontend | React con Vite (React Compiler), React Router, Axios, CSS plano |
| Backend | Node.js, Express 5, JWT, bcrypt, nodemailer |
| Datos | MySQL con Prisma 7 (adaptador de MariaDB) |

Las versiones exactas están en cada `package.json`.

## Estructura del repositorio

```
.
├── backend/    API REST (Node.js + Express + Prisma)    -> backend/README.md
├── frontend/   Aplicación web (React + Vite)            -> frontend/README.md
└── docs/       ERS, DDS, Plan de Trabajo y guías
```

## Inicio rápido

Necesita Node.js, npm y un servidor MySQL con una base vacía. Cada paquete se instala y se ejecuta por separado.

Backend (desde `backend/`). Antes de arrancar, copie `.env.example` a `.env` y complete los valores; el detalle de las variables está en [`backend/README.md`](backend/README.md#variables-de-entorno).

```bash
npm install
```

```bash
npm run prisma:generate
```

```bash
npx prisma migrate deploy
```

```bash
npm run prisma:seed
```

```bash
npm run dev
```

Frontend (desde `frontend/`):

```bash
npm install
```

```bash
npm run dev
```

Por defecto, el backend queda en `http://localhost:3000` y el frontend en `http://localhost:5173`.

> **Puerto 5173 ocupado.** Si otro proceso usa el 5173, Vite pasa al 5174 y el backend rechaza el inicio de sesión por CORS. Cierre el otro proceso o inicie el backend con `FRONTEND_URL=http://localhost:5174`.

### Datos de demostración

Para ver la plataforma con datos (cursos, estudiantes, notas, asistencia y comunicados), desde `backend/`:

```bash
npm run prisma:seed-demo -- --dry-run
```

Simula la carga sin guardar nada. Sin `--dry-run` la carga se persiste, y `--limpiar` elimina lo que creó el script. Las cuentas, la contraseña y el orden sugerido para una presentación están en [`docs/guion-demostracion.md`](docs/guion-demostracion.md).

## Documentación

| Documento | Contenido |
| --- | --- |
| [`backend/README.md`](backend/README.md) | API, variables de entorno, migraciones, endpoints y datos de demostración |
| [`frontend/README.md`](frontend/README.md) | Aplicación web, pantallas por rol y convenciones |
| [`docs/guion-demostracion.md`](docs/guion-demostracion.md) | Preparación de la demostración y cuentas de prueba |
| [`docs/verificar-migraciones-linux.md`](docs/verificar-migraciones-linux.md) | Cómo comprobar las migraciones en MySQL de Linux y variables de despliegue |
| [`docs/qa/sprint3-rf004-rf005-checklist.md`](docs/qa/sprint3-rf004-rf005-checklist.md) | Checklist de QA de notas y asistencia |
| `docs/ERS_EduConnect_BR_v1.0.docx` | Especificación de requisitos de software |
| `docs/DDS_EduConnect_BR_v1.0.docx` | Especificación de diseño de software |
| `docs/Plan_Trabajo_EduConnect_BR_v1.0.docx` | Plan de trabajo, cronograma y ceremonias |

## Flujo de trabajo

- Una rama por historia de usuario o tarea, con prefijo según el tipo: `feature/`, `fix/`, `chore/` o `docs/`.
- Commits convencionales (`feat:`, `fix:`, `docs:`, `chore:`, `refactor:`).
- Los cambios llegan a `main` solo mediante Pull Request revisado, con merge commit.
- Antes de abrir el PR, desde `frontend/` conviene ejecutar `npm run lint`: `main` está en cero errores y la idea es que siga así.
