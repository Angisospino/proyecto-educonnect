import { useEffect, useState } from "react";

import { Pencil, Plus, Trash2 } from "lucide-react";

import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import ConfirmDialog from "../../components/ui/ConfirmDialog.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Input from "../../components/ui/Input.jsx";
import Loader from "../../components/ui/Loader.jsx";
import Modal from "../../components/ui/Modal.jsx";
import Pagination from "../../components/ui/Pagination.jsx";

import { useAuth } from "../../hooks/useAuth.js";
import comunicadoService from "../../services/comunicado.service.js";
import { ROLES } from "../../utils/constants.js";

import "./Comunicados.css";

/* ==========================================
   CONFIGURACIÓN
   ========================================== */

const TAMANO_PAGINA = 10;

const MAX_TITULO = 150;

const MAX_CONTENIDO = 5000;

const ID_FORMULARIO = "comunicado-formulario";

const VALORES_INICIALES = {
	titulo: "",
	contenido: "",
};

// Roles que pueden publicar. El backend es quien autoriza: aquí solo
// se ocultan las acciones que terminarían en un 403.
const ROLES_GESTION = [ROLES.DOCENTE, ROLES.DIRECTIVO];

/* ==========================================
   UTILIDADES
   ========================================== */

// Solo se muestran mensajes de tipo texto: en desarrollo el campo
// "error" del backend puede ser un objeto.
const obtenerMensajeError = (error, porDefecto) => {
	const data = error?.response?.data;

	if (typeof data?.message === "string" && data.message) {
		return data.message;
	}

	if (typeof data?.error === "string" && data.error) {
		return data.error;
	}

	return porDefecto;
};

// fechaPublicacion es fecha y hora en UTC: se muestra en la hora local del
// navegador (dd/mm/aaaa). Cortar el texto ISO mostraría el día siguiente
// para un comunicado publicado por la noche en Colombia (UTC-5).
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

const obtenerNombreAutor = (autor) => {
	const nombre = [autor?.nombre, autor?.apellido].filter(Boolean).join(" ");

	return nombre || "Autor desconocido";
};

const validarValores = (valores) => {
	const errores = {};

	const titulo = valores.titulo.trim();
	const contenido = valores.contenido.trim();

	if (!titulo) {
		errores.titulo = "El título es obligatorio.";
	} else if (titulo.length > MAX_TITULO) {
		errores.titulo = `El título no puede superar ${MAX_TITULO} caracteres.`;
	}

	if (!contenido) {
		errores.contenido = "El contenido es obligatorio.";
	} else if (contenido.length > MAX_CONTENIDO) {
		errores.contenido = `El contenido no puede superar ${MAX_CONTENIDO} caracteres.`;
	}

	return errores;
};

/* ==========================================
   COMPONENTE
   ========================================== */

export default function Comunicados() {
	const { user } = useAuth();

	const puedeGestionar = ROLES_GESTION.includes(user?.rol);

	// Solo el autor puede editar o eliminar su comunicado.
	const esAutor = (comunicado) =>
		puedeGestionar &&
		comunicado.autor?.id != null &&
		user?.id != null &&
		Number(comunicado.autor.id) === Number(user.id);

	/* ---------- Listado ---------- */

	const [pagina, setPagina] = useState(1);

	const [comunicados, setComunicados] = useState([]);

	const [total, setTotal] = useState(0);

	const [tamanoPagina, setTamanoPagina] = useState(TAMANO_PAGINA);

	const [cargando, setCargando] = useState(true);

	const [error, setError] = useState("");

	const [actualizacion, setActualizacion] = useState(0);

	/* ---------- Mensajes de las acciones ---------- */

	const [mensajeExito, setMensajeExito] = useState("");

	const [mensajeError, setMensajeError] = useState("");

	/* ---------- Formulario (publicar / editar) ---------- */

	// null = cerrado; { comunicado: null } = nuevo; { comunicado } = edición.
	const [formulario, setFormulario] = useState(null);

	const [valores, setValores] = useState(VALORES_INICIALES);

	const [errores, setErrores] = useState({});

	const [errorServidor, setErrorServidor] = useState("");

	const [guardando, setGuardando] = useState(false);

	/* ---------- Eliminación ---------- */

	const [comunicadoAEliminar, setComunicadoAEliminar] = useState(null);

	const [eliminando, setEliminando] = useState(false);

	/* ==========================================
     CARGAR COMUNICADOS
     ========================================== */

	useEffect(() => {
		let activo = true;

		const cargarComunicados = async () => {
			setCargando(true);
			setError("");

			try {
				const respuesta = await comunicadoService.listarComunicados({
					page: pagina,
					pageSize: TAMANO_PAGINA,
				});

				// Formato esperado del controlador:
				// {
				//   success: true,
				//   data: { comunicados: [...], total, page, pageSize }
				// }

				const datos = respuesta?.data;

				if (!Array.isArray(datos?.comunicados)) {
					throw new Error(
						"El servidor devolvió un formato de comunicados no válido.",
					);
				}

				const totalRegistros = Number(datos.total) || 0;

				const tamano = Number(datos.pageSize) || TAMANO_PAGINA;

				if (!activo) return;

				// Si la página quedó vacía (p. ej. se eliminó el último
				// comunicado de la última página), se vuelve a la última
				// página existente; el efecto se ejecuta de nuevo.
				if (datos.comunicados.length === 0 && totalRegistros > 0 && pagina > 1) {
					setPagina(Math.max(1, Math.ceil(totalRegistros / tamano)));

					return;
				}

				setComunicados(datos.comunicados);
				setTotal(totalRegistros);
				setTamanoPagina(tamano);
				setCargando(false);
			} catch (err) {
				if (activo) {
					setComunicados([]);
					setTotal(0);
					setError(
						obtenerMensajeError(err, "No fue posible consultar los comunicados."),
					);
					setCargando(false);
				}
			}
		};

		cargarComunicados();

		return () => {
			activo = false;
		};
	}, [pagina, actualizacion]);

	const recargar = () => {
		setActualizacion((valor) => valor + 1);
	};

	const limpiarMensajes = () => {
		setMensajeExito("");
		setMensajeError("");
	};

	// "Actualizar", "Reintentar" y el cambio de página son acciones del
	// usuario sobre la lista: el aviso de la acción anterior (por ejemplo
	// "Comunicado eliminado correctamente.") ya no corresponde.
	const actualizarManual = () => {
		limpiarMensajes();
		recargar();
	};

	const cambiarPagina = (nuevaPagina) => {
		limpiarMensajes();
		setPagina(nuevaPagina);
	};

	const totalPaginas = Math.max(1, Math.ceil(total / tamanoPagina));

	/* ==========================================
     FORMULARIO: ABRIR / CERRAR / CAMPOS
     ========================================== */

	const abrirNuevo = () => {
		limpiarMensajes();
		setValores(VALORES_INICIALES);
		setErrores({});
		setErrorServidor("");
		setFormulario({ comunicado: null });
	};

	const abrirEdicion = (comunicado) => {
		limpiarMensajes();
		setValores({
			titulo: comunicado.titulo ?? "",
			contenido: comunicado.contenido ?? "",
		});
		setErrores({});
		setErrorServidor("");
		setFormulario({ comunicado });
	};

	const cerrarFormulario = () => {
		if (guardando) return;

		setFormulario(null);
	};

	// Input y textarea pasan el evento: se lee el valor del elemento.
	const actualizarCampo = (campo) => (evento) => {
		const valor = evento.target.value;

		setValores((anterior) => ({
			...anterior,
			[campo]: valor,
		}));

		setErrores((anterior) => ({
			...anterior,
			[campo]: undefined,
		}));
	};

	/* ==========================================
     FORMULARIO: GUARDAR
     ========================================== */

	const guardarComunicado = async (evento) => {
		evento.preventDefault();

		if (guardando || !formulario) return;

		const erroresValidacion = validarValores(valores);

		if (Object.keys(erroresValidacion).length > 0) {
			setErrores(erroresValidacion);

			return;
		}

		const datos = {
			titulo: valores.titulo.trim(),
			contenido: valores.contenido.trim(),
		};

		const comunicadoEditado = formulario.comunicado;

		setGuardando(true);
		setErrorServidor("");

		try {
			if (comunicadoEditado) {
				await comunicadoService.editarComunicado(comunicadoEditado.id, datos);
			} else {
				await comunicadoService.publicarComunicado(datos);
			}

			setFormulario(null);
			setMensajeExito(
				comunicadoEditado
					? "Comunicado actualizado correctamente."
					: "Comunicado publicado correctamente.",
			);

			if (!comunicadoEditado) {
				// El más reciente aparece en la primera página.
				setPagina(1);
			}

			recargar();
		} catch (err) {
			if (err?.response?.status === 404) {
				// El comunicado ya no existe: la lista mostrada está desactualizada.
				recargar();
			}

			setErrorServidor(
				obtenerMensajeError(
					err,
					comunicadoEditado
						? "No fue posible actualizar el comunicado."
						: "No fue posible publicar el comunicado.",
				),
			);
		} finally {
			setGuardando(false);
		}
	};

	/* ==========================================
     ELIMINAR
     ========================================== */

	const abrirEliminacion = (comunicado) => {
		limpiarMensajes();
		setComunicadoAEliminar(comunicado);
	};

	const cerrarEliminacion = () => {
		if (eliminando) return;

		setComunicadoAEliminar(null);
	};

	const confirmarEliminacion = async () => {
		if (eliminando || !comunicadoAEliminar) return;

		setEliminando(true);

		try {
			await comunicadoService.eliminarComunicado(comunicadoAEliminar.id);

			setComunicadoAEliminar(null);
			setMensajeExito("Comunicado eliminado correctamente.");
			recargar();
		} catch (err) {
			setComunicadoAEliminar(null);

			if (err?.response?.status === 404) {
				// Ya no existe: solo se refresca la lista.
				setMensajeExito("El comunicado ya no existe. Se actualizó la lista.");
				recargar();
			} else {
				setMensajeError(
					obtenerMensajeError(err, "No fue posible eliminar el comunicado."),
				);
			}
		} finally {
			setEliminando(false);
		}
	};

	/* ==========================================
     INTERFAZ
     ========================================== */

	const editando = Boolean(formulario?.comunicado);

	return (
		<main className="comunicados-page">
			<header className="comunicados-page__header">
				<div>
					<h1>Comunicados</h1>
					<p>Consulta los anuncios y la información institucional.</p>
				</div>

				<div className="comunicados-page__header-actions">
					<Button
						type="button"
						variant="secondary"
						onClick={actualizarManual}
						disabled={cargando}
					>
						Actualizar
					</Button>

					{puedeGestionar && (
						<Button
							type="button"
							variant="primary"
							leftIcon={<Plus size={18} />}
							onClick={abrirNuevo}
						>
							Nuevo comunicado
						</Button>
					)}
				</div>
			</header>

			{mensajeExito && (
				<p
					className="comunicados-page__message comunicados-page__message--success"
					role="status"
				>
					{mensajeExito}
				</p>
			)}

			{mensajeError && (
				<p
					className="comunicados-page__message comunicados-page__message--error"
					role="alert"
				>
					{mensajeError}
				</p>
			)}

			{cargando ? (
				<Loader message="Cargando comunicados..." />
			) : error ? (
				<section className="comunicados-page__card">
					<EmptyState
						title="No se pudieron cargar los comunicados"
						description={error}
						action={
							<Button type="button" variant="secondary" onClick={actualizarManual}>
								Reintentar
							</Button>
						}
					/>
				</section>
			) : comunicados.length === 0 ? (
				<section className="comunicados-page__card">
					<EmptyState
						title="Todavía no hay comunicados"
						description="Cuando se publique un comunicado aparecerá en esta lista."
					/>
				</section>
			) : (
				<>
					<ul className="comunicados-page__list">
						{comunicados.map((comunicado) => (
							<li key={comunicado.id}>
								<article className="comunicados-page__card comunicados-page__item">
									<header className="comunicados-page__item-header">
										<h2 className="comunicados-page__item-title">
											{comunicado.titulo}
										</h2>

										{comunicado.estado === "EDITADO" && (
											<Badge variant="info" size="sm">
												Editado
											</Badge>
										)}
									</header>

									<p className="comunicados-page__meta">
										<span>{obtenerNombreAutor(comunicado.autor)}</span>
										<span aria-hidden="true">·</span>
										<span>{formatearFecha(comunicado.fechaPublicacion)}</span>
									</p>

									<p className="comunicados-page__content">
										{comunicado.contenido}
									</p>

									{esAutor(comunicado) && (
										<div className="comunicados-page__item-actions">
											<Button
												type="button"
												variant="outline"
												size="sm"
												leftIcon={<Pencil size={16} />}
												onClick={() => abrirEdicion(comunicado)}
											>
												Editar
											</Button>

											<Button
												type="button"
												variant="danger"
												size="sm"
												leftIcon={<Trash2 size={16} />}
												onClick={() => abrirEliminacion(comunicado)}
											>
												Eliminar
											</Button>
										</div>
									)}
								</article>
							</li>
						))}
					</ul>

					<div className="comunicados-page__footer">
						<Pagination
							currentPage={pagina}
							totalPages={totalPaginas}
							onPageChange={cambiarPagina}
						/>
					</div>
				</>
			)}

			{/* PUBLICAR / EDITAR */}

			{puedeGestionar && (
				<Modal
					isOpen={formulario !== null}
					onClose={cerrarFormulario}
					title={editando ? "Editar comunicado" : "Nuevo comunicado"}
					size="lg"
					closeOnOverlay={false}
					showCloseButton={!guardando}
					footer={
						<>
							<Button
								type="button"
								variant="outline"
								onClick={cerrarFormulario}
								disabled={guardando}
							>
								Cancelar
							</Button>

							<Button
								type="submit"
								form={ID_FORMULARIO}
								variant="primary"
								loading={guardando}
							>
								{editando ? "Guardar cambios" : "Publicar"}
							</Button>
						</>
					}
				>
					<form
						id={ID_FORMULARIO}
						className="comunicados-page__form"
						onSubmit={guardarComunicado}
						noValidate
					>
						<div className="comunicados-page__field">
							<Input
								id="comunicado-titulo"
								name="titulo"
								label="Título"
								value={valores.titulo}
								placeholder="Escribe el título del comunicado"
								maxLength={MAX_TITULO}
								error={errores.titulo}
								disabled={guardando}
								onChange={actualizarCampo("titulo")}
								required
							/>

							<p className="comunicados-page__counter">
								{valores.titulo.length}/{MAX_TITULO}
							</p>
						</div>

						<div className="comunicados-page__field">
							<label
								htmlFor="comunicado-contenido"
								className="comunicados-page__label"
							>
								Contenido
								<span className="comunicados-page__required" aria-hidden="true">
									*
								</span>
							</label>

							<textarea
								id="comunicado-contenido"
								name="contenido"
								className={[
									"comunicados-page__textarea",
									errores.contenido ? "comunicados-page__textarea--error" : "",
								]
									.filter(Boolean)
									.join(" ")}
								value={valores.contenido}
								placeholder="Escribe el contenido del comunicado"
								rows={8}
								maxLength={MAX_CONTENIDO}
								disabled={guardando}
								required
								aria-invalid={errores.contenido ? "true" : undefined}
								aria-describedby={
									errores.contenido ? "comunicado-contenido-error" : undefined
								}
								onChange={actualizarCampo("contenido")}
							/>

							{errores.contenido && (
								<p
									id="comunicado-contenido-error"
									className="comunicados-page__field-error"
									role="alert"
								>
									{errores.contenido}
								</p>
							)}

							<p className="comunicados-page__counter">
								{valores.contenido.length}/{MAX_CONTENIDO}
							</p>
						</div>

						{errorServidor && (
							<p className="comunicados-page__form-error" role="alert">
								{errorServidor}
							</p>
						)}
					</form>
				</Modal>
			)}

			{/* ELIMINAR */}

			{puedeGestionar && (
				<ConfirmDialog
					isOpen={comunicadoAEliminar !== null}
					onClose={cerrarEliminacion}
					onConfirm={confirmarEliminacion}
					title="Eliminar comunicado"
					message={`¿Desea eliminar el comunicado "${
						comunicadoAEliminar?.titulo || ""
					}"? Dejará de mostrarse para todos los usuarios.`}
					confirmText="Eliminar"
					variant="danger"
					loading={eliminando}
				/>
			)}
		</main>
	);
}
