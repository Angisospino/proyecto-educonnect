# Verificar las migraciones en un MySQL de Linux

Antes de desplegar hay que comprobar que `prisma migrate deploy` funciona **desde cero** en el tipo de base donde se va a desplegar. En Windows y macOS MySQL ignora las mayúsculas en los nombres de tabla; en Linux (`lower_case_table_names=0`, lo habitual en servidores) **no**. Esta guía explica cómo comprobarlo, qué hacer con las bases que ya existen y qué variables de entorno necesita el despliegue.

## Resultado de la verificación (tarjeta `[Sprint 4 - 06] [04]`)

Probado con **MySQL 8.4.11 en Linux** (`lower_case_table_names = 0`) y 7 migraciones: las 5 de `main` más `add_comunicado` y `add_notificacion`, que están en PRs todavía sin fusionar.

- La migración `20260921212517_fix_usuario_tablename_y_indice_asistencia` **fallaba** (`P3018`, error 1146: `Table 'educonnect_test.asistencia' doesn't exist`). Usaba `asistencia`, `estudianteperfil`, `nota` y `usuario` en minúscula, pero la migración anterior crea `Asistencia`, `EstudiantePerfil`, `Nota` y `Usuario`. Una base nueva de Linux quedaba bloqueada ahí.
- Con los nombres corregidos, las 7 migraciones se aplican, `prisma migrate status` indica que la base está al día y `prisma migrate diff` contra `schema.prisma` no encuentra diferencias.
- El seed corre sin errores y el backend arranca contra esa base: `GET /api/health`, el login del seed y las consultas de notas y asistencia responden bien.

## Bases que ya existen

Corregir una migración ya aplicada cambia su checksum. Probado en una base que aplicó la versión vieja:

| Comando | Resultado |
| --- | --- |
| `npx prisma migrate deploy` | Sin errores ("No pending migrations to apply"). No compara el checksum. |
| `npx prisma migrate status` | "Database schema is up to date!". |
| `npx prisma migrate dev` (el `npm run prisma:migrate` de siempre) | **Se detiene**: "was modified after it was applied. We need to reset the database". |

Si se migra con `deploy`, las bases de pruebas o producción que ya aplicaron la versión vieja no se ven afectadas. Una base de Linux nunca pudo aplicarla, porque fallaba. Una base de **desarrollo** que aplicó la versión vieja tiene dos salidas:

1. **Perder los datos de desarrollo:** `npx prisma migrate reset` y, si hace falta, volver a cargar los datos de ejemplo con `npx prisma db seed`.
2. **Conservar los datos:** actualizar el checksum guardado al del archivo actual. En PowerShell, desde la raíz del repositorio:

   ```powershell
   (Get-FileHash backend\prisma\migrations\20260921212517_fix_usuario_tablename_y_indice_asistencia\migration.sql -Algorithm SHA256).Hash.ToLower()
   ```

   y en MySQL, con el valor obtenido:

   ```sql
   UPDATE _prisma_migrations
   SET checksum = '<valor obtenido>'
   WHERE migration_name = '20260921212517_fix_usuario_tablename_y_indice_asistencia';
   ```

   Después, `npx prisma migrate dev` responde "Already in sync".

> **Saltos de línea:** Prisma guarda el hash del archivo **tal como está en disco**, sin normalizar. Con CRLF (checkout de Windows con `core.autocrlf=true`) y con LF el valor es distinto, por eso hay que calcularlo siempre sobre el archivo local. Mientras el repositorio no fije los saltos de línea de los `.sql` (no hay `.gitattributes`), una base migrada en Windows y otra en Linux guardan checksums distintos para las mismas migraciones.

### Si ya se intentó migrar en Linux con la versión vieja

Esa base quedó con una migración marcada como fallida y `migrate deploy` se bloquea con `P3009` aunque el archivo ya esté corregido. La migración falló en su primera sentencia, así que no quedó nada a medias. Se resuelve marcándola como revertida y volviendo a migrar (probado):

```bash
npx prisma migrate resolve --rolled-back 20260921212517_fix_usuario_tablename_y_indice_asistencia
npx prisma migrate deploy
```

## Procedimiento para repetir la prueba

Requisito: Docker. La base de prueba se crea y se destruye sin tocar el `.env` ni la base de desarrollo. Prisma 7 encuentra `backend/prisma7.config.ts` por sí solo; todos los comandos se corren desde `backend/`.

1. **Levantar un MySQL 8 de Linux.** El puerto 3399 es un ejemplo: elegir uno libre (el 3306 suele estar ocupado por la base local).

   ```
   docker run -d --rm --name educonnect-mysql-linux-test -e MYSQL_ROOT_PASSWORD=<clave-de-prueba> -e MYSQL_DATABASE=educonnect_test -p 127.0.0.1:3399:3306 mysql:8
   ```

   Comprobar que distingue mayúsculas: `SELECT @@lower_case_table_names;` debe devolver `0`.

2. **Apuntar el entorno a esa base, solo en la terminal actual.** `dotenv` **no pisa** las variables ya definidas, así que no hace falta editar `.env`. Hay que definir **las dos familias juntas**: `DATABASE_URL` la lee Prisma Migrate (`prisma7.config.ts`) y `DB_*` las leen el seed y el servidor (`src/config/prisma.js`). Si falta una, esa parte usaría la base del `.env`. En PowerShell:

   ```powershell
   $env:DATABASE_URL = "mysql://root:<clave-de-prueba>@127.0.0.1:3399/educonnect_test"
   $env:DB_HOST = "127.0.0.1"; $env:DB_PORT = "3399"; $env:DB_USER = "root"
   $env:DB_PASSWORD = "<clave-de-prueba>"; $env:DB_NAME = "educonnect_test"
   ```

   Si la clave tiene caracteres especiales, codificarla en la URL de `DATABASE_URL` (por ejemplo `@` como `%40`).

3. **Comprobar el destino antes de migrar.** Las tres líneas deben mostrar `127.0.0.1`, el puerto de la prueba y `educonnect_test`:

   ```powershell
   $env:DATABASE_URL -replace ':[^:@]*@', ':****@'
   "$env:DB_HOST`:$env:DB_PORT/$env:DB_NAME"
   ```

   Si no coincide, **no seguir**: se está en otra terminal o falta una variable.

4. **Migrar desde cero y comprobar:**

   ```bash
   npx prisma migrate deploy
   npx prisma migrate status
   npx prisma migrate diff --from-config-datasource --to-schema prisma/schema.prisma --exit-code
   ```

   Prisma imprime la base a la que se conecta (`Datasource "db": MySQL database ... at ...`): comprobar que es la de prueba. `migrate diff` debe responder "No difference detected" (código de salida 0).

5. **Seed y servidor:** `node prisma/seed.js`, luego `npm run start` (con un `PORT` libre) y probar `GET /api/health` y un login del seed.

6. **Limpiar:** `docker stop educonnect-mysql-linux-test` (con `--rm` el contenedor se elimina solo) y cerrar la terminal para que las variables desaparezcan.

> Nunca correr `migrate deploy` ni `migrate reset` sin confirmar antes a qué base apunta `DATABASE_URL`.

## Variables de entorno del despliegue

Se leen de `backend/.env` (no se sube a git; la plantilla es `backend/.env.example`) o del entorno del servidor.

| Variable | Para qué | Notas |
| --- | --- | --- |
| `DATABASE_URL` | Prisma Migrate (`migrate deploy`, `status`, `diff`) | `mysql://usuario:clave@host:puerto/base` |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | Conexión del backend y del seed | Deben apuntar a la misma base que `DATABASE_URL` |
| `JWT_SECRET` | Firma de los tokens | **Obligatorio: sin él el servidor no arranca.** Secreto, largo y distinto en cada entorno |
| `JWT_EXPIRES_IN` | Duración de los tokens | Opcional, por defecto `2h` |
| `FRONTEND_URL` | Origen permitido por CORS | Por defecto `http://localhost:5173`: **en producción hay que definirla** con la URL pública del frontend |
| `PORT` | Puerto del servidor | Por defecto 3000 |
| `NODE_ENV` | Entorno | En producción, `production` (en desarrollo las respuestas de error incluyen un objeto `error` con detalles) |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Correo de las notificaciones (RF-009) | Solo existen desde el PR de la estrategia de correo. **Sin `SMTP_HOST` el envío se simula** (no sale ningún correo). `SMTP_SECURE` es `true` o `false` y `SMTP_PORT` un puerto válido |

El frontend usa `VITE_API_URL` (URL del backend con `/api`) en tiempo de compilación.
