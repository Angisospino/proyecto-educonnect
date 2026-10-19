# Checklist QA — Sprint 3: RF-004 y RF-005

**Proyecto:** EduConnect BR  
**Requisitos:** RF-004 Gestión de notas; RF-005 Control de asistencia  
**Fuente:** ERS_EduConnect_BR_v1.0, sección 3.1; criterios complementarios de RF-006 y RF-011.  
**Estado general:** ⬜ Pendiente de ejecución  
**Fecha de ejecución:** __________  
**Responsable QA:** __________  
**Rama / commit de `main`:** __________  
**Entorno / URL:** __________  
**PR relacionados:** __________

> **Regla de liberación:** No aprobar ni fusionar un PR si existe un defecto reproducible que incumpla un criterio de aceptación, filtre información de otro usuario o permita una operación no autorizada. Registrar el defecto como comentario en el PR correspondiente y repetir la prueba tras la corrección.

## 1. Prerrequisitos y datos de prueba

- [ ] Confirmar que todas las tarjetas de frontend y backend de notas y asistencia estén fusionadas a `main`.
- [ ] Confirmar que `GET/POST/PATCH /api/notas` y `GET/POST /api/asistencia` respondan en el entorno de pruebas, según las rutas implementadas.
- [ ] Confirmar que las pantallas reales sustituyen a los stubs con datos fijos.
- [ ] Confirmar que los componentes de registro y consulta están conectados a sus servicios Axios.
- [ ] Preparar cuentas de prueba: docente A, docente B, estudiante A, estudiante B, padre vinculado al estudiante A, padre no vinculado, directivo.
- [ ] Preparar al menos dos cursos y dos asignaturas, con estudiantes diferenciados.
- [ ] Verificar que las cuentas y relaciones padre-hijo correspondan a los registros de prueba; no usar datos personales reales.
- [ ] Registrar los IDs de notas y asistencias de prueba para contrastar persistencia en base de datos.

**Convenciones:** ⬜ pendiente · ✅ aprobado · ❌ falló · ➖ no aplica / no implementado (justificar). Cada caso debe documentar resultado real, evidencia y defecto/PR si corresponde.

## 2. RF-004 — Gestión de notas

**Criterios de aceptación textuales de la ERS:**
1. «El docente podrá registrar notas por asignatura».
2. «Las modificaciones quedarán actualizadas».
3. «El estudiante podrá visualizar únicamente sus notas».

| ID | Rol | Prueba / pasos | Resultado esperado | Estado | Evidencia / defecto |
|---|---|---|---|---|---|
| N-01 | Docente | Abrir RegistrarNotas, elegir curso, estudiante, asignatura, valor y período; guardar. | Nota creada para la asignatura y estudiante seleccionados; confirmación visible. **ERS 1** | ⬜ | |
| N-02 | Docente | Registrar valores límite `0.0` y `5.0`. | Ambos valores se aceptan y persisten. | ⬜ | |
| N-03 | Docente | Intentar `-0.1`, `5.1`, texto y campos obligatorios vacíos. | Formulario y API rechazan datos inválidos; no se crea registro. | ⬜ | |
| N-04 | Docente | Editar una nota existente, recargar y consultar nuevamente. | El nuevo valor permanece actualizado en base de datos. **ERS 2** | ⬜ | |
| N-05 | Docente | Intentar modificar una nota de un curso/asignatura ajenos a su asignación. | API deniega la modificación sin alterar datos. | ⬜ | |
| N-06 | Estudiante | Iniciar sesión como estudiante A y abrir MisNotas. | Solo aparecen notas del estudiante A. **ERS 3** | ⬜ | |
| N-07 | Estudiante | Manipular `estudianteId` en la URL/API para solicitar notas del estudiante B. | No se exponen notas del estudiante B; respuesta limitada o denegada. **ERS 3** | ⬜ | |
| N-08 | Estudiante | Intentar POST/PATCH a `/api/notas`. | Operaciones de escritura denegadas. | ⬜ | |
| N-09 | Padre | Consultar notas de un hijo vinculado, si el alcance y backend lo permiten. | Ve exclusivamente las notas de sus hijos autorizados. | ⬜ | |
| N-10 | Padre | Solicitar notas de un estudiante no vinculado; intentar POST/PATCH. | Sin acceso a datos ajenos ni permisos de escritura. | ⬜ | |
| N-11 | Directivo | Consultar notas de distintos cursos/estudiantes. | Puede consultar todas las notas autorizadas por el diseño; no puede crear/editar. | ⬜ | |
| N-12 | Todos | Cerrar sesión y acceder directamente a notas/API sin token o con token inválido. | Acceso denegado; no se filtran datos. | ⬜ | |

> **Aclaración de alcance:** Los tres criterios ERS de RF-004 se comprueban en N-01, N-04 y N-06/N-07. Las consultas de padre y directivo proceden de la matriz de permisos/alcance solicitado; deben contrastarse con la implementación aprobada. Si aún no existe una pantalla de consulta para esos roles, registrar el faltante como brecha, no marcarlo aprobado.

## 3. RF-005 — Control de asistencia

**Criterios de aceptación textuales de la ERS:**
1. «El sistema registrará asistencia o inasistencia».
2. «Los estudiantes y padres podrán consultar la asistencia».
3. «La información quedará almacenada correctamente».

| ID | Rol | Prueba / pasos | Resultado esperado | Estado | Evidencia / defecto |
|---|---|---|---|---|---|
| A-01 | Docente | Seleccionar curso y fecha; marcar un estudiante `PRESENTE` y otro `AUSENTE`; guardar. | Se registran los estados correctos. **ERS 1** | ⬜ | |
| A-02 | Docente | Marcar `TARDANZA` y guardar. | Se conserva exactamente `TARDANZA`, según el enum implementado. | ⬜ | |
| A-03 | Docente | Registrar varias asistencias y recargar/consultar la fecha. | Los registros persisten y corresponden a estudiante, curso y fecha. **ERS 3** | ⬜ | |
| A-04 | Docente | Guardar sin curso, sin estudiantes marcados o con estado inválido enviado directamente a API. | No se crean registros incorrectos; errores claros. | ⬜ | |
| A-05 | Docente | Registrar dos veces el mismo estudiante/fecha/curso. | Comportamiento coherente con la regla de duplicados aprobada; no hay duplicación silenciosa. | ⬜ | |
| A-06 | Docente | Intentar registrar asistencia de curso no asignado. | API deniega la operación. | ⬜ | |
| A-07 | Estudiante | Abrir ConsultarAsistencia como estudiante A. | Se muestran solo sus registros, con fecha y estado correcto. **ERS 2** | ⬜ | |
| A-08 | Estudiante | Alterar `estudianteId` para consultar asistencia de estudiante B. | No se muestran datos del estudiante B. | ⬜ | |
| A-09 | Estudiante | Intentar POST a `/api/asistencia`. | Operación denegada. | ⬜ | |
| A-10 | Padre | Consultar asistencia de un hijo vinculado. | Se muestran únicamente registros de sus hijos autorizados. **ERS 2** | ⬜ | |
| A-11 | Padre | Solicitar asistencia de un estudiante no vinculado; intentar POST. | No se exponen registros ajenos ni se permite registrar asistencia. | ⬜ | |
| A-12 | Directivo | Consultar asistencia de diferentes cursos. | Consulta global autorizada según matriz de permisos; sin capacidad de registrar. | ⬜ | |
| A-13 | Estudiante/Padre | Ver registros de los tres estados. | `Badge` diferencia visualmente PRESENTE/AUSENTE/TARDANZA y presenta texto legible. | ⬜ | |
| A-14 | Todos | Consultar sin sesión, con token inválido o expirado. | Acceso denegado y datos protegidos. | ⬜ | |

> **Aclaración de alcance:** La ERS exige consulta para estudiantes y padres. La consulta global del directivo es una prueba adicional derivada de los permisos previstos y debe comprobarse contra el alcance efectivamente aprobado.

## 4. Verificación transversal de aceptación

| ID | Requisito relacionado | Verificación | Estado | Evidencia / defecto |
|---|---|---|---|---|
| T-01 | RF-006 | Estudiante y padre solo visualizan información académica autorizada. | ⬜ | |
| T-02 | RF-006 | Las consultas muestran datos actualizados tras un registro/cambio. | ⬜ | |
| T-03 | RF-006 | Las vistas son comprensibles y permiten consultar sin pasos innecesarios. | ⬜ | |
| T-04 | RF-011 | El control de acceso se aplica en frontend **y backend**, incluso ante solicitudes HTTP directas. | ⬜ | |
| T-05 | RNF-001 | Operaciones comunes responden en **3 segundos o menos** bajo las condiciones de prueba documentadas. | ⬜ | |
| T-06 | RNF-002 | Usuarios no autenticados y roles no autorizados no pueden acceder a funciones ni datos protegidos. | ⬜ | |
| T-07 | Integración | No hay nombres ni registros hardcodeados en MisNotas o ConsultarAsistencia. | ⬜ | |
| T-08 | Integración | Las rutas no colisionan entre vistas de docente y vistas de consulta; los cuatro roles navegan correctamente. | ⬜ | |
| T-09 | Persistencia | Verificar en base de datos que el registro leído coincide con lo guardado y con su estudiante correcto. | ⬜ | |
| T-10 | Errores | Errores 400/401/403/404/500 se manejan sin pantalla en blanco ni filtración de información interna. | ⬜ | |

## 5. Evidencias mínimas por caso

Para cada prueba registrar: fecha/hora, entorno, rol y usuario de prueba, pasos realizados, datos usados, resultado esperado, resultado obtenido, respuesta HTTP relevante, captura o log anonimizado, estado y enlace al comentario/PR. No adjuntar contraseñas, JWT ni datos personales reales.

## 6. Plantilla de comentario de defecto en PR

```md
### [QA][RF-004/RF-005] Título breve del defecto

- **Caso:** N-__/A-__/T-__
- **Severidad:** Bloqueante / Alta / Media / Baja
- **Entorno y commit:** ...
- **Rol afectado:** ...
- **Precondiciones:** ...
- **Pasos para reproducir:** 1. ... 2. ... 3. ...
- **Resultado esperado:** ...
- **Resultado observado:** ...
- **Evidencia:** captura/log anonimizado y código HTTP
- **Criterio ERS afectado:** ...
- **Acción requerida:** corregir y repetir el caso antes del merge
```

**Regla:** Publicar el comentario en el PR que introdujo el defecto; si el problema ya está en `main`, abrir incidencia de seguimiento y vincularla al PR correctivo. No aprobar el PR afectado hasta contar con evidencia de corrección y regresión.

## 7. Acta de cierre QA

| Indicador | Valor |
|---|---|
| Total de casos | 36 |
| Aprobados | 0 |
| Fallidos | 0 |
| Pendientes | 36 |
| No aplican (con justificación) | 0 |
| Defectos bloqueantes/altos abiertos | Por determinar |
| Resultado final | **PENDIENTE — NO APROBADO AÚN** |

**QA responsable:** ____________________  
**Fecha:** ____________________  
**Commit verificado:** ____________________  
**Enlaces de evidencias:** ____________________  
**Decisión:** ⬜ Aprobado para merge · ⬜ Rechazado por defectos · ☑ Pendiente de ejecución

> **Condición de cierre:** todos los criterios de aceptación de RF-004 y RF-005 deben estar demostrados con evidencia; cualquier caso no aplicable debe justificarse y aprobarse formalmente. Repetir las pruebas de regresión de los módulos afectados después de cada corrección.
