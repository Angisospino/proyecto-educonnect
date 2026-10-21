import { Link2 } from "lucide-react";

import Proximamente from "../../../components/ui/Proximamente.jsx";

/**
 * Vínculos padre-estudiante (solo Administrador).
 *
 * La API ya existe (GET, POST y DELETE en /api/vinculos); esta pantalla
 * es un marcador hasta que se construya el formulario para vincular.
 */
const Vinculos = () => {
	return (
		<Proximamente
			titulo="Vínculos familiares"
			descripcion="Aquí podrás vincular a cada padre de familia con sus hijos para que consulten sus notas y su asistencia."
			icon={Link2}
		/>
	);
};

export default Vinculos;
