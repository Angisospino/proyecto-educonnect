import "dotenv/config";

import { PrismaClient } from "@prisma/client";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { hashPassword } from "../src/utils/bcrypt.util.js";

const adapter = new PrismaMariaDb({
	host: process.env.DB_HOST,
	port: Number(process.env.DB_PORT || 3306),
	user: process.env.DB_USER,
	password: process.env.DB_PASSWORD,
	database: process.env.DB_NAME,
	connectionLimit: 5,
});

const prisma = new PrismaClient({
	adapter,
});

async function main() {
	console.log("🌱 Iniciando seed de EduConnect BR...");

	const passwordHash = await hashPassword("EduConnect123*");

	const usuarios = [
		{
			nombre: "Administrador",
			apellido: "EduConnect",
			email: "admin@educonnectbr.edu.co",
			passwordHash,
			rol: "ADMINISTRADOR",
			estado: "ACTIVO",
		},
		{
			nombre: "Carlos",
			apellido: "Martínez",
			email: "docente@educonnectbr.edu.co",
			passwordHash,
			rol: "DOCENTE",
			estado: "ACTIVO",
		},
		{
			nombre: "Laura",
			apellido: "Rodríguez",
			email: "estudiante@educonnectbr.edu.co",
			passwordHash,
			rol: "ESTUDIANTE",
			estado: "ACTIVO",
		},
		{
			nombre: "María",
			apellido: "Rodríguez",
			email: "padre@educonnectbr.edu.co",
			passwordHash,
			rol: "PADRE_FAMILIA",
			estado: "ACTIVO",
		},
		{
			nombre: "Andrés",
			apellido: "Gómez",
			email: "directivo@educonnectbr.edu.co",
			passwordHash,
			rol: "DIRECTIVO",
			estado: "ACTIVO",
		},
	];

	for (const usuario of usuarios) {
		await prisma.usuario.upsert({
			where: {
				email: usuario.email,
			},

			update: {},

			create: usuario,
		});
	}

	console.log("✅ Usuarios iniciales creados correctamente.");

	console.log(`
=============================================
        EDUCONNECT BR - USUARIOS
=============================================

Administrador:
admin@educonnectbr.edu.co

Docente:
docente@educonnectbr.edu.co

Estudiante:
estudiante@educonnectbr.edu.co

Padre:
padre@educonnectbr.edu.co

Directivo:
directivo@educonnectbr.edu.co

Contraseña para todos:
EduConnect123*

=============================================
`);
}

main()
	.catch((error) => {
		console.error("❌ Error ejecutando el seed:");
		console.error(error);

		process.exit(1);
	})
	.finally(async () => {
		await prisma.$disconnect();
	});
