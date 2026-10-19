
import { useMemo, useState } from "react";

import Input from "../../components/ui/Input.jsx";
import Select from "../../components/ui/Select.jsx";
import Button from "../../components/ui/Button.jsx";

import notaService from "../../services/nota.service.js";

import "./RegistrarNotas.css";

const ESTADO_INICIAL = {
  cursoId: "",
  estudianteId: "",
  asignaturaId: "",
  valor: "",
  periodo: "",
};

const obtenerMensajeError = (error) => {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "No fue posible registrar la nota."
  );
};

/**
 * @param {Array} cursos
 * @param {Array} estudiantes
 * @param {Array} asignaturas
 *
 * Los catálogos deben contener IDs y sus
 * relaciones académicas correspondientes.
 *
 * TODO: los catálogos llegan por props (default []) porque el
 * backend de catálogos aún no existe ([Sprint 3 - 20]); cuando
 * exista se cargarán dentro de la vista con catalogo.service.js.
 */
export default function RegistrarNotas({
  cursos = [],
  estudiantes = [],
  asignaturas = [],
}) {
  const [formulario, setFormulario] =
    useState(ESTADO_INICIAL);

  const [errores, setErrores] = useState({});
  const [mensaje, setMensaje] = useState(null);
  const [guardando, setGuardando] = useState(false);

  /* ==========================================
     CATÁLOGOS DEPENDIENTES
     ========================================== */

  const estudiantesFiltrados = useMemo(() => {
    if (!formulario.cursoId) return [];

    return estudiantes.filter(
      (estudiante) =>
        String(estudiante.cursoId) ===
        String(formulario.cursoId)
    );
  }, [estudiantes, formulario.cursoId]);

  const asignaturasFiltradas = useMemo(() => {
    if (!formulario.cursoId) return [];

    return asignaturas.filter(
      (asignatura) =>
        String(asignatura.cursoId) ===
        String(formulario.cursoId)
    );
  }, [asignaturas, formulario.cursoId]);

  /* ==========================================
     OPCIONES DE LOS SELECTORES
     ========================================== */

  // El placeholder lo aporta el propio Select (opción vacía).
  const opcionesCursos = cursos.map((curso) => ({
    value: String(curso.id),
    label: curso.nombre,
  }));

  const opcionesEstudiantes = estudiantesFiltrados.map(
    (estudiante) => ({
      value: String(estudiante.id),
      label:
        estudiante.nombreCompleto ||
        `${estudiante.nombre ?? ""} ${estudiante.apellido ?? ""}`.trim(),
    })
  );

  const opcionesAsignaturas = asignaturasFiltradas.map(
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
          asignaturaId: "",
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
      estudiantesFiltrados.some(
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
      asignaturasFiltradas.some(
        (asignatura) =>
          String(asignatura.id) ===
          formulario.asignaturaId
      );

    if (
      formulario.asignaturaId &&
      !asignaturaValida
    ) {
      nuevosErrores.asignaturaId =
        "La asignatura no pertenece al curso.";
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
                placeholder="Selecciona un curso"
                onChange={(e) =>
                  actualizarCampo("cursoId", e.target.value)
                }
                disabled={guardando}
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
                placeholder="Selecciona un estudiante"
                onChange={(e) =>
                  actualizarCampo(
                    "estudianteId",
                    e.target.value
                  )
                }
                disabled={
                  guardando ||
                  !formulario.cursoId
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
                placeholder="Selecciona una asignatura"
                onChange={(e) =>
                  actualizarCampo(
                    "asignaturaId",
                    e.target.value
                  )
                }
                disabled={
                  guardando ||
                  !formulario.cursoId
                }
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
