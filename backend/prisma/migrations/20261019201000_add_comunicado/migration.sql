-- CreateTable
CREATE TABLE `Comunicado` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `autorId` INTEGER NOT NULL,
    `titulo` VARCHAR(150) NOT NULL,
    `contenido` TEXT NOT NULL,
    `fechaPublicacion` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `estado` ENUM('PUBLICADO', 'EDITADO', 'ELIMINADO') NOT NULL DEFAULT 'PUBLICADO',

    INDEX `Comunicado_estado_fechaPublicacion_idx`(`estado`, `fechaPublicacion`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Comunicado` ADD CONSTRAINT `Comunicado_autorId_fkey` FOREIGN KEY (`autorId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
