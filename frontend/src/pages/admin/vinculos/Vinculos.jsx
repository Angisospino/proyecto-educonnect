import { useEffect, useRef, useState } from "react";

import { Link2, RefreshCw, Trash2, UserPlus } from "lucide-react";

import vinculoService from "../../../services/vinculo.service.js";
import usuarioService from "../../../services/usuario.service.js";
import catalogoService from "../../../services/catalogo.service.js";

import { ESTADOS_USUARIO, ROLES } from "../../../utils/constants.js";

import Button from "../../../components/ui/Button.jsx";
import Select from "../../../components/ui/Select.jsx";
import Loader from "../../../components/ui/Loader.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import ConfirmDialog from "../../../components/ui/ConfirmDialog.jsx";

import "./Vinculos.css";

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

// Los servicios devuelven el sobre { success, data }; se extrae la
// lista (o un arreglo vacío si el formato no es el esperado).
const extraerLista = (respuesta) => {
	const lista = Array.isArray(respuesta) ? respuesta : respuesta?.data;

	return Array.isArray(lista) ? lista : [];
};

// GET /api/usuarios responde { data: { usuarios: [...] } }.
const extraerUsuarios = (respuesta) => {
	const usuarios = Array.isArray(respuesta)
		? respuesta
		: respuesta?.data?.usuarios;

	return Array.isArray(usuarios) ? usuarios : [];
};

const nombreCompleto = (persona) =>
	[persona?.nombre, persona?.apellido].filter(Boolean).join(" ");

// "Apellido Nombre (CÓDIGO)", igual que en Registrar notas.
const etiquetaEstudiante = (estudiante) => {
	const nombre = [estudiante?.usuario?.apellido, estudiante?.usuario?.nombre]
		.filter(Boolean)
		.join(" ");

	return estudiante?.codigoEstudiantil
		? `${nombre} (${estudiante.codigoEstudiantil})`
		: nombre;
};

// El correo desambigua padres con el mismo nombre.
const etiquetaPadre = (padre) => {
	const nombre = nombreCompleto(padre);

	return padre.email ? `${nombre} (${padre.email})` : nombre;
};

const FORMULARIO_INICIAL = {
	padreId: "",
	cursoId: "",
	estudianteId: "",
};

// `intento` identifica la petición que originó el resultado: mientras
// no coincida con el intento actual, la carga sigue en curso. Así no
// hace falta llamar a setState de forma síncrona dentro de los efectos.
const OPCIONES_INICIALES = {
	intento: -1,
	padres: [],
	cursos: [],
	error: "",
};

const VINCULOS_INICIALES = {
	intento: -1,
	lista: [],
	error: "",
};

const ESTUDIANTES_INICIALES = {
	clave: "",
	lista: [],
	error: "",
};

/**
 * Vínculos padre-estudiante (solo Administrador).
 *
 * Permite vincular a un padre de familia con sus hijos y eliminar
 * vínculos existentes (API /api/vinculos).
 */
const Vinculos = () => {
	/* ========================================
     FORMULARIO
     ======================================== */

	const [formulario, setFormulario] = useState(FORMULARIO_INICIAL);

	const [guardando, setGuardando] = useState(false);

	const [mensajeForm, setMensajeForm] = useState(null);

	/* ========================================
     OPCIONES: PADRES Y CURSOS
     ======================================== */

	const [intentoOpciones, setIntentoOpciones] = useState(0);

	const [opciones, setOpciones] = useState(OPCIONES_INICIALES);

	const cargandoOpciones = opciones.intento !== intentoOpciones;

	const errorOpciones = cargandoOpciones ? "" : opciones.error;

	/* ========================================
     ESTUDIANTES DEL CURSO ELEGIDO
     ======================================== */

	const [intentoEstudiantes, setIntentoEstudiantes] = useState(0);

	const [estudiantesCargados, setEstudiantesCargados] = useState(
		ESTUDIANTES_INICIALES,
	);

	/* ========================================
     VÍNCULOS EXISTENTES
     ======================================== */

	const [intentoVinculos, setIntentoVinculos] = useState(0);

	const [vinculos, setVinculos] = useState(VINCULOS_INICIALES);

	const cargandoVinculos = vinculos.intento !== intentoVinculos;

	const errorVinculos = cargandoVinculos ? "" : vinculos.error;

	const [mensajeLista, setMensajeLista] = useState(null);

	/* ========================================
     ELIMINACIÓN
     ======================================== */

	const [vinculoAEliminar, setVinculoAEliminar] = useState(null);

	const [eliminando, setEliminando] = useState(false);

	/* ========================================
     MONTAJE (para handlers asíncronos)
     ======================================== */

	const montado = useRef(true);

	useEffect(() => {
		montado.current = true;

		return () => {
			montado.current = false;
		};
	}, []);

	/* ========================================
     CARGAR PADRES Y CURSOS
     ======================================== */

	useEffect(() => {
		let activo = true;

		const cargarOpciones = async () => {
			try {
				const [respuestaUsuarios, respuestaCursos] = await Promise.all([
					usuarioService.obtenerUsuarios(),
					catalogoService.obtenerCursos(),
				]);

				if (!activo) return;

				// Solo padres activos: el backend rechaza vincular a otros.
				const padres = extraerUsuarios(respuestaUsuarios)
					.filter(
						(usuario) =>
							usuario.rol === ROLES.PADRE_FAMILIA &&
							usuario.estado === ESTADOS_USUARIO.ACTIVO,
					)
					.sort((a, b) =>
						etiquetaPadre(a).localeCompare(etiquetaPadre(b), "es"),
					);

				setOpciones({
					intento: intentoOpciones,
					padres,
					cursos: extraerLista(respuestaCursos),
					error: "",
				});
			} catch (err) {
				if (!activo) return;

				setOpciones({
					intento: intentoOpciones,
					padres: [],
					cursos: [],
					error: obtenerMensajeError(
						err,
						"No fue posible cargar los padres y los cursos.",
					),
				});
			}
		};

		cargarOpciones();

		return () => {
			activo = false;
		};
	}, [intentoOpciones]);

	/* ========================================
     CARGAR ESTUDIANTES AL CAMBIAR EL CURSO
     ======================================== */

	// El resultado queda asociado a la clave (curso + intento) que lo
	// originó; la limpieza del efecto descarta respuestas de un curso
	// anterior o recibidas tras desmontar.
	useEffect(() => {
		if (!formulario.cursoId) return undefined;

		const cursoId = formulario.cursoId;
		const clave = `${cursoId}:${intentoEstudiantes}`;
		let activo = true;

		const cargarEstudiantes = async () => {
			try {
				const respuesta =
					await catalogoService.obtenerEstudiantesDeCurso(cursoId);

				if (!activo) return;

				setEstudiantesCargados({
					clave,
					lista: extraerLista(respuesta),
					error: "",
				});
			} catch (err) {
				if (!activo) return;

				setEstudiantesCargados({
					clave,
					lista: [],
					error: obtenerMensajeError(
						err,
						"No fue posible cargar los estudiantes del curso.",
					),
				});
			}
		};

		cargarEstudiantes();

		return () => {
			activo = false;
		};
	}, [formulario.cursoId, intentoEstudiantes]);

	const claveEstudiantes = formulario.cursoId
		? `${formulario.cursoId}:${intentoEstudiantes}`
		: "";

	const estudiantesVigentes =
		Boolean(claveEstudiantes) && estudiantesCargados.clave === claveEstudiantes;

	const estudiantes = estudiantesVigentes ? estudiantesCargados.lista : [];

	const errorEstudiantes = estudiantesVigentes ? estudiantesCargados.error : "";

	const cargandoEstudiantes =
		Boolean(formulario.cursoId) && !estudiantesVigentes;

	/* ========================================
     CARGAR VÍNCULOS
     ======================================== */

	useEffect(() => {
		let activo = true;

		const cargarVinculos = async () => {
			try {
				const respuesta = await vinculoService.listarVinculos();

				if (!activo) return;

				setVinculos({
					intento: intentoVinculos,
					lista: extraerLista(respuesta),
					error: "",
				});
			} catch (err) {
				if (!activo) return;

				setVinculos({
					intento: intentoVinculos,
					lista: [],
					error: obtenerMensajeError(
						err,
						"No fue posible cargar los vínculos.",
					),
				});
			}
		};

		cargarVinculos();

		return () => {
			activo = false;
		};
	}, [intentoVinculos]);

	const recargarVinculos = () => {
		setIntentoVinculos((valor) => valor + 1);
	};

	// Los avisos del formulario y de la lista son de la última acción: al
	// empezar otra (o al actualizar a mano) se limpian los dos para que no
	// quede visible un aviso de una acción anterior.
	const limpiarMensajes = () => {
		setMensajeForm(null);
		setMensajeLista(null);
	};

	const actualizarManual = () => {
		limpiarMensajes();
		recargarVinculos();
	};

	/* ========================================
     OPCIONES DE LOS SELECTORES
     ======================================== */

	const opcionesPadres = opciones.padres.map((padre) => ({
		value: String(padre.id),
		label: etiquetaPadre(padre),
	}));

	const opcionesCursos = opciones.cursos.map((curso) => ({
		value: String(curso.id),
		label: curso.nombre,
	}));

	const opcionesEstudiantes = estudiantes.map((estudiante) => ({
		value: String(estudiante.id),
		label: etiquetaEstudiante(estudiante),
	}));

	const sinEstudiantes =
		estudiantesVigentes && !errorEstudiantes && estudiantes.length === 0;

	/* ========================================
     CAMBIOS EN EL FORMULARIO
     ======================================== */

	const actualizarCampo = (campo, valor) => {
		setFormulario((anterior) => {
			// Al cambiar el curso, el estudiante elegido deja de ser válido.
			if (campo === "cursoId") {
				return { ...anterior, cursoId: valor, estudianteId: "" };
			}

			return { ...anterior, [campo]: valor };
		});

		setMensajeForm(null);
	};

	const reintentarOpciones = () => {
		setIntentoOpciones((valor) => valor + 1);
	};

	const reintentarEstudiantes = () => {
		setIntentoEstudiantes((valor) => valor + 1);
	};

	/* ========================================
     CREAR VÍNCULO
     ======================================== */

	const puedeVincular =
		Boolean(formulario.padreId) &&
		Boolean(formulario.estudianteId) &&
		!guardando;

	const manejarEnvio = async (evento) => {
		evento.preventDefault();

		if (!puedeVincular) return;

		setGuardando(true);
		limpiarMensajes();

		try {
			await vinculoService.crearVinculo({
				padreId: Number(formulario.padreId),
				estudianteId: Number(formulario.estudianteId),
			});

			if (!montado.current) return;

			setMensajeForm({
				tipo: "exito",
				texto: "El vínculo se creó correctamente.",
			});

			// Se conserva el padre y se limpia el estudiante para poder
			// vincular a varios hijos seguidos.
			setFormulario((anterior) => ({ ...anterior, estudianteId: "" }));

			recargarVinculos();
		} catch (err) {
			if (!montado.current) return;

			setMensajeForm({
				tipo: "error",
				texto: obtenerMensajeError(err, "No fue posible crear el vínculo."),
			});
		} finally {
			if (montado.current) setGuardando(false);
		}
	};

	/* ========================================
     ELIMINAR VÍNCULO
     ======================================== */

	const confirmarEliminacion = async () => {
		const vinculo = vinculoAEliminar;

		if (!vinculo || eliminando) return;

		setEliminando(true);
		limpiarMensajes();

		try {
			await vinculoService.eliminarVinculo(vinculo.id);

			if (!montado.current) return;

			setMensajeLista({
				tipo: "exito",
				texto: "El vínculo se eliminó correctamente.",
			});

			setVinculoAEliminar(null);

			recargarVinculos();
		} catch (err) {
			if (!montado.current) return;

			setVinculoAEliminar(null);

			// Ya no existía (otro administrador lo eliminó): solo se
			// actualiza la lista.
			if (err?.response?.status === 404) {
				setMensajeLista({
					tipo: "exito",
					texto: "El vínculo ya no existía. Se actualizó la lista.",
				});

				recargarVinculos();
			} else {
				setMensajeLista({
					tipo: "error",
					texto: obtenerMensajeError(
						err,
						"No fue posible eliminar el vínculo.",
					),
				});
			}
		} finally {
			if (montado.current) setEliminando(false);
		}
	};

	/* ========================================
     RENDER
     ======================================== */

	const totalVinculos = vinculos.lista.length;

	return (
		<section className="vinculos-page">
			{/* =====================================
          ENCABEZADO
          ===================================== */}

			<div className="vinculos-page__header">
				<div>
					<h2 className="vinculos-page__title">Vínculos familiares</h2>

					<p className="vinculos-page__description">
						Vincula a cada padre de familia con sus hijos para que puedan
						consultar sus notas y su asistencia.
					</p>
				</div>

				<Button
					variant="outline"
					onClick={actualizarManual}
					disabled={cargandoVinculos}
					leftIcon={<RefreshCw size={17} />}
				>
					Actualizar
				</Button>
			</div>

			{/* =====================================
          NUEVO VÍNCULO
          ===================================== */}

			<section
				className="vinculos-page__card"
				aria-labelledby="vinculos-titulo-formulario"
			>
				<div className="vinculos-page__card-header">
					<h3
						id="vinculos-titulo-formulario"
						className="vinculos-page__card-title"
					>
						Nuevo vínculo
					</h3>

					<p className="vinculos-page__card-description">
						Elige el padre, el curso y el estudiante que quieres vincular.
					</p>
				</div>

				{errorOpciones && (
					<div
						className="vinculos-page__mensaje vinculos-page__mensaje--error"
						role="alert"
					>
						<span>{errorOpciones}</span>

						<Button variant="outline" size="sm" onClick={reintentarOpciones}>
							Reintentar
						</Button>
					</div>
				)}

				{errorEstudiantes && (
					<div
						className="vinculos-page__mensaje vinculos-page__mensaje--error"
						role="alert"
					>
						<span>{errorEstudiantes}</span>

						<Button variant="outline" size="sm" onClick={reintentarEstudiantes}>
							Reintentar
						</Button>
					</div>
				)}

				{mensajeForm && (
					<div
						className={`vinculos-page__mensaje vinculos-page__mensaje--${mensajeForm.tipo}`}
						role={mensajeForm.tipo === "error" ? "alert" : "status"}
					>
						<span>{mensajeForm.texto}</span>
					</div>
				)}

				<form className="vinculos-page__form" onSubmit={manejarEnvio} noValidate>
					<div className="vinculos-page__grid">
						<Select
							id="vinculo-padre"
							name="padreId"
							label="Padre de familia"
							value={formulario.padreId}
							options={opcionesPadres}
							placeholder={
								cargandoOpciones ? "Cargando…" : "Selecciona un padre"
							}
							onChange={(e) => actualizarCampo("padreId", e.target.value)}
							disabled={guardando || cargandoOpciones}
						/>

						<Select
							id="vinculo-curso"
							name="cursoId"
							label="Curso"
							value={formulario.cursoId}
							options={opcionesCursos}
							placeholder={
								cargandoOpciones ? "Cargando…" : "Selecciona un curso"
							}
							onChange={(e) => actualizarCampo("cursoId", e.target.value)}
							disabled={guardando || cargandoOpciones}
						/>

						<Select
							id="vinculo-estudiante"
							name="estudianteId"
							label="Estudiante"
							value={formulario.estudianteId}
							options={opcionesEstudiantes}
							placeholder={
								cargandoEstudiantes
									? "Cargando…"
									: formulario.cursoId
										? "Selecciona un estudiante"
										: "Primero elige un curso"
							}
							helperText={
								sinEstudiantes
									? "Este curso no tiene estudiantes."
									: ""
							}
							onChange={(e) => actualizarCampo("estudianteId", e.target.value)}
							disabled={
								guardando || !formulario.cursoId || cargandoEstudiantes
							}
						/>
					</div>

					<div className="vinculos-page__actions">
						<Button
							type="submit"
							disabled={!puedeVincular}
							leftIcon={<UserPlus size={17} />}
						>
							{guardando ? "Vinculando…" : "Vincular"}
						</Button>
					</div>
				</form>
			</section>

			{/* =====================================
          VÍNCULOS EXISTENTES
          ===================================== */}

			<section
				className="vinculos-page__card"
				aria-labelledby="vinculos-titulo-lista"
			>
				<div className="vinculos-page__card-header">
					<h3 id="vinculos-titulo-lista" className="vinculos-page__card-title">
						Vínculos existentes
					</h3>

					{!cargandoVinculos && !errorVinculos && (
						<p className="vinculos-page__card-description">
							{totalVinculos === 1
								? "1 vínculo registrado"
								: `${totalVinculos} vínculos registrados`}
						</p>
					)}
				</div>

				{mensajeLista && (
					<div
						className={`vinculos-page__mensaje vinculos-page__mensaje--${mensajeLista.tipo}`}
						role={mensajeLista.tipo === "error" ? "alert" : "status"}
					>
						<span>{mensajeLista.texto}</span>
					</div>
				)}

				{cargandoVinculos ? (
					<div className="vinculos-page__loading">
						<Loader variant="inline" message="Cargando vínculos..." />
					</div>
				) : errorVinculos ? (
					<div
						className="vinculos-page__mensaje vinculos-page__mensaje--error"
						role="alert"
					>
						<span>{errorVinculos}</span>

						<Button variant="outline" size="sm" onClick={actualizarManual}>
							Reintentar
						</Button>
					</div>
				) : totalVinculos === 0 ? (
					<EmptyState
						icon={Link2}
						title="Todavía no hay vínculos"
						description="Cuando vincules a un padre con un estudiante, aparecerá aquí."
						compact
					/>
				) : (
					<div className="vinculos-page__table-wrapper">
						<table className="vinculos-page__table">
							<caption className="sr-only">
								Vínculos entre padres de familia y estudiantes
							</caption>

							<thead>
								<tr>
									<th scope="col">Padre</th>

									<th scope="col">Estudiante (código)</th>

									<th scope="col">Curso</th>

									<th scope="col" className="vinculos-page__col-accion">
										Acción
									</th>
								</tr>
							</thead>

							<tbody>
								{vinculos.lista.map((vinculo) => {
									const padre = nombreCompleto(vinculo.padre);

									const estudiante = etiquetaEstudiante(vinculo.estudiante);

									return (
										<tr key={vinculo.id}>
											<td>{padre || "—"}</td>

											<td>{estudiante || "—"}</td>

											<td>{vinculo.estudiante?.curso?.nombre || "—"}</td>

											<td className="vinculos-page__col-accion">
												<Button
													variant="outline"
													size="sm"
													leftIcon={<Trash2 size={16} />}
													onClick={() => setVinculoAEliminar(vinculo)}
													aria-label={`Eliminar el vínculo de ${padre} con ${estudiante}`}
												>
													Eliminar
												</Button>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					</div>
				)}
			</section>

			{/* =====================================
          CONFIRMAR ELIMINACIÓN
          ===================================== */}

			<ConfirmDialog
				isOpen={Boolean(vinculoAEliminar)}
				onClose={() => setVinculoAEliminar(null)}
				onConfirm={confirmarEliminacion}
				title="Eliminar vínculo"
				message={`¿Deseas eliminar el vínculo entre ${nombreCompleto(
					vinculoAEliminar?.padre,
				)} y ${etiquetaEstudiante(
					vinculoAEliminar?.estudiante,
				)}? El padre dejará de ver las notas y la asistencia de este estudiante.`}
				confirmText="Eliminar"
				variant="danger"
				loading={eliminando}
			/>
		</section>
	);
};

export default Vinculos;
