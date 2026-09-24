import { useEffect, useMemo, useState } from "react";

import { BookOpen, GraduationCap, RefreshCw } from "lucide-react";

import notaService from "../../services/nota.service.js";

import { useAuth } from "../../hooks/useAuth.js";

import Loader from "../../components/ui/Loader.jsx";
import EmptyState from "../../components/ui/EmptyState.jsx";
import Badge from "../../components/ui/Badge.jsx";
import Button from "../../components/ui/Button.jsx";

import "./MisNotas.css";

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

	const [loading, setLoading] = useState(true);

	const [error, setError] = useState("");

	/* ========================================
     CARGAR NOTAS
     ======================================== */

	const cargarNotas = async () => {
		try {
			setLoading(true);
			setError("");

			const response = await notaService.obtenerNotas();

			const lista = Array.isArray(response)
				? response
				: response?.data || [];

			setNotas(lista);
		} catch (err) {
			console.error("Error cargando notas:", err);

			setError(
				err.response?.data?.error ||
					err.response?.data?.message ||
					"No fue posible cargar las notas.",
			);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		cargarNotas();
	}, []);

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

	/* ========================================
     NOMBRE DEL ESTUDIANTE (SESIÓN REAL)
     ======================================== */

	const nombreCompleto = `${user?.nombre || ""} ${user?.apellido || ""}`.trim();

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
					<h2 className="mis-notas-page__title">Mis notas</h2>

					<p className="mis-notas-page__description">
						{nombreCompleto
							? `Consulta de calificaciones de ${nombreCompleto}.`
							: "Consulta de calificaciones por período académico."}
					</p>
				</div>

				<Button
					variant="outline"
					onClick={cargarNotas}
					leftIcon={<RefreshCw size={17} />}
					title="Actualizar notas"
				>
					Actualizar
				</Button>
			</div>

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
					description="Todavía no se han registrado calificaciones para tu cuenta."
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
								Promedio general
							</span>

							<strong className="mis-notas-page__summary-value">
								{promedio !== null ? promedio.toFixed(1) : "—"}
							</strong>
						</div>

						<Badge variant={getNotaVariant(promedio)} size="lg">
							{promedio >= 3.0 ? "Aprobado" : "En riesgo"}
						</Badge>
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
				</>
			)}
		</section>
	);
};

export default MisNotas;
