# EduConnect BR - Backend

API REST de EduConnect BR, la plataforma web de gestión académica y comunicación de la I.E.D. Bienvenido Rodríguez (Colombia). Atiende al frontend de React (carpeta [`../frontend`](../frontend)) y centraliza la autenticación, los permisos por rol, las notas, la asistencia, los comunicados y las notificaciones por correo.

Roles del sistema: `ADMINISTRADOR`, `DIRECTIVO`, `DOCENTE`, `ESTUDIANTE` y `PADRE_FAMILIA`.

## Stack

| Pieza | Tecnología (versión de `package.json`) |
| --- | --- |
| Servidor | Node.js con módulos ES (`"type": "module"`) y Express `^5.2.1` |
| Base de datos | MySQL, a través de Prisma `^7.10.0` con el adaptador de MariaDB (`@prisma/adapter-mariadb`) |
| Autenticación | JWT (`jsonwebtoken`) y hash de contraseñas con `bcrypt` |
| Correo | `nodemailer` |
| Otros | `cors`, `dotenv` |

## Requisitos

- Node.js y npm (el repositorio no fija una versión mínima; use una compatible con Prisma 7 y Express 5).
- Un servidor MySQL accesible y una base de datos vacía para el proyecto.

## Inicio rápido

Todos los comandos se ejecutan desde la carpeta `backend/`.

1. Instale las dependencias:

```bash
npm install
```

2. Copie la plantilla versionada `.env.example` a `.env` (este último no se versiona) y complete los valores según la sección [Variables de entorno](#variables-de-entorno). Como mínimo: `DATABASE_URL`, `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` y `JWT_SECRET`.

```bash
cp .env.example .env
```

3. Genere el cliente de Prisma. Se crea en `src/generated/prisma`, carpeta ignorada por git, por lo que hay que generarlo en cada copia nueva del repositorio:

```bash
npm run prisma:generate
```

4. Aplique las migraciones:

```bash
npx prisma migrate deploy
```

5. Cargue el seed base (`prisma/seed.js`): un usuario por rol y algunos datos académicos de ejemplo. Las cuentas están en [`../docs/guion-demostracion.md`](../docs/guion-demostracion.md):

```bash
npm run prisma:seed
```

6. Inicie el servidor en modo desarrollo:

```bash
npm run dev
```

7. Compruebe que responde:

```bash
curl http://localhost:3000/api/health
```

Si la conexión con MySQL falla, el servidor imprime el error y termina con código 1.

## Scripts

| Script | Comando real | Uso |
| --- | --- | --- |
| `npm run dev` | `node --watch src/server.js` | Desarrollo con reinicio automático |
| `npm start` | `node src/server.js` | Ejecución normal / producción |
| `npm run prisma:generate` | `prisma generate` | Regenera el cliente de Prisma |
| `npm run prisma:migrate` | `prisma migrate dev` | Crea y aplica migraciones en desarrollo |
| `npm run prisma:seed` | `prisma db seed` | Seed base (`prisma/seed.js`, configurado en `prisma7.config.ts`) |
| `npm run prisma:seed-demo` | `node prisma/seed-demo.js` | Datos de demostración (ver más abajo) |

No hay script de pruebas ni de lint en este paquete.

## Variables de entorno

Se leen con `dotenv` desde `backend/.env` (copia local de `.env.example`) o desde el entorno del servidor. Una variable ya definida en el entorno tiene prioridad sobre el archivo.

| Variable | Obligatoria | Descripción |
| --- | --- | --- |
| `DATABASE_URL` | Sí, para Prisma Migrate | URL `mysql://usuario:clave@host:puerto/base`. La lee `prisma7.config.ts` |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Sí | Conexión del servidor y de los seeds (`src/config/prisma.js`). `DB_PORT` vale 3306 si no se define |
| `JWT_SECRET` | Sí | Firma de los tokens. Sin ella el servidor no arranca (`src/utils/jwt.util.js` lanza un error al cargarse) |
| `JWT_EXPIRES_IN` | No | Duración del token. Por defecto `2h` |
| `PORT` | No | Puerto HTTP. Por defecto `3000` |
| `FRONTEND_URL` | No en desarrollo | Único origen permitido por CORS. Por defecto `http://localhost:5173`; en producción debe ser la URL pública del frontend |
| `NODE_ENV` | No | Con el valor exacto `development`, las respuestas de error incluyen un objeto `error` con nombre, código y stack. `seed-demo.js` se niega a correr con `production` |
| `SMTP_HOST` | No | Si está vacía, el envío de correo se simula (no sale ningún mensaje) |
| `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Solo si hay `SMTP_HOST` | `SMTP_PORT` debe ser un puerto válido y `SMTP_SECURE` debe ser `true` o `false`; si falta alguna, el servidor no arranca |

**Por qué hay dos juegos de variables de base de datos:** Prisma Migrate (`prisma7.config.ts`) lee `DATABASE_URL`, mientras que el servidor y los seeds crean su conexión con el adaptador de MariaDB a partir de `DB_*` (`src/config/prisma.js`). Ambos deben apuntar a la misma base.

## Estructura

```
backend/
├── prisma/
│   ├── migrations/        Migraciones SQL versionadas
│   ├── schema.prisma      Modelos y enums (cliente generado en src/generated/prisma)
│   ├── seed.js            Seed base (un usuario por rol y datos de ejemplo)
│   └── seed-demo.js       Datos de demostración
├── prisma7.config.ts      Configuración de Prisma Migrate (DATABASE_URL, seed)
└── src/
    ├── app.js             Express: CORS, parsers, rutas /api y manejo de errores
    ├── server.js          Arranque, conexión a MySQL y cierre ordenado (SIGINT/SIGTERM)
    ├── config/            Cliente de Prisma
    ├── routes/            Definición de endpoints y permisos por ruta
    ├── controllers/       Capa HTTP: leen la petición y arman la respuesta
    ├── services/          Reglas de negocio
    ├── repositories/      Acceso a datos con Prisma
    ├── middlewares/       auth (JWT), rbac (roles y PERMISOS) y errores
    ├── notifications/     Estrategias de envío de notificaciones
    ├── utils/             JWT, bcrypt y paginación
    └── generated/         Cliente de Prisma (no versionado)
```

## Convenciones

**Arquitectura por capas.** El flujo es `routes -> controllers -> services -> repositories`. El controlador no contiene reglas de negocio; el servicio no conoce Express; solo el repositorio habla con Prisma. Los errores se lanzan con `error.statusCode` y los resuelve el middleware global (`src/middlewares/error.middleware.js`).

**Respuestas JSON.** Las respuestas exitosas llevan `success: true` y `data`; varios controladores añaden además `error: null` o `message`. Los errores responden `{ success: false, message }` (más `error` solo con `NODE_ENV=development`). `GET /api/notas` y `GET /api/asistencia` admiten paginación opcional con `page` y `pageSize` (`src/utils/pagination.util.js`; por defecto 20, máximo 100): sin esos parámetros devuelven todos los registros, y con ellos añaden `meta` junto a `data`. `GET /api/comunicados` siempre pagina (`page` = 1 y `pageSize` = 20 por defecto, máximo 100) y devuelve `data = { comunicados, total, page, pageSize }`.

**Autenticación y roles (RBAC).** Todas las rutas, salvo `POST /api/auth/login`, pasan por `authenticate` (token `Bearer`, usuario existente y `ACTIVO`). Los permisos se declaran en `PERMISOS` (`src/middlewares/rbac.middleware.js`) y se aplican con `authorizeRoles(...PERMISOS.X.LEER)`. Un módulo nuevo se registra allí en lugar de escribir roles sueltos en la ruta.

**Notificaciones (patrón Strategy).** `INotificacionStrategy` define el contrato `enviar(destinatario, asunto, contenido)`; `EmailNotificacionStrategy` lo implementa con `nodemailer`. `src/notifications/index.js` crea el servicio con esa estrategia. Sin `SMTP_HOST` se usa un transporte simulado: no sale ningún correo y las notificaciones quedan en estado `PENDIENTE`. Los estados posibles son `PENDIENTE`, `ENVIADA` y `FALLIDA`.

## Endpoints

Todos cuelgan de `/api`. Además existen `GET /` y `GET /api/health`, ambos públicos.

| Prefijo | Rutas | Roles |
| --- | --- | --- |
| `/auth` | `POST /login` (público), `POST /logout`, `GET /me` | Autenticado |
| `/usuarios` | `GET /`, `GET /:id`, `POST /`, `PATCH /:id`, `PATCH /:id/estado`, `DELETE /:id` | `ADMINISTRADOR` |
| `/vinculos` | `GET /`, `POST /`, `DELETE /:id` (vínculos padre-estudiante) | `ADMINISTRADOR` |
| `/perfil` | `GET /`, `PATCH /`, `PATCH /password` | Todos |
| `/catalogos` | `GET /cursos`, `GET /cursos/:id/estudiantes`, `GET /asignaturas` | `DOCENTE`, `ADMINISTRADOR` |
| `/notas` | `POST /`, `PATCH /:id` (solo `DOCENTE`); `GET /` (todos los roles) | Según `PERMISOS.NOTAS` |
| `/asistencia` | `POST /` (solo `DOCENTE`); `GET /` (todos los roles) | Según `PERMISOS.ASISTENCIA` |
| `/padres` | `GET /mis-hijos` | `PADRE_FAMILIA` |
| `/comunicados` | `POST /`, `PUT /:id`, `DELETE /:id` (`DOCENTE`, `DIRECTIVO`); `GET /` (todos) | Según `PERMISOS.COMUNICADOS` |
| `/notificaciones` | `GET /`, `POST /reintentar` | `ADMINISTRADOR` |

En comunicados, docentes y directivos solo pueden modificar o eliminar los propios; esa regla la valida el servicio, no el middleware.

## Datos de demostración

`prisma/seed-demo.js` carga cursos, asignaturas, usuarios, vínculos, notas, asistencia y comunicados de ejemplo. Conviene ejecutar antes el seed base: sin él, el script avisa y omite los datos de las cuentas `estudiante@` y `padre@` (Laura y María). Es aditivo e idempotente, usa una sola transacción, no envía correos y no corre con `NODE_ENV=production`. Imprime la base de destino (`host`, `puerto`, `base`) antes de actuar: léala antes de confirmar.

```bash
npm run prisma:seed-demo -- --dry-run
```

Simula la carga y revierte todo al final. Sin `--dry-run` persiste los datos:

```bash
npm run prisma:seed-demo
```

Para eliminar solo lo creado por el seed (admite también `--dry-run`):

```bash
npm run prisma:seed-demo -- --limpiar
```

Las cuentas y la contraseña de demostración, el orden sugerido de la presentación y los límites de `--limpiar` están en [`../docs/guion-demostracion.md`](../docs/guion-demostracion.md).

## Cómo se conecta con el frontend

- El frontend consume esta API desde `VITE_API_URL`; si no se define, usa `http://localhost:3000/api`. Si cambia `PORT`, actualice esa variable en el frontend.
- CORS solo acepta el origen de `FRONTEND_URL` (por defecto `http://localhost:5173`). Las peticiones sin cabecera `Origin` (Postman, curl) se permiten.
- **Puerto ocupado:** si otro proceso usa el 5173, Vite arranca en el 5174 y el backend rechaza el inicio de sesión por CORS. Cierre el otro proceso o inicie el backend con `FRONTEND_URL=http://localhost:5174`.
- El frontend envía el JWT en la cabecera `Authorization: Bearer <token>`.

## Documentación relacionada

- [`../docs/verificar-migraciones-linux.md`](../docs/verificar-migraciones-linux.md): cómo comprobar las migraciones desde cero en un MySQL de Linux (distingue mayúsculas en nombres de tabla), qué hacer con bases ya existentes y tabla de variables de despliegue.
- [`../docs/guion-demostracion.md`](../docs/guion-demostracion.md): preparación y guion de la demostración.
- [`../docs/qa/sprint3-rf004-rf005-checklist.md`](../docs/qa/sprint3-rf004-rf005-checklist.md): checklist de QA de notas y asistencia.
- Documentos de diseño y requisitos en `../docs`: `ERS_EduConnect_BR_v1.0.docx`, `DDS_EduConnect_BR_v1.0.docx` y `Plan_Trabajo_EduConnect_BR_v1.0.docx`.
- [`../frontend/README.md`](../frontend/README.md): guía del cliente web.
