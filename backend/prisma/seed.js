import "dotenv/config";
import prisma from "../src/config/prisma.js";

import { hashPassword } from "../src/utils/bcrypt.util.js";



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
console.log('🌱 Iniciando seed de Sprint 3...');

  // =====================================================
  // 1. CREAR O REUTILIZAR UN CURSO
  // =====================================================

  let curso = await prisma.curso.findFirst({
    where: {
      nombre: '6°A',
    },
  });

  if (!curso) {
    curso = await prisma.curso.create({
      data: {
        nombre: '6°A',
        jornada: 'MAÑANA',
      },
    });
  }

  console.log(`✅ Curso disponible: ${curso.nombre}`);

  // =====================================================
  // 2. CREAR O REUTILIZAR UNA ASIGNATURA
  // =====================================================

  let asignatura = await prisma.asignatura.findFirst({
    where: {
      nombre: 'Matemáticas',
    },
  });

  if (!asignatura) {
    asignatura = await prisma.asignatura.create({
      data: {
        nombre: 'Matemáticas',
      },
    });
  }

  console.log(`✅ Asignatura disponible: ${asignatura.nombre}`);

  // =====================================================
  // 3. BUSCAR ESTUDIANTES EXISTENTES
  // =====================================================

  const estudiantes = await prisma.usuario.findMany({
    where: {
      rol: 'ESTUDIANTE',
    },
  });

  if (estudiantes.length === 0) {
    console.warn(
      '⚠️ No existen usuarios con rol ESTUDIANTE. Ejecuta primero el seed de usuarios.'
    );
    return;
  }

  console.log(
    `👨‍🎓 Se encontraron ${estudiantes.length} estudiante(s).`
  );

  // =====================================================
  // 4. CREAR ESTUDIANTE PERFIL
  // =====================================================

  const perfiles = [];

  for (const estudiante of estudiantes) {
    let perfil = await prisma.estudiantePerfil.findUnique({
      where: {
        usuarioId: estudiante.id,
      },
    });

    if (!perfil) {
      perfil = await prisma.estudiantePerfil.create({
        data: {
          usuarioId: estudiante.id,
          cursoId: curso.id,

          // Código único de ejemplo.
          codigoEstudiantil: `EST-${String(estudiante.id).padStart(4, '0')}`,
        },
      });

      console.log(
        `✅ Perfil creado para ${estudiante.nombre} ${estudiante.apellido}`
      );
    } else {
      console.log(
        `ℹ️ ${estudiante.nombre} ${estudiante.apellido} ya tiene perfil.`
      );
    }

    perfiles.push(perfil);
  }

  // =====================================================
  // 5. BUSCAR UN DOCENTE
  // =====================================================

  const docente = await prisma.usuario.findFirst({
    where: {
      rol: 'DOCENTE',
    },
  });

  if (!docente) {
    console.warn(
      '⚠️ No existe un usuario DOCENTE. No se crearán notas ni asistencias.'
    );
    return;
  }

  console.log(
    `👨‍🏫 Docente utilizado: ${docente.nombre} ${docente.apellido}`
  );

  // =====================================================
  // 6. SEMBRAR NOTAS
  // =====================================================

  console.log('📝 Creando notas de ejemplo...');

  for (let i = 0; i < perfiles.length; i++) {
    const perfil = perfiles[i];

    // Valores deterministas para que el seed sea predecible.
    const valores = [4.5, 3.8, 4.2, 3.5, 4.0];
    const valor = valores[i % valores.length];

    const notaExistente = await prisma.nota.findFirst({
      where: {
        estudianteId: perfil.id,
        asignaturaId: asignatura.id,
        docenteId: docente.id,
        periodo: '2026-P3',
      },
    });

    if (!notaExistente) {
      await prisma.nota.create({
        data: {
          estudianteId: perfil.id,
          asignaturaId: asignatura.id,
          docenteId: docente.id,
          periodo: '2026-P3',
          valor,
        },
      });

      console.log(
        `   ✅ Nota ${valor} creada para perfil ${perfil.id}`
      );
    }
  }

  // =====================================================
  // 7. SEMBRAR ASISTENCIA
  // =====================================================

  console.log('📋 Creando registros de asistencia...');

  const fechas = [
    new Date('2026-09-07T12:00:00.000Z'),
    new Date('2026-09-09T12:00:00.000Z'),
    new Date('2026-09-11T12:00:00.000Z'),
  ];

  const estados = ['PRESENTE', 'AUSENTE', 'TARDANZA'];

  for (let i = 0; i < perfiles.length; i++) {
    const perfil = perfiles[i];

    for (let j = 0; j < fechas.length; j++) {
      const fecha = fechas[j];

      const asistenciaExistente =
        await prisma.asistencia.findFirst({
          where: {
            estudianteId: perfil.id,
            cursoId: curso.id,
            docenteId: docente.id,
            fecha,
          },
        });

      if (!asistenciaExistente) {
        await prisma.asistencia.create({
          data: {
            estudianteId: perfil.id,
            cursoId: curso.id,
            docenteId: docente.id,
            fecha,

            // Distribuye estados de prueba entre estudiantes.
            estado:
              estados[(i + j) % estados.length],
          },
        });
      }
    }
  }

  console.log('✅ Registros de asistencia creados.');

  // =====================================================
  // RESUMEN
  // =====================================================

  console.log('\n--------------------------------');
  console.log('🌱 Seed Sprint 3 completado');
  console.log('--------------------------------');
  console.log(`Curso: ${curso.nombre}`);
  console.log(`Asignatura: ${asignatura.nombre}`);
  console.log(`Estudiantes: ${perfiles.length}`);
  console.log(
    `Docente: ${docente.nombre} ${docente.apellido}`
  );
  console.log('Periodo: 2026-P3');
  console.log('--------------------------------');
}


main()
  .catch((error) => {
    console.error('❌ Error ejecutando seed:');
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });