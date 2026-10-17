
import { useEffect, useMemo, useState } from "react";

import Select from "../../components/ui/Select";
import Button from "../../components/ui/Button";

import asistenciaService from "../../services/asistencia.service";

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

const obtenerMensajeError = (error) => {
  const mensaje = error?.response?.data?.message;
  const detalle = error?.response?.data?.error;

  if (typeof mensaje === "string") return mensaje;
  if (typeof detalle === "string") return detalle;

  return error?.message || "Error desconocido.";
};

/* ==========================================
   COMPONENTE
   ========================================== */

export default function RegistrarAsistencia({
  cursos = [],
  estudiantes = [],
}) {
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
     ESTUDIANTES DEL CURSO
     ========================================== */

  const estudiantesDelCurso = useMemo(() => {
    if (!cursoId) return [];

    return estudiantes.filter(
      (estudiante) =>
        String(estudiante.cursoId) ===
        String(cursoId)
    );
  }, [estudiantes, cursoId]);

  /* ==========================================
     OPCIONES DE CURSOS
     ========================================== */

  const opcionesCursos = [
    {
      value: "",
      label: "Selecciona un curso",
    },
    ...cursos.map((curso) => ({
      value: String(curso.id),
      label: curso.nombre,
    })),
  ];

  /* ==========================================
     REINICIAR AL CAMBIAR CURSO
     ========================================== */

  useEffect(() => {
    setAsistencias({});
    setMensaje(null);
    setErrores([]);
  }, [cursoId, fecha]);

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
          nombre:
            estudiante.nombreCompleto ||
            `${estudiante.nombre ?? ""} ${estudiante.apellido ?? ""}`.trim(),
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
                onChange={setCursoId}
                disabled={guardando}
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
                onChange={(evento) =>
                  setFecha(evento.target.value)
                }
                disabled={guardando}
                required
              />
            </div>
          </div>

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
                    {estudiantesDelCurso.length}
                    {" "}estudiante(s) en el curso.
                  </p>
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  onClick={marcarTodosPresentes}
                  disabled={
                    guardando ||
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

              {estudiantesDelCurso.length === 0 ? (
                <div className="registrar-asistencia__empty">
                  No hay estudiantes disponibles
                  para este curso.
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
                            estudiante.nombreCompleto ||
                            `${estudiante.nombre ?? ""} ${estudiante.apellido ?? ""}`.trim();

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
