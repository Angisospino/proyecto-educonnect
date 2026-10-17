
import { useCallback, useEffect, useMemo, useState } from "react";

import Badge from "../../components/ui/Badge";
import asistenciaService from "../../services/asistencia.service";

import "./ConsultarAsistencia.css";

/* ==========================================
   CONFIGURACIÓN
   ========================================== */

const ESTADOS = {
  PRESENTE: {
    texto: "Presente",
    variant: "success",
  },
  AUSENTE: {
    texto: "Ausente",
    variant: "danger",
  },
  TARDANZA: {
    texto: "Tardanza",
    variant: "warning",
  },
};

const FILTROS_INICIALES = {
  estudianteId: "",
  inicio: "",
  fin: "",
};

/* ==========================================
   UTILIDADES
   ========================================== */

const obtenerMensajeError = (error) => {
  const data = error?.response?.data;

  if (typeof data?.message === "string") {
    return data.message;
  }

  if (typeof data?.error === "string") {
    return data.error;
  }

  return error?.message ||
    "No fue posible consultar la asistencia.";
};

const formatearFecha = (valor) => {
  if (!valor) return "Sin fecha";

  const fechaTexto = String(valor).slice(0, 10);

  const partes = fechaTexto.split("-");

  if (partes.length !== 3) {
    return fechaTexto;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const obtenerNombreEstudiante = (registro) => {
  const estudiante = registro.estudiante;

  if (!estudiante) {
    return `Estudiante #${registro.estudianteId}`;
  }

  if (estudiante.nombreCompleto) {
    return estudiante.nombreCompleto;
  }

  const usuario = estudiante.usuario || estudiante;

  const nombre = [
    usuario.nombre,
    usuario.apellido,
  ].filter(Boolean).join(" ");

  return nombre ||
    `Estudiante #${registro.estudianteId}`;
};

/* ==========================================
   COMPONENTE
   ========================================== */

export default function ConsultarAsistencia() {
  const [filtros, setFiltros] = useState(
    FILTROS_INICIALES
  );

  const [asistencias, setAsistencias] =
    useState([]);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [actualizacion, setActualizacion] =
    useState(0);

  /* ==========================================
     CONSULTAR ASISTENCIA
     ========================================== */

  useEffect(() => {
    let activo = true;

    const cargarAsistencias = async () => {
      setCargando(true);
      setError("");

      try {
        const parametros = {};

        if (filtros.estudianteId.trim()) {
          parametros.estudianteId =
            filtros.estudianteId.trim();
        }

        if (filtros.inicio) {
          parametros.inicio = filtros.inicio;
        }

        if (filtros.fin) {
          parametros.fin = filtros.fin;
        }

        const respuesta =
          await asistenciaService.obtenerAsistencia(
            parametros
          );

        // Formato esperado del controlador:
        // {
        //   success: true,
        //   data: { asistencias: [...], total: n }
        // }

        const registros =
          respuesta?.data?.asistencias;

        if (!Array.isArray(registros)) {
          throw new Error(
            "El servidor devolvió un formato de asistencia no válido."
          );
        }

        if (activo) {
          setAsistencias(registros);
        }
      } catch (err) {
        if (activo) {
          setAsistencias([]);
          setError(obtenerMensajeError(err));
        }
      } finally {
        if (activo) {
          setCargando(false);
        }
      }
    };

    cargarAsistencias();

    return () => {
      activo = false;
    };
  }, [
    filtros.estudianteId,
    filtros.inicio,
    filtros.fin,
    actualizacion,
  ]);

  /* ==========================================
     FILTROS
     ========================================== */

  const actualizarFiltro = useCallback(
    (campo, valor) => {
      setFiltros((anterior) => ({
        ...anterior,
        [campo]: valor,
      }));
    },
    []
  );

  const limpiarFiltros = () => {
    setFiltros({ ...FILTROS_INICIALES });
    setActualizacion((valor) => valor + 1);
  };

  const recargar = () => {
    setActualizacion((valor) => valor + 1);
  };

  /* ==========================================
     RESUMEN
     ========================================== */

  const resumen = useMemo(() => {
    const resultado = {
      total: asistencias.length,
      presentes: 0,
      ausentes: 0,
      tardanzas: 0,
    };

    asistencias.forEach((registro) => {
      switch (registro.estado) {
        case "PRESENTE":
          resultado.presentes += 1;
          break;

        case "AUSENTE":
          resultado.ausentes += 1;
          break;

        case "TARDANZA":
          resultado.tardanzas += 1;
          break;

        default:
          break;
      }
    });

    return resultado;
  }, [asistencias]);

  const fechasInvalidas =
    Boolean(
      filtros.inicio &&
      filtros.fin &&
      filtros.inicio > filtros.fin
    );

  /* ==========================================
     INTERFAZ
     ========================================== */

  return (
    <main className="consultar-asistencia">
      <header className="consultar-asistencia__header">
        <div>
          <h1>Consultar asistencia</h1>
          <p>
            Consulta el historial de asistencia
            registrado en la institución.
          </p>
        </div>

        <button
          type="button"
          className="consultar-asistencia__refresh"
          onClick={recargar}
          disabled={cargando}
        >
          Actualizar
        </button>
      </header>

      {/* FILTROS */}

      <section
        className="consultar-asistencia__card"
        aria-labelledby="titulo-filtros-asistencia"
      >
        <div className="consultar-asistencia__section-header">
          <h2 id="titulo-filtros-asistencia">
            Filtros de búsqueda
          </h2>

          <p>
            Puedes consultar todos los registros
            disponibles o limitar la búsqueda.
          </p>
        </div>

        <div className="consultar-asistencia__filters">
          <div className="consultar-asistencia__field">
            <label htmlFor="consulta-estudiante">
              ID del estudiante
            </label>

            <input
              id="consulta-estudiante"
              type="number"
              min="1"
              step="1"
              placeholder="Opcional"
              value={filtros.estudianteId}
              onChange={(evento) =>
                actualizarFiltro(
                  "estudianteId",
                  evento.target.value
                )
              }
            />
          </div>

          <div className="consultar-asistencia__field">
            <label htmlFor="consulta-inicio">
              Desde
            </label>

            <input
              id="consulta-inicio"
              type="date"
              value={filtros.inicio}
              onChange={(evento) =>
                actualizarFiltro(
                  "inicio",
                  evento.target.value
                )
              }
            />
          </div>

          <div className="consultar-asistencia__field">
            <label htmlFor="consulta-fin">
              Hasta
            </label>

            <input
              id="consulta-fin"
              type="date"
              value={filtros.fin}
              onChange={(evento) =>
                actualizarFiltro(
                  "fin",
                  evento.target.value
                )
              }
            />
          </div>
        </div>

        {fechasInvalidas && (
          <p
            className="consultar-asistencia__validation"
            role="alert"
          >
            La fecha inicial no puede ser
            posterior a la fecha final.
          </p>
        )}

        <div className="consultar-asistencia__filter-actions">
          <button
            type="button"
            onClick={limpiarFiltros}
            className="consultar-asistencia__clear"
          >
            Limpiar filtros
          </button>
        </div>
      </section>

      {/* RESUMEN */}

      {!cargando && !error && (
        <section
          className="consultar-asistencia__summary"
          aria-label="Resumen de asistencia"
        >
          <div className="consultar-asistencia__stat">
            <span>Total registros</span>
            <strong>{resumen.total}</strong>
          </div>

          <div className="consultar-asistencia__stat">
            <span>Presentes</span>
            <strong>{resumen.presentes}</strong>
          </div>

          <div className="consultar-asistencia__stat">
            <span>Ausentes</span>
            <strong>{resumen.ausentes}</strong>
          </div>

          <div className="consultar-asistencia__stat">
            <span>Tardanzas</span>
            <strong>{resumen.tardanzas}</strong>
          </div>
        </section>
      )}

      {/* RESULTADOS */}

      <section
        className="consultar-asistencia__card"
        aria-labelledby="titulo-historial-asistencia"
      >
        <div className="consultar-asistencia__section-header">
          <h2 id="titulo-historial-asistencia">
            Historial de asistencia
          </h2>

          <p>
            Registros disponibles según los
            permisos de tu cuenta.
          </p>
        </div>

        {cargando ? (
          <div
            className="consultar-asistencia__state"
            role="status"
          >
            Cargando registros de asistencia...
          </div>
        ) : error ? (
          <div
            className="consultar-asistencia__state consultar-asistencia__state--error"
            role="alert"
          >
            <p>{error}</p>

            <button
              type="button"
              onClick={recargar}
            >
              Reintentar
            </button>
          </div>
        ) : asistencias.length === 0 ? (
          <div className="consultar-asistencia__state">
            <h3>Sin registros</h3>

            <p>
              No se encontraron registros de
              asistencia para esta consulta.
            </p>
          </div>
        ) : (
          <div className="consultar-asistencia__table-wrapper">
            <table className="consultar-asistencia__table">
              <thead>
                <tr>
                  <th scope="col">Fecha</th>
                  <th scope="col">Estudiante</th>
                  <th scope="col">Estado</th>
                </tr>
              </thead>

              <tbody>
                {asistencias.map((registro) => {
                  const configuracion =
                    ESTADOS[registro.estado];

                  return (
                    <tr key={registro.id}>
                      <td>
                        {formatearFecha(
                          registro.fecha
                        )}
                      </td>

                      <td>
                        {obtenerNombreEstudiante(
                          registro
                        )}
                      </td>

                      <td>
                        {configuracion ? (
                          <Badge
                            variant={
                              configuracion.variant
                            }
                          >
                            {configuracion.texto}
                          </Badge>
                        ) : (
                          <span>
                            {registro.estado ||
                              "Sin estado"}
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
