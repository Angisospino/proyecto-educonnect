/**
 * Datos de demostracion de EduConnect BR.
 *
 * Uso (desde /backend):
 *   node prisma/seed-demo.js              Carga los datos de demostracion.
 *   node prisma/seed-demo.js --dry-run    Ejecuta todo y revierte al final (no persiste nada).
 *   node prisma/seed-demo.js --limpiar    Elimina SOLO los datos de demostracion.
 *   node prisma/seed-demo.js --limpiar --dry-run
 *
 * Propiedades:
 *  - ADITIVO e IDEMPOTENTE: en modo carga solo busca-o-crea por claves
 *    naturales; nunca actualiza ni elimina filas existentes.
 *  - DETERMINISTA: las notas y la asistencia salen de un PRNG con semilla
 *    fija, asi que cada ejecucion genera exactamente los mismos datos.
 *  - Todo ocurre dentro de UNA transaccion interactiva.
 *  - No envia correos: solo usa Prisma.
 *
 * Requiere que el seed base (prisma/seed.js) ya se haya ejecutado.
 */
import "dotenv/config";
import prisma from "../src/config/prisma.js";

import { hashPassword } from "../src/utils/bcrypt.util.js";

// =====================================================
// CONSTANTES
// =====================================================

const DOMINIO = "educonnectbr.edu.co";
const PASSWORD_DEMO = "EduConnect123*";
const SEMILLA_PRNG = 20260914;

const PREFIJO_CODIGO = "DEMO-";

const PERIODOS_BASE = ["2026-P1", "2026-P2"];
const PERIODOS_LAURA = ["2026-P1", "2026-P2", "2026-P3"];

// Rango de asistencia (dias habiles, lunes a viernes).
const FECHA_INICIO = new Date(Date.UTC(2026, 8, 14));
const FECHA_FIN = new Date(Date.UTC(2026, 9, 20));

const mail = (local) => `${local}@${DOMINIO}`;

// Usuarios que ya existen en la base (seed base). Nunca se actualizan ni se borran.
const EMAIL_CARLOS = mail("docente");
const EMAIL_ANDRES = mail("directivo");
const EMAIL_LAURA = mail("estudiante");
const EMAIL_MARIA = mail("padre");

// Usuarios nuevos de demostracion.
const EMAIL_ANA = mail("ana.torres");
const EMAIL_LUIS = mail("luis.ortega");
const EMAIL_MARTA = mail("marta.rojas");

// Docente y directivo base que se crean solo si NO existen (seed base ausente).
const USUARIOS_BASE_SI_FALTAN = [
	{
		nombre: "Carlos",
		apellido: "Martínez",
		email: EMAIL_CARLOS,
		rol: "DOCENTE",
		estado: "ACTIVO",
	},
	{
		nombre: "Andrés",
		apellido: "Gómez",
		email: EMAIL_ANDRES,
		rol: "DIRECTIVO",
		estado: "ACTIVO",
	},
];

// Personal y padres nuevos.
const USUARIOS_DEMO_ADULTOS = [
	{ nombre: "Ana María", apellido: "Torres", email: EMAIL_ANA, rol: "DOCENTE", estado: "ACTIVO" },
	{ nombre: "Luis Fernando", apellido: "Ortega", email: EMAIL_LUIS, rol: "DOCENTE", estado: "ACTIVO" },
	{ nombre: "Marta Lucía", apellido: "Rojas", email: EMAIL_MARTA, rol: "DIRECTIVO", estado: "ACTIVO" },
	// Usuario inactivo para mostrar el filtro de estado.
	{ nombre: "Roberto", apellido: "Díaz", email: mail("roberto.diaz"), rol: "DOCENTE", estado: "INACTIVO" },
	{ nombre: "Jorge", apellido: "Ramírez", email: mail("jorge.ramirez"), rol: "PADRE_FAMILIA", estado: "ACTIVO" },
	{ nombre: "Claudia", apellido: "Castro", email: mail("claudia.castro"), rol: "PADRE_FAMILIA", estado: "ACTIVO" },
	{ nombre: "Pedro", apellido: "Herrera", email: mail("pedro.herrera"), rol: "PADRE_FAMILIA", estado: "ACTIVO" },
	{ nombre: "Luz Marina", apellido: "Moreno", email: mail("luz.moreno"), rol: "PADRE_FAMILIA", estado: "ACTIVO" },
];

// Estudiantes nuevos (el codigo DEMO-NNN se asigna por orden en esta lista).
const ESTUDIANTES_DEMO = [
	// 6°A
	{ nombre: "Sofía", apellido: "Ramírez", email: mail("sofia.ramirez"), curso: "6°A" },
	{ nombre: "Valentina", apellido: "Castro", email: mail("valentina.castro"), curso: "6°A" },
	{ nombre: "Santiago", apellido: "Herrera", email: mail("santiago.herrera"), curso: "6°A" },
	{ nombre: "Juan David", apellido: "Pardo", email: mail("juan.pardo"), curso: "6°A" },
	{ nombre: "Camila", apellido: "Ortiz", email: mail("camila.ortiz"), curso: "6°A" },
	{ nombre: "Samuel", apellido: "Vargas", email: mail("samuel.vargas"), curso: "6°A" },
	{ nombre: "Daniela", apellido: "Peña", email: mail("daniela.pena"), curso: "6°A" },
	// 6°B
	{ nombre: "Isabella", apellido: "Moreno", email: mail("isabella.moreno"), curso: "6°B", todasLasAsignaturas: true },
	{ nombre: "Emmanuel", apellido: "Herrera", email: mail("emmanuel.herrera"), curso: "6°B" },
	{ nombre: "Nicolás", apellido: "Cardona", email: mail("nicolas.cardona"), curso: "6°B" },
	{ nombre: "Mariana", apellido: "Salazar", email: mail("mariana.salazar"), curso: "6°B" },
	{ nombre: "Gabriel", apellido: "Núñez", email: mail("gabriel.nunez"), curso: "6°B" },
	// 7°A
	{ nombre: "Mateo", apellido: "Rodríguez", email: mail("mateo.rodriguez"), curso: "7°A", todasLasAsignaturas: true },
	{ nombre: "Luciana", apellido: "Duarte", email: mail("luciana.duarte"), curso: "7°A" },
	{ nombre: "Andrés Felipe", apellido: "Mejía", email: mail("andres.mejia"), curso: "7°A" },
	{ nombre: "Paula Andrea", apellido: "Guzmán", email: mail("paula.guzman"), curso: "7°A" },
].map((e, i) => ({
	...e,
	rol: "ESTUDIANTE",
	estado: "ACTIVO",
	codigo: `${PREFIJO_CODIGO}${String(i + 1).padStart(3, "0")}`,
}));

const EMAIL_MATEO = mail("mateo.rodriguez");

// Lista EXACTA de correos de demostracion (clave de --limpiar).
const EMAILS_DEMO = [
	...USUARIOS_DEMO_ADULTOS.map((u) => u.email),
	...ESTUDIANTES_DEMO.map((e) => e.email),
];

// Cursos: los nuevos son los que se pueden limpiar; 6°A nunca se elimina.
const CURSOS = [
	{ nombre: "6°A", jornada: "Mañana" },
	{ nombre: "6°B", jornada: "Mañana" },
	{ nombre: "7°A", jornada: "Tarde" },
];
const CURSOS_DEMO_NUEVOS = ["6°B", "7°A"];

// Docente titular de cada curso (para Asistencia.docenteId).
const DOCENTE_POR_CURSO = {
	"6°A": EMAIL_ANA,
	"6°B": EMAIL_LUIS,
	"7°A": EMAIL_CARLOS,
};

const ASIGNATURA_EXISTENTE = "Matemáticas";
const ASIGNATURAS_NUEVAS = [
	"Lengua Castellana",
	"Ciencias Naturales",
	"Ciencias Sociales",
	"Inglés",
	"Educación Física",
];
const ASIGNATURAS_BASE_ESTUDIANTE = [
	"Matemáticas",
	"Lengua Castellana",
	"Ciencias Naturales",
	"Inglés",
];
const ASIGNATURAS_TODAS = [...ASIGNATURAS_BASE_ESTUDIANTE, "Ciencias Sociales", "Educación Física"];

// Docente que registra cada asignatura (Nota.docenteId).
const DOCENTE_POR_ASIGNATURA = {
	"Lengua Castellana": EMAIL_ANA,
	"Ciencias Sociales": EMAIL_ANA,
	"Inglés": EMAIL_LUIS,
	"Educación Física": EMAIL_LUIS,
	"Matemáticas": EMAIL_CARLOS,
	"Ciencias Naturales": EMAIL_CARLOS,
};

// Vinculos padre-estudiante a crear (por correo). No incluye a Laura.
const VINCULOS_DEMO = [
	{ padre: EMAIL_MARIA, hijo: EMAIL_MATEO },
	{ padre: mail("jorge.ramirez"), hijo: mail("sofia.ramirez") },
	{ padre: mail("claudia.castro"), hijo: mail("valentina.castro") },
	{ padre: mail("pedro.herrera"), hijo: mail("santiago.herrera") },
	{ padre: mail("pedro.herrera"), hijo: mail("emmanuel.herrera") },
	{ padre: mail("luz.moreno"), hijo: mail("isabella.moreno") },
];

// Comunicados de demostracion. Los titulos son UNICOS y tambien son la
// clave de --limpiar: no los cambies sin actualizar ambos modos.
const COMUNICADOS_DEMO = [
	{
		autor: EMAIL_ANDRES,
		titulo: "Reunión general de padres de familia",
		fecha: "2026-09-04T08:00:00-05:00",
		contenido:
			"La institución convoca a todos los padres y madres de familia a la reunión general del tercer periodo. Se presentarán los avances académicos y los acuerdos de convivencia. Su asistencia es muy importante para acompañar el proceso de los estudiantes.",
	},
	{
		autor: EMAIL_CARLOS,
		titulo: "Cronograma de evaluaciones del tercer periodo",
		fecha: "2026-09-02T07:45:00-05:00",
		contenido:
			"Se publica el cronograma de evaluaciones del tercer periodo para los grados sexto y séptimo. Cada docente informará en clase los temas que se evaluarán. Se recomienda organizar con tiempo el estudio de cada asignatura.",
	},
	{
		autor: EMAIL_CARLOS,
		titulo: "Salida pedagógica al parque ecológico",
		fecha: "2026-09-08T10:15:00-05:00",
		contenido:
			"El área de Ciencias Naturales realizará una salida pedagógica a un parque ecológico de la región. Los estudiantes deberán entregar la autorización firmada por su acudiente antes de la fecha indicada. Se debe llevar ropa cómoda, gorra y botella de agua.",
	},
	{
		autor: EMAIL_ANA,
		titulo: "Plan lector del tercer periodo",
		fecha: "2026-09-10T09:00:00-05:00",
		contenido:
			"El área de Lengua Castellana da a conocer los libros del plan lector del tercer periodo. Cada estudiante deberá elegir una obra y presentar un resumen oral en clase. Los textos están disponibles para préstamo en la biblioteca de la institución.",
	},
	{
		autor: EMAIL_CARLOS,
		titulo: "Taller de lectura en voz alta para grado sexto",
		fecha: "2026-09-16T14:20:00-05:00",
		contenido:
			"Los estudiantes de grado sexto participarán en un taller de lectura en voz alta durante la jornada. La actividad busca fortalecer la comprensión lectora y la expresión oral. No se requiere ningún material especial.",
	},
	{
		autor: EMAIL_ANDRES,
		titulo: "Jornada deportiva institucional",
		fecha: "2026-09-18T12:30:00-05:00",
		contenido:
			"La institución invita a toda la comunidad educativa a la jornada deportiva anual. Habrá torneos de fútbol, baloncesto y voleibol entre los diferentes grados. Los estudiantes deben asistir con el uniforme de educación física.",
	},
	{
		autor: EMAIL_MARTA,
		titulo: "Campaña de salud y vacunación escolar",
		fecha: "2026-09-21T09:35:00-05:00",
		contenido:
			"Se realizará una campaña de promoción de la salud con apoyo de personal del sector. Incluye revisión del esquema de vacunación, pausas activas y charlas de hábitos saludables. Los acudientes deben presentar el carné de vacunación del estudiante cuando se solicite.",
	},
	{
		autor: EMAIL_CARLOS,
		titulo: "Entrega de trabajos de Matemáticas",
		fecha: "2026-09-23T08:05:00-05:00",
		contenido:
			"Se recuerda que los talleres de Matemáticas del tercer periodo deben entregarse en la fecha acordada en clase. Los trabajos presentados fuera de tiempo se recibirán con ajuste en la valoración. Cualquier inquietud puede resolverse con el docente durante la jornada.",
	},
	{
		autor: EMAIL_ANA,
		titulo: "Horario ampliado de la biblioteca",
		fecha: "2026-09-29T13:10:00-05:00",
		contenido:
			"La biblioteca de la institución amplía su horario de atención durante las últimas semanas del periodo. Los estudiantes podrán consultar y solicitar material de lunes a viernes, incluso después de terminar las clases. Se pide cuidar los libros y devolverlos en el plazo establecido.",
	},
	{
		autor: EMAIL_CARLOS,
		titulo: "Feria de ciencias institucional",
		fecha: "2026-10-01T11:30:00-05:00",
		estado: "EDITADO",
		contenido:
			"La feria de ciencias se realizará en el patio principal con la participación de todos los grados. Los equipos deben inscribir su proyecto con el docente de Ciencias Naturales y preparar una exposición de cinco minutos. Se actualizó la hora de inicio y el orden de las presentaciones.",
	},
	{
		autor: EMAIL_ANDRES,
		titulo: "Cambios en el horario de ruta escolar",
		fecha: "2026-10-05T17:15:00-05:00",
		contenido:
			"A partir de la próxima semana se ajusta el horario de salida de la ruta escolar para ambas jornadas. Se solicita a los acudientes verificar los nuevos tiempos de recogida con la coordinación. Los estudiantes deben estar en el punto de encuentro con anticipación.",
	},
	{
		autor: EMAIL_ANA,
		titulo: "Concurso de ortografía y redacción",
		fecha: "2026-10-08T15:25:00-05:00",
		estado: "EDITADO",
		contenido:
			"El área de Lengua Castellana organiza un concurso de ortografía y redacción para los grados sexto y séptimo. Los estudiantes interesados deben inscribirse con su docente de área. Se corrigió la fecha de la prueba final y se ampliaron los cupos de participación.",
	},
	{
		autor: EMAIL_CARLOS,
		titulo: "Simulacro de pruebas de periodo",
		fecha: "2026-10-14T16:40:00-05:00",
		contenido:
			"Se aplicará un simulacro de pruebas de periodo para preparar a los estudiantes antes de las evaluaciones finales. Los resultados no afectarán la valoración definitiva y servirán para reforzar los temas con mayor dificultad. Se recomienda descansar bien la noche anterior.",
	},
	{
		autor: EMAIL_ANDRES,
		titulo: "Cronograma de la semana de receso escolar",
		fecha: "2026-10-16T10:50:00-05:00",
		contenido:
			"La institución informa las fechas de la semana de receso escolar y el día de retorno a clases. Durante ese tiempo no habrá atención de aulas ni de transporte. Se invita a las familias a aprovechar el descanso para fortalecer la lectura en casa.",
	},
	{
		autor: EMAIL_MARTA,
		titulo: "Uso adecuado del uniforme institucional",
		fecha: "2026-10-19T07:20:00-05:00",
		contenido:
			"Se recuerda a los estudiantes que el uniforme debe portarse completo y en buen estado durante toda la jornada. El uniforme de educación física solo se usa los días indicados en el horario. Los acudientes pueden comunicarse con la coordinación ante cualquier dificultad.",
	},
];

const TITULOS_COMUNICADOS_DEMO = COMUNICADOS_DEMO.map((c) => c.titulo);

// Credenciales que se muestran al final (ademas de los usuarios nuevos).
const USUARIOS_EXISTENTES_INFO = [
	{ email: mail("admin"), rol: "ADMINISTRADOR" },
	{ email: EMAIL_CARLOS, rol: "DOCENTE" },
	{ email: EMAIL_LAURA, rol: "ESTUDIANTE" },
	{ email: EMAIL_MARIA, rol: "PADRE_FAMILIA" },
	{ email: EMAIL_ANDRES, rol: "DIRECTIVO" },
	{ email: mail("padre.sinhijos"), rol: "PADRE_FAMILIA (sin hijos)" },
];

// =====================================================
// UTILIDADES
// =====================================================

class RollbackSimulado extends Error {
	constructor() {
		super("Rollback simulado (--dry-run)");
		this.name = "RollbackSimulado";
	}
}

/** PRNG determinista (mulberry32): mismo seed, misma secuencia. */
function mulberry32(semilla) {
	let a = semilla >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

const claveFecha = (fecha) => fecha.toISOString().slice(0, 10);

/** Dias habiles (lunes a viernes) del rango, como Date en medianoche UTC. */
function diasHabiles() {
	const dias = [];
	for (let t = FECHA_INICIO.getTime(); t <= FECHA_FIN.getTime(); t += 86400000) {
		const fecha = new Date(t);
		const diaSemana = fecha.getUTCDay();
		if (diaSemana >= 1 && diaSemana <= 5) dias.push(fecha);
	}
	return dias;
}

function dividirEnLotes(lista, tamano) {
	const lotes = [];
	for (let i = 0; i < lista.length; i += tamano) {
		lotes.push(lista.slice(i, i + tamano));
	}
	return lotes;
}

/**
 * Genera, de forma determinista y sin tocar la base de datos, todas las
 * notas y asistencias de demostracion. Se calcula siempre completo, asi
 * una re-ejecucion produce los mismos valores aunque ya existan filas.
 */
function planificarDatos() {
	const rand = mulberry32(SEMILLA_PRNG);

	// Distribucion normal (Box-Muller) a partir del PRNG.
	const gauss = () => {
		const u = Math.max(rand(), 1e-9);
		const v = rand();
		return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
	};

	// Media ~3.8 (tras el tope de 5.0), desviacion ~0.55, limitada a 1.0-5.0 con un decimal.
	const generarNota = (nivelEstudiante) => {
		const bruto = 4.0 + nivelEstudiante + gauss() * 0.5;
		return Number(Math.min(5, Math.max(1, bruto)).toFixed(1));
	};

	// ~80% PRESENTE, ~12% AUSENTE, ~8% TARDANZA.
	const generarEstado = () => {
		const r = rand();
		if (r < 0.8) return "PRESENTE";
		if (r < 0.92) return "AUSENTE";
		return "TARDANZA";
	};

	const dias = diasHabiles();

	// Laura (existente) va primero: solo asignaturas nuevas x 3 periodos.
	const estudiantes = [
		{ email: EMAIL_LAURA, curso: "6°A", esLaura: true },
		...ESTUDIANTES_DEMO.map((e) => ({
			email: e.email,
			curso: e.curso,
			todasLasAsignaturas: Boolean(e.todasLasAsignaturas),
		})),
	];

	// Estudiantes en los que se garantizan los tres estados de asistencia.
	const garantizarEstados = new Set([EMAIL_LAURA, EMAIL_MATEO]);

	return estudiantes.map((est) => {
		const nivel = gauss() * 0.25;

		const asignaturas = est.esLaura
			? ASIGNATURAS_NUEVAS
			: est.todasLasAsignaturas
				? ASIGNATURAS_TODAS
				: ASIGNATURAS_BASE_ESTUDIANTE;
		const periodos = est.esLaura ? PERIODOS_LAURA : PERIODOS_BASE;

		const notas = [];
		for (const periodo of periodos) {
			for (const asignatura of asignaturas) {
				notas.push({ asignatura, periodo, valor: generarNota(nivel) });
			}
		}

		const asistencias = dias.map((fecha) => ({ fecha, estado: generarEstado() }));

		if (garantizarEstados.has(est.email)) {
			if (!asistencias.some((a) => a.estado === "AUSENTE")) asistencias[4].estado = "AUSENTE";
			if (!asistencias.some((a) => a.estado === "TARDANZA")) asistencias[11].estado = "TARDANZA";
		}

		return { email: est.email, curso: est.curso, notas, asistencias };
	});
}

/** Contadores creados / ya existentes por entidad. */
function crearResumen() {
	const datos = {};
	return {
		registrar(entidad, creados, existentes = 0) {
			if (!datos[entidad]) datos[entidad] = { creados: 0, existentes: 0 };
			datos[entidad].creados += creados;
			datos[entidad].existentes += existentes;
		},
		tabla(soloCantidad = false) {
			return Object.fromEntries(
				Object.entries(datos).map(([k, v]) => [k, soloCantidad ? { cantidad: v.creados } : v]),
			);
		},
	};
}

// =====================================================
// MODO CARGA
// =====================================================

async function buscarOCrearUsuario(tx, resumen, datos, passwordHash) {
	const existente = await tx.usuario.findUnique({ where: { email: datos.email } });
	if (existente) {
		resumen.registrar("usuarios", 0, 1);
		return existente;
	}
	const creado = await tx.usuario.create({
		data: {
			nombre: datos.nombre,
			apellido: datos.apellido,
			email: datos.email,
			passwordHash,
			rol: datos.rol,
			estado: datos.estado,
		},
	});
	resumen.registrar("usuarios", 1, 0);
	return creado;
}

async function cargar(tx, passwordHash, plan, resumen) {
	// ---- 1. Cursos --------------------------------------------------
	const cursos = new Map();
	for (const datos of CURSOS) {
		let curso = await tx.curso.findFirst({ where: { nombre: datos.nombre } });
		if (curso) {
			resumen.registrar("cursos", 0, 1);
		} else {
			curso = await tx.curso.create({ data: { nombre: datos.nombre, jornada: datos.jornada } });
			resumen.registrar("cursos", 1, 0);
		}
		cursos.set(datos.nombre, curso);
	}

	// ---- 2. Asignaturas ---------------------------------------------
	const asignaturas = new Map();
	for (const nombre of [ASIGNATURA_EXISTENTE, ...ASIGNATURAS_NUEVAS]) {
		let asignatura = await tx.asignatura.findFirst({ where: { nombre } });
		if (asignatura) {
			resumen.registrar("asignaturas", 0, 1);
		} else {
			asignatura = await tx.asignatura.create({ data: { nombre } });
			resumen.registrar("asignaturas", 1, 0);
		}
		asignaturas.set(nombre, asignatura);
	}

	// ---- 3. Usuarios ------------------------------------------------
	const usuarios = new Map();

	// Carlos y Andres: se reutilizan; solo se crean si el seed base no corrio.
	for (const datos of USUARIOS_BASE_SI_FALTAN) {
		usuarios.set(datos.email, await buscarOCrearUsuario(tx, resumen, datos, passwordHash));
	}

	// Laura y Maria deben existir (los crea el seed base); jamas se crean aqui.
	for (const emailBase of [EMAIL_LAURA, EMAIL_MARIA]) {
		const usuario = await tx.usuario.findUnique({ where: { email: emailBase } });
		if (usuario) {
			usuarios.set(emailBase, usuario);
		} else {
			console.warn(`  [aviso] No existe ${emailBase}; ejecuta primero "npm run prisma:seed". Se omiten sus datos.`);
		}
	}

	for (const datos of [...USUARIOS_DEMO_ADULTOS, ...ESTUDIANTES_DEMO]) {
		usuarios.set(datos.email, await buscarOCrearUsuario(tx, resumen, datos, passwordHash));
	}

	// ---- 4. Perfiles de estudiante ---------------------------------
	const perfiles = new Map();

	for (const datos of ESTUDIANTES_DEMO) {
		const usuario = usuarios.get(datos.email);
		let perfil =
			(await tx.estudiantePerfil.findUnique({ where: { codigoEstudiantil: datos.codigo } })) ||
			(await tx.estudiantePerfil.findUnique({ where: { usuarioId: usuario.id } }));
		if (perfil && perfil.usuarioId !== usuario.id) {
			throw new Error(
				`El código ${datos.codigo} o el usuario ${datos.email} ya tienen un perfil de otro estudiante; revisa la base antes de cargar la demo.`,
			);
		}
		if (perfil) {
			resumen.registrar("perfiles", 0, 1);
		} else {
			perfil = await tx.estudiantePerfil.create({
				data: {
					usuarioId: usuario.id,
					cursoId: cursos.get(datos.curso).id,
					codigoEstudiantil: datos.codigo,
				},
			});
			resumen.registrar("perfiles", 1, 0);
		}
		perfiles.set(datos.email, perfil);
	}

	// Laura: su perfil ya existe (no se crea).
	const usuarioLaura = usuarios.get(EMAIL_LAURA);
	if (usuarioLaura) {
		const perfilLaura = await tx.estudiantePerfil.findUnique({ where: { usuarioId: usuarioLaura.id } });
		if (perfilLaura) {
			perfiles.set(EMAIL_LAURA, perfilLaura);
			resumen.registrar("perfiles", 0, 1);
		} else {
			console.warn("  [aviso] Laura Rodríguez no tiene perfil; se omiten sus notas y asistencias.");
		}
	}

	// ---- 5. Vinculos padre-estudiante ------------------------------
	for (const vinculo of VINCULOS_DEMO) {
		const padre = usuarios.get(vinculo.padre);
		const perfilHijo = perfiles.get(vinculo.hijo);
		if (!padre || !perfilHijo) {
			console.warn(`  [aviso] Vínculo omitido: ${vinculo.padre} -> ${vinculo.hijo}`);
			continue;
		}
		const existente = await tx.padreEstudiante.findUnique({
			where: { padreId_estudianteId: { padreId: padre.id, estudianteId: perfilHijo.id } },
		});
		if (existente) {
			resumen.registrar("vinculos", 0, 1);
		} else {
			await tx.padreEstudiante.create({
				data: { padreId: padre.id, estudianteId: perfilHijo.id },
			});
			resumen.registrar("vinculos", 1, 0);
		}
	}

	// ---- 6. Notas ---------------------------------------------------
	const candidatasNotas = [];
	for (const est of plan) {
		const perfil = perfiles.get(est.email);
		if (!perfil) continue;
		for (const nota of est.notas) {
			candidatasNotas.push({
				estudianteId: perfil.id,
				asignaturaId: asignaturas.get(nota.asignatura).id,
				docenteId: usuarios.get(DOCENTE_POR_ASIGNATURA[nota.asignatura]).id,
				periodo: nota.periodo,
				valor: nota.valor,
			});
		}
	}

	const notasExistentes = await tx.nota.findMany({
		where: {
			estudianteId: { in: [...new Set(candidatasNotas.map((n) => n.estudianteId))] },
			periodo: { in: PERIODOS_LAURA },
		},
		select: { estudianteId: true, asignaturaId: true, periodo: true },
	});
	const clavesNotas = new Set(
		notasExistentes.map((n) => `${n.estudianteId}|${n.asignaturaId}|${n.periodo}`),
	);
	const notasNuevas = candidatasNotas.filter(
		(n) => !clavesNotas.has(`${n.estudianteId}|${n.asignaturaId}|${n.periodo}`),
	);
	for (const lote of dividirEnLotes(notasNuevas, 500)) {
		await tx.nota.createMany({ data: lote });
	}
	resumen.registrar("notas", notasNuevas.length, candidatasNotas.length - notasNuevas.length);

	// ---- 7. Asistencias --------------------------------------------
	const candidatasAsistencias = [];
	for (const est of plan) {
		const perfil = perfiles.get(est.email);
		if (!perfil) continue;
		const docenteId = usuarios.get(DOCENTE_POR_CURSO[est.curso]).id;
		for (const asistencia of est.asistencias) {
			candidatasAsistencias.push({
				estudianteId: perfil.id,
				cursoId: perfil.cursoId,
				docenteId,
				fecha: asistencia.fecha,
				estado: asistencia.estado,
			});
		}
	}

	const asistenciasExistentes = await tx.asistencia.findMany({
		where: {
			estudianteId: { in: [...new Set(candidatasAsistencias.map((a) => a.estudianteId))] },
			fecha: { gte: FECHA_INICIO, lte: FECHA_FIN },
		},
		select: { estudianteId: true, fecha: true },
	});
	const clavesAsistencias = new Set(
		asistenciasExistentes.map((a) => `${a.estudianteId}|${claveFecha(a.fecha)}`),
	);
	const asistenciasNuevas = candidatasAsistencias.filter(
		(a) => !clavesAsistencias.has(`${a.estudianteId}|${claveFecha(a.fecha)}`),
	);
	for (const lote of dividirEnLotes(asistenciasNuevas, 500)) {
		await tx.asistencia.createMany({ data: lote });
	}
	resumen.registrar(
		"asistencias",
		asistenciasNuevas.length,
		candidatasAsistencias.length - asistenciasNuevas.length,
	);

	// ---- 8. Comunicados --------------------------------------------
	for (const datos of COMUNICADOS_DEMO) {
		const autor = usuarios.get(datos.autor);
		const existente = await tx.comunicado.findFirst({
			where: { autorId: autor.id, titulo: datos.titulo },
		});
		if (existente) {
			resumen.registrar("comunicados", 0, 1);
		} else {
			await tx.comunicado.create({
				data: {
					autorId: autor.id,
					titulo: datos.titulo,
					contenido: datos.contenido,
					fechaPublicacion: new Date(datos.fecha),
					estado: datos.estado || "PUBLICADO",
				},
			});
			resumen.registrar("comunicados", 1, 0);
		}
	}
}

// =====================================================
// MODO LIMPIEZA
// =====================================================

async function limpiar(tx, resumen) {
	const registrar = (entidad, cantidad) => resumen.registrar(entidad, cantidad);

	// Identificadores de lo que es "demo".
	const usuariosDemo = await tx.usuario.findMany({
		where: { email: { in: EMAILS_DEMO } },
		select: { id: true },
	});
	const idsUsuarios = usuariosDemo.map((u) => u.id);

	// Perfiles: codigo DEMO-* Y perteneciente a un usuario demo.
	const perfilesDemo = await tx.estudiantePerfil.findMany({
		where: { codigoEstudiantil: { startsWith: PREFIJO_CODIGO }, usuarioId: { in: idsUsuarios } },
		select: { id: true },
	});
	const idsPerfiles = perfilesDemo.map((p) => p.id);

	const asignaturasNuevas = await tx.asignatura.findMany({
		where: { nombre: { in: ASIGNATURAS_NUEVAS } },
		select: { id: true, nombre: true },
	});

	// Docentes que firman notas y comunicados (incluye a Carlos y Andres, que no se borran).
	const emailsAutores = [
		...new Set([...Object.values(DOCENTE_POR_ASIGNATURA), ...COMUNICADOS_DEMO.map((c) => c.autor)]),
	];
	const autores = await tx.usuario.findMany({
		where: { email: { in: emailsAutores } },
		select: { id: true, email: true },
	});
	const idPorEmail = new Map(autores.map((a) => [a.email, a.id]));

	// Comunicados: se identifican por autor Y titulo (nunca solo por titulo).
	const filtrosComunicados = COMUNICADOS_DEMO.filter((c) => idPorEmail.has(c.autor)).map((c) => ({
		autorId: idPorEmail.get(c.autor),
		titulo: c.titulo,
	}));
	const comunicadosDemo = filtrosComunicados.length
		? await tx.comunicado.findMany({ where: { OR: filtrosComunicados }, select: { id: true } })
		: [];
	const idsComunicados = comunicadosDemo.map((c) => c.id);

	const perfilLaura = await tx.estudiantePerfil.findFirst({
		where: { usuario: { email: EMAIL_LAURA } },
		select: { id: true },
	});
	const ana = await tx.usuario.findUnique({ where: { email: EMAIL_ANA }, select: { id: true } });

	// 1. Notificaciones de los comunicados demo y de los usuarios demo
	//    (estas ultimas bloquearian el borrado de usuarios por FK).
	const notificaciones = await tx.notificacion.deleteMany({
		where: {
			OR: [{ comunicadoId: { in: idsComunicados } }, { usuarioId: { in: idsUsuarios } }],
		},
	});
	registrar("notificaciones eliminadas", notificaciones.count);

	// 2. Comunicados demo (por id, obtenidos por autor + titulo).
	const comunicados = await tx.comunicado.deleteMany({ where: { id: { in: idsComunicados } } });
	registrar("comunicados eliminados", comunicados.count);

	// 3. Notas de estudiantes demo y las que el seed agrego a Laura: misma
	//    clave que usa la carga (estudiante, asignatura, periodo) con el docente
	//    que el seed asigna a cada asignatura. Conserva las originales de Laura
	//    y cualquier nota real que un docente registre despues.
	const filtrosNotas = [{ estudianteId: { in: idsPerfiles } }];
	if (perfilLaura) {
		for (const asignatura of asignaturasNuevas) {
			const docenteId = idPorEmail.get(DOCENTE_POR_ASIGNATURA[asignatura.nombre]);
			if (!docenteId) continue;
			filtrosNotas.push({
				estudianteId: perfilLaura.id,
				asignaturaId: asignatura.id,
				docenteId,
				periodo: { in: PERIODOS_LAURA },
			});
		}
	}
	const notas = await tx.nota.deleteMany({ where: { OR: filtrosNotas } });
	registrar("notas eliminadas", notas.count);

	// 4. Asistencias de estudiantes demo y las demo de Laura (Ana, en el rango).
	const filtrosAsistencia = [{ estudianteId: { in: idsPerfiles } }];
	if (perfilLaura && ana) {
		filtrosAsistencia.push({
			estudianteId: perfilLaura.id,
			docenteId: ana.id,
			fecha: { gte: FECHA_INICIO, lte: FECHA_FIN },
		});
	}
	const asistencias = await tx.asistencia.deleteMany({ where: { OR: filtrosAsistencia } });
	registrar("asistencias eliminadas", asistencias.count);

	// 5. Vinculos hacia estudiantes demo (nunca Maria -> Laura). Los vinculos
	//    que un padre demo tenga con otros estudiantes se conservan, y el padre
	//    queda protegido en el paso 7.
	const vinculos = await tx.padreEstudiante.deleteMany({
		where: { estudianteId: { in: idsPerfiles } },
	});
	registrar("vinculos eliminados", vinculos.count);

	// 6. Perfiles demo (codigo DEMO-*).
	const perfiles = await tx.estudiantePerfil.deleteMany({ where: { id: { in: idsPerfiles } } });
	registrar("perfiles eliminados", perfiles.count);

	// 7. Usuarios demo (lista exacta). Si alguno conserva referencias creadas
	//    despues (p. ej. un comunicado nuevo de Ana), se conserva y se avisa.
	const referenciados = new Set();
	const referencias = [
		await tx.nota.findMany({ where: { docenteId: { in: idsUsuarios } }, select: { docenteId: true }, distinct: ["docenteId"] }),
		await tx.asistencia.findMany({ where: { docenteId: { in: idsUsuarios } }, select: { docenteId: true }, distinct: ["docenteId"] }),
		await tx.comunicado.findMany({ where: { autorId: { in: idsUsuarios } }, select: { autorId: true }, distinct: ["autorId"] }),
		await tx.padreEstudiante.findMany({ where: { padreId: { in: idsUsuarios } }, select: { padreId: true }, distinct: ["padreId"] }),
		await tx.estudiantePerfil.findMany({ where: { usuarioId: { in: idsUsuarios } }, select: { usuarioId: true } }),
	];
	for (const filas of referencias) {
		for (const fila of filas) {
			referenciados.add(fila.docenteId ?? fila.autorId ?? fila.padreId ?? fila.usuarioId);
		}
	}
	const idsEliminables = idsUsuarios.filter((id) => !referenciados.has(id));
	if (referenciados.size > 0) {
		console.warn(
			`  [aviso] ${referenciados.size} usuario(s) demo se conservan porque tienen datos propios creados después.`,
		);
	}
	const usuarios = await tx.usuario.deleteMany({ where: { id: { in: idsEliminables } } });
	registrar("usuarios eliminados", usuarios.count);
	registrar("usuarios conservados (con referencias)", referenciados.size);

	// 8. Cursos nuevos, solo si ya no tienen referencias.
	let cursosEliminados = 0;
	for (const nombre of CURSOS_DEMO_NUEVOS) {
		const cursos = await tx.curso.findMany({ where: { nombre }, select: { id: true } });
		for (const curso of cursos) {
			const usos =
				(await tx.estudiantePerfil.count({ where: { cursoId: curso.id } })) +
				(await tx.asistencia.count({ where: { cursoId: curso.id } }));
			if (usos === 0) {
				await tx.curso.delete({ where: { id: curso.id } });
				cursosEliminados += 1;
			}
		}
	}
	registrar("cursos eliminados", cursosEliminados);

	// 9. Asignaturas nuevas, solo si ya no tienen notas.
	let asignaturasEliminadas = 0;
	for (const nombre of ASIGNATURAS_NUEVAS) {
		const asignaturas = await tx.asignatura.findMany({ where: { nombre }, select: { id: true } });
		for (const asignatura of asignaturas) {
			const usos = await tx.nota.count({ where: { asignaturaId: asignatura.id } });
			if (usos === 0) {
				await tx.asignatura.delete({ where: { id: asignatura.id } });
				asignaturasEliminadas += 1;
			}
		}
	}
	registrar("asignaturas eliminadas", asignaturasEliminadas);
}

// =====================================================
// PRINCIPAL
// =====================================================

function imprimirCredenciales() {
	const filas = [
		...USUARIOS_DEMO_ADULTOS.map((u) => ({
			email: u.email,
			rol: u.estado === "INACTIVO" ? `${u.rol} (INACTIVO)` : u.rol,
			password: PASSWORD_DEMO,
		})),
		...ESTUDIANTES_DEMO.map((e) => ({ email: e.email, rol: `${e.rol} (${e.curso})`, password: PASSWORD_DEMO })),
		...USUARIOS_EXISTENTES_INFO.map((u) => ({ email: u.email, rol: `${u.rol} (existente)`, password: PASSWORD_DEMO })),
	];
	console.log("\nCredenciales:");
	console.table(filas);
}

async function main() {
	const args = process.argv.slice(2);
	const conocidos = new Set(["--dry-run", "--limpiar"]);
	const desconocidos = args.filter((a) => !conocidos.has(a));
	if (desconocidos.length > 0) {
		throw new Error(`Argumentos no reconocidos: ${desconocidos.join(", ")}. Usa --dry-run y/o --limpiar.`);
	}
	const dryRun = args.includes("--dry-run");
	const modoLimpiar = args.includes("--limpiar");

	if (process.env.NODE_ENV === "production") {
		throw new Error("Este script de demostración no se ejecuta con NODE_ENV=production.");
	}

	// Validaciones de integridad de las constantes (claves naturales unicas).
	const duplicados = (lista) => lista.length !== new Set(lista).size;
	if (
		duplicados(EMAILS_DEMO) ||
		duplicados(TITULOS_COMUNICADOS_DEMO) ||
		duplicados(ESTUDIANTES_DEMO.map((e) => e.codigo))
	) {
		throw new Error("Constantes inconsistentes: correos, títulos o códigos duplicados.");
	}

	const modo = `${modoLimpiar ? "LIMPIAR" : "CARGAR"}${dryRun ? " (dry-run: se revierte al final)" : ""}`;
	console.log("Datos de demostración de EduConnect BR");
	console.log(`  Destino: host=${process.env.DB_HOST} puerto=${process.env.DB_PORT || 3306} base=${process.env.DB_NAME}`);
	console.log(`  Modo:    ${modo}\n`);

	// El hash se calcula UNA vez, fuera de la transaccion.
	const passwordHash = modoLimpiar ? null : await hashPassword(PASSWORD_DEMO);
	const plan = modoLimpiar ? null : planificarDatos();
	const resumen = crearResumen();

	let revertido = false;
	try {
		await prisma.$transaction(
			async (tx) => {
				if (modoLimpiar) {
					await limpiar(tx, resumen);
				} else {
					await cargar(tx, passwordHash, plan, resumen);
				}
				if (dryRun) throw new RollbackSimulado();
			},
			{ timeout: 180000, maxWait: 20000 },
		);
	} catch (error) {
		if (error && error.name === "RollbackSimulado") {
			revertido = true;
		} else {
			throw error;
		}
	}

	console.log(
		dryRun
			? "Resumen (SIMULADO: nada se guardó, la transacción se revirtió):"
			: "Resumen:",
	);
	console.table(resumen.tabla(modoLimpiar));

	if (!modoLimpiar) imprimirCredenciales();

	if (revertido) console.log("\nDry-run finalizado: no se persistió ningún cambio.");
}

main()
	.catch((error) => {
		console.error("Error ejecutando seed-demo:");
		console.error(error);
		process.exitCode = 1;
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
