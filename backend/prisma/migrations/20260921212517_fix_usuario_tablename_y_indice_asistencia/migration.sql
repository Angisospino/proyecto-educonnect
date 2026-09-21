/*
  Warnings:

  - You are about to drop the `usuario` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `asistencia` DROP FOREIGN KEY `Asistencia_docenteId_fkey`;

-- DropForeignKey
ALTER TABLE `estudianteperfil` DROP FOREIGN KEY `EstudiantePerfil_usuarioId_fkey`;

-- DropForeignKey
ALTER TABLE `nota` DROP FOREIGN KEY `Nota_docenteId_fkey`;

-- DropIndex
DROP INDEX `Asistencia_docenteId_fkey` ON `asistencia`;

-- DropIndex
DROP INDEX `Nota_docenteId_fkey` ON `nota`;

-- DropTable
DROP TABLE `usuario`;

-- CreateTable
CREATE TABLE `usuarios` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(100) NOT NULL,
    `apellido` VARCHAR(100) NOT NULL,
    `email` VARCHAR(150) NOT NULL,
    `passwordHash` VARCHAR(255) NOT NULL,
    `rol` ENUM('ADMINISTRADOR', 'DOCENTE', 'ESTUDIANTE', 'PADRE_FAMILIA', 'DIRECTIVO') NOT NULL,
    `estado` ENUM('ACTIVO', 'INACTIVO') NOT NULL DEFAULT 'ACTIVO',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `usuarios_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Asistencia_cursoId_fecha_idx` ON `Asistencia`(`cursoId`, `fecha`);

-- AddForeignKey
ALTER TABLE `EstudiantePerfil` ADD CONSTRAINT `EstudiantePerfil_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Nota` ADD CONSTRAINT `Nota_docenteId_fkey` FOREIGN KEY (`docenteId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Asistencia` ADD CONSTRAINT `Asistencia_docenteId_fkey` FOREIGN KEY (`docenteId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
