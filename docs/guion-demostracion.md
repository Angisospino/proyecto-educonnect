# Guion de demostración de EduConnect BR

Guía para presentar lo implementado hasta el Sprint 4 con datos de prueba. Todo lo que aparece aquí se comprobó contra el backend real con los datos cargados.

## 1. Preparar el entorno

Desde `backend/`, con la base de desarrollo ya migrada (`npx prisma migrate deploy`):

```bash
npm run prisma:seed-demo -- --dry-run   # simula: muestra qué crearía y revierte todo
npm run prisma:seed-demo                # carga los datos de demostración
```

El script es **aditivo e idempotente**: busca cada registro por su clave natural y solo crea lo que falta, así que puede correrse varias veces (la segunda vez crea 0). Nunca modifica ni borra lo que ya existía. Se niega a correr con `NODE_ENV=production`.

Para dejar la base como estaba antes de la demo:

```bash
npm run prisma:seed-demo -- --limpiar --dry-run   # vista previa de lo que borraría
npm run prisma:seed-demo -- --limpiar             # borra solo lo creado por el seed
```

### Qué carga

| Dato | Cantidad |
| --- | --- |
| Cursos nuevos (6°B Mañana, 7°A Tarde; 6°A ya existía) | 2 |
| Asignaturas | 5 |
| Usuarios (docentes, directivo, 1 docente inactivo, 4 padres, 16 estudiantes) | 24 |
| Perfiles de estudiante (`DEMO-001`…) | 16 |
| Vínculos padre-estudiante | 6 |
| Notas | 151 |
| Asistencias | 457 |
| Comunicados | 15 |

Contraseña de **todas** las cuentas: `EduConnect123*`.

Límites de `--limpiar` que conviene conocer:

- Borra por claves exactas (correos, códigos `DEMO-*`, autor + título de cada comunicado, estudiante + asignatura + periodo + docente de cada nota). Las notas, asistencias y comunicados reales que se registren después no se tocan, y un usuario demo con datos propios creados después se conserva con un aviso.
- Los cursos `6°B` y `7°A` y las cinco asignaturas se borran **por nombre** si quedaron sin uso. Si en su base ya existía un curso o una asignatura vacía con ese mismo nombre, la carga la reutiliza y la limpieza la borra. Revise la vista previa (`--dry-run`) antes de limpiar.
- La protección contra producción solo actúa con `NODE_ENV=production`. El script imprime el destino (`host`, `puerto`, `base`) al empezar: léalo antes de confirmar una carga en una base que no sea la suya.

### Levantar la aplicación

Backend (desde `backend/`) y frontend (desde `frontend/`):

```bash
npm run dev
```

Dos advertencias para el día de la presentación:

- **Puerto 5173 ocupado.** Si otro proyecto usa el 5173, Vite pasará al 5174 y el backend rechazará el inicio de sesión por CORS, porque `FRONTEND_URL` vale `http://localhost:5173` por defecto. Cierre el otro servidor o arranque el backend con `FRONTEND_URL=http://localhost:5174`.
- **Correo.** Con `SMTP_HOST` vacío las notificaciones se simulan y no sale ningún correo. Verifique el log de arranque del backend antes de publicar comunicados en vivo: si hay un SMTP real configurado, los destinatarios son usuarios reales de la base.

## 2. Cuentas de la demostración

| Rol | Correo | Qué muestra |
| --- | --- | --- |
| Administrador | `admin@educonnectbr.edu.co` | Usuarios (30), vínculos |
| Directivo | `marta.rojas@educonnectbr.edu.co` | Comunicados |
| Docente | `ana.torres@educonnectbr.edu.co` | Notas, asistencia, comunicados propios |
| Docente | `luis.ortega@educonnectbr.edu.co` | Segundo docente (el seed también deja `docente@`) |
| Docente inactivo | `roberto.diaz@educonnectbr.edu.co` | No puede iniciar sesión (403) |
| Estudiante | `estudiante@educonnectbr.edu.co` (Laura Rodríguez, 6°A) | Dashboard, notas y asistencia con paginación |
| Estudiante | `sofia.ramirez@educonnectbr.edu.co` (6°A) | Pocas notas, sin paginación |
| Padre con 2 hijos | `padre@educonnectbr.edu.co` (María Rodríguez) | Selector de hijo: Laura (6°A) y Mateo (7°A) |
| Padre con 2 hijos | `pedro.herrera@educonnectbr.edu.co` | Santiago (6°A) y Emmanuel (6°B) |
| Padre con 1 hijo | `jorge.ramirez@educonnectbr.edu.co`, `claudia.castro@educonnectbr.edu.co`, `luz.moreno@educonnectbr.edu.co` | Un solo hijo, sin selector |
| Padre sin hijos | `padre.sinhijos@educonnectbr.edu.co` | Estado vacío |

Los demás estudiantes del seed siguen el patrón `nombre.apellido@educonnectbr.edu.co` (por ejemplo `mateo.rodriguez@`, `valentina.castro@`).

## 3. Orden sugerido (unos 10 minutos)

1. **Inicio de sesión y roles** — entre como administrador; muestre que el menú cambia según el rol en cada paso siguiente.
2. **Administrador → Usuarios** (`/admin/usuarios`) — lista de 30 usuarios con paginación (1 - 10 de 30), búsqueda, filtros por rol y estado. Roberto Díaz aparece como inactivo.
3. **Administrador → Vínculos** (`/admin/vinculos`) — 7 vínculos entre padres y estudiantes; formulario para vincular (padre → curso → estudiante) y eliminación con confirmación.
4. **Docente** (`ana.torres@`) — `/notas` (registrar y consultar), `/asistencia` (registrar y consultar), `/comunicados`: publicar un comunicado nuevo y editar o eliminar uno propio (los de otros autores no muestran esos botones).
5. **Estudiante** (`estudiante@`) — dashboard con **resumen académico** (promedio 3.9 sobre 21 notas; asistencia 75 %, 24 de 32 registros presentes; último comunicado), luego `/notas` y `/asistencia` con paginación de 10 en 10.
6. **Padre** (`padre@`) — dashboard con selector de hijo: al cambiar de Laura a Mateo el resumen se actualiza (Mateo: 4.0 con 12 notas, asistencia 81 %, 22 de 27). Luego notas y asistencia del hijo elegido.
7. **Padre sin hijos** (`padre.sinhijos@`) — muestra el estado vacío en lugar de un error.
8. **Directivo** (`marta.rojas@`) — consulta de comunicados y vista de gestión propia.
9. **Cierre** — pantallas "Próximamente" (Notificaciones, Reportes, Configuración) para mostrar lo que sigue en el Sprint 5.

## 4. Si algo sale mal

- **"No me deja iniciar sesión"** — revise el puerto del frontend y `FRONTEND_URL` (ver advertencias arriba) y que el backend responda en `http://localhost:3000/api/health`.
- **Datos duplicados o extraños** — `npm run prisma:seed-demo -- --limpiar` y vuelva a cargar. Los usuarios y registros que ya existían antes del seed no se tocan.
- **Error de migraciones en otra máquina** — siga `docs/verificar-migraciones-linux.md` (la migración 3 cambió de contenido en el PR #58 y una base antigua necesita resolver el checksum).
