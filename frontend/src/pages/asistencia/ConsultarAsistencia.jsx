
import { useEffect, useMemo, useState } from "react";

import { Users } from "lucide-react";

import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Input from "../../components/ui/Input.jsx";
import Loader from "../../components/ui/Loader.jsx";
import Pagination from "../../components/ui/Pagination.jsx";
import Select from "../../components/ui/Select.jsx";

import { useAuth } from "../../hooks/useAuth.js";
import asistenciaService from "../../services/asistencia.service.js";
import catalogoService from "../../services/catalogo.service.js";
import { ROLES } from "../../utils/constants.js";
import { obtenerMensajeError } from "../../utils/errores.js";

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

const TAMANO_PAGINA = 10;

const FILTROS_INICIALES = {
  inicio: "",
  fin: "",
};

// Estado de la lista de hijos del Padre. Empieza cargando porque
// la consulta de asistencia espera a tener un hijo seleccionado.
const HIJOS_INICIALES = {
  cargando: true,
  lista: [],
  error: "",
};

/* ==========================================
   UTILIDADES
   ========================================== */

const formatearFecha = (valor) => {
  if (!valor) return "Sin fecha";

  const fechaTexto = String(valor).slice(0, 10);

  const partes = fechaTexto.split("-");

  if (partes.length !== 3) {
    return fechaTexto;
  }

  return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const obtenerEtiquetaHijo = (hijo) => {
  const nombre = [
    hijo.usuario?.nombre,
    hijo.usuario?.apellido,
  ].filter(Boolean).join(" ");

  const base = nombre || `Estudiante #${hijo.id}`;

  return hijo.curso?.nombre
    ? `${base} (${hijo.curso.nombre})`
    : base;
};

const obtenerNombreEstudiante = (registro) => {
  const usuario = registro.estudiante?.usuario;

  const nombre = [
    usuario?.nombre,
    usuario?.apellido,
  ].filter(Boolean).join(" ");

  return nombre ||
    `Estudiante #${registro.estudianteId}`;
};

/* ==========================================
   COMPONENTE
   ========================================== */

export default function ConsultarAsistencia() {
  const { user } = useAuth();

  const esPadre = user?.rol === ROLES.PADRE_FAMILIA;

  const [filtros, setFiltros] = useState(
    FILTROS_INICIALES
  );

  const [asistencias, setAsistencias] =
    useState([]);

  const [pagina, setPagina] =
    useState(1);

  // Total de registros visibles para el usuario (no solo los de
  // la página).
  const [total, setTotal] =
    useState(0);

  const [tamanoPagina, setTamanoPagina] =
    useState(TAMANO_PAGINA);

  const [cargando, setCargando] =
    useState(true);

  const [error, setError] =
    useState("");

  const [actualizacion, setActualizacion] =
    useState(0);

  // Solo Padre de familia: hijos vinculados y el hijo elegido
  // (EstudiantePerfil.id como texto, para el <select>).
  const [hijos, setHijos] =
    useState(HIJOS_INICIALES);

  const [hijoId, setHijoId] =
    useState("");

  const [intentoHijos, setIntentoHijos] =
    useState(0);

  /* ==========================================
     HIJOS DEL PADRE
     ========================================== */

  useEffect(() => {
    if (!esPadre) return undefined;

    let activo = true;

    const cargarHijos = async () => {
      try {
        const respuesta =
          await catalogoService.obtenerMisHijos();

        const lista = respuesta?.data;

        if (!Array.isArray(lista)) {
          throw new Error(
            "El servidor devolvió un formato de hijos no válido."
          );
        }

        if (activo) {
          setHijos({
            cargando: false,
            lista,
            error: "",
          });

          // Con un solo hijo (lo habitual) se consulta de una vez.
          setHijoId(
            lista.length > 0
              ? String(lista[0].id)
              : ""
          );
        }
      } catch (err) {
        if (activo) {
          setHijos({
            cargando: false,
            lista: [],
            error: obtenerMensajeError(
              err,
              "No fue posible cargar tus hijos."
            ),
          });
        }
      }
    };

    cargarHijos();

    return () => {
      activo = false;
    };
  }, [esPadre, intentoHijos]);

  /* ==========================================
     CONSULTAR ASISTENCIA
     ========================================== */

  useEffect(() => {
    // El Padre solo puede consultar a un hijo vinculado: sin hijo
    // elegido no se llama a la API (respondería 400).
    if (esPadre && !hijoId) return undefined;

    let activo = true;

    const cargarAsistencias = async () => {
      setCargando(true);
      setError("");

      try {
        // Estudiante: el backend resuelve su perfil desde el token y
        // no se envía estudianteId. Padre: se envía el hijo elegido
        // (el backend verifica que sea su hijo).
        const parametros = {};

        if (esPadre) {
          parametros.estudianteId = hijoId;
        }

        if (filtros.inicio) {
          parametros.inicio = filtros.inicio;
        }

        if (filtros.fin) {
          parametros.fin = filtros.fin;
        }

        parametros.page = pagina;
        parametros.pageSize = TAMANO_PAGINA;

        const respuesta =
          await asistenciaService.obtenerAsistencia(
            parametros
          );

        // Formato esperado del controlador:
        // {
        //   success: true,
        //   data: { asistencias: [...], total, page, pageSize }
        // }

        const datos = respuesta?.data;

        const registros = datos?.asistencias;

        if (!Array.isArray(registros)) {
          throw new Error(
            "El servidor devolvió un formato de asistencia no válido."
          );
        }

        // Sin page/pageSize en la respuesta (sin paginar) la lista
        // recibida es el total: la pantalla se comporta como antes,
        // sin paginador.
        const totalRegistros =
          typeof datos.total === "number"
            ? datos.total
            : registros.length;

        const tamano = datos.pageSize
          ? Number(datos.pageSize) || TAMANO_PAGINA
          : Math.max(registros.length, TAMANO_PAGINA);

        if (!activo) return;

        // Si la página quedó vacía (p. ej. el total bajó), se vuelve
        // a la última página existente; el efecto se ejecuta de nuevo.
        // Solo se salta hacia atrás, así que no puede ciclar.
        const ultimaPagina = Math.max(
          1,
          Math.ceil(totalRegistros / tamano)
        );

        if (
          registros.length === 0 &&
          totalRegistros > 0 &&
          ultimaPagina < pagina
        ) {
          setPagina(ultimaPagina);

          return;
        }

        setAsistencias(registros);
        setTotal(totalRegistros);
        setTamanoPagina(tamano);
        setCargando(false);
      } catch (err) {
        if (activo) {
          setAsistencias([]);
          setTotal(0);
          setError(
            obtenerMensajeError(
              err,
              "No fue posible consultar la asistencia."
            )
          );
          setCargando(false);
        }
      }
    };

    cargarAsistencias();

    return () => {
      activo = false;
    };
  }, [
    esPadre,
    hijoId,
    filtros.inicio,
    filtros.fin,
    pagina,
    actualizacion,
  ]);

  /* ==========================================
     FILTROS
     ========================================== */

  // Input pasa onChange directo al elemento nativo:
  // el handler recibe el evento, no el valor.
  const actualizarFiltro = (campo) => (evento) => {
    const valor = evento.target.value;

    setFiltros((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));

    // Otro filtro es otra consulta: vuelve a la primera página.
    setPagina(1);
  };

  const cambiarHijo = (evento) => {
    setHijoId(evento.target.value);
    setPagina(1);
  };

  const limpiarFiltros = () => {
    setFiltros({ ...FILTROS_INICIALES });
    setPagina(1);
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

  // Con varias páginas, los contadores por estado solo cubren los
  // registros cargados (los de la página actual); el total sí es el real.
  const totalPaginas = Math.max(
    1,
    Math.ceil(total / tamanoPagina)
  );

  const resumenParcial = total > tamanoPagina;

  const sufijoPagina = resumenParcial
    ? " (esta página)"
    : "";

  const fechasInvalidas =
    Boolean(
      filtros.inicio &&
      filtros.fin &&
      filtros.inicio > filtros.fin
    );

  /* ==========================================
     PADRE DE FAMILIA: HIJOS NO DISPONIBLES
     ========================================== */

  const reintentarHijos = () => {
    setHijos(HIJOS_INICIALES);
    setIntentoHijos((valor) => valor + 1);
  };

  if (
    esPadre &&
    (hijos.cargando ||
      hijos.error ||
      hijos.lista.length === 0)
  ) {
    return (
      <main className="consultar-asistencia">
        <header className="consultar-asistencia__header">
          <div>
            <h1>Consultar asistencia</h1>
            <p>
              Consulta el historial de asistencia
              de tus hijos.
            </p>
          </div>
        </header>

        <section className="consultar-asistencia__card">
          {hijos.cargando ? (
            <Loader message="Cargando tus hijos..." />
          ) : hijos.error ? (
            <EmptyState
              title="No se pudieron cargar tus hijos"
              description={hijos.error}
              action={
                <Button
                  type="button"
                  variant="secondary"
                  onClick={reintentarHijos}
                >
                  Reintentar
                </Button>
              }
            />
          ) : (
            <EmptyState
              icon={Users}
              title="Sin hijos vinculados"
              description="Tu cuenta todavía no tiene estudiantes vinculados. Comunícate con la institución para que los vinculen."
            />
          )}
        </section>
      </main>
    );
  }

  /* ==========================================
     INTERFAZ
     ========================================== */

  return (
    <main className="consultar-asistencia">
      <header className="consultar-asistencia__header">
        <div>
          <h1>Consultar asistencia</h1>
          <p>
            {esPadre
              ? "Consulta el historial de asistencia de tus hijos."
              : "Consulta tu historial de asistencia."}
          </p>
        </div>

        <Button
          type="button"
          variant="secondary"
          onClick={recargar}
          disabled={cargando}
        >
          Actualizar
        </Button>
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
            {esPadre
              ? "Elige a tu hijo o hija y consulta todos sus registros, o limita la búsqueda por fechas."
              : "Puedes consultar todos tus registros o limitar la búsqueda por fechas."}
          </p>
        </div>

        <div className="consultar-asistencia__filters">
          {esPadre && (
            <Select
              id="consulta-hijo"
              name="hijoId"
              label="Hijo o hija"
              value={hijoId}
              options={hijos.lista.map((hijo) => ({
                value: String(hijo.id),
                label: obtenerEtiquetaHijo(hijo),
              }))}
              placeholder={null}
              onChange={cambiarHijo}
            />
          )}

          <Input
            id="consulta-inicio"
            name="inicio"
            type="date"
            label="Desde"
            value={filtros.inicio}
            onChange={actualizarFiltro("inicio")}
          />

          <Input
            id="consulta-fin"
            name="fin"
            type="date"
            label="Hasta"
            value={filtros.fin}
            onChange={actualizarFiltro("fin")}
          />
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
          <Button
            type="button"
            variant="secondary"
            onClick={limpiarFiltros}
          >
            Limpiar filtros
          </Button>
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
            <strong>{total}</strong>
          </div>

          <div className="consultar-asistencia__stat">
            <span>Presentes{sufijoPagina}</span>
            <strong>{resumen.presentes}</strong>
          </div>

          <div className="consultar-asistencia__stat">
            <span>Ausentes{sufijoPagina}</span>
            <strong>{resumen.ausentes}</strong>
          </div>

          <div className="consultar-asistencia__stat">
            <span>Tardanzas{sufijoPagina}</span>
            <strong>{resumen.tardanzas}</strong>
          </div>

          {resumenParcial && (
            <p className="consultar-asistencia__summary-note">
              Presentes, ausentes y tardanzas se calculan
              con los registros de esta página (
              {asistencias.length} de {total}).
            </p>
          )}
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
          <Loader message="Cargando registros de asistencia..." />
        ) : error ? (
          <EmptyState
            title="No se pudo consultar la asistencia"
            description={error}
            action={
              <Button
                type="button"
                variant="secondary"
                onClick={recargar}
              >
                Reintentar
              </Button>
            }
          />
        ) : asistencias.length === 0 ? (
          <EmptyState
            title="Sin registros"
            description="No se encontraron registros de asistencia para esta consulta."
          />
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

        {!cargando && !error && (
          <div className="consultar-asistencia__footer">
            <Pagination
              currentPage={pagina}
              totalPages={totalPaginas}
              onPageChange={setPagina}
            />
          </div>
        )}
      </section>
    </main>
  );
}
