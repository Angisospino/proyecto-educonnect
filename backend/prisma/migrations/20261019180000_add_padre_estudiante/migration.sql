-- CreateTable
CREATE TABLE `PadreEstudiante` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `padreId` INTEGER NOT NULL,
    `estudianteId` INTEGER NOT NULL,

    UNIQUE INDEX `PadreEstudiante_padreId_estudianteId_key`(`padreId`, `estudianteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `PadreEstudiante` ADD CONSTRAINT `PadreEstudiante_padreId_fkey` FOREIGN KEY (`padreId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PadreEstudiante` ADD CONSTRAINT `PadreEstudiante_estudianteId_fkey` FOREIGN KEY (`estudianteId`) REFERENCES `EstudiantePerfil`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
