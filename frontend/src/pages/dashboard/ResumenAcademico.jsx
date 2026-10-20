import { useCallback, useEffect, useMemo, useState } from "react";

import { Link } from "react-router-dom";

import {
	CalendarCheck,
	GraduationCap,
	Megaphone,
	RefreshCw,
} from "lucide-react";

import asistenciaService from "../../services/asistencia.service.js";
import catalogoService from "../../services/catalogo.service.js";
import comunicadoService from "../../services/comunicado.service.js";
import notaService from "../../services/nota.service.js";

import { useAuth } from "../../hooks/useAuth.js";

import { ROLES, ROUTES } from "../../utils/constants.js";

import Button from "../../components/ui/Button.jsx";
import Loader from "../../components/ui/Loader.jsx";
import Select from "../../components/ui/Select.jsx";

import "./ResumenAcademico.css";

/* ==========================================
   CONFIGURACIÓN
   ========================================== */

// El backend limita pageSize a 100. Para no calcular un promedio sobre una
// página parcial se piden todas las páginas, con un tope de seguridad.
const TAMANO_PAGINA = 100;

const MAX_PAGINAS = 20;

// Estado de cada tarjeta. Empieza cargando porque la consulta se lanza
// apenas se monta el componente (o cuando hay un hijo elegido).
const ESTADO_INICIAL = {
	cargando: true,
	error: "",
	datos: null,
};

// Estado de la lista de hijos del Padre. Empieza cargando porque las
// consultas de notas y asistencia esperan a tener un hijo seleccionado.
const HIJOS_INICIALES = {
	cargando: true,
	lista: [],
	error: "",
};

const INTENTOS_INICIALES = {
	notas: 0,
	asistencia: 0,
	comunicado: 0,
};

/* ==========================================
   UTILIDADES
   ========================================== */

// El backend responde { message } y, en desarrollo, un objeto en
// `error`: solo se aceptan textos para no pintar un objeto en pantalla.
const obtenerMensajeError = (err, porDefecto) => {
	const data = err?.response?.data;

	if (typeof data?.message === "string" && data.message) {
		return data.message;
	}

	if (typeof data?.error === "string" && data.error) {
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

// fechaPublicacion es fecha y hora en UTC: se muestra en la hora local del
// navegador (dd/mm/aaaa), igual que en la vista de comunicados.
const formatearFecha = (valor) => {
	if (!valor) return "Sin fecha";

	const fecha = new Date(valor);

	if (Number.isNaN(fecha.getTime())) {
		return "Sin fecha";
	}

	const dia = String(fecha.getDate()).padStart(2, "0");
	const mes = String(fecha.getMonth() + 1).padStart(2, "0");

	return `${dia}/${mes}/${fecha.getFullYear()}`;
};

// Total real de registros que informa el backend; null si no lo informa
// (backend sin paginación, que devuelve todo en una sola respuesta).
const leerTotal = (valor) => {
	if (valor === null || valor === undefined) return null;

	const total = Number(valor);

	return Number.isFinite(total) ? total : null;
};

/* ==========================================
   PEDIR TODAS LAS PÁGINAS
   leerPagina(pagina) -> { lista, total }
   sigue() -> false si la respuesta ya no importa (cancela el bucle)
   ========================================== */

const obtenerTodasLasPaginas = async (leerPagina, sigue) => {
	const registros = [];

	for (let pagina = 1; pagina <= MAX_PAGINAS; pagina += 1) {
		const { lista, total } = await leerPagina(pagina);

		registros.push(...lista);

		// Sin total no hay forma de saber si faltan páginas: se asume que la
		// respuesta ya trae todo. Una página vacía también corta el bucle,
		// para no insistir si el total informado no coincide con los datos.
		if (
			!sigue() ||
			total === null ||
			lista.length === 0 ||
			registros.length >= total
		) {
			return { registros, truncado: false };
		}
	}

	// Se agotó el tope de páginas y todavía faltan registros.
	return { registros, truncado: true };
};

/* ==========================================
   HOOK DE CONSULTA POR TARJETA
   Cada tarjeta tiene su propia carga, error y reintento. `activo` es
   por ejecución del efecto: una respuesta vieja nunca pisa a una nueva.
   ========================================== */

const useConsulta = ({ cargar, habilitado, intento, mensajeError }) => {
	const [estado, setEstado] = useState(ESTADO_INICIAL);

	useEffect(() => {
		if (!habilitado) return undefined;

		let activo = true;

		const ejecutar = async () => {
			setEstado((anterior) => ({ ...anterior, cargando: true, error: "" }));

			try {
				const datos = await cargar(() => activo);

				if (activo) {
					setEstado({ cargando: false, error: "", datos });
				}
			} catch (err) {
				if (activo) {
					setEstado({
						cargando: false,
						error: obtenerMensajeError(err, mensajeError),
						datos: null,
					});
				}
			}
		};

		ejecutar();

		return () => {
			activo = false;
		};
	}, [cargar, habilitado, intento, mensajeError]);

	return estado;
};

/* ==========================================
   TARJETA BASE (carga / error / aviso / contenido)
   ========================================== */

const TarjetaResumen = ({
	icono: Icono,
	titulo,
	cargando,
	error,
	aviso,
	onReintentar,
	children,
}) => (
	<article className="resumen-card" aria-busy={cargando}>
		<header className="resumen-card__header">
			<div className="resumen-card__icon">
				<Icono size={22} aria-hidden="true" />
			</div>

			<h3 className="resumen-card__title">{titulo}</h3>
		</header>

		<div className="resumen-card__body">
			{cargando ? (
				<Loader variant="inline" size="sm" message="Cargando..." />
			) : error ? (
				<div className="resumen-card__error">
					<p role="alert">{error}</p>

					<Button type="button" variant="outline" size="sm" onClick={onReintentar}>
						Reintentar
					</Button>
				</div>
			) : aviso ? (
				<p className="resumen-card__empty">{aviso}</p>
			) : (
				children
			)}
		</div>
	</article>
);

/* ==========================================
   COMPONENTE
   ========================================== */

const ResumenAcademico = () => {
	const { user } = useAuth();

	// Estudiante: el backend resuelve su perfil desde el token y no se envía
	// estudianteId. Padre: se envía el hijo elegido (el backend verifica que
	// sea su hijo).
	const esPadre = user?.rol === ROLES.PADRE_FAMILIA;

	const [hijos, setHijos] = useState(HIJOS_INICIALES);

	// EstudiantePerfil.id como texto, para el <select>.
	const [hijoId, setHijoId] = useState("");

	const [intentoHijos, setIntentoHijos] = useState(0);

	const [intentos, setIntentos] = useState(INTENTOS_INICIALES);

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

					// Con un solo hijo (lo habitual) se usa directamente.
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

	const reintentarHijos = () => {
		setHijos(HIJOS_INICIALES);
		setIntentoHijos((valor) => valor + 1);
	};

	// Qué pasa con las tarjetas que dependen de un hijo (notas y asistencia):
	// "cargando" | "error" | "vacio" | "listo" (el Estudiante siempre está listo).
	let estadoHijos = "listo";

	if (esPadre) {
		if (hijos.cargando) {
			estadoHijos = "cargando";
		} else if (hijos.error) {
			estadoHijos = "error";
		} else if (hijos.lista.length === 0) {
			estadoHijos = "vacio";
		}
	}

	const estudianteId = esPadre ? hijoId : "";

	const consultaHabilitada = estadoHijos === "listo";

	/* ========================================
     CARGADORES
     ======================================== */

	const cargarNotas = useCallback(
		(sigue) =>
			obtenerTodasLasPaginas(async (pagina) => {
				const filtros = { page: pagina, pageSize: TAMANO_PAGINA };

				if (estudianteId) {
					filtros.estudianteId = estudianteId;
				}

				const respuesta = await notaService.obtenerNotas(filtros);

				// Con paginación: { data: [...], meta: { total, page, pageSize } }.
				// Sin paginación (backend anterior): lista completa y sin meta.
				const lista = Array.isArray(respuesta) ? respuesta : respuesta?.data;

				if (!Array.isArray(lista)) {
					throw new Error("El servidor devolvió un formato de notas no válido.");
				}

				return { lista, total: leerTotal(respuesta?.meta?.total) };
			}, sigue),
		[estudianteId],
	);

	const cargarAsistencia = useCallback(
		(sigue) =>
			obtenerTodasLasPaginas(async (pagina) => {
				const filtros = { page: pagina, pageSize: TAMANO_PAGINA };

				if (estudianteId) {
					filtros.estudianteId = estudianteId;
				}

				const respuesta = await asistenciaService.obtenerAsistencia(filtros);

				// Formato del controlador:
				// { success: true, data: { asistencias: [...], total, page, pageSize } }
				const lista = respuesta?.data?.asistencias;

				if (!Array.isArray(lista)) {
					throw new Error(
						"El servidor devolvió un formato de asistencia no válido.",
					);
				}

				return { lista, total: leerTotal(respuesta.data.total) };
			}, sigue),
		[estudianteId],
	);

	const cargarComunicado = useCallback(async () => {
		const respuesta = await comunicadoService.listarComunicados({
			page: 1,
			pageSize: 1,
		});

		// Formato del controlador:
		// { success: true, data: { comunicados: [...], total, page, pageSize } }
		const lista = respuesta?.data?.comunicados;

		if (!Array.isArray(lista)) {
			throw new Error(
				"El servidor devolvió un formato de comunicados no válido.",
			);
		}

		return { comunicado: lista[0] ?? null };
	}, []);

	const notas = useConsulta({
		cargar: cargarNotas,
		habilitado: consultaHabilitada && (!esPadre || hijoId !== ""),
		intento: intentos.notas,
		mensajeError: "No fue posible cargar las notas.",
	});

	const asistencia = useConsulta({
		cargar: cargarAsistencia,
		habilitado: consultaHabilitada && (!esPadre || hijoId !== ""),
		intento: intentos.asistencia,
		mensajeError: "No fue posible consultar la asistencia.",
	});

	// El último comunicado no depende de ningún hijo.
	const comunicado = useConsulta({
		cargar: cargarComunicado,
		habilitado: true,
		intento: intentos.comunicado,
		mensajeError: "No fue posible consultar los comunicados.",
	});

	/* ========================================
     REINTENTAR / ACTUALIZAR
     ======================================== */

	const reintentar = (tarjeta) => () => {
		setIntentos((anterior) => ({ ...anterior, [tarjeta]: anterior[tarjeta] + 1 }));
	};

	const actualizarTodo = () => {
		setIntentos((anterior) => ({
			notas: anterior.notas + 1,
			asistencia: anterior.asistencia + 1,
			comunicado: anterior.comunicado + 1,
		}));

		// Si la lista de hijos falló, las tarjetas no pueden consultar nada
		// hasta que se vuelva a pedir.
		if (esPadre && hijos.error) {
			reintentarHijos();
		}
	};

	/* ========================================
     PROMEDIO GENERAL
     ======================================== */

	const registrosNotas = notas.datos?.registros;

	const promedio = useMemo(() => {
		if (!registrosNotas) {
			return null;
		}

		const valores = registrosNotas
			.map((nota) => Number(nota.valor))
			.filter(Number.isFinite);

		if (valores.length === 0) {
			return null;
		}

		const suma = valores.reduce((acc, valor) => acc + valor, 0);

		return { valor: suma / valores.length, cantidad: valores.length };
	}, [registrosNotas]);

	/* ========================================
     ASISTENCIA
     Igual que ConsultarAsistencia: presentes = registros PRESENTE sobre el
     total de registros. La TARDANZA no cuenta como presente.
     ======================================== */

	const registrosAsistencia = asistencia.datos?.registros;

	const resumenAsistencia = useMemo(() => {
		if (!registrosAsistencia) {
			return null;
		}

		const total = registrosAsistencia.length;

		const presentes = registrosAsistencia.filter(
			(registro) => registro.estado === "PRESENTE",
		).length;

		return {
			total,
			presentes,
			porcentaje: total > 0 ? Math.round((presentes / total) * 100) : null,
		};
	}, [registrosAsistencia]);

	/* ========================================
     ESTADO VISIBLE DE LAS TARJETAS CON HIJO
     ======================================== */

	const propsDependientes = (consulta, tarjeta) => ({
		cargando:
			estadoHijos === "cargando" ||
			(estadoHijos === "listo" && consulta.cargando),
		error: estadoHijos === "error" ? hijos.error : consulta.error,
		aviso:
			estadoHijos === "vacio"
				? "Tu cuenta todavía no tiene estudiantes vinculados. Comunícate con la institución para que los vinculen."
				: "",
		onReintentar: estadoHijos === "error" ? reintentarHijos : reintentar(tarjeta),
	});

	const propsNotas = propsDependientes(notas, "notas");

	const propsAsistencia = propsDependientes(asistencia, "asistencia");

	const ocupado =
		propsNotas.cargando || propsAsistencia.cargando || comunicado.cargando;

	/* ========================================
     ENCABEZADO
     ======================================== */

	const hijoActual = hijos.lista.find((hijo) => String(hijo.id) === hijoId);

	const nombreHijo = [hijoActual?.usuario?.nombre, hijoActual?.usuario?.apellido]
		.filter(Boolean)
		.join(" ");

	const descripcion =
		esPadre && nombreHijo
			? `Resumen académico de ${nombreHijo}.`
			: "Notas, asistencia y el último comunicado de un vistazo.";

	const ultimoComunicado = comunicado.datos?.comunicado;

	/* ========================================
     RENDER
     ======================================== */

	return (
		<section className="resumen-academico" aria-labelledby="resumen-academico-titulo">
			<div className="resumen-academico__header">
				<div>
					<h2 id="resumen-academico-titulo" className="resumen-academico__title">
						Resumen académico
					</h2>

					<p className="resumen-academico__description">{descripcion}</p>
				</div>

				<Button
					type="button"
					variant="outline"
					onClick={actualizarTodo}
					disabled={ocupado}
					leftIcon={<RefreshCw size={17} />}
					title="Actualizar resumen"
				>
					Actualizar
				</Button>
			</div>

			{/* SELECTOR DE HIJO (solo Padre con 2 o más hijos) */}

			{esPadre && estadoHijos === "listo" && hijos.lista.length > 1 && (
				<div className="resumen-academico__child-selector">
					<Select
						id="resumen-hijo"
						name="hijoId"
						label="Hijo o hija"
						value={hijoId}
						options={hijos.lista.map((hijo) => ({
							value: String(hijo.id),
							label: obtenerEtiquetaHijo(hijo),
						}))}
						placeholder={null}
						onChange={(evento) => setHijoId(evento.target.value)}
					/>
				</div>
			)}

			<div className="resumen-academico__cards">
				{/* PROMEDIO GENERAL */}

				<TarjetaResumen
					icono={GraduationCap}
					titulo="Promedio general"
					{...propsNotas}
					aviso={
						propsNotas.aviso ||
						(!promedio ? "Aún no hay notas registradas." : "")
					}
				>
					{promedio && (
						<>
							<strong className="resumen-card__value">
								{promedio.valor.toFixed(1)}
							</strong>

							<p className="resumen-card__detail">
								Promedio de {promedio.cantidad}{" "}
								{promedio.cantidad === 1 ? "nota" : "notas"}.
							</p>

							{notas.datos?.truncado && (
								<p className="resumen-card__note">
									Calculado con los primeros {notas.datos.registros.length}{" "}
									registros.
								</p>
							)}
						</>
					)}
				</TarjetaResumen>

				{/* ASISTENCIA */}

				<TarjetaResumen
					icono={CalendarCheck}
					titulo="Asistencia"
					{...propsAsistencia}
					aviso={
						propsAsistencia.aviso ||
						(resumenAsistencia?.total === 0
							? "Aún no hay registros de asistencia."
							: "")
					}
				>
					{resumenAsistencia && resumenAsistencia.total > 0 && (
						<>
							<strong className="resumen-card__value">
								{resumenAsistencia.porcentaje}%
							</strong>

							<p className="resumen-card__detail">
								{resumenAsistencia.presentes} de {resumenAsistencia.total}{" "}
								registros presentes.
							</p>

							<p className="resumen-card__note">
								Las tardanzas no se cuentan como presente.
							</p>

							{asistencia.datos?.truncado && (
								<p className="resumen-card__note">
									Calculado con los primeros {asistencia.datos.registros.length}{" "}
									registros.
								</p>
							)}
						</>
					)}
				</TarjetaResumen>

				{/* ÚLTIMO COMUNICADO */}

				<TarjetaResumen
					icono={Megaphone}
					titulo="Último comunicado"
					cargando={comunicado.cargando}
					error={comunicado.error}
					aviso={ultimoComunicado === null ? "Aún no hay comunicados" : ""}
					onReintentar={reintentar("comunicado")}
				>
					{ultimoComunicado && (
						<>
							<strong className="resumen-card__headline">
								{ultimoComunicado.titulo}
							</strong>

							<p className="resumen-card__detail">
								{formatearFecha(ultimoComunicado.fechaPublicacion)}
							</p>

							<Link className="resumen-card__link" to={ROUTES.COMMUNICATIONS}>
								Ver comunicados
							</Link>
						</>
					)}
				</TarjetaResumen>
			</div>
		</section>
	);
};

export default ResumenAcademico;
