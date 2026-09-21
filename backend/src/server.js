import "dotenv/config";

import app from "./app.js";
import prisma from "./config/prisma.js";

/* ==========================================
   CONFIGURACIÓN DEL SERVIDOR
   ========================================== */

const PORT = Number(process.env.PORT) || 3000;

/* ==========================================
   INICIAR SERVIDOR
   ========================================== */

const startServer = async () => {
	try {
		/* ======================================
       VERIFICAR CONEXIÓN CON LA BASE DE DATOS
       ====================================== */

		await prisma.$connect();

		console.log("✅ Conexión con MySQL establecida correctamente.");

		/* ======================================
       LEVANTAR SERVIDOR EXPRESS
       ====================================== */

		const server = app.listen(PORT, () => {
			console.log("");
			console.log("🚀 EduConnect BR API");
			console.log(`📡 Servidor ejecutándose en el puerto ${PORT}`);
			console.log(`🌐 URL: http://localhost:${PORT}`);
			console.log(`❤️  Health: http://localhost:${PORT}/api/health`);
			console.log("");
		});

		/* ======================================
       CIERRE CONTROLADO DEL SERVIDOR
       ====================================== */

		const shutdown = async (signal) => {
			console.log("");
			console.log(`⚠️ Señal ${signal} recibida.`);
			console.log("🔄 Cerrando servidor...");

			server.close(async () => {
				try {
					await prisma.$disconnect();

					console.log("✅ Conexión con MySQL cerrada.");
					console.log("👋 Servidor detenido correctamente.");

					process.exit(0);
				} catch (error) {
					console.error(
						"❌ Error cerrando la conexión con la base de datos:",
						error,
					);

					process.exit(1);
				}
			});
		};

		/* ======================================
       ESCUCHAR SEÑALES DEL SISTEMA
       ====================================== */

		process.on("SIGINT", () => {
			shutdown("SIGINT");
		});

		process.on("SIGTERM", () => {
			shutdown("SIGTERM");
		});
	} catch (error) {
		console.error("");
		console.error("❌ No fue posible iniciar EduConnect BR.");
		console.error(error);

		try {
			await prisma.$disconnect();
		} catch {
			// No hacemos nada si Prisma no alcanzó a conectarse.
		}

		process.exit(1);
	}
};

/* ==========================================
   EJECUTAR SERVIDOR
   ========================================== */

startServer();
