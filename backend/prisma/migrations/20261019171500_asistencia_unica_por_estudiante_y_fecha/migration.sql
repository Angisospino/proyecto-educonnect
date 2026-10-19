/*
  Warnings:

  - A unique constraint covering the columns `[estudianteId,fecha]` on the table `Asistencia` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Asistencia_estudianteId_fecha_key` ON `Asistencia`(`estudianteId`, `fecha`);
