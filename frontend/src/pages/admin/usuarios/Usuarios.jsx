import { useEffect, useMemo, useState } from "react";

import {
	Edit3,
	MoreVertical,
	Plus,
	Power,
	PowerOff,
	RefreshCw,
	SearchX,
	Trash2,
	Users as UsersIcon,
} from "lucide-react";

import usuarioService from "../../../services/usuario.service.js";

import Button from "../../../components/ui/Button.jsx";
import SearchBar from "../../../components/ui/SearchBar.jsx";
import Select from "../../../components/ui/Select.jsx";
import Badge from "../../../components/ui/Badge.jsx";
import Pagination from "../../../components/ui/Pagination.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import Loader from "../../../components/ui/Loader.jsx";
import ConfirmDialog from "../../../components/ui/ConfirmDialog.jsx";

import UsuarioForm from "./UsuarioForm.jsx";

import {
	ROLES,
	ROLE_LABELS,
	ESTADOS_USUARIO,
	ESTADO_USUARIO_LABELS,
} from "../../../utils/constants.js";

import "./Usuarios.css";

const ITEMS_PER_PAGE = 10;

/* ==========================================
   OPCIONES DE FILTROS
   ========================================== */

const roleOptions = Object.values(ROLES).map((rol) => ({
	value: rol,
	label: ROLE_LABELS[rol] || rol,
}));

const estadoOptions = Object.values(ESTADOS_USUARIO).map((estado) => ({
	value: estado,
	label: ESTADO_USUARIO_LABELS[estado] || estado,
}));

/* ==========================================
   VARIANTE BADGE ROL
   ========================================== */

const getRoleVariant = (rol) => {
	switch (rol) {
		case ROLES.ADMINISTRADOR:
			return "primary";

		case ROLES.DOCENTE:
			return "secondary";

		case ROLES.ESTUDIANTE:
			return "info";

		case ROLES.PADRE_FAMILIA:
			return "warning";

		case ROLES.DIRECTIVO:
			return "neutral";

		default:
			return "neutral";
	}
};

const Usuarios = () => {
	/* ========================================
     ESTADO PRINCIPAL
     ======================================== */

	const [usuarios, setUsuarios] = useState([]);

	const [loading, setLoading] = useState(true);

	const [error, setError] = useState("");

	/* ========================================
     BÚSQUEDA Y FILTROS
     ======================================== */

	const [search, setSearch] = useState("");

	const [rolFilter, setRolFilter] = useState("");

	const [estadoFilter, setEstadoFilter] = useState("");

	/* ========================================
     PAGINACIÓN
     ======================================== */

	const [currentPage, setCurrentPage] = useState(1);

	/* ========================================
     FORMULARIO CREAR / EDITAR
     ======================================== */

	const [isFormOpen, setIsFormOpen] = useState(false);

	const [selectedUsuario, setSelectedUsuario] = useState(null);

	/* ========================================
     MENÚ DE ACCIONES
     ======================================== */

	const [openMenuId, setOpenMenuId] = useState(null);

	/* ========================================
     CONFIRMACIÓN DE ESTADO
     ======================================== */

	const [statusDialog, setStatusDialog] = useState({
		open: false,
		usuario: null,
	});

	const [changingStatus, setChangingStatus] = useState(false);

	/* ========================================
     CONFIRMACIÓN DE ELIMINACIÓN
     ======================================== */

	const [deleteDialog, setDeleteDialog] = useState({
		open: false,
		usuario: null,
	});

	const [deleting, setDeleting] = useState(false);

	/* ========================================
     CARGAR USUARIOS
     ======================================== */

	const cargarUsuarios = async () => {
		try {
			setLoading(true);
			setError("");

			const response = await usuarioService.obtenerUsuarios();

			/*
			 * El servicio retorna response.data.
			 *
			 * Si el backend responde:
			 *
			 * {
			 *   success: true,
			 *   data: [...]
			 * }
			 *
			 * aquí extraemos response.data.
			 */

			const lista = Array.isArray(response)
				? response
				: response?.data?.usuarios || [];

			setUsuarios(lista);
		} catch (err) {
			console.error("Error cargando usuarios:", err);

			setError(
				err.response?.data?.message ||
					err.response?.data?.error ||
					"No fue posible cargar los usuarios.",
			);
		} finally {
			setLoading(false);
		}
	};

	/* ========================================
     CARGA INICIAL
     ======================================== */

	useEffect(() => {
		cargarUsuarios();
	}, []);

	/* ========================================
     VOLVER A PÁGINA 1 AL FILTRAR
     ======================================== */

	useEffect(() => {
		setCurrentPage(1);
	}, [search, rolFilter, estadoFilter]);

	/* ========================================
     CERRAR MENÚ AL HACER CLICK FUERA
     ======================================== */

	useEffect(() => {
		const handleDocumentClick = () => {
			setOpenMenuId(null);
		};

		document.addEventListener("click", handleDocumentClick);

		return () => {
			document.removeEventListener("click", handleDocumentClick);
		};
	}, []);

	/* ========================================
     FILTRAR USUARIOS
     ======================================== */

	const usuariosFiltrados = useMemo(() => {
		const searchTerm = search.trim().toLowerCase();

		return usuarios.filter((usuario) => {
			const nombreCompleto = `${usuario.nombre || ""} ${usuario.apellido || ""}`
				.trim()
				.toLowerCase();

			const email = usuario.email?.toLowerCase() || "";

			const coincideBusqueda =
				!searchTerm ||
				nombreCompleto.includes(searchTerm) ||
				email.includes(searchTerm);

			const coincideRol = !rolFilter || usuario.rol === rolFilter;

			const coincideEstado = !estadoFilter || usuario.estado === estadoFilter;

			return coincideBusqueda && coincideRol && coincideEstado;
		});
	}, [usuarios, search, rolFilter, estadoFilter]);

	/* ========================================
     PAGINACIÓN
     ======================================== */

	const totalPages = Math.ceil(usuariosFiltrados.length / ITEMS_PER_PAGE);

	const usuariosPaginados = useMemo(() => {
		const start = (currentPage - 1) * ITEMS_PER_PAGE;

		return usuariosFiltrados.slice(start, start + ITEMS_PER_PAGE);
	}, [usuariosFiltrados, currentPage]);

	/*
	 * Si por una eliminación la página actual
	 * queda fuera del rango disponible,
	 * regresamos a la última página válida.
	 */

	useEffect(() => {
		if (totalPages > 0 && currentPage > totalPages) {
			setCurrentPage(totalPages);
		}
	}, [currentPage, totalPages]);

	/* ========================================
     INFORMACIÓN DE PAGINACIÓN
     ======================================== */

	const startItem =
		usuariosFiltrados.length === 0 ? 0 : (currentPage - 1) * ITEMS_PER_PAGE + 1;

	const endItem = Math.min(
		currentPage * ITEMS_PER_PAGE,
		usuariosFiltrados.length,
	);

	/* ========================================
     LIMPIAR FILTROS
     ======================================== */

	const handleClearFilters = () => {
		setSearch("");
		setRolFilter("");
		setEstadoFilter("");
	};

	const hasFilters = Boolean(search || rolFilter || estadoFilter);

	/* ========================================
     CREAR USUARIO
     ======================================== */

	const handleCreate = () => {
		setSelectedUsuario(null);
		setIsFormOpen(true);
		setOpenMenuId(null);
	};

	/* ========================================
     EDITAR USUARIO
     ======================================== */

	const handleEdit = (usuario) => {
		setSelectedUsuario(usuario);
		setIsFormOpen(true);
		setOpenMenuId(null);
	};

	/* ========================================
     CERRAR FORMULARIO
     ======================================== */

	const handleCloseForm = () => {
		setIsFormOpen(false);
		setSelectedUsuario(null);
	};

	/* ========================================
     GUARDADO EXITOSO
     ======================================== */

	const handleUsuarioSaved = async () => {
		handleCloseForm();

		await cargarUsuarios();
	};

	/* ========================================
     ABRIR CAMBIO DE ESTADO
     ======================================== */

	const handleOpenStatusDialog = (usuario) => {
		setOpenMenuId(null);

		setStatusDialog({
			open: true,
			usuario,
		});
	};

	/* ========================================
     CAMBIAR ESTADO
     ======================================== */

	const handleChangeStatus = async () => {
		const usuario = statusDialog.usuario;

		if (!usuario) {
			return;
		}

		const nuevoEstado =
			usuario.estado === ESTADOS_USUARIO.ACTIVO
				? ESTADOS_USUARIO.INACTIVO
				: ESTADOS_USUARIO.ACTIVO;

		try {
			setChangingStatus(true);
			setError("");

			await usuarioService.cambiarEstadoUsuario(usuario.id, nuevoEstado);

			/*
			 * Actualizamos el estado local para no
			 * necesitar descargar toda la lista.
			 */

			setUsuarios((prev) =>
				prev.map((item) =>
					item.id === usuario.id
						? {
								...item,
								estado: nuevoEstado,
							}
						: item,
				),
			);

			setStatusDialog({
				open: false,
				usuario: null,
			});
		} catch (err) {
			console.error("Error cambiando estado:", err);

			setError(
				err.response?.data?.message ||
					"No fue posible cambiar el estado del usuario.",
			);
		} finally {
			setChangingStatus(false);
		}
	};

	/* ========================================
     ABRIR ELIMINACIÓN
     ======================================== */

	const handleOpenDeleteDialog = (usuario) => {
		setOpenMenuId(null);

		setDeleteDialog({
			open: true,
			usuario,
		});
	};

	/* ========================================
     ELIMINAR USUARIO
     ======================================== */

	const handleDelete = async () => {
		const usuario = deleteDialog.usuario;

		if (!usuario) {
			return;
		}

		try {
			setDeleting(true);
			setError("");

			await usuarioService.eliminarUsuario(usuario.id);

			setUsuarios((prev) => prev.filter((item) => item.id !== usuario.id));

			setDeleteDialog({
				open: false,
				usuario: null,
			});
		} catch (err) {
			console.error("Error eliminando usuario:", err);

			setError(
				err.response?.data?.message || "No fue posible eliminar el usuario.",
			);
		} finally {
			setDeleting(false);
		}
	};

	/* ========================================
     NOMBRE USUARIO CONFIRMACIÓN
     ======================================== */

	const statusUsuario = statusDialog.usuario;

	const statusIsActive = statusUsuario?.estado === ESTADOS_USUARIO.ACTIVO;

	/* ========================================
     RENDER
     ======================================== */

	return (
		<section className="usuarios-page">
			{/* =====================================
          ENCABEZADO
          ===================================== */}

			<div className="usuarios-page__header">
				<div>
					<h2 className="usuarios-page__title">Gestión de usuarios</h2>

					<p className="usuarios-page__description">
						Administre las cuentas de administradores, docentes, estudiantes,
						padres de familia y directivos de EduConnect BR.
					</p>
				</div>

				<Button onClick={handleCreate} icon={<Plus size={18} />}>
					Nuevo usuario
				</Button>
			</div>

			{/* =====================================
          ERROR
          ===================================== */}

			{error && (
				<div className="usuarios-page__alert" role="alert">
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
          FILTROS
          ===================================== */}

			<div className="usuarios-page__filters">
				<div className="usuarios-page__search">
					<SearchBar
						value={search}
						onChange={setSearch}
						placeholder="Buscar por nombre, apellido o correo..."
					/>
				</div>

				<div className="usuarios-page__filter">
					<Select
						value={rolFilter}
						onChange={(event) => setRolFilter(event.target.value)}
						options={roleOptions}
						placeholder="Todos los roles"
					/>
				</div>

				<div className="usuarios-page__filter">
					<Select
						value={estadoFilter}
						onChange={(event) => setEstadoFilter(event.target.value)}
						options={estadoOptions}
						placeholder="Todos los estados"
					/>
				</div>

				<Button
					variant="outline"
					onClick={cargarUsuarios}
					icon={<RefreshCw size={17} />}
					title="Actualizar usuarios"
				>
					Actualizar
				</Button>
			</div>

			{/* =====================================
          CONTENIDO
          ===================================== */}

			<div className="usuarios-page__card">
				{loading ? (
					/* LOADING */

					<div className="usuarios-page__loading">
						<Loader />

						<p>Cargando usuarios...</p>
					</div>
				) : usuariosFiltrados.length === 0 ? (
					/* EMPTY STATE */

					hasFilters ? (
						<EmptyState
							icon={SearchX}
							title="No se encontraron usuarios"
							description="No existen usuarios que coincidan con la búsqueda o los filtros seleccionados."
							action={
								<Button variant="outline" onClick={handleClearFilters}>
									Limpiar filtros
								</Button>
							}
						/>
					) : (
						<EmptyState
							icon={UsersIcon}
							title="No hay usuarios registrados"
							description="Cree el primer usuario para comenzar a administrar las cuentas de EduConnect BR."
							action={
								<Button onClick={handleCreate} icon={<Plus size={18} />}>
									Crear usuario
								</Button>
							}
						/>
					)
				) : (
					<>
						{/* ===============================
                TABLA
                =============================== */}

						<div className="usuarios-page__table-wrapper">
							<table className="usuarios-page__table">
								<thead>
									<tr>
										<th>Usuario</th>

										<th>Correo electrónico</th>

										<th>Rol</th>

										<th>Estado</th>

										<th>Fecha de creación</th>

										<th className="usuarios-page__actions-header">Acciones</th>
									</tr>
								</thead>

								<tbody>
									{usuariosPaginados.map((usuario) => {
										const nombreCompleto = `${usuario.nombre || ""} ${
											usuario.apellido || ""
										}`.trim();

										const initials = `${usuario.nombre?.[0] || ""}${
											usuario.apellido?.[0] || ""
										}`.toUpperCase();

										const isActive = usuario.estado === ESTADOS_USUARIO.ACTIVO;

										return (
											<tr key={usuario.id}>
												{/* USUARIO */}

												<td>
													<div className="usuarios-page__user">
														<div className="usuarios-page__avatar">
															{initials || "U"}
														</div>

														<div className="usuarios-page__user-info">
															<strong>{nombreCompleto}</strong>

															<span>ID #{usuario.id}</span>
														</div>
													</div>
												</td>

												{/* EMAIL */}

												<td>
													<span className="usuarios-page__email">
														{usuario.email}
													</span>
												</td>

												{/* ROL */}

												<td>
													<Badge variant={getRoleVariant(usuario.rol)}>
														{ROLE_LABELS[usuario.rol] || usuario.rol}
													</Badge>
												</td>

												{/* ESTADO */}

												<td>
													<Badge variant={isActive ? "success" : "danger"} dot>
														{ESTADO_USUARIO_LABELS[usuario.estado] ||
															usuario.estado}
													</Badge>
												</td>

												{/* FECHA */}

												<td>
													{usuario.createdAt
														? new Intl.DateTimeFormat("es-CO", {
																day: "2-digit",
																month: "2-digit",
																year: "numeric",
															}).format(new Date(usuario.createdAt))
														: "—"}
												</td>

												{/* ACCIONES */}

												<td>
													<div className="usuarios-page__actions">
														<button
															type="button"
															className="usuarios-page__action-button"
															onClick={(event) => {
																event.stopPropagation();

																setOpenMenuId((current) =>
																	current === usuario.id ? null : usuario.id,
																);
															}}
															aria-label={`Acciones para ${nombreCompleto}`}
															aria-expanded={openMenuId === usuario.id}
														>
															<MoreVertical size={19} />
														</button>

														{openMenuId === usuario.id && (
															<div
																className="usuarios-page__actions-menu"
																onClick={(event) => event.stopPropagation()}
															>
																<button
																	type="button"
																	onClick={() => handleEdit(usuario)}
																>
																	<Edit3 size={17} />
																	Editar
																</button>

																<button
																	type="button"
																	onClick={() =>
																		handleOpenStatusDialog(usuario)
																	}
																>
																	{isActive ? (
																		<PowerOff size={17} />
																	) : (
																		<Power size={17} />
																	)}

																	{isActive ? "Desactivar" : "Activar"}
																</button>

																<div className="usuarios-page__menu-divider" />

																<button
																	type="button"
																	className="usuarios-page__menu-danger"
																	onClick={() =>
																		handleOpenDeleteDialog(usuario)
																	}
																>
																	<Trash2 size={17} />
																	Eliminar
																</button>
															</div>
														)}
													</div>
												</td>
											</tr>
										);
									})}
								</tbody>
							</table>
						</div>

						{/* ===============================
                FOOTER / PAGINACIÓN
                =============================== */}

						<div className="usuarios-page__footer">
							<p className="usuarios-page__pagination-info">
								Mostrando <strong>{startItem}</strong> -{" "}
								<strong>{endItem}</strong> de{" "}
								<strong>{usuariosFiltrados.length}</strong> usuarios
							</p>

							<Pagination
								currentPage={currentPage}
								totalPages={totalPages}
								onPageChange={setCurrentPage}
							/>
						</div>
					</>
				)}
			</div>

			{/* =====================================
          CREAR / EDITAR USUARIO
          ===================================== */}

			<UsuarioForm
				isOpen={isFormOpen}
				onClose={handleCloseForm}
				usuario={selectedUsuario}
				onSuccess={handleUsuarioSaved}
			/>

			{/* =====================================
          CAMBIAR ESTADO
          ===================================== */}

			<ConfirmDialog
				isOpen={statusDialog.open}
				onClose={() =>
					setStatusDialog({
						open: false,
						usuario: null,
					})
				}
				onConfirm={handleChangeStatus}
				title={statusIsActive ? "Desactivar usuario" : "Activar usuario"}
				message={
					statusIsActive
						? `¿Desea desactivar la cuenta de ${statusUsuario?.nombre || ""} ${statusUsuario?.apellido || ""}? El usuario no podrá iniciar sesión mientras permanezca inactivo.`
						: `¿Desea activar la cuenta de ${statusUsuario?.nombre || ""} ${statusUsuario?.apellido || ""}? El usuario podrá volver a iniciar sesión.`
				}
				confirmText={statusIsActive ? "Desactivar" : "Activar"}
				variant={statusIsActive ? "warning" : "success"}
				loading={changingStatus}
			/>

			{/* =====================================
          ELIMINAR USUARIO
          ===================================== */}

			<ConfirmDialog
				isOpen={deleteDialog.open}
				onClose={() =>
					setDeleteDialog({
						open: false,
						usuario: null,
					})
				}
				onConfirm={handleDelete}
				title="Eliminar usuario"
				message={`¿Está seguro de que desea eliminar permanentemente a ${
					deleteDialog.usuario?.nombre || ""
				} ${
					deleteDialog.usuario?.apellido || ""
				}? Esta acción no se puede deshacer.`}
				confirmText="Eliminar"
				variant="danger"
				loading={deleting}
			/>
		</section>
	);
};

export default Usuarios;
