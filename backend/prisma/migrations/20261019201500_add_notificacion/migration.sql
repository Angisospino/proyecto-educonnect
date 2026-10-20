-- CreateTable
CREATE TABLE `Notificacion` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `usuarioId` INTEGER NOT NULL,
    `comunicadoId` INTEGER NULL,
    `canal` ENUM('EMAIL') NOT NULL DEFAULT 'EMAIL',
    `estado` ENUM('PENDIENTE', 'ENVIADA', 'FALLIDA') NOT NULL DEFAULT 'PENDIENTE',
    `fechaEnvio` DATETIME(3) NULL,

    INDEX `Notificacion_estado_idx`(`estado`),
    INDEX `Notificacion_usuarioId_idx`(`usuarioId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Notificacion` ADD CONSTRAINT `Notificacion_usuarioId_fkey` FOREIGN KEY (`usuarioId`) REFERENCES `usuarios`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Notificacion` ADD CONSTRAINT `Notificacion_comunicadoId_fkey` FOREIGN KEY (`comunicadoId`) REFERENCES `Comunicado`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
