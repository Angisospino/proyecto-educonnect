
import { useEffect, useState } from "react";

import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Button from "../../components/ui/Button.jsx";

import notaService from "../../services/nota.service.js";
import catalogoService from "../../services/catalogo.service.js";

import "./RegistrarNotas.css";

const ESTADO_INICIAL = {
  cursoId: "",
  estudianteId: "",
  asignaturaId: "",
  valor: "",
  periodo: "",
};

const obtenerMensajeError = (
  error,
  porDefecto = "No fue posible registrar la nota."
) => {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    porDefecto
  );
};

// El servicio devuelve el sobre del backend
// ({ success, data, error }); se extrae la lista.
const extraerLista = (respuesta) => {
  const lista = Array.isArray(respuesta)
    ? respuesta
    : respuesta?.data;

  return Array.isArray(lista) ? lista : [];
};

const obtenerEtiquetaEstudiante = (estudiante) => {
  const nombre =
    `${estudiante.usuario?.apellido ?? ""} ${estudiante.usuario?.nombre ?? ""}`.trim();

  return estudiante.codigoEstudiantil
    ? `${nombre} (${estudiante.codigoEstudiantil})`
    : nombre;
};

// Estado inicial de los estudiantes cargados: sin curso asociado.
const ESTUDIANTES_INICIAL = {
  cursoId: "",
  lista: [],
  error: "",
};

/**
 * Los catálogos (cursos, asignaturas y estudiantes del
 * curso seleccionado) se cargan desde catalogo.service.js.
 */
export default function RegistrarNotas() {
  const [formulario, setFormulario] =
    useState(ESTADO_INICIAL);

  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [guardando, setGuardando] = useState(false);

  /* ==========================================
     CATÁLOGOS
     ========================================== */

  const [cursos, setCursos] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [cargandoCatalogos, setCargandoCatalogos] =
    useState(true);
  const [errorCatalogos, setErrorCatalogos] =
    useState("");

  const [estudiantesCargados, setEstudiantesCargados] =
    useState(ESTUDIANTES_INICIAL);

  // Cursos y asignaturas: una sola carga al montar.
  useEffect(() => {
    let activo = true;

    const cargarCatalogos = async () => {
      try {
        const [respuestaCursos, respuestaAsignaturas] =
          await Promise.all([
            catalogoService.obtenerCursos(),
            catalogoService.obtenerAsignaturas(),
          ]);

        if (!activo) return;

        setCursos(extraerLista(respuestaCursos));
        setAsignaturas(extraerLista(respuestaAsignaturas));
      } catch (error) {
        if (!activo) return;

        setErrorCatalogos(
          obtenerMensajeError(
            error,
            "No fue posible cargar los cursos y asignaturas."
          )
        );
      } finally {
        if (activo) setCargandoCatalogos(false);
      }
    };

    cargarCatalogos();

    return () => {
      activo = false;
    };
  }, []);

  // Estudiantes: se vuelven a cargar al cambiar el curso.
  // El resultado queda asociado al curso que lo originó; la
  // limpieza del efecto descarta respuestas de un curso
  // anterior o recibidas tras desmontar.
  useEffect(() => {
    if (!formulario.cursoId) return;

    const cursoId = formulario.cursoId;
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
          lista: [],
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
  }, [formulario.cursoId]);

  // Solo se consideran los estudiantes cargados para el
  // curso actualmente seleccionado.
  const estudiantesVigentes =
    estudiantesCargados.cursoId === formulario.cursoId;

  const estudiantes = estudiantesVigentes
    ? estudiantesCargados.lista
    : [];

  const errorEstudiantes = estudiantesVigentes
    ? estudiantesCargados.error
    : "";

  const cargandoEstudiantes =
    Boolean(formulario.cursoId) && !estudiantesVigentes;

  const errorCarga = errorCatalogos || errorEstudiantes;

  /* ==========================================
     OPCIONES DE LOS SELECTORES
     ========================================== */

  // El placeholder lo aporta el propio Select (opción vacía).
  const opcionesCursos = cursos.map((curso) => ({
    value: String(curso.id),
    label: curso.nombre,
  }));

  const opcionesEstudiantes = estudiantes.map(
    (estudiante) => ({
      value: String(estudiante.id),
      label: obtenerEtiquetaEstudiante(estudiante),
    })
  );

  const opcionesAsignaturas = asignaturas.map(
    (asignatura) => ({
      value: String(asignatura.id),
      label: asignatura.nombre,
    })
  );

  /* ==========================================
     CAMBIOS EN EL FORMULARIO
     ========================================== */

  const actualizarCampo = (campo, valor) => {
    setFormulario((anterior) => {
      if (campo === "cursoId") {
        return {
          ...anterior,
          cursoId: valor,
          estudianteId: "",
        };
      }

      return {
        ...anterior,
        [campo]: valor,
      };
    });

    setErrores((anterior) => ({
      ...anterior,
      [campo]: "",
    }));

    setMensaje(null);
  };

  /* ==========================================
     VALIDACIÓN
     ========================================== */

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!formulario.cursoId) {
      nuevosErrores.cursoId =
        "Selecciona un curso.";
    }

    if (!formulario.estudianteId) {
      nuevosErrores.estudianteId =
        "Selecciona un estudiante.";
    }

    if (!formulario.asignaturaId) {
      nuevosErrores.asignaturaId =
        "Selecciona una asignatura.";
    }

    if (formulario.valor.trim() === "") {
      nuevosErrores.valor =
        "Ingresa una calificación.";
    } else {
      const valor = Number(formulario.valor);

      if (
        !Number.isFinite(valor) ||
        valor < 0 ||
        valor > 5
      ) {
        nuevosErrores.valor =
          "La nota debe estar entre 0.0 y 5.0.";
      }
    }

    // Texto libre de hasta 10 caracteres (ej. "2026-P3"),
    // igual que la columna periodo VarChar(10) del schema.
    const periodo = formulario.periodo.trim();

    if (periodo === "") {
      nuevosErrores.periodo =
        "Ingresa el periodo (ej. 2026-P3).";
    } else if (periodo.length > 10) {
      nuevosErrores.periodo =
        "El periodo no puede superar 10 caracteres.";
    }

    const estudianteValido =
      estudiantes.some(
        (estudiante) =>
          String(estudiante.id) ===
          formulario.estudianteId
      );

    if (
      formulario.estudianteId &&
      !estudianteValido
    ) {
      nuevosErrores.estudianteId =
        "El estudiante no pertenece al curso.";
    }

    const asignaturaValida =
      asignaturas.some(
        (asignatura) =>
          String(asignatura.id) ===
          formulario.asignaturaId
      );

    if (
      formulario.asignaturaId &&
      !asignaturaValida
    ) {
      nuevosErrores.asignaturaId =
        "La asignatura seleccionada no es válida.";
    }

    setErrores(nuevosErrores);

    return Object.keys(nuevosErrores).length === 0;
  };

  /* ==========================================
     REGISTRAR NOTA
     ========================================== */

  const manejarEnvio = async (evento) => {
    evento.preventDefault();

    if (guardando || !validarFormulario()) {
      return;
    }

    setGuardando(true);
    setMensaje(null);

    try {
      const datos = {
        estudianteId: Number(
          formulario.estudianteId
        ),
        asignaturaId: Number(
          formulario.asignaturaId
        ),
        valor: Number(formulario.valor),
        periodo: String(formulario.periodo).trim(),
      };

      await notaService.crearNota(datos);

      setMensaje({
        tipo: "exito",
        texto: "La nota se registró correctamente.",
      });

      setFormulario((anterior) => ({
        ...anterior,
        valor: "",
      }));

      setErrores({});
    } catch (error) {
      setMensaje({
        tipo: "error",
        texto: obtenerMensajeError(error),
      });
    } finally {
      setGuardando(false);
    }
  };

  const limpiarFormulario = () => {
    setFormulario(ESTADO_INICIAL);
    setErrores({});
    setMensaje(null);
  };

  /* ==========================================
     INTERFAZ
     ========================================== */

  return (
    <main className="registrar-notas">
      <header className="registrar-notas__header">
        <div>
          <h1>Registrar notas</h1>
          <p>
            Registra las calificaciones de los
            estudiantes por curso, asignatura
            y periodo académico.
          </p>
        </div>
      </header>

      <section
        className="registrar-notas__card"
        aria-labelledby="titulo-formulario-notas"
      >
        <div className="registrar-notas__card-header">
          <h2 id="titulo-formulario-notas">
            Nueva calificación
          </h2>

          <p>
            Completa los campos para registrar
            una nota.
          </p>
        </div>

        {errorCarga && (
          <div
            className="registrar-notas__mensaje registrar-notas__mensaje--error"
            role="alert"
          >
            {errorCarga}
          </div>
        )}

        {mensaje && (
          <div
            className={
              `registrar-notas__mensaje ` +
              `registrar-notas__mensaje--${mensaje.tipo}`
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

        <form
          className="registrar-notas__form"
          onSubmit={manejarEnvio}
          noValidate
        >
          <div className="registrar-notas__grid">
            <div className="registrar-notas__field">
              <label htmlFor="nota-curso">
                Curso
              </label>

              <Select
                id="nota-curso"
                name="cursoId"
                value={formulario.cursoId}
                options={opcionesCursos}
                placeholder={
                  cargandoCatalogos
                    ? "Cargando cursos..."
                    : "Selecciona un curso"
                }
                onChange={(e) =>
                  actualizarCampo("cursoId", e.target.value)
                }
                disabled={guardando || cargandoCatalogos}
              />

              {errores.cursoId && (
                <span className="registrar-notas__error">
                  {errores.cursoId}
                </span>
              )}
            </div>

            <div className="registrar-notas__field">
              <label htmlFor="nota-estudiante">
                Estudiante
              </label>

              <Select
                id="nota-estudiante"
                name="estudianteId"
                value={formulario.estudianteId}
                options={opcionesEstudiantes}
                placeholder={
                  cargandoEstudiantes
                    ? "Cargando estudiantes..."
                    : "Selecciona un estudiante"
                }
                onChange={(e) =>
                  actualizarCampo(
                    "estudianteId",
                    e.target.value
                  )
                }
                disabled={
                  guardando ||
                  !formulario.cursoId ||
                  cargandoEstudiantes
                }
              />

              {errores.estudianteId && (
                <span className="registrar-notas__error">
                  {errores.estudianteId}
                </span>
              )}
            </div>

            <div className="registrar-notas__field">
              <label htmlFor="nota-asignatura">
                Asignatura
              </label>

              <Select
                id="nota-asignatura"
                name="asignaturaId"
                value={formulario.asignaturaId}
                options={opcionesAsignaturas}
                placeholder={
                  cargandoCatalogos
                    ? "Cargando asignaturas..."
                    : "Selecciona una asignatura"
                }
                onChange={(e) =>
                  actualizarCampo(
                    "asignaturaId",
                    e.target.value
                  )
                }
                disabled={guardando || cargandoCatalogos}
              />

              {errores.asignaturaId && (
                <span className="registrar-notas__error">
                  {errores.asignaturaId}
                </span>
              )}
            </div>

            <div className="registrar-notas__field">
              <label htmlFor="nota-periodo">
                Periodo académico
              </label>

              <Input
                id="nota-periodo"
                name="periodo"
                type="text"
                maxLength={10}
                placeholder="Ejemplo: 2026-P3"
                value={formulario.periodo}
                onChange={(e) =>
                  actualizarCampo("periodo", e.target.value)
                }
                disabled={guardando}
              />

              {errores.periodo && (
                <span className="registrar-notas__error">
                  {errores.periodo}
                </span>
              )}
            </div>

            <div className="registrar-notas__field registrar-notas__field--full">
              <label htmlFor="nota-valor">
                Calificación
              </label>

              <Input
                id="nota-valor"
                name="valor"
                type="number"
                min="0"
                max="5"
                step="0.1"
                placeholder="Ejemplo: 4.5"
                value={formulario.valor}
                onChange={(e) =>
                  actualizarCampo("valor", e.target.value)
                }
                disabled={guardando}
              />

              <small className="registrar-notas__hint">
                Ingresa un valor entre 0.0 y 5.0.
              </small>

              {errores.valor && (
                <span className="registrar-notas__error">
                  {errores.valor}
                </span>
              )}
            </div>
          </div>

          <div className="registrar-notas__actions">
            <Button
              type="button"
              variant="secondary"
              onClick={limpiarFormulario}
              disabled={guardando}
            >
              Limpiar
            </Button>

            <Button
              type="submit"
              disabled={guardando}
            >
              {guardando
                ? "Guardando..."
                : "Registrar nota"}
            </Button>
          </div>
        </form>
      </section>
    </main>
  );
}
