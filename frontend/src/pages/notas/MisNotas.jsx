import { useEffect, useMemo, useState } from "react";

import { BookOpen, GraduationCap, RefreshCw } from "lucide-react";

import notaService from "../../services/nota.service.js";
import catalogoService from "../../services/catalogo.service.js";

import { useAuth } from "../../hooks/useAuth.js";

import { ROLES } from "../../utils/constants.js";

import Loader from "../../components/ui/Loader.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import Select from "../../components/ui/Select.jsx";
import Pagination from "../../components/ui/Pagination.jsx";

import "./MisNotas.css";

/* ==========================================
   CONFIGURACIÓN
   ========================================== */

const TAMANO_PAGINA = 10;

/* ==========================================
   UTILIDADES
   ========================================== */

// El backend responde { message } y, en desarrollo, un objeto en
// `error`: solo se aceptan textos para no pintar un objeto en pantalla.
const obtenerMensajeError = (err, porDefecto) => {
	const data = err?.response?.data;

	if (typeof data?.message === "string") {
		return data.message;
	}

	if (typeof data?.error === "string") {
		return data.error;
	}

	return porDefecto;
};

const obtenerEtiquetaHijo = (hijo) => {
	const nombre = [hijo.usuario?.nombre, hijo.usuario?.apellido]
		.filter(Boolean)
		.join(" ");

	const base = nombre || `Estudiante #${hijo.id}`;

	return hijo.curso?.nombre ? `${base} (${hijo.curso.nombre})` : base;
};

// Estado de la lista de hijos del Padre. Empieza cargando porque la
// consulta de notas espera a tener un hijo seleccionado.
const HIJOS_INICIALES = {
	cargando: true,
	lista: [],
	error: "",
};

/* ==========================================
   VARIANTE DE BADGE SEGÚN RANGO DE NOTA
   Escala 0.0 - 5.0, aprobación desde 3.0
   ========================================== */

const getNotaVariant = (valor) => {
	const numero = Number(valor);

	if (!Number.isFinite(numero)) {
		return "neutral";
	}

	if (numero >= 4.0) {
		return "success";
	}

	if (numero >= 3.0) {
		return "warning";
	}

	return "danger";
};

const MisNotas = () => {
	const { user } = useAuth();

	/* ========================================
     ESTADO PRINCIPAL
     ======================================== */

	const [notas, setNotas] = useState([]);

	const [pagina, setPagina] = useState(1);

	// Total de notas visibles para el usuario (no solo las de la página).
	const [total, setTotal] = useState(0);

	const [tamanoPagina, setTamanoPagina] = useState(TAMANO_PAGINA);

	const [loading, setLoading] = useState(true);

	const [error, setError] = useState("");

	const [actualizacion, setActualizacion] = useState(0);

	// Solo Padre de familia: hijos vinculados y el hijo elegido
	// (EstudiantePerfil.id como texto, para el <select>).
	const esPadre = user?.rol === ROLES.PADRE_FAMILIA;

	const [hijos, setHijos] = useState(HIJOS_INICIALES);

	const [hijoId, setHijoId] = useState("");

	const [intentoHijos, setIntentoHijos] = useState(0);

	/* ========================================
     HIJOS DEL PADRE
     ======================================== */

	useEffect(() => {
		if (!esPadre) return undefined;

		let activo = true;

		const cargarHijos = async () => {
			try {
				const respuesta = await catalogoService.obtenerMisHijos();

				const lista = respuesta?.data;

				if (!Array.isArray(lista)) {
					throw new Error("El servidor devolvió un formato de hijos no válido.");
				}

				if (activo) {
					setHijos({ cargando: false, lista, error: "" });

					// Con un solo hijo (lo habitual) se consulta de una vez.
					setHijoId(lista.length > 0 ? String(lista[0].id) : "");
				}
			} catch (err) {
				if (activo) {
					setHijos({
						cargando: false,
						lista: [],
						error: obtenerMensajeError(err, "No fue posible cargar tus hijos."),
					});
				}
			}
		};

		cargarHijos();

		return () => {
			activo = false;
		};
	}, [esPadre, intentoHijos]);

	/* ========================================
     CARGAR NOTAS
     ======================================== */

	useEffect(() => {
		// El Padre solo puede consultar a un hijo vinculado: sin hijo
		// elegido no se llama a la API (respondería 400).
		if (esPadre && !hijoId) return undefined;

		let activo = true;

		const cargarNotas = async () => {
			setLoading(true);
			setError("");

			try {
				// Estudiante: el backend resuelve su perfil desde el token.
				// Padre: se envía el hijo elegido (el backend verifica que
				// sea su hijo).
				const filtros = esPadre ? { estudianteId: hijoId } : {};

				const response = await notaService.obtenerNotas({
					...filtros,
					page: pagina,
					pageSize: TAMANO_PAGINA,
				});

				const lista = Array.isArray(response)
					? response
					: response?.data || [];

				// Formato esperado del controlador:
				// { success: true, data: [...], meta: { total, page, pageSize } }
				const meta = Array.isArray(response) ? null : response?.meta;

				// Sin meta (respuesta sin paginar) la lista recibida es el
				// total: la pantalla se comporta como antes, sin paginador.
				const totalRegistros =
					typeof meta?.total === "number" ? meta.total : lista.length;

				const tamano = meta
					? Number(meta.pageSize) || TAMANO_PAGINA
					: Math.max(lista.length, TAMANO_PAGINA);

				if (!activo) return;

				// Si la página quedó vacía (p. ej. el total bajó), se vuelve
				// a la última página existente; el efecto se ejecuta de nuevo.
				// Solo se salta hacia atrás, así que no puede ciclar.
				const ultimaPagina = Math.max(1, Math.ceil(totalRegistros / tamano));

				if (lista.length === 0 && totalRegistros > 0 && ultimaPagina < pagina) {
					setPagina(ultimaPagina);

					return;
				}

				setNotas(lista);
				setTotal(totalRegistros);
				setTamanoPagina(tamano);
				setLoading(false);
			} catch (err) {
				if (activo) {
					setNotas([]);
					setTotal(0);
					setError(
						obtenerMensajeError(err, "No fue posible cargar las notas."),
					);
					setLoading(false);
				}
			}
		};

		cargarNotas();

		return () => {
			activo = false;
		};
	}, [esPadre, hijoId, pagina, actualizacion]);

	// Cambiar de hijo es otra consulta: vuelve a la primera página.
	const cambiarHijo = (evento) => {
		setHijoId(evento.target.value);
		setPagina(1);
	};

	const recargar = () => {
		setActualizacion((valor) => valor + 1);
	};

	const reintentarHijos = () => {
		setHijos(HIJOS_INICIALES);
		setIntentoHijos((valor) => valor + 1);
	};

	/* ========================================
     PROMEDIO GENERAL
     ======================================== */

	const promedio = useMemo(() => {
		if (notas.length === 0) {
			return null;
		}

		const suma = notas.reduce((acc, nota) => acc + Number(nota.valor), 0);

		return suma / notas.length;
	}, [notas]);

	// Con varias páginas, el promedio solo cubre las notas cargadas
	// (las de la página actual): se avisa en vez de mostrarlo como general.
	const totalPaginas = Math.max(1, Math.ceil(total / tamanoPagina));

	const promedioParcial = total > tamanoPagina;

	/* ========================================
     NOMBRE DEL ESTUDIANTE (SESIÓN REAL)
     ======================================== */

	const hijoActual = hijos.lista.find((hijo) => String(hijo.id) === hijoId);

	const nombreCompleto = esPadre
		? [hijoActual?.usuario?.nombre, hijoActual?.usuario?.apellido]
				.filter(Boolean)
				.join(" ")
		: `${user?.nombre || ""} ${user?.apellido || ""}`.trim();

	/* ========================================
     PADRE DE FAMILIA: HIJOS NO DISPONIBLES
     ======================================== */

	if (esPadre && (hijos.cargando || hijos.error || hijos.lista.length === 0)) {
		return (
			<section className="mis-notas-page">
				<div className="mis-notas-page__header">
					<div>
						<h2 className="mis-notas-page__title">Notas de mis hijos</h2>

						<p className="mis-notas-page__description">
							Consulta las calificaciones de tus hijos.
						</p>
					</div>
				</div>

				{hijos.cargando ? (
					<div className="mis-notas-page__loading">
						<Loader />

						<p>Cargando tus hijos...</p>
					</div>
				) : hijos.error ? (
					<EmptyState
						title="No se pudieron cargar tus hijos"
						description={hijos.error}
						action={
							<Button variant="secondary" onClick={reintentarHijos}>
								Reintentar
							</Button>
						}
					/>
				) : (
					<EmptyState
						icon={GraduationCap}
						title="Sin hijos vinculados"
						description="Tu cuenta todavía no tiene estudiantes vinculados. Comunícate con la institución para que los vinculen."
					/>
				)}
			</section>
		);
	}

	/* ========================================
     RENDER
     ======================================== */

	return (
		<section className="mis-notas-page">
			{/* =====================================
          ENCABEZADO
          ===================================== */}

			<div className="mis-notas-page__header">
				<div>
					<h2 className="mis-notas-page__title">
						{esPadre ? "Notas de mis hijos" : "Mis notas"}
					</h2>

					<p className="mis-notas-page__description">
						{nombreCompleto
							? `Consulta de calificaciones de ${nombreCompleto}.`
							: "Consulta de calificaciones por período académico."}
					</p>
				</div>

				<Button
					variant="outline"
					onClick={recargar}
					leftIcon={<RefreshCw size={17} />}
					title="Actualizar notas"
				>
					Actualizar
				</Button>
			</div>

			{/* =====================================
          SELECTOR DE HIJO (solo Padre)
          ===================================== */}

			{esPadre && (
				<div className="mis-notas-page__child-selector">
					<Select
						id="notas-hijo"
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
				</div>
			)}

			{/* =====================================
          ERROR
          ===================================== */}

			{error && (
				<div className="mis-notas-page__alert" role="alert">
					<span>{error}</span>

					<button
						type="button"
						onClick={() => setError("")}
						aria-label="Cerrar mensaje"
					>
						×
					</button>
				</div>
			)}

			{/* =====================================
          CONTENIDO
          ===================================== */}

			{loading ? (
				<div className="mis-notas-page__loading">
					<Loader />

					<p>Cargando notas...</p>
				</div>
			) : notas.length === 0 ? (
				<EmptyState
					icon={GraduationCap}
					title="No hay notas registradas"
					description={
						esPadre
							? "Todavía no se han registrado calificaciones para este estudiante."
							: "Todavía no se han registrado calificaciones para tu cuenta."
					}
				/>
			) : (
				<>
					{/* ===============================
              TARJETA DE PROMEDIO
              =============================== */}

					<div className="mis-notas-page__summary">
						<div className="mis-notas-page__summary-icon">
							<GraduationCap size={28} />
						</div>

						<div className="mis-notas-page__summary-content">
							<span className="mis-notas-page__summary-label">
								{promedioParcial ? "Promedio de esta página" : "Promedio general"}
							</span>

							<strong className="mis-notas-page__summary-value">
								{promedio !== null ? promedio.toFixed(1) : "—"}
							</strong>

							{promedioParcial && (
								<span className="mis-notas-page__summary-note">
									Calculado con los registros de esta página ({notas.length} de{" "}
									{total})
								</span>
							)}
						</div>

						{/* Con una sola página del listado el estado no sería el real: se oculta. */}
						{!promedioParcial && (
							<Badge variant={getNotaVariant(promedio)} size="lg">
								{promedio >= 3.0 ? "Aprobado" : "En riesgo"}
							</Badge>
						)}
					</div>

					{/* ===============================
              TABLA DE NOTAS
              =============================== */}

					<div className="mis-notas-page__card">
						<div className="mis-notas-page__table-wrapper">
							<table className="mis-notas-page__table">
								<thead>
									<tr>
										<th>Asignatura</th>

										<th>Docente</th>

										<th>Período</th>

										<th>Nota</th>
									</tr>
								</thead>

								<tbody>
									{notas.map((nota) => {
										const docenteNombre = nota.docente
											? `${nota.docente.nombre || ""} ${nota.docente.apellido || ""}`.trim()
											: "—";

										return (
											<tr key={nota.id}>
												<td>
													<div className="mis-notas-page__asignatura">
														<BookOpen size={16} />

														<span>{nota.asignatura?.nombre || "—"}</span>
													</div>
												</td>

												<td>{docenteNombre || "—"}</td>

												<td>{nota.periodo}</td>

												<td>
													<Badge variant={getNotaVariant(nota.valor)}>
														{Number(nota.valor).toFixed(1)}
													</Badge>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>
					</div>

					<div className="mis-notas-page__footer">
						<Pagination
							currentPage={pagina}
							totalPages={totalPaginas}
							onPageChange={setPagina}
						/>
					</div>
				</>
			)}
		</section>
	);
};

export default MisNotas;
