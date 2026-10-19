
import { useEffect, useMemo, useState } from "react";

import Select from "../../components/ui/Select.jsx";
import Button from "../../components/ui/Button.jsx";

import asistenciaService from "../../services/asistencia.service.js";
import catalogoService from "../../services/catalogo.service.js";

import "./RegistrarAsistencia.css";

/* ==========================================
   CONSTANTES
   ========================================== */

const ESTADOS = {
  PRESENTE: "PRESENTE",
  AUSENTE: "AUSENTE",
  TARDANZA: "TARDANZA",
};

const obtenerFechaLocal = () => {
  const fecha = new Date();

  const anio = fecha.getFullYear();
  const mes = String(
    fecha.getMonth() + 1
  ).padStart(2, "0");

  const dia = String(
    fecha.getDate()
  ).padStart(2, "0");

  return `${anio}-${mes}-${dia}`;
};

const obtenerMensajeError = (
  error,
  porDefecto = "Error desconocido."
) => {
  const mensaje = error?.response?.data?.message;
  const detalle = error?.response?.data?.error;

  if (typeof mensaje === "string") return mensaje;
  if (typeof detalle === "string") return detalle;

  return error?.message || porDefecto;
};

// El servicio devuelve el sobre del backend
// ({ success, data, error }); se extrae la lista.
const extraerLista = (respuesta) => {
  const lista = Array.isArray(respuesta)
    ? respuesta
    : respuesta?.data;

  return Array.isArray(lista) ? lista : [];
};

const obtenerNombreEstudiante = (estudiante) => {
  const nombre =
    `${estudiante.usuario?.apellido ?? ""} ${estudiante.usuario?.nombre ?? ""}`.trim();

  return estudiante.codigoEstudiantil
    ? `${nombre} (${estudiante.codigoEstudiantil})`
    : nombre;
};

// Referencia estable para "sin estudiantes" (evita recalcular
// los useMemo que dependen de la lista en cada render).
const SIN_ESTUDIANTES = [];

// Estado inicial de los estudiantes cargados: sin curso asociado.
const ESTUDIANTES_INICIAL = {
  cursoId: "",
  lista: SIN_ESTUDIANTES,
  error: "",
};

/* ==========================================
   COMPONENTE
   ========================================== */

// Los catálogos (cursos y estudiantes del curso seleccionado)
// se cargan desde catalogo.service.js.
export default function RegistrarAsistencia() {
  const [cursoId, setCursoId] = useState("");
  const [fecha, setFecha] = useState(
    obtenerFechaLocal
  );

  const [asistencias, setAsistencias] =
    useState({});

  const [guardando, setGuardando] =
    useState(false);

  const [mensaje, setMensaje] =
    useState(null);

  const [errores, setErrores] =
    useState([]);

  /* ==========================================
     CATÁLOGOS
     ========================================== */

  const [cursos, setCursos] = useState([]);
  const [cargandoCursos, setCargandoCursos] =
    useState(true);
  const [errorCursos, setErrorCursos] = useState("");

  const [estudiantesCargados, setEstudiantesCargados] =
    useState(ESTUDIANTES_INICIAL);

  // Cursos: una sola carga al montar.
  useEffect(() => {
    let activo = true;

    const cargarCursos = async () => {
      try {
        const respuesta =
          await catalogoService.obtenerCursos();

        if (!activo) return;

        setCursos(extraerLista(respuesta));
      } catch (error) {
        if (!activo) return;

        setErrorCursos(
          obtenerMensajeError(
            error,
            "No fue posible cargar los cursos."
          )
        );
      } finally {
        if (activo) setCargandoCursos(false);
      }
    };

    cargarCursos();

    return () => {
      activo = false;
    };
  }, []);

  // Estudiantes: se vuelven a cargar al cambiar el curso.
  // El resultado queda asociado al curso que lo originó; la
  // limpieza del efecto descarta respuestas de un curso
  // anterior o recibidas tras desmontar.
  useEffect(() => {
    if (!cursoId) return;

    let activo = true;

    const cargarEstudiantes = async () => {
      try {
        const respuesta =
          await catalogoService.obtenerEstudiantesDeCurso(
            cursoId
          );

        if (!activo) return;

        setEstudiantesCargados({
          cursoId,
          lista: extraerLista(respuesta),
          error: "",
        });
      } catch (error) {
        if (!activo) return;

        setEstudiantesCargados({
          cursoId,
          lista: SIN_ESTUDIANTES,
          error: obtenerMensajeError(
            error,
            "No fue posible cargar los estudiantes del curso."
          ),
        });
      }
    };

    cargarEstudiantes();

    return () => {
      activo = false;
    };
  }, [cursoId]);

  /* ==========================================
     ESTUDIANTES DEL CURSO
     ========================================== */

  // Solo se consideran los estudiantes cargados para el
  // curso actualmente seleccionado.
  const estudiantesVigentes =
    estudiantesCargados.cursoId === cursoId;

  const estudiantesDelCurso = estudiantesVigentes
    ? estudiantesCargados.lista
    : SIN_ESTUDIANTES;

  const errorEstudiantes = estudiantesVigentes
    ? estudiantesCargados.error
    : "";

  const cargandoEstudiantes =
    Boolean(cursoId) && !estudiantesVigentes;

  const errorCarga = errorCursos || errorEstudiantes;

  /* ==========================================
     OPCIONES DE CURSOS
     ========================================== */

  // El placeholder lo aporta el propio Select (opción vacía).
  const opcionesCursos = cursos.map((curso) => ({
    value: String(curso.id),
    label: curso.nombre,
  }));

  /* ==========================================
     REINICIAR AL CAMBIAR CURSO O FECHA
     ========================================== */

  const reiniciarJornada = () => {
    setAsistencias({});
    setMensaje(null);
    setErrores([]);
  };

  // Select e Input pasan onChange directo al elemento nativo:
  // el handler recibe el evento, no el valor.
  const manejarCambioCurso = (evento) => {
    setCursoId(evento.target.value);
    reiniciarJornada();
  };

  const manejarCambioFecha = (evento) => {
    setFecha(evento.target.value);
    reiniciarJornada();
  };

  /* ==========================================
     MARCAR ASISTENCIA
     ========================================== */

  const marcarAsistencia = (
    estudianteId,
    estado
  ) => {
    if (guardando) return;

    setAsistencias((anterior) => ({
      ...anterior,
      [estudianteId]: estado,
    }));

    setMensaje(null);
    setErrores([]);
  };

  /* ==========================================
     MARCAR TODOS PRESENTES
     ========================================== */

  const marcarTodosPresentes = () => {
    if (guardando) return;

    const nuevosEstados = {};

    estudiantesDelCurso.forEach(
      (estudiante) => {
        nuevosEstados[estudiante.id] =
          ESTADOS.PRESENTE;
      }
    );

    setAsistencias(nuevosEstados);
    setMensaje(null);
    setErrores([]);
  };

  /* ==========================================
     ESTADÍSTICAS
     ========================================== */

  const resumen = useMemo(() => {
    const conteo = {
      PRESENTE: 0,
      AUSENTE: 0,
      TARDANZA: 0,
      SIN_MARCAR: 0,
    };

    estudiantesDelCurso.forEach(
      (estudiante) => {
        const estado =
          asistencias[estudiante.id];

        if (estado && conteo[estado] !== undefined) {
          conteo[estado] += 1;
        } else {
          conteo.SIN_MARCAR += 1;
        }
      }
    );

    return conteo;
  }, [estudiantesDelCurso, asistencias]);

  /* ==========================================
     GUARDAR ASISTENCIA
     ========================================== */

  const guardarAsistencia = async (evento) => {
    evento.preventDefault();

    if (guardando) return;

    if (!cursoId || !fecha) {
      setMensaje({
        tipo: "error",
        texto: "Selecciona un curso y una fecha.",
      });
      return;
    }

    if (estudiantesDelCurso.length === 0) {
      setMensaje({
        tipo: "error",
        texto:
          "El curso seleccionado no tiene estudiantes.",
      });
      return;
    }

    const estudiantesMarcados =
      estudiantesDelCurso.filter(
        (estudiante) =>
          Object.values(ESTADOS).includes(
            asistencias[estudiante.id]
          )
      );

    if (estudiantesMarcados.length === 0) {
      setMensaje({
        tipo: "error",
        texto:
          "Debes marcar al menos un estudiante.",
      });
      return;
    }

    setGuardando(true);
    setMensaje(null);
    setErrores([]);

    let registrados = 0;
    const erroresRegistro = [];

    // Se procesan secuencialmente para controlar
    // los resultados de cada solicitud.
    for (const estudiante of estudiantesMarcados) {
      try {
        await asistenciaService.registrarAsistencia({
          estudianteId: Number(estudiante.id),
          cursoId: Number(cursoId),
          fecha,
          estado: asistencias[estudiante.id],
        });

        registrados += 1;
      } catch (error) {
        erroresRegistro.push({
          estudianteId: estudiante.id,
          nombre: obtenerNombreEstudiante(estudiante),
          mensaje: obtenerMensajeError(error),
        });
      }
    }

    setGuardando(false);
    setErrores(erroresRegistro);

    if (erroresRegistro.length === 0) {
      setMensaje({
        tipo: "exito",
        texto:
          `Se registró correctamente la asistencia ` +
          `de ${registrados} estudiante(s).`,
      });

      setAsistencias({});
    } else {
      setMensaje({
        tipo: "error",
        texto:
          `Se registraron ${registrados} de ` +
          `${estudiantesMarcados.length} asistencias. ` +
          `Revisa los errores antes de volver a guardar.`,
      });

      // Se mantienen marcados únicamente los
      // registros que fallaron para evitar reenviar
      // los que ya se guardaron correctamente.
      const pendientes = {};

      erroresRegistro.forEach((error) => {
        pendientes[error.estudianteId] =
          asistencias[error.estudianteId];
      });

      setAsistencias(pendientes);
    }
  };

  /* ==========================================
     INTERFAZ
     ========================================== */

  return (
    <main className="registrar-asistencia">
      <header className="registrar-asistencia__header">
        <h1>Registrar asistencia</h1>
        <p>
          Selecciona un curso y registra el estado
          de asistencia de sus estudiantes.
        </p>
      </header>

      <section className="registrar-asistencia__card">
        <div className="registrar-asistencia__section-header">
          <h2>Datos de la jornada</h2>
          <p>
            Selecciona el curso y la fecha.
          </p>
        </div>

        <form onSubmit={guardarAsistencia}>
          <div className="registrar-asistencia__filters">
            <div className="registrar-asistencia__field">
              <label htmlFor="asistencia-curso">
                Curso
              </label>

              <Select
                id="asistencia-curso"
                name="cursoId"
                value={cursoId}
                options={opcionesCursos}
                placeholder={
                  cargandoCursos
                    ? "Cargando cursos..."
                    : "Selecciona un curso"
                }
                onChange={manejarCambioCurso}
                disabled={guardando || cargandoCursos}
              />
            </div>

            <div className="registrar-asistencia__field">
              <label htmlFor="asistencia-fecha">
                Fecha
              </label>

              <input
                id="asistencia-fecha"
                type="date"
                value={fecha}
                onChange={manejarCambioFecha}
                disabled={guardando}
                required
              />
            </div>
          </div>

          {errorCarga && (
            <div
              className="registrar-asistencia__mensaje registrar-asistencia__mensaje--error"
              role="alert"
            >
              {errorCarga}
            </div>
          )}

          {mensaje && (
            <div
              className={
                `registrar-asistencia__mensaje ` +
                `registrar-asistencia__mensaje--${mensaje.tipo}`
              }
              role={
                mensaje.tipo === "error"
                  ? "alert"
                  : "status"
              }
            >
              {mensaje.texto}
            </div>
          )}

          {cursoId && (
            <>
              <div className="registrar-asistencia__list-header">
                <div>
                  <h2>Lista de estudiantes</h2>
                  <p>
                    {cargandoEstudiantes
                      ? "Cargando estudiantes..."
                      : `${estudiantesDelCurso.length} estudiante(s) en el curso.`}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={marcarTodosPresentes}
                  disabled={
                    guardando ||
                    cargandoEstudiantes ||
                    estudiantesDelCurso.length === 0
                  }
                >
                  Todos presentes
                </Button>
              </div>

              <div className="registrar-asistencia__summary">
                <span>
                  Presentes: {resumen.PRESENTE}
                </span>
                <span>
                  Ausentes: {resumen.AUSENTE}
                </span>
                <span>
                  Tardanzas: {resumen.TARDANZA}
                </span>
                <span>
                  Sin marcar: {resumen.SIN_MARCAR}
                </span>
              </div>

              {cargandoEstudiantes ? (
                <div
                  className="registrar-asistencia__empty"
                  role="status"
                >
                  Cargando estudiantes...
                </div>
              ) : estudiantesDelCurso.length === 0 ? (
                <div className="registrar-asistencia__empty">
                  {errorEstudiantes
                    ? "No se pudieron cargar los estudiantes de este curso."
                    : "No hay estudiantes disponibles para este curso."}
                </div>
              ) : (
                <div className="registrar-asistencia__table-wrapper">
                  <table className="registrar-asistencia__table">
                    <thead>
                      <tr>
                        <th scope="col">
                          Estudiante
                        </th>
                        <th scope="col">
                          Presente
                        </th>
                        <th scope="col">
                          Ausente
                        </th>
                        <th scope="col">
                          Tardanza
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {estudiantesDelCurso.map(
                        (estudiante) => {
                          const nombre =
                            obtenerNombreEstudiante(estudiante);

                          return (
                            <tr key={estudiante.id}>
                              <td>{nombre}</td>

                              {Object.values(ESTADOS).map(
                                (estado) => (
                                  <td key={estado}>
                                    <input
                                      type="radio"
                                      name={`asistencia-${estudiante.id}`}
                                      value={estado}
                                      aria-label={
                                        `${nombre}: ${estado}`
                                      }
                                      checked={
                                        asistencias[
                                          estudiante.id
                                        ] === estado
                                      }
                                      onChange={() =>
                                        marcarAsistencia(
                                          estudiante.id,
                                          estado
                                        )
                                      }
                                      disabled={guardando}
                                    />
                                  </td>
                                )
                              )}
                            </tr>
                          );
                        }
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {errores.length > 0 && (
                <div
                  className="registrar-asistencia__errors"
                  role="alert"
                >
                  <h3>
                    Registros no guardados
                  </h3>

                  <ul>
                    {errores.map((error) => (
                      <li key={error.estudianteId}>
                        <strong>
                          {error.nombre}:
                        </strong>{" "}
                        {error.mensaje}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="registrar-asistencia__actions">
                <Button
                  type="submit"
                  disabled={
                    guardando ||
                    resumen.PRESENTE +
                      resumen.AUSENTE +
                      resumen.TARDANZA === 0
                  }
                >
                  {guardando
                    ? "Guardando asistencia..."
                    : "Guardar asistencia"}
                </Button>
              </div>
            </>
          )}
        </form>
      </section>
    </main>
  );
}
