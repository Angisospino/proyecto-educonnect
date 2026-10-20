import { useEffect, useState } from "react";

import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Loader from "../../components/ui/Loader.jsx";
import Pagination from "../../components/ui/Pagination.jsx";

import comunicadoService from "../../services/comunicado.service.js";

import "./Comunicados.css";

/* ==========================================
   CONFIGURACIÓN
   ========================================== */

const TAMANO_PAGINA = 10;

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

// Se toman los primeros 10 caracteres del ISO (aaaa-mm-dd)
// para no desplazar la fecha por zona horaria.
const formatearFecha = (valor) => {
	if (!valor) return "Sin fecha";

	const fechaTexto = String(valor).slice(0, 10);

	const partes = fechaTexto.split("-");

	if (partes.length !== 3) {
		return fechaTexto;
	}

	return `${partes[2]}/${partes[1]}/${partes[0]}`;
};

const obtenerNombreAutor = (autor) => {
	const nombre = [autor?.nombre, autor?.apellido].filter(Boolean).join(" ");

	return nombre || "Autor desconocido";
};

/* ==========================================
   COMPONENTE
   ========================================== */

export default function Comunicados() {
	const [pagina, setPagina] = useState(1);

	const [comunicados, setComunicados] = useState([]);

	const [total, setTotal] = useState(0);

	const [tamanoPagina, setTamanoPagina] = useState(TAMANO_PAGINA);

	const [cargando, setCargando] = useState(true);

	const [error, setError] = useState("");

	const [actualizacion, setActualizacion] = useState(0);

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

	const totalPaginas = Math.max(1, Math.ceil(total / tamanoPagina));

	/* ==========================================
     INTERFAZ
     ========================================== */

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
						onClick={recargar}
						disabled={cargando}
					>
						Actualizar
					</Button>
				</div>
			</header>

			{cargando ? (
				<Loader message="Cargando comunicados..." />
			) : error ? (
				<section className="comunicados-page__card">
					<EmptyState
						title="No se pudieron cargar los comunicados"
						description={error}
						action={
							<Button type="button" variant="secondary" onClick={recargar}>
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
								</article>
							</li>
						))}
					</ul>

					<div className="comunicados-page__footer">
						<Pagination
							currentPage={pagina}
							totalPages={totalPaginas}
							onPageChange={setPagina}
						/>
					</div>
				</>
			)}
		</main>
	);
}
